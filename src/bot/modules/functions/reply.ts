import { buildMenu, extendedBuildMenu, type Menu, searchPath } from "../../dest.js";

export async function reply(ctx: any, _pageData: Menu, callback_part: string = "nav") {
    let pageData;
    if(ctx.session.admin) {
        if(ctx.session.admin?.editMode || ctx.session.admin?.viewerMode) {
            pageData = await searchPath(ctx, ctx.session.admin.updatedMenu);
        }
        else if(ctx.session.admin?.reshuffle?.isOn) {
            pageData = ctx.session.admin.reshuffle.page;
        }
    } else {
        pageData = await searchPath(ctx, _pageData);
    }
    if(pageData == undefined) {
        pageData = await searchPath(ctx, _pageData);
    }
    try {
        if(ctx.session.settings.msgId.length !== 0) {
            try {
                console.log(`reply.js: MSG BEFORE DELETING: ${ctx.session.settings.msgId}`)
                await ctx.api.deleteMessages(ctx.chatId, ctx.session.settings.msgId); // УДАЛИТИ СОО 
                ctx.session.settings.msgId = []
                console.log(`reply.js: MSG AFTER DELETING: ${ctx.session.settings.msgId}`)
            } catch (err) {
                ctx.session.settings.msgId = []
                console.log(`reply.js: ERROR WHILE DELETING MSG: ${err}`)
            }
        }
        if(ctx.session.admin?.viewerMode) {
            let botReply = await ctx.reply("Ви переглядаєте РЕДАГОВАНЕ меню як користувач. Поточні користувачі бачать старе(неоновлене) меню\n\nЩоб повернутися до редагування, використовуйте /edit")
            ctx.session.settings.msgId.push(botReply.message_id)
        }
        let textForShowing = `<b>${pageData.caption}</b>\n\n`;
        if(pageData.text) {
            textForShowing += pageData.text;
        }

        let isInCart: boolean = false;
        let currentlyInCart = 0;
        for(let item of ctx.session.settings.cart.products) {
            if(pageData.id === item.id) {
                currentlyInCart += item.amount;
                isInCart = true;
            }
        }
        let settings = {
            textForShowing: pageData.type === "product" ? textForShowing + `\n\n<b>Ціна: ${pageData.price} грн/шт.</b>\n${isInCart? "В корзині: " + currentlyInCart : ""}`:
            textForShowing,
            menuType: ctx.session.admin?.editMode ? extendedBuildMenu(ctx, pageData, ctx.session.admin.editMode) : ctx.session.admin?.reshuffle?.isOn? extendedBuildMenu(ctx, pageData, ctx.session.admin.editMode, callback_part) : buildMenu(ctx, pageData, false),
        }

        let botReply;
        if((pageData.photoId !== null) && (pageData.photoId !== undefined)) {
            if(pageData.photoId.length === 0) {
                botReply = await ctx.reply(settings.textForShowing, {
                    reply_markup: settings.menuType, 
                    parse_mode: "HTML"
                });
                ctx.session.settings.msgId.push(botReply.message_id);
            }
            if(pageData.photoId.length === 1) {
                botReply = await ctx.replyWithPhoto(pageData.photoId[0], {
                    caption: settings.textForShowing, 
                    reply_markup: settings.menuType,
                    parse_mode: "HTML"
                }) 
                ctx.session.settings.msgId.push(botReply.message_id);
            }
            else if(pageData.photoId.length > 1) {
                botReply = await ctx.api.sendMediaGroup(ctx.chatId, pageData.photoId.map( (item: string) => ({
                    type: "photo" as const,
                    media: item
                }) ));
                console.log(botReply)
                for(let msg of botReply) {
                    ctx.session.settings.msgId.push(msg.message_id);
                }
                botReply = await ctx.reply(settings.textForShowing, {
                    reply_markup: settings.menuType, 
                    parse_mode: "HTML"
                });
                ctx.session.settings.msgId.push(botReply.message_id);
            }
        } else {
            botReply = await ctx.reply(settings.textForShowing, {
                reply_markup: settings.menuType, 
                parse_mode: "HTML"
            });
            ctx.session.settings.msgId.push(botReply.message_id);
        }
        
        console.log(`reply.js: PATH WHEN REPLY: ${ctx.session.settings.path}, msgId: ${ctx.session.settings.msgId}`) 
        console.log(`reply.js: curr action: ${ctx.session.admin?.action}`)
        return pageData;        
    } catch (err) {
        console.log(err)
    }
    
}

