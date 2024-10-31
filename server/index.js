// imports
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";

// Load environment variables from .env file
env.config();

// consts
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const saltRounds = 10;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(cors());
// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    }
  })
);
// passport middleware
app.use(passport.initialize());
// passport session middleware
app.use(passport.session());



// Database connection
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,  
});
db.connect();

// Database schema
// Database schema for users and notes
const createTables = async () => {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users1 (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `;

  const createNotesTableQuery = `
    CREATE TABLE IF NOT EXISTS notes1 (
      id SERIAL PRIMARY KEY,
      title TEXT,
      content TEXT,
      user_id INTEGER REFERENCES users1(id)
    );
  `;

  await db.query(createUsersTableQuery);
  await db.query(createNotesTableQuery);
};
createTables().catch(err => console.error('Error creating tables:', err));

// Before Login
var items;

// Routes

app.get('/api', async (req, res) => {
  items = [];
  if (req.isAuthenticated()) {
      try {
          const result = await db.query("SELECT * FROM notes1 WHERE user_id = $1", [req.user.id]);
          res.status(200).json(result.rows);
      } catch (error) {
          res.status(500).json({ error: 'Error fetching notes from database' });
      }
  } else {
      res.status(200).json(items); // items is your in-memory notes array for non-authenticated users
  }
});

app.post("/api/notes", async (req, res) => {
  const { title, content } = req.body;
  if (req.isAuthenticated()) {
    const result = await db.query(
      "INSERT INTO notes1 (user_id, title, content) VALUES ($1, $2, $3) RETURNING *",
      [req.user.id, title, content]
    );
    res.status(201).json(result.rows[0]);
  } else {
    const newNote = { id: items.length + 1, title, content };
    items.push(newNote);
    res.status(201).json(newNote);
  }
});
 

app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  if (req.isAuthenticated()) {
    await db.query("DELETE FROM notes1 WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    res.json({ message: "Note deleted" });
  } else {
    items = items.filter(note => note.id !== parseInt(id));
    res.json({ message: "Note deleted" });
  }
});


app.get("/api/auth/check", async(req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  // console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.json({ auth: 200 }); 
  } else {
    res.json({ auth: 401 });
  }
});


app.get("/api/logout", (req, res) => {
  req.logout(err => {
      if (err) return res.status(500).json({ error: "Logout error" });
      req.session.destroy(() => {
          
          res.clearCookie('connect.sid'); // Replace with actual session cookie name if different
          
          res.status(200).json({ message: "Logged out successfully" });
      
        });
  });
});

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging in" });
      }
      res.status(200).json({ message: "Login successful" });
    });
  })(req, res, next);
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  // console.log(username);

  try {
    const checkResult = await db.query("SELECT * FROM users1 WHERE username = $1", [
      username,
    ]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    } else {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const result = await db.query(
        "INSERT INTO users1 (username, password) VALUES ($1, $2) RETURNING *",
        [username, hashedPassword]
      );

      const user = result.rows[0];

      req.login(user, (err) => {
        if (err) {
          console.error("Error logging in after registration:", err);
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        res.status(201).json({ message: "Registration successful" });
      });
    }
  } catch (err) {
    console.log("Error in registration route:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users1 WHERE username = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              //Passed password check
              return cb(null, user);
            } else {
              //Did not pass password check
              return cb(null, false, { message: "Incorrect password" });
            }
          }
        });
      } else {
        return cb(null, false, { message: "User not found"});
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
