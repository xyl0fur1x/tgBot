import { type Context } from "../../dest.js";

export function getSessionKey(ctx: Context): string | undefined { // ЗАДАТИ КЛЮЧ СЕСІЇ ДЛЯ КОРИСТУВАЧА
    return ctx.from?.id.toString();
}