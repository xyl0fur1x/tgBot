export async function getJSON(url: string = "/", api_url: string) {
    let endpoint = api_url! + url;
    try {
        const response: Response = await fetch(endpoint);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }
        const menu = await response.json();
        return menu;
    } catch (error) {
        console.error("Fetch error:", error);
        return {
            id: "no-connection",
            caption: "Немає з'єднання з сервером, або виникла помилка. Спробуйте пізніше, перезапустивши бота командою /start",
            next: []
        }
    }
}