// imports
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import path from "path";
import { fileURLToPath } from "url";



// Load environment variables from .env file
env.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// consts
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/build')));


// Database connection
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,  
});
db.connect();

// Before Login
let items = [];

// Routes
app.get("/api", async(req, res) => {
  try{
    const result = await db.query("SELECT * FROM notes");
    res.status(200).json(result.rows);
  }
  catch(err){
    console.log(err);
  }
});

app.post('/api/notes', async(req, res) => {
  const newItem = req.body;
  // console.log("Adding new item:", newItem);
   try{
    const result = await db.query("INSERT INTO notes (title, content) VALUES($1, $2) RETURNING *",[newItem.title, newItem.content]); 
    // console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);
  }catch(err){
    console.log(err);
  }  
});

app.delete('/api/notes/:id', async(req, res) => {
  const { id } = req.params; // Get the id from the URL
  const index = parseInt(id); // Parse the id to an integer
  try{
    await db.query("DELETE FROM notes WHERE id = $1",[id]);
    res.status(200).json({ message: `Note with id ${id} deleted` });
  }catch(err){
    console.log(err); 
    res.status(404).json({ error: "Note not found" }); // Not found if id is invalid
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
