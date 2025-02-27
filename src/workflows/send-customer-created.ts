import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { sendNotificationStep } from "./steps/send-notification";

type WorkflowInput = {
  id: string;
};

export const sendCustomerCreatedWorkflow = createWorkflow(
  "send-customer-created",
  ({ id }: WorkflowInput) => {
    const { data: customers } = useQueryGraphStep({
      entity: "customer",
      fields: ["*", "first_name", "last_name", "phone"],
      filters: { id },
    });

    //console.log("Customer data retrieved:", customers);

    const notification = sendNotificationStep([
      {
        to: customers[0].email,
        channel: "email",
        template: "customer.created",
        data: { customer: customers[0] },
      },
    ]);

    return new WorkflowResponse(notification);
  }
);