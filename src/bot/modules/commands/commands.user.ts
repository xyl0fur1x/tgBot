import { CommandGroup, type MyContext, reply, showHints } from "../../dest.js";
import { botDevs, menuData } from "../../main.js";

export const userCommands = new CommandGroup<MyContext>();

userCommands.command("start", "Початок роботи", async (ctx, next) => {
    ctx.session.settings.path = ["root"];
    console.log(menuData.rootDir)
    await reply(ctx, menuData.rootDir);
    console.log(ctx.session)
    if(botDevs.ids.includes( String(ctx.message?.from?.id) )) {
        await showHints({userId: ctx.message?.from?.id!, isAdmin: true});
        if(ctx.session.admin) {
            ctx.session.admin.action = null;
        }
    }
    await next();
})
