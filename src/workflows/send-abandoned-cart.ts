import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";
import { CreateNotificationDTO } from "@medusajs/framework/types";

type WorkflowInput = {
  cartId: string;
};

export const sendAbandonedCartWorkflow = createWorkflow(
  "send-abandoned-cart",
  ({ cartId }: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id",
        "email",
        "created_at",
        "customer.first_name",
        "customer.last_name",
        "customer.phone",
        "currency_code",
        "items.*"
      ],
      filters: { id: cartId },
    });

   

    const notificationData: CreateNotificationDTO[] = [
          {
            to: carts[0].email,
            channel: "email",
            template: "cart.abandoned",
            data: { cart: carts[0] },
          },
    ];


        
    const notificationStep = sendNotificationStep(notificationData);

    return new WorkflowResponse(notificationStep);
  }
);