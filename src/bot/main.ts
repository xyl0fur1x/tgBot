/* ---------- IMPORTS ------------ */
import { sequentialize } from "@grammyjs/runner";
import {
    Bot, 
    Context, 
    GrammyError, 
    HttpError, 
    InlineKeyboard, 
    InputFile, 
    session, 
    dotenv,
    type SessionData,
    type Menu,
    type MyContext,
    searchPath, 
    reply, 
    menuChanges,
    addToCart,
    getJSON,
    putJSON,
    buildCart,
    FileAdapter,
    cleanCart,
    initial,
    getSessionKey,
    commands,
    userCommands,
    adminCommands,
    showHints,
    shippingInfo,
    autoRetry,
    run,
    reshuffle,
    searchDublicates,
} from "./dest.js"


/*--------- BOT and ENV CONFIGURATION-------- */
dotenv.config();
export const token = process.env.API_KEY;
export const botDevs = {
    ids: ["450052409"] // last yura "574725825" /"5606374346"me
}
export const manager = {
    username: "@xyl0fur1x"
}
export const bot = new Bot<MyContext>(token!);
export const _api_url = process.env.API_URL;
export let storage = new FileAdapter<SessionData>({
    dirName: "./sessions"
});
export let menuData = { // MENU OBJ(for exporting)
    rootDir: await getJSON("/", _api_url!).then( (res) => { 
        console.log("menu initializing is done");    
        return res as Menu;
    })
}
/* --------------------------- */



bot.use(sequentialize(getSessionKey))
bot.use(session({ 
    initial, 
    getSessionKey, 
    storage, }), async (ctx, next) => { 
    ctx.config = {
        menu: menuData.rootDir

    };
    ctx.session.settings.first_name = ctx.from?.first_name;
    ctx.session.settings.username = ctx.from?.username;
    ctx.session.settings.userId = ctx.from?.id
    await next();
})
bot.api.config.use(autoRetry());
bot.use(commands());
bot.use(userCommands);
bot.filter((ctx) => botDevs.ids.includes( String(ctx.from?.id))).use(adminCommands)
await showHints()






//---------GETME USER DEBUG---------
bot.command("getme", async ctx => {
    await ctx.reply(`USER ID: <code>${ctx.from?.id}</code>(натисніть щоб скопіювати)\nUSERNAME: ${ctx.from?.username ? "@"+ctx.from.username : "undefined"}`, {
        parse_mode: "HTML"
    });
})
/* ---------------------------------- */


// RESHUFFLE EDIT CALLBACK
bot.callbackQuery(/^edit:/, async (ctx, next) => {
    const action = ctx.callbackQuery.data.split(":")[1]!; // GET ACTION
    try {
        await ctx.answerCallbackQuery(action);
    } catch (e) {
        console.log(e)
    }
    if((!ctx.session.admin?.hasAccessToEdit) || (!ctx.session.admin?.isDeveloper)) { // IF NOT LOGGED IN
        return await ctx.reply("Спочатку увійдіть у систему!")
    }
    ctx.session.admin!.action = action; // SET ACTION TO ADMIN SESSION
    if(action === "reshuffle_mode") {
        ctx.session.admin.editMode = !ctx.session.admin.editMode;
        ctx.session.admin.reshuffle.isOn = !ctx.session.admin.reshuffle.isOn
        if(ctx.session.admin.reshuffle.isOn) {
            await reshuffle(ctx, "edit");
            await reply(ctx, ctx.session.admin.reshuffle.page!, "reshuffle")
        } else {
            ctx.session.admin.action = null;
            await reshuffle(ctx, "edit")
            await reply(ctx, ctx.session.admin.updatedMenu!, "nav")
        }
        return;
    }
    if(action == "reshuffle_save") {
        await reshuffle(ctx, "save");
        if(ctx.session.admin.action === null) {
            await reply(ctx, ctx.session.admin.updatedMenu!, "nav");
        }
    }
    await next()
})
// RESHUFFLE CALLBACK
bot.callbackQuery(/^reshuffle:/, async (ctx, next) => {
    const itemId = ctx.callbackQuery.data.split(":")[1]!; // GET ITEMID
    try {
        await ctx.answerCallbackQuery();
    } catch (e) {
        console.log(e)
    }
    if((!ctx.session.admin?.hasAccessToEdit) || (!ctx.session.admin?.isDeveloper)) { // IF NOT LOGGED IN
        return await ctx.reply("Спочатку увійдіть у систему!")
    }
    
    await reshuffle(ctx, "edit", itemId)
})




