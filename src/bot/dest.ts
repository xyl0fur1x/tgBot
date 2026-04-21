import {Bot, Context, GrammyError, HttpError, InlineKeyboard, InputFile, session, type CommandContext, type SessionFlavor,} from "grammy";
import * as dotenv from 'dotenv';
import { FileAdapter } from "@grammyjs/storage-file";
import { CommandGroup, commands, type CommandsFlavor, Command} from "@grammyjs/commands";
import { autoRetry } from "@grammyjs/auto-retry";
import { run } from "@grammyjs/runner";


/*--------- INTERFACES & TYPES------------*/
import { type BotConfig } from "./interfaces/ctx.config.i.js";
import { type SessionData } from "./interfaces/session.config.i.js";
import { type Menu, type Product } from "./interfaces/menu.i.js";
import { type Cart } from "./interfaces/cart.i.js";

type MyContext = Context & SessionFlavor<SessionData> & CommandsFlavor<MyContext> & {
    config:BotConfig;
}

/*------------ FUNCTIONS ----------------*/
import { reply } from "./modules/functions/reply.js";
import { buildMenu, extendedBuildMenu } from "./modules/menu/menu.buildMenu.js";
import { searchPath } from "./modules/menu/menu.searchPath.js";
import { menuChanges } from "./modules/menu/menu.menuChanges.js";
import { addToCart } from "./modules/cart/cart.addToCart.js";
import { getJSON } from "./modules/functions/getJSON.js";
import { buildCart } from "./modules/cart/cart.buildCart.js";
import { putJSON } from "./modules/functions/putJSON.js";
import { cleanCart } from "./modules/cart/cart.cleanCart.js";
import { shippingInfo } from "./modules/cart/cart.shippingInfo.js";
import { reshuffle } from "./modules/menu/menu.reshuffleMode.js";
import { searchDublicates } from "./modules/functions/searchDublicates.js";



/* -------- CONFIG FUNCTIONS ---------- */
import { initial } from "./modules/configurations/configurations.initial.js";
import { getSessionKey } from "./modules/configurations/configurations.getSessionKey.js";


/* --------- COMMANDS & COMMAND TYPES ------------ */
import { userCommands } from "./modules/commands/commands.user.js";
import { adminCommands } from "./modules/commands/commands.admin.js";
import { showHints } from "./modules/commands/commands.showHints.js";



export {
    autoRetry,
    run,
    Bot, 
    Context, 
    GrammyError, 
    HttpError, 
    InlineKeyboard, 
    InputFile, 
    session, 
    type CommandContext, 
    type SessionFlavor,
    dotenv,
    FileAdapter,
    type BotConfig,
    type SessionData,
    type Menu,
    type Product,
    type Cart,
    type MyContext,
    searchPath, 
    reply, 
    buildMenu,
    extendedBuildMenu,
    menuChanges,
    addToCart,
    cleanCart,
    getJSON,
    putJSON,
    buildCart,
    initial,
    getSessionKey,
    CommandGroup, 
    commands, 
    type CommandsFlavor,
    Command,
    userCommands,
    adminCommands,
    showHints,
    shippingInfo,
    reshuffle,
    searchDublicates
    



    
}