import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Banco de dados em um caminho absoluto para a Hostinger não se perder
const db = new Database(path.join(__dirname, "inventory.db"));

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    is_paid INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category_id INTEGER,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 5,
    price REAL,
    cost REAL,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER,
    total_price REAL,
    total_cost REAL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed Admin User
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("ADMIN");
if (!adminExists) {
  db.prepare("INSERT INTO users (username, password, is_paid) VALUES (?, ?, ?)").run("ADMIN", "123teste", 1);
}

const app = express();
app.use(express.json());

// PORTA: A Hostinger usa a variável de ambiente PORT
const PORT = process.env.PORT || 3000;

// --- API ROUTES ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username, is_paid: user.is_paid } });
  } else {
    res.status(401).json({ success: false, message: "Credenciais inválidas" });
  }
});

app.get("/api/products", (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
  `).all();
  res.json(products);
});

// Outras rotas simplificadas para o servidor rodar leve
app.get("/api/categories", (req, res) => {
  res.json(db.prepare("SELECT * FROM categories").all());
});

// --- ENTREGA DOS ARQUIVOS DO SITE (FRONT-END) ---
// Isso faz o site carregar na Hostinger
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  // Se for uma chamada de API que não existe, retorna 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: "API route not found" });
  }
  // Para qualquer outra rota, entrega o index.html (SPA)
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});