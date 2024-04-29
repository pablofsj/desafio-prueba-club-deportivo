import express from "express";
import { readFile, writeFile } from "fs/promises";


const __dirname = import.meta.dirname;

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const filePath = __dirname + "/db/deportes.json";


// Ruta cliente para leer una lista de los deportes con su precio y agregar o eliminar deportes
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html')
})


// Leer (JSON)
app.get("/deportes", async (req, res) => {
  try {
    const deportes = await readFile(filePath, "utf8");
    return res.json(JSON.parse(deportes));

  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false });
  }
});


// Crear
app.post("/agregar", async (req, res) => {
  try {
    const {nombre, precio} = req.body
    const nuevoDeporte = { nombre, precio };
    const stringDeportes = await readFile(filePath, "utf8");
    const deportes = JSON.parse(stringDeportes);
    deportes.push(nuevoDeporte);
    await writeFile(filePath, JSON.stringify(deportes));
    return res.json(nuevoDeporte);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false });
  }
});


// Borrar
app.delete("/borrar/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const stringDeportes = await readFile(filePath, "utf8");
    const deportes = JSON.parse(stringDeportes);
    const nuevosDeportes = deportes.filter((deporte) => deporte.nombre !== nombre);

    if (deportes.length === nuevosDeportes.length) {
      return res.status(404).json({ ok: false });
    }
    await writeFile(filePath, JSON.stringify(nuevosDeportes));

    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false });
  }
});


// Editar
app.put("/editar/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const { nuevoPrecio } = req.body;
    const stringDeportes = await readFile(filePath, "utf8");
    let deportes = JSON.parse(stringDeportes);
    const indiceDeporte = deportes.findIndex((deporte) => deporte.nombre === nombre);
    if (indiceDeporte === -1) {
      return res.status(404).json({ ok: false });
    }
    deportes[indiceDeporte].precio = nuevoPrecio;
    await writeFile(filePath, JSON.stringify(deportes));
    return res.json(deportes[indiceDeporte]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false });
  }
});

// Ruta 404
app.all('*', (req, res) => {
  res.status(404).send('Sitio no encontrado...');
});


const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
