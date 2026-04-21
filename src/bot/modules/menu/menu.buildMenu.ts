import { InlineKeyboard } from "grammy";
import type { Menu, Product } from "../../dest.js";
import { manager } from "../../main.js";

// MENU BUILDING(GENERAL)
export function buildMenu(ctx: any, pageData: Menu, editMode: boolean = false, callback_part: string = "nav") {
    const menu = new InlineKeyboard();
    if(pageData.type === "category") {
        if (pageData.next?.length !== 0) { // iF CURRENT PATH HAS ITEMS OR CATEGORIES
            for (const nested of pageData.next!) {
                if(nested.isHidden && !editMode) continue; // IF HIDDEN AND EDITMODE=false - SKIP
                if((nested.type === "row") && ((!editMode) && (!ctx.session.admin?.reshuffle?.isOn)) ) { // IF ROW AND EDITMODE=false - SKIP, otherwise place ROW
                    menu.row();
                    continue;
                }
                menu.text(nested.caption, `${callback_part}:${nested.id}`) // BUTTON CREATION
                if((nested.type === "row")) {
                    menu.row()
                }
            }
        }
    }
    if((!editMode) && (pageData.type == "product") && (!ctx.session.admin?.viewerMode) && (!ctx.session.admin?.reshuffle?.isOn)) {
        if(ctx.session.settings.cart.products.filter( (itemCart: Product) => itemCart.id === pageData.id).length === 0) {
            menu.row().text("🛒 Додати в корзину", "nav:addToCart")

        }
        menu.row().text(`${ctx?.session.settings.cart.products.filter( (item: Product) => item.id === pageData.id).length === 0? "📝 Додати декілька" : "✏️ Змінити к-сть у корзині"}`, "nav:mult_addToCart");
    }
    if(pageData.id !== "no-connection") {
        if((pageData.id !== undefined) && (pageData.id !== "cart") && (!editMode) && (ctx.session.settings.path[0] !== "cart") && (!ctx.session.admin?.viewerMode) && (!ctx.session.admin?.reshuffle?.isOn) ) { // SHOW CART
            menu.row().text(`🛒 Корзина(${ctx.session.settings.cart.products.length})`, "nav:cart").row()
        }
        if ((pageData.id !== 'root') && (pageData.id !== undefined) && (pageData.id !== "cart") && (!ctx.session.admin?.reshuffle?.isOn)) {
            menu.row().text(`${ctx.session.settings.path[0] === "root" ? "⬅ Назад" : "⬅ До корзини"}`, "nav:prevPage").text("🏠 Головне меню", "nav:mainPage")
        }
    }
    if( (!editMode) && ((ctx.session.settings.path.at(-1) === "root") || (pageData.id === "no-connection")) ) {
        menu.row().url("👨‍💻 Зв'язатись з менеджером", `tg://resolve?domain=${manager.username.replace("@","")}`)
    }
    
    return menu;

}
export function extendedBuildMenu(ctx: any, pageData: Menu, editMode: boolean, callback_part: string = "nav") {
    const extendedMenu = buildMenu(ctx, pageData, editMode, callback_part);
    if(pageData.id !== "no-connection") {
        if (editMode) {
            if((pageData.id !== "root") && (ctx.session.admin.copyPage === null) || (ctx.session.admin.copyPage === undefined)) {
                extendedMenu.row().text(`Скопіювати ${pageData.type === "category"? "категорію" : "товар"}`, "edit:copyPage").success()
            }
            if (pageData.type === "category") {
                if((ctx.session.admin.copyPage !== null) && (ctx.session.admin.copyPage !== undefined)) {
                    extendedMenu.row().text(`Вставити ${ctx.session.admin.copyPage.type === "category"? "категорію" : "товар"}`, "edit:pasteCopyPage").success()
                    extendedMenu.row().text(`Очистити скопійоване`, "edit:deleteCopyPage").danger()
                }
                extendedMenu.row().text("➕ Створити розділ", "edit:add_category").success().text("➕ Створити товар", "edit:add_product").success().row().text("↩️ Нові кнопки із нового рядка", "edit:add_row").success();
            }
            if (pageData.id == "root") {
                extendedMenu.row().text("✏ Редагувати","edit:edit_item").success().row();
            } else {
                if(pageData.isHidden) {
                    extendedMenu.row().text("👁 Показати", "edit:toggle_hidden").success();
                } else {
                    extendedMenu.row().text("🙈 Приховати", "edit:toggle_hidden").danger();
                }
                extendedMenu.text("✏ Редагувати","edit:edit_item").success().row().text(`🗑 Видалити ${pageData.type === "category"? 'розділ' : 'товар'}`, "edit:delete_item").danger();
            }
            if(pageData.type == "category") {
                if(pageData.next.length >= 2) {
                    extendedMenu.row().text("🔃 Включити режим перестановки", "edit:reshuffle_mode").success()
                }
            }
            extendedMenu.row().text("👀Подивитись від лиця користувача", "edit:watch_as_user").success()
            extendedMenu.row().text("💾 Зберегти меню", "edit:save").success();
        }
        if(ctx.session.admin.reshuffle.isOn) {
            extendedMenu.row().text("✅🔃 Зберегти зміни", "edit:reshuffle_save").success()
            extendedMenu.row().text("❌🔃 Вийти без змін", "edit:reshuffle_mode").danger()
        
        }
    }
    
    return extendedMenu;
}