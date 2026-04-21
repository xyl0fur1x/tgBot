/* import express from "express";
import fs, { open } from "fs";
import path from "path";
const app = express()
const port = 3000




app.get('/', (req, res) => {
  const filePath = path.join("./src/server", 'paths.json'); //path.join("./", 'paths.json'); 
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Помилка читання файлу:', err);
      return res.status(500).json({ error: 'не вдалося прочитати файл' });
    }
    try {
      const jsonData = JSON.parse(data); 
      res.json(jsonData); 
    } catch (parseError) {
      console.error('Помилка парсингу JSON:', parseError);
      res.status(500).json({ error: 'Помилка парсингу даних' });
    }
  });
});



app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`)
}) */

  import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// путь к файлу
const filePath = path.join(__dirname, "paths.json");

// дефолтная структура
const defaultData = {
  isHidden: false,
  id: "root",
  caption: "Головна сторінка",
  text: null,
  type: "category",
  photoId: null,
  next: []
};

//  функция инициализации файла 
async function ensureFileExists() {
  try {
    await fs.access(filePath);
  } catch {
    // файла нет — создаем
    await fs.writeFile(
      filePath,
      JSON.stringify(defaultData, null, 2),
      "utf8"
    );
  }
}

//  получить файл 
app.get("/", async (req, res) => {
  try {
    await ensureFileExists();

    const data = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(data);

    return res.json(json);
  } catch (err) {
    console.error("Ошибка чтения файла:", err);
    return res.status(500).json({ error: "Ошибка чтения файла" });
  }
});

//  перезаписать файл 
app.put("/load", async (req, res) => {
  try {
    const incomingData = req.body;

    if (!incomingData || typeof incomingData !== "object") {
      return res.status(400).json({ error: "Некорректный JSON" });
    }

    // форматируем и записываем
    await fs.writeFile(
      filePath,
      JSON.stringify(incomingData, null, 2),
      "utf8"
    );

    return res.json({ status: "Файл успешно обновлён" });
  } catch (err) {
    console.error("Ошибка записи файла:", err);
    return res.status(500).json({ error: "Ошибка записи файла" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});