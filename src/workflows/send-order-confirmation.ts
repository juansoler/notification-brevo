import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";
import { CreateNotificationDTO } from "@medusajs/framework/types";

type WorkflowInput = {
  id: string;
};

export const sendOrderConfirmationWorkflow = createWorkflow(
  "send-order-confirmation",
  ({ id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["*", "id", "created_at","email", "currency_code", "display_id", "shipping_subtotal", "total", "items.*","billing_address.*", "shipping_address.*", "payment_collections.*","payment_collections.payments.*", "fulfillments.*", "shipping_methods.*"],
      filters: { id },
    });
    //console.log("Order data retrieved (resolved):", JSON.stringify(orders, null, 2));
   
    const notificationData: CreateNotificationDTO[] = [
      {
        to: orders[0].email,
        channel: "email",
        template: "order.placed",
        data: { order: orders[0] },
      },
    ];
    //console.log("Prepared order confirmed notification data:", JSON.stringify(notificationData, null, 2));
    const notification = sendNotificationStep(notificationData);

    return new WorkflowResponse(notification);
  }
);