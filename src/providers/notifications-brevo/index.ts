import abandonedCart from "../../jobs/abandoned-cart"
import BrevoProviderService from "./services"
import { 
  ModuleProvider, 
  Modules
} from "@medusajs/framework/utils"

export * from "./types"
export * from "../../jobs/abandoned-cart"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [BrevoProviderService],
  
})

