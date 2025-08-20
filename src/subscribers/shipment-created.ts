import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { sendShipmentConfirmationWorkflow } from "../workflows/send-shipment-confirmation"

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendShipmentConfirmationWorkflow(container)
    .run({
      input: {
        id: data.id
      }
    })
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}