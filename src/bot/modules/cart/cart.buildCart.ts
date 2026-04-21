import { InlineKeyboard, type Product } from "../../dest.js";

export async function buildCart(ctx: any) {
    try {
        if(ctx.session.settings.msgId.length !== 0) {
            try {
                console.log(`reply.ts: MSG BEFORE DELETING: ${ctx.session.settings.msgId}`)
                await ctx.api.deleteMessages(ctx.chatId, ctx.session.settings.msgId); // УДАЛИТИ СОО 
                ctx.session.settings.msgId = []
                console.log(`reply.ts: MSG AFTER DELETING: ${ctx.session.settings.msgId}`)
            } catch (err) {
                ctx.session.settings.msgId = []
                console.log(`reply.ts: ERROR WHILE DELETING MSG: ${err}`)
            }
        } 
        const menu = new InlineKeyboard();
        let productsAmount = 0;
        for (const product of ctx.session.settings.cart.products) {
            if(product.isHidden) continue; // IF HIDDEN - SKIP
            productsAmount += 1;
        }


        if(productsAmount === 0) {
            
        }
        else if((productsAmount > 0) && (productsAmount < 6)) {
            for (const product of ctx.session.settings.cart.products) {
                if(product.isHidden) continue; // IF HIDDEN - SKIP
                menu.text(product.caption, `nav:${product.id}`).row() // BUTTON CREATION
            }
        }
        else if ((productsAmount >= 6) && (productsAmount < 15)) {
            let currAmount = 0;
            for (const product of ctx.session.settings.cart.products) {
                if(product.isHidden) continue; // IF HIDDEN - SKIP
                menu.text(product.caption, `nav:${product.id}`) // BUTTON CREATION
                currAmount += 1;
                if(currAmount === 2) {
                    menu.row();
                    currAmount = 0;
                } 
            }
        }
        else if((productsAmount >= 15)) {
            let currAmount = 0;
            for (const product of ctx.session.settings.cart.products) {
                if(product.isHidden) continue; // IF HIDDEN - SKIP
                menu.text(product.caption, `nav:${product.id}`) // BUTTON CREATION
                currAmount += 1;
                if(currAmount === 3){
                    menu.row();
                    currAmount = 0;
                } 
            }
        }
        if(productsAmount !== 0) {
            menu.text("📝 Перейти до оформлення замовлення", "nav:processOrder").success().row()
            menu.text("🗑 Очистити корзину", "nav:cleanCart").danger().row()
        }
        menu.text("🏠 Головне меню", "nav:mainPage").row();
        // оформити замовлення() / очистити корзину() // фотки товарів // опис корзини       

        let botReply;
        let showPhotos: boolean = false;
        if(showPhotos) {
            let productsPhotos = []
            for(let item of ctx.session.settings.cart.products) {
                console.log(item)
                if((item.photoId !== null) && (item.photoId !== undefined) && (item.photoId.length !== 0)) {
                    productsPhotos.push(item.photoId[0]);
                }
            }
            console.log(productsPhotos)
            if(productsPhotos.length !== 0) {
                botReply = await ctx.api.sendMediaGroup(ctx.chatId, productsPhotos.map( (item) => ({
                    type: "photo" as const,
                    media: item
                }) ));
                for(let msg of botReply) {
                    ctx.session.settings.msgId.push(msg.message_id);
                }
            }
        }
        botReply = await ctx.reply(`Корзина\n<b>Загальна вартість: ${ctx.session.settings.cart.totalPrice} грн</b>`, { // REPLY WITH / WITHOUT PHOTOS
            reply_markup: menu, 
            parse_mode: "HTML"
        });
        ctx.session.settings.msgId.push(botReply.message_id);
    } catch (e) {
        console.log(e)
    }
}