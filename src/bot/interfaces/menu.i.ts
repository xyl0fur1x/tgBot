interface Base {
    isHidden: boolean
    id: string,
    caption: string,
    text?: string | null,
    photoId?: string[] | null,
    type: "category" | "product" | "row"
}
interface Category extends Base {
    type: "category",
    next: Menu[]
}
export interface Product extends Base {
    type: "product",
    price: number,
    maxCartAmount: number,
    path?: string[],
    amount?: number
}
interface Row extends Base {
    type: "row"
}
export type Menu = Category | Product | Row;