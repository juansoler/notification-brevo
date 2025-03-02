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

        // Tạo formatter dựa trên currency_code
        const formatter = new Intl.NumberFormat([], {
          style: "currency",
          currencyDisplay: "narrowSymbol",
          currency: order.currency_code.toUpperCase(), // "VND"
        });

        params = {
          order_id: order?.id,
          email: order?.email,
          currency_code: order?.currency_code,
          display_id: order?.display_id,
          total: formatter.format(order?.total), 
          customer_name: order?.shipping_address?.first_name,
          items: order?.items.map((item: any) => ({
            ...item,
            unit_price: formatter.format(item.total), 
          })),
          shipping_address: order?.shipping_address,
          shipping_subtotal: formatter.format(order?.shipping_subtotal), 
          shipping_methods: order?.shipping_methods,
          payment_collections: order?.payment_collections?.payments,
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
        
        params = {
          cart_id: (data as any).cart?.id,
          created_at: (data as any).cart?.created_at,
          name: (data as any).cart?.name,
          phone: (data as any).cart?.phone,
          items: (data as any).cart?.items, 
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