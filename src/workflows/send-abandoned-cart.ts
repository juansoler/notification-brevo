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
    const cartStep = useQueryGraphStep({
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

    const prepareNotificationStep = createStep(
      "prepare-abandoned-cart-notification",
      async (input: { data: any[] }) => {
        const carts = input.data;
        //console.log("Cart data retrieved:", carts);

        const notificationData: CreateNotificationDTO[] = [
          {
            to: carts[0].email,
            channel: "email",
            template: "cart.abandoned",
            data: {
              cart: {
                id: carts[0].id,
                created_at: carts[0].created_at,
                name: (carts[0].customer?.first_name || "") + " " + (carts[0].customer?.last_name || ""),
                phone: carts[0].customer?.phone || "Không có số điện thoại",
                items: carts[0].items // Thêm danh sách items vào data.cart
              },
            },
          },
        ];

        //console.log("Prepared abandoned cart notification data:", notificationData);
        return new StepResponse(notificationData);
      }
    );

    const notificationData = prepareNotificationStep(cartStep);
    const notificationStep = sendNotificationStep(notificationData);

    return new WorkflowResponse(notificationStep);
  }
);