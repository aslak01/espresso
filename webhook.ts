type WebhookMessage = {
  destination: string;
  content: string;
};

export async function sendWebhook(msg: WebhookMessage) {
  const content = JSON.stringify({ content: msg.content });

  const req = await fetch(msg.destination, { method: "post", body: content });

  console.log(req);
}
