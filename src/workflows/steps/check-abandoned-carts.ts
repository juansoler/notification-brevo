import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { sendAbandonedCartWorkflow } from "../send-abandoned-cart";
import { abandonedCartConfig } from "../../config";

type WorkflowInput = {
  container: any;
};

export const checkAbandonedCartsWorkflow = createWorkflow(
  "check-abandoned-carts",
  ({ container }: WorkflowInput) => {
    const checkCartsStep = createStep(
      "check-abandoned-carts-step",
      async (_, { container: stepContainer }) => {
        const cartModuleService = stepContainer.resolve(Modules.CART);
        const logger = stepContainer.resolve("logger");
        const query = stepContainer.resolve("query");

        if (!abandonedCartConfig.abandoned_carts) {
          logger.info("Abandoned carts feature is disabled in config.");
          return new StepResponse(null);
        }

        if (!abandonedCartConfig.checks.length) {
          logger.info("No abandoned cart checks configured.");
          return new StepResponse(null);
        }

        logger.info("Running check-abandoned-carts scheduled job...");

        const now = new Date();
        const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

        // Tính các ngưỡng kiểm tra dựa trên số phần tử thực tế trong checks
        const checkTimes = abandonedCartConfig.checks.map(check =>
          new Date(now.getTime() - parseInt(check.delay) * 60 * 60 * 1000)
        );

        //logger.info(`Checking intervals: ${abandonedCartConfig.checks.map(c => `${c.delay} hours`).join(", ")}`);

        const { data: carts } = await query.graph({
          entity: "cart",
          fields: [
            "id", "email", "created_at", "updated_at", "completed_at", "metadata",
            "items.id", "items.updated_at"
          ],
          filters: {
            completed_at: null,
            email: { $ne: null },
            updated_at: { $gte: seventyTwoHoursAgo.toISOString() },
          },
        });

        //logger.info(`Found ${carts.length} carts to check`);

        for (const cart of carts) {
          const latestItemUpdate = cart.items?.length > 0
            ? cart.items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0].updated_at
            : cart.updated_at;
          const check = new Date(latestItemUpdate);
          const hoursSinceUpdate = Math.floor((now.getTime() - check.getTime()) / (1000 * 60 * 60));

          const notifiedFlags = cart.metadata || {};

          let actionIndex = -1;
         
          for (let i = checkTimes.length - 1; i >= 0; i--) {
            if (check < checkTimes[i] && !notifiedFlags[`abandonedcart_mail_${i + 1}`]) {
              actionIndex = i;
              break;
            }
          }

          if (actionIndex >= 0) {
            const delay = abandonedCartConfig.checks[actionIndex].delay;
            const flagKey = `abandonedcart_mail_${actionIndex + 1}`;
            //logger.info(`Cart ${cart.id}: check = ${check}, hoursSinceUpdate = ${hoursSinceUpdate}`);
            //logger.info(`Sending abandoned cart email #${actionIndex + 1} to ${cart.email} after ${delay} hours`);
            await sendAbandonedCartWorkflow(stepContainer).run({ input: { cartId: cart.id } });
            await cartModuleService.updateCarts(cart.id, {
              metadata: { ...notifiedFlags, [flagKey]: true },
            });
          }
        }

        logger.info("Finished checking abandoned carts");
        return new StepResponse(null);
      }
    );

    const result = checkCartsStep();
    return new WorkflowResponse(result);
  }
);