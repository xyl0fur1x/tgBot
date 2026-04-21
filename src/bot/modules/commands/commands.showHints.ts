import { token } from "../../main.js";
import { adminCommands } from "./commands.admin.js";
import { userCommands } from "./commands.user.js";



export async function showHints(optional?: {userId?: number, isAdmin: boolean}) {
    try {
        if( (optional?.userId) && (optional?.isAdmin === true) ) {
            await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
                method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify( {commands: adminCommands.commands.map( cmd => {
                        return { command: cmd.name, description: cmd.description } 
                    }).concat( userCommands.commands.map( cmd => {
                        return { command: cmd.name, description: cmd.description } 
                    }) ), scope: {type: "chat", chat_id: optional.userId} } ),
            }).then( async res => {
                console.log(await res.json())
            })
        } 
        else if( (optional?.userId) && (optional?.isAdmin === false)) {
            await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
                method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify( {commands: userCommands.commands.map( cmd => {
                        return { command: cmd.name, description: cmd.description } 
                    } ), scope: {type: "chat", chat_id: optional.userId} } ),
            }).then( async res => {
                console.log(await res.json())
            })
        }
        else {
            await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
                method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify( {commands: userCommands.commands.map( cmd => {
                        return { command: cmd.name, description: cmd.description } 
                    } ), scope: {type: "all_private_chats"} } ),
            }).then( async res => {
                console.log(await res.json())
            })
        }
    } catch (e) {
        console.log(e)
    }
    
    
}