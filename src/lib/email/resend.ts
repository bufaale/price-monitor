import { Resend } from "resend";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || "noreply@yourdomain.com";

export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to PriceWise!",
    html: `
      <h1>Welcome, ${escapeHtml(name || "there")}!</h1>
      <p>Thanks for signing up. Start tracking competitor prices in minutes.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a></p>
    `,
  });
}

export async function sendSubscriptionEmail(email: string, plan: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `You're now on the ${escapeHtml(plan)} plan!`,
    html: `
      <h1>Subscription Confirmed</h1>
      <p>You've been upgraded to the <strong>${escapeHtml(plan)}</strong> plan.</p>
      <p>Enjoy unlimited price tracking, AI strategy recommendations, and priority alerts!</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a></p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

export async function sendPriceAlertEmail(
  email: string,
  productName: string,
  oldPrice: number,
  newPrice: number,
  changePercent: number,
  productUrl: string,
) {
  const direction = changePercent < 0 ? "dropped" : "increased";
  const color = changePercent < 0 ? "#16a34a" : "#dc2626";

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Price Alert: ${escapeHtml(productName)} ${direction} ${Math.abs(changePercent)}%`,
    html: `
      <h1>Price Change Detected</h1>
      <p><strong>${escapeHtml(productName)}</strong> has ${direction} in price.</p>
      <p style="font-size: 24px; color: ${color};">
        $${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)} (${changePercent > 0 ? "+" : ""}${changePercent}%)
      </p>
      <p><a href="${escapeHtml(productUrl)}">View Product</a></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/alerts">View All Alerts</a></p>
    `,
  });
}
