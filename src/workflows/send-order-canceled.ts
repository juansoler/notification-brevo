import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";

type WorkflowInput = {
  id: string;
};

export const sendOrderCanceledWorkflow = createWorkflow(
  "send-order-canceled",
  ({ id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["id", "email"],
      filters: { id },
    });

    const notification = sendNotificationStep([
      {
        to: orders[0].email,
        channel: "email",
        template: "order.canceled",
        data: { order: orders[0] },
      },
    ]);

    return new WorkflowResponse(notification);
  }
);