import { type Menu } from "../../dest.js";

export function searchDublicates(ctx: any, pageData: Menu[]) {
    
    for(let item of pageData) {
        if(!ctx.session.admin?.ids.includes(item.id)) {
            ctx.session.admin.ids.push(item.id)
        } else {
            console.log(`DUBLICATE of ${item.caption}: id ${item.id}`)
            item.id = Date.now().toString() + Math.floor(Math.random() * 1000000);
            ctx.session.admin.ids.push(item.id)
        }
        if(item.type === "category") {
            if(item.next.length !== 0) {
                searchDublicates(ctx, item.next)
            }
        }
    }
}