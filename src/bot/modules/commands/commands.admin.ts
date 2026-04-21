import { CommandGroup, getJSON, getSessionKey, type Menu, type MyContext, reply, showHints } from "../../dest.js";
import { _api_url, bot, botDevs, manager, menuData, storage } from "../../main.js";
export const adminCommands = new CommandGroup<MyContext>();

adminCommands.command("loadmenu", "Завантажити меню з сервера", async (ctx, next) => {
    let botReply;
    menuData.rootDir = await getJSON("/", _api_url!).then( async (res) => { 
            console.log("menu initializing is done");    // REWORK getJSON FOR RETURNING ANSWERS
            botReply = await ctx.reply("Меню було завантажено з серверу та стало доступне для усіх користувачів!")
            return res as Menu;
    });
    await reply(ctx, menuData.rootDir);
    setTimeout(async () => {
        try {
            await ctx.api.deleteMessages(ctx.chatId, [botReply!.message_id, ctx.message?.message_id!])
        } catch(e) {
            console.log(e)
        }
    }, 3000);
})

adminCommands.command("deletesession", "Видалити дані вашої сесії", async (ctx) => {
    console.log(await storage.read(ctx.from!.id.toString()));
    await storage.delete(ctx.from!.id.toString())
    ctx.session = undefined as any;
    console.log(await storage.read(ctx.from!.id.toString()));
    let botReply = await ctx.reply("your session was deleted")
    setTimeout(async () => {
        try {
            await ctx.api.deleteMessages(ctx.chatId, [botReply.message_id, ctx.message?.message_id!])
        } catch(e) {
            console.log(e)
        }
    }, 3000);
})

adminCommands.command("get", "Отримати дані вашої сесії", async (ctx, next) => {
    console.log(await storage.read(ctx.from!.id.toString()))
    await ctx.reply(`YOUR SESSION INFO: \n`)
    await ctx.reply(JSON.stringify((await storage.read(ctx.from!.id.toString())), null, 4))
    
})

adminCommands.command("login", "Увійти в адмін-акаунт", async (ctx, next) => {
    if (botDevs.ids.includes(ctx.message?.from.id.toString()!)) {
        if(!ctx.session.admin) {
            ctx.session.admin = {
                isDeveloper: true,
                hasAccessToEdit: false,
                editMode: false,
                action: null,
                updatedMenu: null,
                viewerMode: false,
                reshuffle: {
                    isOn: false,
                    page: null,
                    reshuffledPage: [],
                },
                copyPage: null,
                ids: []
            }
        }
        console.log(`currently isDev flag value: ${ctx.session.admin.isDeveloper}, ID: ${ctx.from?.id}, username: ${ctx.from?.username ? "@"+ctx.from.username : "undefined"}`)
    }
    if((botDevs.ids.includes(ctx.message?.from.id.toString()!)) && (ctx.session.admin?.isDeveloper)) { //чи є право на використання команди
        ctx.session.admin.hasAccessToEdit = true;
        await ctx.reply("Ви успішно ввійшли в систему")
    } else {
        await ctx.reply("У вас недостатньо прав для використання даної команди.")
        for (let dev of botDevs.ids) { //сповіщення всім розробникам що хтось намагається використати команду без дозволу
            try {
                await bot.api.sendMessage(dev, `!!!СПРОБА ВХОДУ В СИСТЕМУ КОРИСТУВАЧЕМ БЕЗ ДОЗВОЛІВ!!!\nкористувач:\nUSER ID: ${ctx.from?.id}\nUSERNAME: ${ctx.from?.username ? "@"+ctx.from.username : "undefined"}\nВвід: ${ctx.message?.text}
                        `, {parse_mode: 'HTML'}, );
                console.log(`Security message was sent to ID: ${dev}`)
            } catch (err) {
                console.error("Помилка надіслання сповіщення безпеки: ", err)
            }
        }
    }
})

