import BrevoProviderService from "../src/providers/notifications-brevo/services"
import { BrevoProviderConfig } from "../src/providers/notifications-brevo/types"

const logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
} as any

const config: BrevoProviderConfig = {
  apiKey: "test_key",
  from: "no-reply@example.com",
  orderPlacedTemplateId: "1",
  orderCanceledTemplateId: "2",
  customerCreatedTemplateId: "3",
  promotionNewCustomerTemplateId: "4",
  shipmentConfirmedTemplateId: "5",
  abandonedCartTemplateId: "6",
  abandonedCartIntervals: "[]",
  abandoned_cart: {
    first: { delay: "0" },
    second: { delay: "0" },
    third: { delay: "0" },
  },
}

const service = new BrevoProviderService({ logger }, config)

;(service as any).apiInstance.sendTransacEmail = async () => ({ messageId: "mock" }) as any

async function run() {
  const result = await service.send({
    to: "customer@example.com",
    template: "order.placed",
    data: {
      order: {
        id: "order_1",
        email: "customer@example.com",
        currency_code: "usd",
        created_at: new Date().toISOString(),
        display_id: "1001",
        total: 0,
        shipping_address: {
          first_name: "Test",
          last_name: "User",
        },
        billing_address: null,
        shipping_subtotal: 0,
        shipping_methods: [],
        items: [],
        payment_collections: [],
        fulfillments: [],
      },
    },
  } as any)

  if (!result || !result.id) {
    throw new Error("Expected send to return a result identifier")
  }

  console.log("order.placed without payments handled successfully")
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
