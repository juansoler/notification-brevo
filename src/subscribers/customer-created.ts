import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendCustomerCreatedWorkflow } from "../workflows/send-customer-created";

export default async function customerCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {

  
    const result = await sendCustomerCreatedWorkflow(container).run({
      input: { id: event.data.id },
    });
    
}

export const config: SubscriberConfig = {
  event: "customer.created",
};