// COPY EDIT CALLBACK 
bot.callbackQuery(/^edit:/, async (ctx, next) => {
    const action = ctx.callbackQuery.data.split(":")[1]!; // GET ACTION
    try {
        await ctx.answerCallbackQuery(action);
    } catch (e) {
        console.log(e)
    }
    
    if((!ctx.session.admin?.hasAccessToEdit) || (!ctx.session.admin?.isDeveloper)) { // IF NOT LOGGED IN
        return await ctx.reply("Спочатку увійдіть у систему!")
    }

    if(action === "copyPage") {
        ctx.session.admin.copyPage = structuredClone(await searchPath(ctx, ctx.session.admin.updatedMenu!).then( res => {
            return res
        }))
        ctx.session.admin.copyPage!.id = Date.now().toString();
        let botReply = await ctx.reply(`${ctx.session.admin.copyPage?.type === "category"? "Категорію" : "Товар"} було скопійовано!`)
        setTimeout(async() => {
            try {
                ctx.api.deleteMessage(ctx.chatId!, botReply.message_id);
            } catch (e){
                console.log(e)
            }
        }, 2000);
        await reply(ctx, ctx.session.admin.updatedMenu!)
        return;
    }
    if(action === "pasteCopyPage") {
        let currPage = await searchPath(ctx, ctx.session.admin.updatedMenu!).then( res => {
            if(res.type === "category") {
                return res.next;
            }
        })
        let count = 0;
        for(let item of currPage!) {
            if(item.type !== "row") {
                count +=1;
            } else {
                count = 0;
            }
        }
        if(count === 4) {
            await ctx.reply("К-сть кнопок в рядку не може бути більшою ніж 4.")
            return;
        }
        currPage!.push(ctx.session.admin.copyPage!);
        if(ctx.session.admin.ids.length !== 0) {
            ctx.session.admin.ids = [];
        }
        if(ctx.session.admin?.updatedMenu?.type === "category") {
            searchDublicates(ctx, ctx.session.admin!.updatedMenu.next)
            console.log(ctx.session.admin?.ids)
        }
        let botReply = await ctx.reply(`${ctx.session.admin.copyPage?.type === "category"? "Категорію" : "Товар"} було вставлено!`)
        ctx.session.admin.copyPage = null;
        await reply(ctx, ctx.session.admin.updatedMenu!);
        setTimeout(async() => {
            try {
                ctx.api.deleteMessage(ctx.chatId!, botReply.message_id);
            } catch (e){
                console.log(e)
            }
        }, 2000);
        return;
    }
    if(action === "deleteCopyPage") {
        ctx.session.admin.copyPage = null;
        await reply(ctx, ctx.session.admin.updatedMenu!);
        return;
    }
    await next();
})

