// src/config.ts trong @kb0912/notification-brevo
interface Check {
    delay: string; // Chỉ cho phép string, không undefined
  }
  
  export const abandonedCartConfig = {
    abandoned_carts: process.env.ENABLE_ABANDONED_CARTS === "true" || false,
    checks: [
      { delay: process.env.BREVO_CART_FIRST_DELAY || 24},
      { delay: process.env.BREVO_CART_SECOND_DELAY },
      { delay: process.env.BREVO_CART_THIRD_DELAY },
    ].filter((check): check is Check => 
      check.delay !== undefined && check.delay !== null && check.delay !== ""
    ),
  };