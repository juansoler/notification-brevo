
## Information
Not a full-time professional developer so Medusa 2.0 is very hard to learn for me. 
If anyone want to improve this plugin, just submit your PR



# @kb0912/notification-brevo

A Medusa plugin to integrate Brevo (Sendinblue) notification provider for sending emails such as order confirmations and abandoned cart reminders.



### Features
- Send email notifications for order placement, order cancellation, customer creation, and abandoned carts using Brevo.
- Configurable delays for abandoned cart reminders.
- Supports multiple notification stages (first, second, third).

### Installation

To install the package, use Yarn:

```bash
yarn add @kb0912/notification-brevo
```

### Configuration
Add the plugin to your medusa-config.ts file to enable Brevo notifications in your Medusa project.

```bash
modules: [
 // Other module...
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "@kb0912/notification-brevo/providers/notifications-brevo",
            id: "brevo",
            options: {
              channels: ["email"],
               apiKey: process.env.BREVO_API_KEY || "your-brevo-api-key",
      from: process.env.BREVO_FROM_EMAIL || "info@example.com",
      orderPlacedTemplateId: process.env.BREVO_ORDER_PLACED_TEMPLATE_ID || "11",
      orderCanceledTemplateId: process.env.BREVO_ORDER_CANCELED_TEMPLATE_ID || "14",
      customerCreatedTemplateId: process.env.BREVO_CUSTOMER_CREATED_TEMPLATE_ID || "12",
      abandonedCartTemplateId: process.env.BREVO_ABANDONED_CART_TEMPLATE_ID || "13",
            },
          },
        ],
      }
      },
      }
}
```
then 
```bash
const plugins = [
  // Other plugins...
  {
    resolve: "@kb0912/notification-brevo",
    options: {
    
      
    },
  },
];
```

### Environment Variables

You can use environment variables to override default values:

```bash
# .env
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=info@example.com
BREVO_ORDER_PLACED_TEMPLATE_ID=11
BREVO_ORDER_CANCELED_TEMPLATE_ID=14
BREVO_CUSTOMER_CREATED_TEMPLATE_ID=12
BREVO_ABANDONED_CART_TEMPLATE_ID=13
BREVO_CART_FIRST_DELAY=24
BREVO_CART_SECOND_DELAY=48
BREVO_CART_THIRD_DELAY=72
ENABLE_ABANDONED_CARTS=true
```

### Usage
Once configured, the plugin will:

Send order confirmation emails when an order is placed.
Send abandoned cart reminder emails based on the configured delays (e.g., 24, 48, 72 hours) after the cart's last update.
Prerequisites

A Medusa server running v2.x.
A Brevo account with API key and email templates set up.