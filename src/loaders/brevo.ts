import { MedusaContainer } from "@medusajs/framework/types";
import { checkAbandonedCartsWorkflow } from "../workflows/steps/check-abandoned-carts";
import {
    LoaderOptions,
  } from "@medusajs/framework/types"
import checkAbandonedCartsJob from "../jobs/abandoned-cart";

interface ScheduleService {
  create: (config: { name: string; schedule: string; data?: Record<string, any> }) => void;
  register: (name: string, handler: () => Promise<void>) => void;
}

export default async function abandonedCartLoader({
    container,
    options,
  }: LoaderOptions) {
  const logger = container.resolve("logger");
  
  checkAbandonedCartsJob
  logger.info("Initializing abandoned cart loader...");

  
}