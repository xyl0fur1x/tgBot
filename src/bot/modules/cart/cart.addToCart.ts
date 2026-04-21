import { buildCart, reply, searchPath, type Cart, type Menu, type Product } from "../../dest.js";

export async function addToCart(ctx: any, pageData: Menu, amount?: number) {
    let itemData = await searchPath(ctx, pageData)
    if(itemData.type === "product") {
               
        console.log(`ITEM PATH(cart managing): ${ctx.session.settings.path}`)
        let cart: Cart = ctx.session.settings.cart;
        let item: Product = {
            isHidden: itemData.isHidden,
            type: "product",
            id: itemData.id,
            path: ctx.session.settings.path,
            caption: itemData.caption,
            price: itemData.price,
            maxCartAmount: itemData.maxCartAmount ?? 5,
            photoId: itemData.photoId ?? null,
            amount: amount ?? 1
        };
        if( (!amount) && (amount !== 0) ) {
            let botReply = await ctx.reply(`✏️ Введіть потрібну кількість(не більше ${item.maxCartAmount}).\n🗑 Щоб вилучити товар із корзини, введіть "0":`)
            ctx.session.settings.msgId.push(botReply.message_id);
            return;
        }
        if(!isNaN(amount)) {
            if(ctx.message?.text) {
                if( (isNaN(+ctx.message.text!)) || (+ctx.message.text! > item.maxCartAmount) || (+ctx.message.text < 0)) {
                    let botReply = await ctx.reply("❌ Некоректні дані. Повторіть ввід:");
                    ctx.session.settings.msgId?.push(botReply.message_id);
                    return;
                }
            }
            item.amount = +amount.toFixed(1);
            if(cart.products.length !== 0) {
                let isFound: boolean = false;
                for(let itemCart of cart.products) {
                    if(itemCart.id === itemData.id) {
                        itemCart.amount = amount;
                        isFound = true;
                        break;
                    } 
                }
                if(!isFound) {
                    cart.products.push(item);
                }
            } else {
                cart.products.push(item);
            }
            if(amount === 0) {
                cart.products = cart.products.filter( (itemCart) => itemCart.amount !== 0)
            }
            ctx.session.settings.path.pop()
            cart.totalPrice = 0;
            for(let itemCart of cart.products) {
                cart.totalPrice += itemCart.amount! * itemCart.price;
            }
            if(ctx.session.settings.path[0] === 'cart') {
                await buildCart(ctx);
            } else if(ctx.session.settings.path[0] === 'root') {
                await reply(ctx, itemData)
            }
            let botReply = await ctx.reply(`Кількість товару ${item.caption} змінено, у кошику: ${amount}! ✅`)
            setTimeout(async () => {
                try {
                    await ctx.api.deleteMessage(ctx.chat.id, botReply.message_id)
                } catch(err) {
                    console.log(`message deleting err(cart): ${err}`)
                }
            }, 2000)
            
        }
        
        
    }
    console.log("CART: ")
    console.log(ctx.session.settings.cart);    
}