adminCommands.command("edit", "Вийти/Увійти в режим редагування меню", async (ctx, next) => {
    ctx.session.settings.msgId.push(ctx.message?.message_id!)
    if (!ctx.session.admin?.hasAccessToEdit || !ctx.session.admin?.isDeveloper) {
            return await ctx.reply("Немає доступу!");
        }
        ctx.session.admin.viewerMode = false;  
        ctx.session.admin.reshuffle.isOn = false;
        ctx.session.admin.reshuffle.page = null;
        ctx.session.admin.reshuffle.reshuffledPage = []
        ctx.session.admin.editMode = !ctx.session.admin.editMode;
        if(ctx.session.admin.editMode === false) {
            ctx.session.admin.action = null;
        }
        if((ctx.session.admin.updatedMenu === null ) || (ctx.session.admin.updatedMenu.id === "no-connection") ) {
            ctx.session.admin.updatedMenu = structuredClone(menuData.rootDir);
        }
        if(ctx.session.settings.path[0] === "cart") {
            ctx.session.settings.path = ["root"]
        }
        ctx.session.admin.editMode ? await reply(ctx, ctx.session.admin.updatedMenu) : await reply(ctx, menuData.rootDir)
})

adminCommands.command("clearlocalmenu", "Відхилити будь які зміни у меню", async ctx => {
    if (ctx.session.admin?.updatedMenu) {
        ctx.session.admin.updatedMenu = null;
        ctx.session.admin.editMode = false;
        ctx.session.admin.action = null;
        ctx.session.admin.reshuffle.isOn = false;
        ctx.session.admin.reshuffle.page = null;
        ctx.session.admin.reshuffle.reshuffledPage = []
        ctx.session.admin.viewerMode = false;
        let botReply = await ctx.reply("Зміни у меню було видалено. Меню залишилось у попередньому стані.")
        await reply(ctx, menuData.rootDir)
        setTimeout(async () => {
            try {
                await ctx.api.deleteMessages(ctx.chatId, [botReply.message_id, ctx.message?.message_id!])
            } catch(e) {
                console.log(e)
            }
        }, 3000);
    }
})


adminCommands.command("addadmin", "Добавити нового адміністратора(/addadmin USERID)", async (ctx, next) => {
    if (botDevs.ids.includes(ctx.message?.from.id.toString()!)) {
        let userId = ctx.match.split(" ")[0];
        if( (!botDevs.ids.includes(String(userId))) && (userId !== undefined) && (userId.length > 3) ) {
            if(await storage.read(userId!.toString()) !== undefined) {
                botDevs.ids.push(userId)
                console.log(botDevs.ids)
                await showHints({userId: Number(userId), isAdmin: true});
                let botReply = await ctx.reply(`Нового адміністратора ${userId} було додано!`)
                setTimeout(async () => {
                    try {
                        await ctx.api.deleteMessages(ctx.chatId, [botReply.message_id, ctx.message?.message_id!])
                    } catch(e) {
                        console.log(e)
                    }
                }, 2000);
            } else {
                let botReply = await ctx.reply(`Користувач ${userId} ще не запускав бота!`)
                setTimeout(async () => {
                    try {
                        await ctx.api.deleteMessages(ctx.chatId, [botReply.message_id, ctx.message?.message_id!])
                    } catch(e) {
                        console.log(e)
                    }
                }, 3000);
            }
            
        } else {
            let botReply = await ctx.reply(`Неправильний ввід, або такий адміністратор вже існує!`)
            if(botDevs.ids.includes(String(userId))) {
                await showHints({userId: Number(userId), isAdmin: true});
            }
            setTimeout(async () => {
                try {
                    await ctx.api.deleteMessages(ctx.chatId, [botReply.message_id, ctx.message?.message_id!])
                } catch(e) {
                    console.log(e)
                }
            }, 2000);
        }
    }
})

adminCommands.command("deleteadmin", "Видалити адміністратора(/deleteadmin USERID)", async (ctx, next) => {
    if (botDevs.ids.includes(ctx.message?.from.id.toString()!)) {
        let userId = ctx.match.split(" ")[0];
        if( (botDevs.ids.includes(String(userId)))  ) {
            botDevs.ids = botDevs.ids.filter( (adminId) => adminId !== userId);
            console.log(botDevs.ids)
            await showHints({userId: Number(userId), isAdmin: false});
            let botReply = await ctx.reply(`Адміністратора ${userId} було видалено!`)
            setTimeout(async () => {
                try {
                    await ctx.api.deleteMessages(ctx.chatId, [botReply.message_id, ctx.message?.message_id!])
                } catch(e) {
                    console.log(e)
                }
            }, 2000);
        } else {
            let botReply = await ctx.reply(`Неправильний ввід, або такого адміністратора не існує!`)
            setTimeout(async () => {
                try {
                    await ctx.api.deleteMessages(ctx.chatId, [botReply.message_id, ctx.message?.message_id!])
                } catch(e) {
                    console.log(e)
                }
            }, 2000);
        }
    }
})

