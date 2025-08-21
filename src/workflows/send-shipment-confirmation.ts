import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";
import { CreateNotificationDTO } from "@medusajs/framework/types";

type WorkflowInput = {
  id: string; // This will now be the shipment (fulfillment) ID
};

export const sendShipmentConfirmationWorkflow = createWorkflow(
  "send-shipment-confirmation",
  ({ id }: WorkflowInput) => {
    // Query the fulfillment and include the related order
    const { data: fulfillments } = useQueryGraphStep({
      entity: "fulfillment",
      fields: [
        "*",
        "id",
        "tracking_numbers",
        "order.*", // Fetch all order details related to the fulfillment
        "order.email",
        "order.shipping_address",
      ],
      filters: { id },
    });

    // Make sure the fulfillment and order exist
    if (!fulfillments[0] || !fulfillments[0].order || !fulfillments[0].order.email) {
      throw new Error("Fulfillment or order not found, or order email missing.");
    }

    const notificationData: CreateNotificationDTO[] = [
      {
        to: fulfillments[0].order.email,
        channel: "email",
        template: "shipment.confirmed", // Use your actual shipment confirmation template ID
        data: { 
          order: fulfillments[0].order,
          fulfillment: fulfillments[0], // You can also pass fulfillment details if needed
        },
      },
    ];

    const notification = sendNotificationStep(notificationData);

    return new WorkflowResponse(notification);
  }
);