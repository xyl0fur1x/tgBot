import type { Menu, Product } from "../../dest.js";

export async function searchPath(ctx: any, menuData: Menu, path?: string[]) {
    let pageData = menuData;
    let generatedPath = ctx.session.settings.cart.products.find( (item: Product) => item.id === ctx.session.settings.path[1])
    let foundItem = generatedPath;
    if(generatedPath) {
        console.log("FOUND A ITEM OF CART:");
        console.log(generatedPath)
        foundItem = generatedPath;
        generatedPath = generatedPath.path.slice(1)
    } else {
        generatedPath = undefined;
    }
    for(const id of (generatedPath ?? ctx.session.settings.path.slice(1)) ) {
        console.log("ENTERED SEARCHING PATH")
        if(pageData.type === "category") {
            if(pageData.id === id){
                console.log("PAGEDATA ID === ID")
                ctx.session.settings.path.pop()
                return pageData;
            }
            if(pageData.next?.find((pgDt: Menu) => pgDt.id === id)) {
                pageData = pageData.next?.find((pgDt: Menu) => pgDt.id === id)!;
                console.log("FOUND A WAY")
                // return pageData;
            } else {
                if(ctx.session.settings.path[0] === "cart") {
                    ctx.session.settings.path = ["root"];
                    pageData = menuData;
                    ctx.session.settings.cart.products = ctx.session.settings.cart.products.filter( (item: Product) => item.id !== foundItem?.id )
                    let botReply = await ctx.reply(`❌ Товар ${foundItem.caption} не в наявності!`)
                    setTimeout(async () => {
                        await ctx.api.deleteMessage(ctx.chatId, botReply.message_id)
                    }, 2000);
                    return pageData;
                }
                console.log("PAGEDATA NOT FOUND")
                ctx.session.settings.path.pop();
                return pageData;
            }
        }
        else console.log("PATH TYPE IS NOT A CATEGORY")
    }
    return pageData;
}