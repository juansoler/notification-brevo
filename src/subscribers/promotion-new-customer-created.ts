import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendPromotionNotificationWorkflow } from "../workflows/send-promotion-notification";

export default async function promotionNewCustomerHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  customer_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  ends_at: string;
  promotion_code: string;
}>) {
  await sendPromotionNotificationWorkflow(container).run({
    input: {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      ends_at: data.ends_at,
      promotion_code: data.promotion_code,
    },
  });
}

export const config: SubscriberConfig = {
  event: "promotion-new-customer.created",
};