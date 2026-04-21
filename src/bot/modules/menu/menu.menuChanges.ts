import { InlineKeyboard, reply, searchPath, putJSON, type Menu } from "../../dest.js";
import { token } from "../../main.js";

export async function menuChanges(ctx: any, api_url?: string, url?: string) {
    if(!ctx.session.admin?.editMode || !ctx.session.admin?.hasAccessToEdit) { // EXIT IF NO ACCESS
        return await ctx.reply("Спочатку увімкніть режим редагування! (/edit)");
    }
    let pageData = await searchPath(ctx, ctx.session.admin?.updatedMenu); // SEARCH CURR PATH
    let action = ctx.session.admin?.action


    if(pageData.type === "category") { // IF CATEGORY
        
        let newMenuItem: Menu;
        if(action === "add_row") { // NEW ROW
            newMenuItem = {
                type: "row",
                isHidden: false,
                id: Date.now().toString(),
                caption: "*↩️*",
            }
            pageData.next.push(newMenuItem);
            await reply(ctx, pageData)
            return;

        } 
        if(action === "add_category") { // NEW CATEGORY
            newMenuItem = {
                type: "category",
                isHidden: false, 
                id: Date.now().toString() + Math.floor(Math.random() * 1000000),
                caption: "НОВИЙ РОЗДІЛ",
                photoId: [],
                next: []
            }
            newMenuItem.text = null;
            pageData.next.push(newMenuItem); // ADD NEW ITEM TO MENU( stored locally in admin session)
            await reply(ctx, pageData)
            return;
        }
        if(action === "add_product") { // NEW PRODUCT
            let messageData;
            newMenuItem = {
                type: "product",
                isHidden: false, 
                id: Date.now().toString() + Math.floor(Math.random() * 1000000),
                caption: "НЕ ВКАЗАНО",
                price: 0,
                photoId: [],
                maxCartAmount: 5
            }
            if(ctx.message.photo) { // IF HAS PHOTO
                messageData = ctx.message.caption.split("_"); // SPLIT CAPTION
                newMenuItem.photoId?.push(ctx.message.photo[1].file_id); // SET PHOTO 
            } else {
                messageData = ctx.message.text.split("_");
            }
            newMenuItem.caption = messageData[0] ?? 'НЕ ВКАЗАНО';   // SET CAPTION
            newMenuItem.text = messageData[1] === "" ? null : messageData[1]; // SET TEXT
            if( !messageData[2] ) {
                let botReply = await ctx.reply("Ціну не було вказано. Поточна ціна: 0 грн. Не забудьте відредагувати пізніше у карточці товару.")
                ctx.session.settings.msgId?.push(botReply.message_id);
                
            }
            if(messageData[2]) {
                if(isNaN(+messageData[2])) {
                    let botReply = await ctx.reply("Ціна була вказана не цифрами. Повторіть ввід.")
                    ctx.session.settings.msgId?.push(botReply.message_id);
                    return "bad_info";
                }
                newMenuItem.price = messageData[2]
                
            }
            pageData.next.push(newMenuItem); // ADD NEW ITEM TO MENU( stored locally in admin session)
            setTimeout(async () => {
                await reply(ctx, pageData)
                return;
            }, messageData[2]? 0 : 3000);
            
        }
    }
    
    if(action === "toggle_hidden") { // TOGGLE VISIBILITY
        pageData.isHidden = !pageData.isHidden;
        if(pageData.isHidden) { // ADD A BELL IF HIDDEN
            pageData.caption += "🔕"
        } else {
            pageData.caption = pageData.caption.slice(0, -2); // DELETE BELL

        }
        await reply(ctx, pageData)
        ctx.session.admin!.action = null;
        return;
    }
    if(action === "delete_item") {
        if(pageData?.type === "category") {
            try {
                console.log(`menuchanges.js: MSG BEFORE DELETING: ${ctx.session.settings.msgId}`)
                await ctx.api.deleteMessages(ctx.chatId, ctx.session.settings.msgId); // УДАЛИТИ СОО 
                ctx.session.settings.msgId = []
                console.log(`menuchanges.js: MSG AFTER DELETING: ${ctx.session.settings.msgId}`)
            } catch (err) {
                ctx.session.settings.msgId = []
                console.log(`menuchanges.js: ERROR WHILE DELETING MSG: ${err}`)
            }
            let botReply = await ctx.reply("Ви впевнені, що хочете видалити цілу категорію? Всі вкладені товари та категорії будуть видалені також.", {
                reply_markup: new InlineKeyboard().text("Так ✅", "edit:delete_item_yes").danger().text("Ні ❌", "edit:prevPage").success().row()
            })
            ctx.session.settings.msgId?.push(botReply.message_id);
            return;
        }
    }
    if((action === "delete_item_yes") || (action === "delete_item")) { // DELETE ITEM
        let id = pageData.id; // GET ID OF CURRENT ITEM
        ctx.session.settings.path.pop();
        pageData = await searchPath(ctx, ctx.session.admin?.updatedMenu); // SEARCH A PARENT OF ITEM
        if(pageData.type === "category") {
            pageData.next = pageData.next?.filter(item => item.id !== id); // FILTER A NEXT ARR WITHOUT THIS ITEM
        }
        await reply(ctx, pageData)
        return;
    }

    if(action === "edit_item") {
        await ctx.api.deleteMessages(ctx.chatId, ctx.session.settings.msgId);
        let replyMenu = new InlineKeyboard()
        replyMenu.text(`Назва: ${pageData.caption}`, "edit:change_caption").row();
        replyMenu.text(`Опис: ${pageData.text ?? "Не вказано ❌"}`, "edit:change_text").row();
        replyMenu.text(`Фото: ${pageData.photoId?.length ? "Присутні (" + pageData.photoId.length + ") ✅" : "Відсутні ❌"}`, "edit:change_photo").row();
        if(pageData.type === "product") {
            replyMenu.text(`Ціна: ${pageData.price}`, "edit:change_price").row();
            replyMenu.text(`Макс. к-сть в корзині: ${pageData.maxCartAmount}`, "edit:change_maxCartAmount").row();
        }
        replyMenu.text("⬅️  Повернутися назад", "edit:prevPage").row();
        let botReply = await ctx.reply("Що ви хочете змінити?", {
            reply_markup: replyMenu,
        })
        ctx.session.settings.msgId?.push(botReply.message_id);
        return;
    }
    if(action === "change_caption") {
        pageData.caption = ctx.message.text;
        await reply(ctx, pageData);
        return;
    }
    if(action === "change_text") {
        pageData.text = ctx.message.text;
        await reply(ctx, pageData);
        return;
    }
    if(action === "delete_text") {
        pageData.text = null;
        await reply(ctx, pageData);
        return;
    }
    if(action === "change_photo") {
        if(pageData.photoId === null) {
            pageData.photoId = [];
        }
        if(ctx.message.photo) {
            pageData.photoId?.push(ctx.message.photo[0].file_id);
            console.log(`menuchanges,caption: ${pageData.caption} photoid array: ${pageData.photoId}`)
            await reply(ctx, pageData);
            return;
        } else {ctx.session.settings.admin.action = null}
        
    }
    if(action === "delete_photo") {
        pageData.photoId = [];
        await reply(ctx, pageData);
        return;
    }
    if(action === "change_price") {
        if(pageData.type === "product") {
            if(isNaN(+ctx.message.text)) {
                let botReply = await ctx.reply("Ціна була вказана не цифрами. Повторіть ввід.")
                ctx.session.settings.msgId?.push(botReply.message_id);
                return "bad_info";
            }
            pageData.price = +ctx.message.text;
            console.log(`menu.change.js:${pageData.price}`)
            await reply(ctx, pageData);
            return;
        }
    }
    if(action === "change_maxCartAmount") {
        if(pageData.type === "product") {
            if(isNaN(+ctx.message.text)) {
                let botReply = await ctx.reply("Кількість була вказана не цифрами. Повторіть ввід.")
                ctx.session.settings.msgId?.push(botReply.message_id);
                return "bad_info";
            }
            if( (+ctx.message.text < 1) || (+ctx.message.text > 500)) {
                let botReply = await ctx.reply("Кількість була вказана не у рамках ліміту. Повторіть ввід.")
                ctx.session.settings.msgId?.push(botReply.message_id);
                return "bad_info";
            }
            pageData.maxCartAmount = +ctx.message.text;
            console.log(`menu.change.js: ${pageData.maxCartAmount}`)
            await reply(ctx, pageData);
            return;
        }
    }



    if(action === "prevPage") { // IF GOING BACK(edit:prevPage, NOT nav:prevPage)
        if(ctx.session.admin?.editMode == true) {
            if(ctx.session.admin?.action) { // if action is not null
                console.log(`menu.change.js: action of admin = ${ctx.session.admin?.action}`);
                ctx.session.admin!.action = null;
                console.log(`menu.change.js: action of admin = ${ctx.session.admin?.action}`);
            }
        await reply(ctx, pageData); // reply in current context with custome REPLY func
        }
    ctx.session.admin!.action = null;
    }
    /* ---------SAVE AND SEND TO THE SERVER-------------- */
    if(action === "save"){
        ctx.session.admin.editMode = false;
        // ctx.session.admin.hasAccessToEdit = false;
        try {
            console.log(`menuchanges(save).js: MSG BEFORE DELETING: ${ctx.session.settings.msgId}`)
            await ctx.api.deleteMessages(ctx.chatId, ctx.session.settings.msgId); // УДАЛИТИ СОО 
            ctx.session.settings.msgId = []
            console.log(`menuchanges(save).js: MSG AFTER DELETING: ${ctx.session.settings.msgId}`)
        } catch (err) {
            ctx.session.settings.msgId = []
            console.log(`menuchanges(save).js: ERROR WHILE DELETING MSG: ${err}`)
        }
        try {
            let res = await putJSON(ctx.session.admin?.updatedMenu, api_url!, url).then(async (response) => {
                return await response?.json()
                
            });
            console.log(res)
            let botReply = await ctx.reply("Меню було збережено локально. Щоб завантажити його на сервер та зробити доступним для усіх користувачів, введіть /loadmenu")
            ctx.session.settings.msgId.push(botReply.message_id)
        } catch (e) {
            console.log(e)
            let botReply = await ctx.reply("Меню не було збережено, виникла помилка: "+e)
            ctx.session.settings.msgId.push(botReply.message_id)
        }
        
        
    }
    return pageData;
}
