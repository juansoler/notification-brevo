import { 
  AbstractNotificationProviderService, 
  MedusaError,
} from "@medusajs/framework/utils";
import { 
  ProviderSendNotificationDTO, 
  ProviderSendNotificationResultsDTO,
  Logger,
} from "@medusajs/framework/types";
import * as Brevo from "@getbrevo/brevo";
import { BrevoProviderConfig } from "./types";



class BrevoProviderService extends AbstractNotificationProviderService {
  static identifier = "brevo";

  public options: BrevoProviderConfig; // Đổi từ protected thành public
  protected apiInstance: Brevo.TransactionalEmailsApi;
  protected logger: Logger;

  constructor({ logger }: { logger: Logger }, options: BrevoProviderConfig) {
    super();
    this.options = options;
    this.logger = logger;
    
    if (!this.options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BREVO_API_KEY need to be set"
      );
    }
    if (!this.options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BREVO_FROM_EMAIL need to be set"
      );
    }

    this.apiInstance = new Brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      this.options.apiKey
    );
  }

  humanPrice(amount, currencyCode) {
    if (!amount)
      return "0.00";

    const formatter = new Intl.NumberFormat([], {
      style: "currency",
      currencyDisplay: "narrowSymbol",
      currency: currencyCode, // "VND"
    });

    return formatter.format(amount);
  }


  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const { to, template, data } = notification;
    let templateId: number;
    let params: any;
   

    switch (template) {
      case "order.placed":
        templateId = parseInt(this.options.orderPlacedTemplateId);
        const order = (data as any).order;

       

        const paymentMethodMap = {
          "pp_bank-transfer_bank-transfer": "Bank Transfer",
          "pp_stripe_stripe": "Credit Card",
          "pp_system_default": "Cash on Delivery",

       };
  
      
      const mapPaymentMethod = (providerId) => {
          
          if (providerId && providerId.startsWith("pp_stripe_")) {
              return "Credit Card";
          }
          
          return paymentMethodMap[providerId] || providerId;
      };

        params = {
          order_id: order?.id,
          email: order?.email,
          currency_code: order?.currency_code,
          
          date_placed: new Date(order?.created_at).toLocaleDateString(),
          display_id: order?.display_id,
          total: this.humanPrice(order?.total, order?.currency_code), 
          customer_name: `${order?.shipping_address?.first_name} ${order?.shipping_address?.last_name}`, // Full name
          items: order?.items.map((item: any) => ({
            ...item,
            unit_price: this.humanPrice(item.unit_price, order?.currency_code),
            total: this.humanPrice(item.total, order?.currency_code),
            thumbnail: item.thumbnail,
            title: item.product_title,
            description: item.product_description
        })),
          shipping_address: order?.shipping_address,
          billing_address: order?.billing_address, 
          shipping_subtotal: this.humanPrice(order?.shipping_subtotal, order?.currency_code), 
          shipping_methods: order?.shipping_methods,
          payment_collections: order?.payment_collections[0]?.payments.map(payment => ({
            ...payment,
            provider_id: mapPaymentMethod(payment.provider_id) // Ánh xạ provider_id
          })) || [],

          fulfillments: order?.fulfillments,
        };
        
      break;

     


      case "order.canceled":
        templateId = parseInt(this.options.orderCanceledTemplateId);
        params = {
          order_id: (data as any).order?.id,
          customer_name: (data as any).order?.billing_address?.first_name,
        };
        break;

      case "customer.created":
        templateId = parseInt(this.options.customerCreatedTemplateId);
        params = {
          name: (data as any).customer?.first_name + " " + ((data as any).customer?.last_name || ""),
          phone: (data as any).customer?.phone,
          customer_id: (data as any).customer?.id,
        };
        break;

      case "cart.abandoned":
        templateId = parseInt(this.options.abandonedCartTemplateId);
        
        const cart = (data as any).cart;

        params = {
          cart_id: cart?.id,
          created_at: cart?.created_at,
          name: cart?.name,
          phone: cart?.phone,
          currency_code: cart?.currency_code,
          item: cart?.items.map((item: any) => ({
            ...item,
            unit_price: this.humanPrice(item.unit_price, cart?.currency_code),
            total: this.humanPrice(item.total, cart?.currency_code),
            thumbnail: item.thumbnail,
            title: item.product_title,
            description: item.product_description,
          })),
        };
        break;

      default:
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Template ${template} is not supported`
        );
    }

    if (isNaN(templateId) || templateId === 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Template ID for ${template} is not set in options`
      );
    }

    if (!to) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Email is not found for ${template}`
      );
    }

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: this.options.from };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.templateId = templateId;
    sendSmtpEmail.params = params;

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.info(`Email sent to ${to} for template ${template}`);

      return {
        id: `${template}-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Error while sending email ${to}:`, error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Email is not send"
      );
    }
  }

  async resend(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    return this.send(notification);
  }
}

export default BrevoProviderService;