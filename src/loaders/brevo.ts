import { LoaderOptions } from "@medusajs/framework/types";
import checkAbandonedCartsJob, { config } from "../jobs/abandoned-cart";

interface ScheduleService {
  create: (config: {
    name: string
    schedule: Record<string, any>
    data?: Record<string, any>
  }) => Promise<void> | void
  register: (name: string, handler: () => Promise<void>) => void
}

export default async function abandonedCartLoader({
  container,
}: LoaderOptions) {
  const logger = container.resolve("logger") as {
    info: (message: string) => void
  }
  const scheduleService = container.resolve<ScheduleService>("scheduleService")

  scheduleService.register(config.name, () => checkAbandonedCartsJob(container))

  await scheduleService.create({
    name: config.name,
    schedule: config.schedule,
  })

  logger.info(
    `Registered abandoned cart schedule "${config.name}" with schedule ${JSON.stringify(
      config.schedule
    )}`
  )
}
