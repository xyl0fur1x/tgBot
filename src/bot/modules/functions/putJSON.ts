import { type Menu } from "../../dest.js";

export async function putJSON(updatedMenu: Menu, api_url: string, url: string = "/load"): Promise<Response | undefined> {
    let endpoint = api_url! + url;
    try {
        const response = await fetch(endpoint, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedMenu),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Ошибка запроса: ${response.status} ${response.statusText}\n${errorText}`
            );
        }
        
        return response;
    } catch (err) {
        console.log(err)
    }
    
}