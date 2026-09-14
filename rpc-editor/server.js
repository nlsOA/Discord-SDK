const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Ruta al config.json que también lee tu main.py de Python.
// Por defecto asume que está en una carpeta hermana llamada "mySDK" al lado de "rpc-editor".
// Podés pisar esta ruta seteando la variable de entorno CONFIG_PATH antes de arrancar el server:
//   Windows (PowerShell):  $env:CONFIG_PATH="C:\Users\nicol\Desktop\mySDK\config.json"; node server.js
//   Windows (CMD):         set CONFIG_PATH=C:\Users\nicol\Desktop\mySDK\config.json && node server.js
const CONFIG_PATH =
  process.env.CONFIG_PATH || path.join(__dirname, "..", "config.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// GET /api/config -> devuelve el contenido actual del config.json
app.get("/api/config", (req, res) => {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      // Si todavía no existe, devolvemos una estructura vacía por defecto
      return res.json({ client_id: "", intervalo_cambio: 60, estados: [] });
    }
    console.error("Error leyendo config.json:", err.message);
    res.status(500).json({ error: "No se pudo leer config.json: " + err.message });
  }
});

// POST /api/config -> sobreescribe el config.json con lo que mande el editor
app.post("/api/config", (req, res) => {
  const nuevoConfig = req.body;

  if (!nuevoConfig || typeof nuevoConfig !== "object") {
    return res.status(400).json({ error: "Cuerpo de la petición inválido" });
  }
  if (!nuevoConfig.client_id) {
    return res.status(400).json({ error: "Falta client_id" });
  }
  if (!Array.isArray(nuevoConfig.estados)) {
    return res.status(400).json({ error: "'estados' tiene que ser una lista" });
  }

  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(nuevoConfig, null, 4), "utf-8");
    res.json({ ok: true });
  } catch (err) {
    console.error("Error escribiendo config.json:", err.message);
    res.status(500).json({ error: "No se pudo guardar config.json: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Editor de config corriendo en http://localhost:${PORT}`);
  console.log(`Archivo conectado: ${CONFIG_PATH}`);

  if (!fs.existsSync(CONFIG_PATH)) {
    console.log(
      `Aviso: ese archivo todavía no existe. Se va a crear recién cuando guardes desde la web.`
    );
  }
});