// EDITING CALLBACK
bot.callbackQuery(/^edit:/, async (ctx) => {
    const action = ctx.callbackQuery.data.split(":")[1]!; // GET ACTION
    try {
        await ctx.answerCallbackQuery(action);
    } catch (e) {
        console.log(e)
    }
    
    if((!ctx.session.admin?.hasAccessToEdit) || (!ctx.session.admin?.isDeveloper)) { // IF NOT LOGGED IN
        return await ctx.reply("Спочатку увійдіть у систему!")
    }
    ctx.session.admin!.action = action; // SET ACTION TO ADMIN SESSION


    /* if action is selfstanding, does not need an user text/photo input */
    if((action === "add_row") || (action === "toggle_hidden") || (action === "edit_item") || (action === "delete_item") || (action === "delete_item_yes") || (action === "prevPage") || (action === "delete_text") || (action === "delete_photo")) { 
        await menuChanges(ctx)
        ctx.session.admin.action = null;
        return;
    }
    if((action === "save")) {
        await menuChanges(ctx, _api_url, "/load")
        ctx.session.admin.action = null;
        return;
    }
    if(action === "watch_as_user") {
        ctx.session.admin.editMode = false;
        ctx.session.admin.viewerMode = true;
        ctx.session.admin.action = null;
        await reply(ctx, ctx.session.admin.updatedMenu!);
        
    }

    if((action == "add_category") || (action == "add_product")) { // IF ADDING NEW PRODUCT OR CATEGORY
        let pageData = await searchPath(ctx, ctx.session.admin.updatedMenu!); // GET PATH
        let currAmount = 0; // AMOUNT OF NON ROW ELEMENTS
        if(pageData.type === "category"){
            for(let item of pageData.next) {
                if(item.type !== "row") currAmount +=1;
                if(item.type === "row") currAmount = 0;
            }
        }
        if(currAmount < 4) { // IF LESS THAN 4 NON ROW
            let botReply;
            if(action === "add_category") {
                await menuChanges(ctx)
                ctx.session.admin.action = null;

            }
            if(action === "add_product") {
                try {
                    console.log(`main.js: MSG BEFORE DELETING: ${ctx.session.settings.msgId}`)
                    await ctx.api.deleteMessages(ctx.chatId!, ctx.session.settings.msgId); // УДАЛИТИ СОО 
                    ctx.session.settings.msgId = []
                    console.log(`main.js: MSG AFTER DELETING: ${ctx.session.settings.msgId}`)
                } catch (err) {
                    ctx.session.settings.msgId = []
                    console.log(`main.js: ERROR WHILE DELETING MSG: ${err}`)
                }
                botReply = await ctx.reply(`Введіть дані нового товару у такому форматі: \n\n<b><code>НАЗВА_ОПИС(необов'язково)_ЦІНА(необов'язково)</code></b>. \n\nЯкщо хочете добавити фото до товару, прикріпіть фото, та у цьому ж повідомленні введіть дані у тому ж форматі. За замовчуванням, береться перше надіслане фото, інші будуть проігноровані. Якщо ви хочете добавити декілька фото до товару, зробіть це у розділі редагування товару пізніше. \n\nЯкщо хочете пропустити необо'язкове поле(опис), просто пропустіть його, наприклад: \n\n<b><code>Запальничка_Запальничка заправляється бензином та горить понад 10 годин_1000</code></b> \n\nАБО: \n\n<b><code>Запальничка__1000  АБО  Запальничка</code></b>`, {parse_mode: 'HTML', reply_markup: new InlineKeyboard().text("Повернутись назад", "edit:prevPage")})    
                ctx.session.settings.msgId?.push(botReply!.message_id);
            }
        } else {
            let botReply = await ctx.reply("Максимальна кількість кнопок в одному рядку не повинна перебільшувати 4 штук.", {reply_markup: new InlineKeyboard().text("Повернутись назад", "edit:prevPage")})
            ctx.session.settings.msgId?.push(botReply.message_id);
            ctx.session.admin.action = null;

        }
        return;
    }

    /* -------EDITING--------- */
    if(action === "change_caption") { 
        let botReply = await ctx.reply("Введіть нову назву:");
        ctx.session.settings.msgId?.push(botReply.message_id);
    }
    if(action === "change_text") {
        let currPageText = await searchPath(ctx, ctx.session.admin.updatedMenu!).then( res => {
            return res.text ?? "Не вказано ❌";
        })
        let botReply = await ctx.reply(`Поточний опис(натисніть щоб скопіювати): <code>${currPageText}</code>`, {
            parse_mode: "HTML"
        })
        ctx.session.settings.msgId?.push(botReply.message_id);
        botReply = await ctx.reply("Введіть новий опис:", {
            reply_markup: new InlineKeyboard().text("🗑 Видалити опис", "edit:delete_text")
        });
        ctx.session.settings.msgId?.push(botReply.message_id);
    }
    if(action === "change_photo") {
        let botReply = await ctx.reply("Надішліть нове/нові фото:", {
            reply_markup: new InlineKeyboard().text("🗑 Видалити поточне/поточні фото", "edit:delete_photo")
        })
        ctx.session.settings.msgId?.push(botReply.message_id);
    }
    if(action === "change_price") {
        let botReply = await ctx.reply("Введіть нову ціну:")
        ctx.session.settings.msgId?.push(botReply.message_id);
    }
    if(action === "change_maxCartAmount") {
        let botReply = await ctx.reply("Введіть максимальну к-сть цього товару в корзині(мін: 1, макс: 500");
        ctx.session.settings.msgId?.push(botReply.message_id);
    }
})

bot.on(["message:text", "message:photo"], async (ctx, next) => { // GETTING PHOTO OR TEXT
    let res;
    if(ctx.session.admin?.editMode) { // EDITMODE = true?
        const action = ctx.session.admin?.action;
        ctx.session.settings.msgId?.push(ctx.msgId);
        if((action === "add_product")|| (action === "change_caption") || (action === "change_text") || (action === "change_photo") || (action === "change_price") || (action === "change_maxCartAmount")) {
            res = await menuChanges(ctx);
            
        }
        if((res !== "bad_info") && (action !== "change_photo") ) {
            ctx.session.admin.action = null;
        }
        console.log(ctx.message.photo);
        return;
    }
    if(ctx.session.settings.path.at(-1) === "mult_addToCart") {
        ctx.session.settings.msgId?.push(ctx.msgId);
        await addToCart(ctx, menuData.rootDir, +ctx.message.text!)
    }
    await next();
})



