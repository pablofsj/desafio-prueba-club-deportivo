import express from "express";
import { readFile, writeFile } from "fs/promises";
import { nanoid } from "nanoid";

const __dirname = import.meta.dirname;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const filePath = __dirname + "/db/todos.json";

app.get("/todos", async (req, res) => {
  try {
    const todos = await readFile(filePath, "utf8");
    return res.json(JSON.parse(todos));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { title = "" } = req.body;
    const newTodo = { id: nanoid(), title, completed: false };

    const stringTodos = await readFile(filePath, "utf8");
    const todos = JSON.parse(stringTodos);
    todos.push(newTodo);

    await writeFile(filePath, JSON.stringify(todos));

    return res.json(newTodo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const stringTodos = await readFile(filePath, "utf8");
    const todos = JSON.parse(stringTodos);
    const newTodos = todos.filter((todo) => todo.id !== id);

    if (todos.length === newTodos.length) {
      return res.status(404).json({ ok: false });
    }

    await writeFile(filePath, JSON.stringify(newTodos));

    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false });
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const stringTodos = await readFile(filePath, "utf8");
    const todos = JSON.parse(stringTodos);

    const index = todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
      return res.status(404).json({ ok: false });
    }

    if (title) {
      todos[index].title = title;
    }

    if (completed !== undefined) {
      todos[index].completed = completed;
    }

    await writeFile(filePath, JSON.stringify(todos));

    return res.json(todos[index]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