adminCommands.command("getadmins", "отримати список усіх адміністраторів", async ctx => {
    ctx.session.settings.msgId.push(ctx.message?.message_id!)
    let message = ``;
    for(let adminId of botDevs.ids) {
        message += `---\nІм'я: ${(await storage.read(adminId))?.settings.first_name}\nID: <code>${(await storage.read(adminId))?.settings.userId}\n</code>username: @${(await storage.read(adminId))?.settings.username}\n` 
        if((await storage.read(adminId))?.settings.username === manager.username.slice(1)) {
            message += `<b><u>Встановлений як менеджер</u></b>\n`;
        }
        message += `---\n`
    }
    let botReply = await ctx.reply(message, {parse_mode: "HTML"})
    ctx.session.settings.msgId.push(botReply.message_id)
})

adminCommands.command("setmanager", "Вказати нового менеджера(/setmanager @USERNAME)", async ctx => {
    if (botDevs.ids.includes(ctx.message?.from.id.toString()!)) {
        let username = ctx.match.split(" ")[0];
        let isFound = false;
        for(let adminId of botDevs.ids) {
            let sessionInfo = await storage.read(adminId);
            if(sessionInfo?.settings.username === username?.slice(1)) {
                isFound = true;
                break;
            }
        }
        if(isFound) {
            manager.username = username!;
            let botReply = await ctx.reply(`Нового менеджера було встановлено!`)
            setTimeout(async () => {
                try {
                    await ctx.api.deleteMessages(ctx.chatId, [botReply.message_id, ctx.message?.message_id!])
                } catch(e) {
                    console.log(e)
                }
            }, 2000);
        } else {
            let botReply = await ctx.reply(`Неможливо додати менеджера, оскільки він не є у списку адміністраторів!`)
            setTimeout(async () => {
                try {
                    await ctx.api.deleteMessages(ctx.chatId, [botReply.message_id, ctx.message?.message_id!])
                } catch(e) {
                    console.log(e)
                }
            }, 2000);
        }
    }
})

adminCommands.command("help", "Список та опис усіх команд", async ctx => {
    await ctx.reply(`/start - команда для запуску бота\n\n/login - отримати право на вхід у адмін панель. Дану команду потрібно використовувати лише під час першого входу, або після фізичного перезапуску бота\n\n/edit - безпосередньо вхід у адмін панель. Повторний ввід - вихід із адмін панелі. Дана команда створює для вас локальну копію ПОТОЧНОГО меню та дозволяє вносити зміни у нього, проте ці зміни не будуть відображатись у інших користувачів, поки ви їх не завантажите з на сервер та далі з серверу відповідно.\n\n/clearlocalmenu - очищує ЛОКАЛЬНО ЗБЕРЕЖЕНЕ меню, тобто відміняє всі внесені вами зміни У ЛОКАЛЬНОМУ МЕНЮ.\n\n/loadmenu - завантажує меню із сервера, робить його видимим для усіх користувачів. Тобто, після внесених вами змін у меню, та їх збереження, дана команда дозволяє показувати усім користувачам ОНОВЛЕНЕ меню.\n\n/addadmin USERID - дозволяє добавити нового адміністратора. USERID - айді користувача телеграм. Для використання цієї команди, потрібно щоб користувач, якого ви додаєте, вже контактував із ботом; отримати айді користувача можна наступним чином:\n/getme - надсилає ваш айді та юзернейм у чат. попросіть користувача використати дану команду та переслати вам його айді.\n\n/deleteadmin USERID - видалити конкретного адміністратора. щоб отримати айді адміністратора, якого ви хочете видалити, використовуйте наступну команду: \n/getadmins - відображає інформацію про усіх наявних адміністраторів та менеджерів.\n\n/setmanager @USERNAME - встановити наявного адміна менеджером для отримання замовлень. Користувач обов'язково повинен бути адміністратором та мати юзернейм.\n\n---\n/deletesession - видаляє вашу сесію(дебаг команда)\n/get - отрмати дані вашої сесії(дебаг команда)\n---\n`)
})