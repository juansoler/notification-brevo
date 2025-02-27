import { Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CreateNotificationDTO } from "@medusajs/framework/types"
import BrevoProviderService from "../../providers/notifications-brevo/services"

export const sendNotificationStep = createStep(
  "send-notification",
  async (data: CreateNotificationDTO[], { container }) => {
    const notificationModuleService = container.resolve(
      Modules.NOTIFICATION
    )
   


    const notification = await notificationModuleService.createNotifications(data)
    return new StepResponse(notification)
  }
)