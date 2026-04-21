import type { Cart } from "./cart.i.js"
import type { Menu } from "./menu.i.js"

export interface SessionData {
  admin?: {
    isDeveloper: boolean,
    hasAccessToEdit: boolean
    editMode: boolean,
    action?: string | null,
    updatedMenu: Menu | null,
    viewerMode: boolean,
    reshuffle: {
      isOn: boolean,
      page: Menu | null,
      reshuffledPage: Menu[];
    }
    copyPage: Menu | null,
    ids: [];
  },
  settings: {
    first_name: string | undefined,
    username: string | undefined,
    userId: number | undefined,
    shippingInfo?: {
      first_name?: string,
      second_name?: string,
      father_name?: string,
      phone_number?: string,
      novaPost_address?: string,
      editAction: string | null
    },
    msgId : number[],
    path : string[],
    cart: Cart
  }
  
}