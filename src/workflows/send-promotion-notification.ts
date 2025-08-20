import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { sendNotificationStep } from "./steps/send-notification";
import { CreateNotificationDTO } from "@medusajs/framework/types";

type WorkflowInput = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  ends_at: string;
  promotion_code: string;
};

export const sendPromotionNotificationWorkflow = createWorkflow(
  "send-promotion-notification",
  (input: WorkflowInput) => {
    const notificationData: CreateNotificationDTO[] = [
      {
        to: input.email,
        channel: "email",
        template: "promotion-new-customer", 
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          phone: input.phone,
          ends_at: input.ends_at,
          promotion_code: input.promotion_code,
        },
      },
    ];

    const notification = sendNotificationStep(notificationData);

    return new WorkflowResponse(notification);
  }
);