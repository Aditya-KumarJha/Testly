export async function register() {
  // Execute only in the Node.js server runtime (not edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[Instrumentation] Bootstrapping background RabbitMQ email queue consumer...");
    try {
      const { startEmailConsumer } = await import("@/lib/rabbitmq");
      await startEmailConsumer();
      console.log("[Instrumentation] Background RabbitMQ email queue consumer registered successfully.");
    } catch (error) {
      console.error("[Instrumentation] Critical failure starting RabbitMQ consumer on boot:", error);
    }
  }
}