// NAVIGATION CALLBACK 
bot.callbackQuery(/^nav:/, async (ctx) => {
    try {
        await ctx.answerCallbackQuery();
    } catch (e) {
        console.log(e)
    }
    const action = ctx.callbackQuery.data.split(':')[1]!;
    console.log(`CURR PATH WHEN NAVIGATING BEFORE POP: ${ctx.session.settings.path}`)
    if(action === "prevPage") {
        if(ctx.session.settings.path[0] === "cart") {
            ctx.session.settings.path = ["cart"]
            if(ctx.session.settings.shippingInfo) {
                ctx.session.settings.shippingInfo.editAction = null;
            }
            await buildCart(ctx)
            return;
        } else {
            ctx.session.settings.path.pop();

        }
    } 
    else if (action === "mainPage") {
        ctx.session.settings.path = ["root"]
    }
    else if(action === "addToCart") {
        if(ctx.session.settings.path.at(-1) !== action) ctx.session.settings.path.push(action);
        await addToCart(ctx, menuData.rootDir, 1) // rootDir
        return;
    }
    else if(action === "mult_addToCart") {
        if(ctx.session.settings.path.at(-1) !== action) ctx.session.settings.path.push(action);
        await addToCart(ctx, menuData.rootDir) // rootDir
        return;
    }
    else if(action === "cart") {
        ctx.session.settings.path = ["cart"]
        await buildCart(ctx);
        return;
    }
    else if(action == "cleanCart") {
        await cleanCart(ctx);
    }
    else if(action === "processOrder") {
        await shippingInfo(ctx)
        return;
    }
    else {
        if(ctx.session.settings.path.at(-1) !== action) ctx.session.settings.path.push(action);
    }
    await reply(ctx, menuData.rootDir);
    
})



// SHIPPING 
bot.callbackQuery(/^shipping:/, async ctx => {
    try {
        await ctx.answerCallbackQuery();
    } catch (e) {
        console.log(e)
    }
    const action = ctx.callbackQuery.data.split(':')[1]!;
    if(!ctx.session.settings.shippingInfo) {
        ctx.session.settings.shippingInfo = {
            editAction: null,
        }
    }
    let botReply;
    if( action === "f_n") {
        botReply = await ctx.reply("Введіть ваше ім'я:")
        ctx.session.settings.shippingInfo.editAction = "f_n";
    }
    else if( action === "s_n") {
        botReply = await ctx.reply("Введіть ваше прізвище:")
        ctx.session.settings.shippingInfo.editAction = "s_n";
    }
    else if( action === "ft_n") {
        botReply = await ctx.reply("Введіть ваше ім'я по-батькові:")
        ctx.session.settings.shippingInfo.editAction = "ft_n";
    }
    else if( action === "ph_n") {
        botReply = await ctx.reply("Введіть ваш номер телефону:")
        ctx.session.settings.shippingInfo.editAction = "ph_n";
    }
    else if( action === "np_adr") {
        botReply = await ctx.reply("Введіть назву населеного пункту та номер відділення/поштомату Нової Пошти:")
        ctx.session.settings.shippingInfo.editAction = "np_adr";
    }
    else if(action === "notFullInfo") {
        botReply = await ctx.reply("Вказані не всі дані. для продовження, вкажіть їх.")
        ctx.session.settings.shippingInfo.editAction = null;
    }
    ctx.session.settings.msgId.push(botReply!.message_id);
    return;
})
bot.on("message:text", async ctx => {
    const action = ctx.session.settings.shippingInfo?.editAction!;
    if( action === "f_n") {
        ctx.session.settings.msgId.push(ctx.message.message_id);
        await shippingInfo(ctx, "first_name");
    }
    else if( action === "s_n") {
        ctx.session.settings.msgId.push(ctx.message.message_id);
        await shippingInfo(ctx, "second_name");
    }
    else if( action === "ft_n") {
        ctx.session.settings.msgId.push(ctx.message.message_id);
        await shippingInfo(ctx, "father_name");
    }
    else if( action === "ph_n") {
        ctx.session.settings.msgId.push(ctx.message.message_id);
        if(isNaN(+ctx.message.text)) {
            let botReply = await ctx.reply("Номер телефону повинен містити лише цифри!")
            ctx.session.settings.msgId.push(botReply.message_id)
            return;
        }
        await shippingInfo(ctx, "phone_number");
    }
    else if( action === "np_adr") {
        ctx.session.settings.msgId.push(ctx.message.message_id);
        await shippingInfo(ctx, "novaPost_address");
    }
    else {
        return;
    }
    
})






bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Помилка при обробці оновлення ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Помилка в запиті:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Не вдалось зв'язатись з Telegram:", e);
  } else {
    console.error("Невідома помилка:", e);
  }
});


const runner = run(bot);
const stopRunner = () => runner.isRunning() && runner.stop();
process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);