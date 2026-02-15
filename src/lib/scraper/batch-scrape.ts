import { createServerClient } from "@supabase/ssr";

import { sendPriceAlertEmail } from "@/lib/email/resend";

import { scrapeProduct } from "./scrape-product";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function runBatchScrapeForUser(
  userId: string,
): Promise<{ scraped: number; alerts: number }> {
  const admin = createAdminClient();

  const { data: products } = await admin
    .from("products")
    .select("id, name, url, css_selector, current_price, competitor_id")
    .eq("user_id", userId);

  if (!products?.length) return { scraped: 0, alerts: 0 };

  // Check competitor status — only scrape products whose competitor is active
  const { data: competitors } = await admin
    .from("competitors")
    .select("id, status")
    .eq("user_id", userId);

  const activeCompetitorIds = new Set(
    (competitors || []).filter((c) => c.status === "active").map((c) => c.id),
  );

  const activeProducts = products.filter((p) =>
    activeCompetitorIds.has(p.competitor_id),
  );
  if (!activeProducts.length) return { scraped: 0, alerts: 0 };

  const { data: alertSettings } = await admin
    .from("alert_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, alert_email")
    .eq("id", userId)
    .single();

  const alertEmail = profile?.alert_email || profile?.email;
  const threshold = alertSettings?.threshold_percent ?? 1;

  let scraped = 0;
  let alerts = 0;

  for (const product of activeProducts) {
    if (scraped > 0) {
      await new Promise((r) => setTimeout(r, 2000));
    }

    const result = await scrapeProduct(product.url, product.css_selector);

    if (result.success) {
      const newPrice = result.data.price;
      const oldPrice = product.current_price;

      await admin.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: result.data.currency,
      });

      const updateData: Record<string, unknown> = {
        current_price: newPrice,
        currency: result.data.currency,
        last_scraped_at: new Date().toISOString(),
        scrape_status: "success",
        scrape_error: null,
      };

      if (oldPrice !== null && oldPrice > 0) {
        const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

        if (Math.abs(changePercent) >= threshold) {
          const alertType =
            changePercent < 0 ? "price_drop" : "price_increase";
          const shouldNotify =
            (alertType === "price_drop" &&
              alertSettings?.notify_price_drop !== false) ||
            (alertType === "price_increase" &&
              alertSettings?.notify_price_increase !== false);

          if (shouldNotify) {
            updateData.previous_price = oldPrice;

            const { data: alertRow } = await admin
              .from("alerts")
              .insert({
                user_id: userId,
                product_id: product.id,
                alert_type: alertType,
                old_price: oldPrice,
                new_price: newPrice,
                change_percent: Math.round(changePercent * 100) / 100,
              })
              .select("id")
              .single();

            if (
              alertSettings?.email_enabled !== false &&
              alertEmail &&
              alertRow
            ) {
              try {
                await sendPriceAlertEmail(
                  alertEmail,
                  product.name,
                  oldPrice,
                  newPrice,
                  Math.round(changePercent * 100) / 100,
                  product.url,
                );
                await admin
                  .from("alerts")
                  .update({ notified_email: true })
                  .eq("id", alertRow.id);
              } catch (e) {
                console.error("Alert email failed:", e);
              }
            }

            if (
              alertSettings?.webhook_enabled &&
              alertSettings?.webhook_url &&
              alertRow
            ) {
              try {
                await fetch(alertSettings.webhook_url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event: "price_change",
                    product: {
                      id: product.id,
                      name: product.name,
                      url: product.url,
                    },
                    oldPrice,
                    newPrice,
                    changePercent: Math.round(changePercent * 100) / 100,
                    currency: result.data.currency,
                    timestamp: new Date().toISOString(),
                  }),
                });
                await admin
                  .from("alerts")
                  .update({ notified_webhook: true })
                  .eq("id", alertRow.id);
              } catch (e) {
                console.error("Webhook failed:", e);
              }
            }

            alerts++;
          }
        }
      }

      await admin.from("products").update(updateData).eq("id", product.id);
    } else {
      await admin
        .from("products")
        .update({
          scrape_status: "error",
          scrape_error: result.error.message,
          last_scraped_at: new Date().toISOString(),
        })
        .eq("id", product.id);
    }

    scraped++;
  }

  return { scraped, alerts };
}
