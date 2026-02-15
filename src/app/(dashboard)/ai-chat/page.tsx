import { Chat } from "@/components/ai/chat";

export default function AIChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">AI Chat</h1>
        <p className="text-muted-foreground">
          Chat with AI using multiple providers (Claude, GPT, and more)
        </p>
      </div>
      <Chat />
    </div>
  );
}
