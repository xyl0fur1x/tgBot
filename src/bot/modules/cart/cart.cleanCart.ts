export async function cleanCart(ctx : any) {
    ctx.session.settings.cart.products = [];
    ctx.session.settings.cart.totalPrice = 0;
    ctx.session.settings.path = ["root"]

    let botReply;
    setTimeout(async () => {
        try {
            botReply = await ctx.reply("✅ Корзина очищена!")
            setTimeout(async () => {
                await ctx.api.deleteMessage(ctx.chatId, botReply!.message_id) 
            }, 2000);
        } catch (e) {
            console.log(`cleanCart.ts: ${e}`)
        }
        
    }, 500);


    
}