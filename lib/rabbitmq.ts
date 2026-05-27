import amqplib from "amqplib";
import { getRequiredEnv } from "@/lib/env";

const QUEUE_NAME = "email_queue";

// Extend global type for Next.js hot reload safety
declare global {
  var rabbitmqConn: any;
  var rabbitmqChannel: any;
  var rabbitmqConsuming: boolean | undefined;
}

/**
 * Gets or creates the RabbitMQ connection singleton.
 */
export async function getRabbitConnection(): Promise<any> {
  const rabbitmqUrl = getRequiredEnv("RABBITMQ_URL");

  if (process.env.NODE_ENV === "development") {
    if (!global.rabbitmqConn) {
      console.log("[RabbitMQ] Creating new Connection singleton (dev)...");
      global.rabbitmqConn = await amqplib.connect(rabbitmqUrl);
    }
    return global.rabbitmqConn;
  }

  return await amqplib.connect(rabbitmqUrl);
}

/**
 * Gets or creates the RabbitMQ channel singleton.
 */
export async function getRabbitChannel(): Promise<any> {
  if (process.env.NODE_ENV === "development") {
    if (global.rabbitmqChannel) {
      return global.rabbitmqChannel;
    }
    const conn = await getRabbitConnection();
    console.log("[RabbitMQ] Creating new Channel singleton (dev)...");
    global.rabbitmqChannel = await conn.createChannel();
    await global.rabbitmqChannel.assertQueue(QUEUE_NAME, { durable: true });
    return global.rabbitmqChannel;
  }

  const conn = await getRabbitConnection();
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  return channel;
}

/**
 * Publishes an event and its data to the email queue.
 */
export async function publishToQueue(
  eventType: "USER_LOGIN" | "PAYMENT_CONFIRMED" | "TEST_RUN_COMPLETED",
  data: any
) {
  try {
    const channel = await getRabbitChannel();
    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    };
    
    console.log(`[RabbitMQ] Publishing event ${eventType} to ${QUEUE_NAME}...`);
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
    return true;
  } catch (error) {
    console.error(`[RabbitMQ] Failed to publish event ${eventType}:`, error);
    return false;
  }
}

/**
 * Starts consuming events from the email queue inside the Next.js process.
 */
export async function startEmailConsumer() {
  // Prevent duplicate consumers from starting (especially during Next.js hot-reloads)
  if (global.rabbitmqConsuming) {
    console.log("[RabbitMQ] Email consumer is already running.");
    return;
  }

  try {
    console.log("[RabbitMQ] Initializing background email consumer...");
    const channel = await getRabbitChannel();

    global.rabbitmqConsuming = true;

    // Dynamically import to prevent circular dependency
    const { processEmailQueueMessage } = await import("./email-service");

    console.log(`[RabbitMQ] Subscribing to queue "${QUEUE_NAME}"...`);
    await channel.consume(
      QUEUE_NAME,
      async (msg: any) => {
        if (!msg) return;

        try {
          const content = msg.content.toString();
          console.log(`[RabbitMQ] Received message from "${QUEUE_NAME}":`, content.slice(0, 300));
          const parsed = JSON.parse(content);

          const success = await processEmailQueueMessage(parsed.event, parsed.data);
          
          if (success) {
            channel.ack(msg);
            console.log("[RabbitMQ] Message processed successfully and acknowledged.");
          } else {
            console.warn("[RabbitMQ] Message processing failed. Requeueing...");
            channel.nack(msg, false, true); // Requeue for retry
          }
        } catch (err) {
          console.error("[RabbitMQ] Error handling queue message:", err);
          // Reject and do not requeue corrupted JSON messages to prevent endless poison queues
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );

    console.log("[RabbitMQ] Background consumer listening successfully.");
  } catch (error) {
    global.rabbitmqConsuming = false;
    console.error("[RabbitMQ] Failed to start email consumer:", error);
    // Retry connection after 10 seconds if it fails to start
    setTimeout(() => {
      startEmailConsumer().catch(console.error);
    }, 10000);
  }
}
