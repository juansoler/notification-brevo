import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";
import { CreateNotificationDTO } from "@medusajs/framework/types";

type WorkflowInput = {
  id: string;
};

export const sendShipmentConfirmationWorkflow = createWorkflow(
  "send-shipment-confirmation",
  ({ id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "*",
        "id",
        "created_at",
        "email",
        "currency_code",
        "display_id",
        "shipping_subtotal",
        "total",
        "items.*",
        "billing_address.*",
        "shipping_address.*",
        "payment_collections.*",
        "payment_collections.payments.*",
        "fulfillments.*",
        "fulfillments.labels.*", // Add this line to get label info, including tracking number
 
        
      ],
      filters: { id },
    });

    const notificationData: CreateNotificationDTO[] = [
      {
        to: orders[0].email,
        channel: "email",
        template: "shipment.confirmed", // Use your actual shipment confirmation template ID
        data: { order: orders[0] },
      },
    ];

    const notification = sendNotificationStep(notificationData);

    return new WorkflowResponse(notification);
  }
);