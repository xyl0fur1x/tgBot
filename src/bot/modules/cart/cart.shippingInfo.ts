import { InlineKeyboard } from "grammy";
import { manager } from "../../main.js";

export async function shippingInfo(ctx: any, funcName?: string) {

    let rawMessage = `Доброго дня! Хочу замовити наступні позиції:\n\n`
    for(let product of ctx.session.settings.cart.products) {
        rawMessage += `${product.caption}: ${product.amount}шт. (${product.amount * product.price}грн);\n`
    }
    rawMessage += `\nЗагальна вартість: ${ctx.session.settings.cart.totalPrice}грн.\n\n`
    rawMessage += `Дані для відправки:\nПІБ: ${ctx.session.settings.shippingInfo?.second_name} ${ctx.session.settings.shippingInfo?.first_name} ${ctx.session.settings.shippingInfo?.father_name}\nНомер телефону: ${ctx.session.settings.shippingInfo.phone_number}\nНаселений пункт, відділення/поштомат нової пошти: ${ctx.session.settings.shippingInfo.novapost_address}`

    let messageToSend = encodeURIComponent(rawMessage)
    if(ctx.session.settings.msgId.length !== 0) {
        try {
            console.log(`shipping.js: MSG BEFORE DELETING: ${ctx.session.settings.msgId}`)
            await ctx.api.deleteMessages(ctx.chatId, ctx.session.settings.msgId); // УДАЛИТИ СОО 
            ctx.session.settings.msgId = []
            console.log(`shipping.js: MSG AFTER DELETING: ${ctx.session.settings.msgId}`)
        } catch (err) {
            ctx.session.settings.msgId = []
            console.log(`shipping.js: ERROR WHILE DELETING MSG: ${err}`)
        }
    } 
    const menu = new InlineKeyboard();
    menu.text(`Прізвище: ${ctx.session.settings.shippingInfo?.second_name ?? "Не вказано"}`, "shipping:s_n").row()
    menu.text(`Ім'я: ${ctx.session.settings.shippingInfo?.first_name ?? "Не вказано"}`, "shipping:f_n").row()
    menu.text(`По-батькові: ${ctx.session.settings.shippingInfo?.father_name ?? "Не вказано"}`, "shipping:ft_n").row()
    menu.text(`Номер телефону: ${ctx.session.settings.shippingInfo?.phone_number ?? "Не вказано"}`, "shipping:ph_n").row()
    menu.text(`НП: ${ctx.session.settings.shippingInfo?.novapost_address ?? "Не вказано"}`, "shipping:np_adr").row()

    if( (ctx.session.settings.shippingInfo?.first_name) && (ctx.session.settings.shippingInfo?.second_name) && (ctx.session.settings.shippingInfo?.father_name) && (ctx.session.settings.shippingInfo?.phone_number) && (ctx.session.settings.shippingInfo?.novapost_address) ) {
        menu.url(`✅ Все вказано, перейти далі`, `tg://resolve?domain=${manager.username.replace("@","")}&text=${messageToSend}`).success().row() // URL OF MANAGER
    } else {
        menu.text(`❌ Не вказано: ${ctx.session.settings.shippingInfo?.first_name? "": "ім'я, "}${ctx.session.settings.shippingInfo?.second_name? "" : "прізвище, " }${ctx.session.settings.shippingInfo?.father_name? "": "по-батькові, " }${ctx.session.settings.shippingInfo?.phone_number? "": "номер телефону, " }${ctx.session.settings.shippingInfo?.novapost_address? "": "адреса доставки, "}`, "shipping:notFullInfo").danger().row()
    }

    menu.text("⬅ До корзини", "nav:prevPage").row()
    console.log(menu)
    if(!funcName) {
        let botReply = await ctx.reply("Ваша контактна інформація та адреса доставки(Натисніть щоб редагувати)", {
            reply_markup: menu,
        });
        ctx.session.settings.msgId.push(botReply.message_id)
    } else {
        if(funcName === "first_name") {
            first_name(ctx, ctx.message?.text);
            await shippingInfo(ctx)
        } 
        else if(funcName === "second_name") {
            second_name(ctx, ctx.message?.text);
            await shippingInfo(ctx)

        } 
        else if(funcName === "father_name") {
            father_name(ctx, ctx.message?.text);
            await shippingInfo(ctx)

        } 
        else if(funcName === "phone_number") {
            phone_number(ctx, ctx.message?.text);
            await shippingInfo(ctx)

        } 
        else if(funcName === "novaPost_address") {
            novaPost_address(ctx, ctx.message?.text);
            await shippingInfo(ctx)

        } 
        ctx.session.settings.shippingInfo.editAction = null;
    }
    


}

function first_name(ctx: any, first_name: string) {
    ctx.session.settings.shippingInfo.first_name = first_name;
}
function second_name(ctx: any, second_name: string) {
    ctx.session.settings.shippingInfo.second_name = second_name;
}
function father_name(ctx: any, father_name: string) {
    ctx.session.settings.shippingInfo.father_name = father_name;
}
function phone_number(ctx: any, phone_number: string) {
    ctx.session.settings.shippingInfo.phone_number = phone_number;
}
function novaPost_address(ctx: any, novaPost_address: string) {
    ctx.session.settings.shippingInfo.novapost_address = novaPost_address;
}