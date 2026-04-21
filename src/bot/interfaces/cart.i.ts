import type { Product } from "../dest.js";

export interface Cart {
    products: Product[],
    totalPrice: number,

}