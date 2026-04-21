import {buildMenu, extendedBuildMenu, InlineKeyboard, type Menu, reply, searchPath } from "../../dest.js";

export async function reshuffle(ctx: any, action: string, itemId?: string) {
    if(action === "save") {
        if(ctx.session.admin.reshuffle.page.next.length !== ctx.session.admin.reshuffle.reshuffledPage.length) {
            let botReply = await ctx.reply("Порядок був заданий не для усіх елементів. \nСпочатку задайте всім елементам порядок!")
            setTimeout(async() => {
                try {
                    ctx.api.deleteMessage(ctx.chatId, botReply.message_id);
                } catch (e){
                    console.log(e)
                }
            }, 2000);
        } else {
            await searchPath(ctx, ctx.session.admin.updatedMenu).then( res => {
                if(res.type === "category") {
                    res.next = structuredClone(ctx.session.admin.reshuffle.reshuffledPage);
                }
            })  
            ctx.session.admin.reshuffle.isOn = false;
            ctx.session.admin.editMode = true;
            ctx.session.admin.reshuffle.page = null;
            ctx.session.admin.action = null;
            ctx.session.admin.reshuffle.reshuffledPage = []
        }
    }
    if( (!itemId) && (action === "edit") ) {
        if(ctx.session.admin.reshuffle.page === null) {
            ctx.session.admin.reshuffle.page = structuredClone(await searchPath(ctx, ctx.session.admin.updatedMenu));
            ctx.session.admin.reshuffle.reshuffledPage = []
            console.log(ctx.session.admin.reshuffle.page)
        } else {
            ctx.session.admin.reshuffle.page = null;
            ctx.session.admin.reshuffle.reshuffledPage = [];
            console.log(ctx.session.admin.reshuffle.page)
        }
        
    } else if ((itemId) && (action === "edit")){
        if(ctx.session.admin.reshuffle.page.type === "category") {
            let noRows = 0;


            for(let item of ctx.session.admin.reshuffle.page.next) {

                if( (item.id === itemId) && ( (item.caption.slice(0,1) === "[") && (!isNaN(+item.caption.slice(1,2))) ) ){
                    ctx.session.admin.reshuffle.reshuffledPage = ctx.session.admin.reshuffle.reshuffledPage.filter( (itm:Menu) => {
                        return itm.id !== itemId;
                    })
                    ctx.session.admin.reshuffle.page.next.forEach( (itm1: Menu) => {
                        if( (itm1.caption.slice(0,1) === "[") && (!isNaN(+itm1.caption.slice(1,2))) ) {
                            itm1.caption = itm1.caption.slice( (itm1.caption.indexOf("]") + 2) );
                        }
                        ctx.session.admin.reshuffle.reshuffledPage.forEach( (itm2:Menu) => {
                            if(itm1.id === itm2.id) {
                                itm1.caption = "[" + (ctx.session.admin.reshuffle.reshuffledPage.indexOf(itm2) + 1) + "] " + itm1.caption;
                            }
                        } )
                    })
                    try {
                        await ctx.editMessageReplyMarkup({
                            reply_markup: extendedBuildMenu(ctx, ctx.session.admin.reshuffle.page, false, "reshuffle")
                        })
                    } catch (e) {
                        console.log(e)
                        await ctx.reply("Виникла помилка при оновленні повідомлення. Спробуйте ще раз.\nЯкщо помилка буде повторюватись, краще вийдіть без збереження змін щоб уникнути непередбачуваних наслідків.")
                    }
                    
                    console.log(ctx.session.admin.reshuffle.reshuffledPage)
                    console.log(ctx.session.admin.reshuffle.page)
                    break;
                }
                if(itemId === item.id){
                    ctx.session.admin.reshuffle.reshuffledPage.forEach( (item:Menu) => {
                        if(item.type !== "row") {
                            noRows +=1;
                        } else {
                            noRows = 0;
                        }
                    })
                    if((noRows === 4) && (item.type !== "row")) {
                        await ctx.reply("К-сть кнопок в рядку не може бути більшою ніж 4.")
                        return;
                    }
                    ctx.session.admin.reshuffle.reshuffledPage.push(structuredClone(item));
                    for(let itemArray of ctx.session.admin.reshuffle.reshuffledPage) {
                        if(itemArray.id === itemId) {
                            item.caption = "[" + (ctx.session.admin.reshuffle.reshuffledPage.indexOf(itemArray) + 1) + "] " + item.caption;
                        }
                    }
                    try {
                        await ctx.editMessageReplyMarkup({
                            reply_markup: extendedBuildMenu(ctx, ctx.session.admin.reshuffle.page, false, "reshuffle")
                        })
                    } catch (e) {
                        console.log(e)
                        await ctx.reply("Виникла помилка при оновленні повідомлення. Спробуйте ще раз.\nЯкщо помилка буде повторюватись, краще вийдіть без збереження змін щоб уникнути непередбачуваних наслідків.")
                    }
                    console.log(ctx.session.admin.reshuffle.reshuffledPage)
                    console.log(ctx.session.admin.reshuffle.page)
                    break;
                }

            }

        
        }
    }
    
}