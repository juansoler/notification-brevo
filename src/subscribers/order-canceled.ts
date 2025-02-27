import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendOrderCanceledWorkflow } from "../workflows/send-order-canceled";

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendOrderCanceledWorkflow(container).run({
    input: { id: data.id },
  });
}

export const config: SubscriberConfig = {
  event: "order.canceled",
};