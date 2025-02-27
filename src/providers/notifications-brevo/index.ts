import BrevoProviderService from "./services"
import { 
  ModuleProvider, 
  Modules
} from "@medusajs/framework/utils"

export * from "./types"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [BrevoProviderService],
  
})

