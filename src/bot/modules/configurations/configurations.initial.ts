import { type SessionData } from "../../dest.js";

export function initial(): SessionData { // ПОЧАТКОВІ ЗНАЧЕННЯ СЕСІЙ ДЛЯ НОВИХ КОРИСТУВАЧІВ
     return {
        settings: {
            first_name: undefined,
            username: undefined,
            userId: 0,
            shippingInfo: {
                editAction: null
            },
            msgId: [],
            path: ["root"],
            cart: {
                products: [],
                totalPrice: 0
            }
        }
    };
}