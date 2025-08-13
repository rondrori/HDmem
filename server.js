// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('build')); // Serve React build files

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('רק קבצי תמונה מותרים'));
    }
  }
});

// Database initialization
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS memories (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        story TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        date DATE,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        memory_id INTEGER REFERENCES memories(id) ON DELETE CASCADE,
        author VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Routes

// Get all memories with comments
app.get('/api/memories', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT m.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'author', c.author,
                   'text', c.text,
                   'created_at', c.created_at
                 ) ORDER BY c.created_at
               ) FILTER (WHERE c.id IS NOT NULL), 
               '[]'
             ) as comments
      FROM memories m
      LEFT JOIN comments c ON m.id = c.memory_id
    `;
    
    let params = [];
    if (search) {
      query += ` WHERE m.title ILIKE $1 OR m.story ILIKE $1 OR m.author ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` GROUP BY m.id ORDER BY m.created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הזיכרונות' });
  }
});

// Add new memory
app.post('/api/memories', upload.single('image'), async (req, res) => {
  try {
    const { title, story, author, date } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      'INSERT INTO memories (title, story, author, date, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, story, author, date || null, imageUrl]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בהוספת הזיכרון' });
  }
});

// Add comment to memory
app.post('/api/memories/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { author, text } = req.body;

    const result = await pool.query(
      'INSERT INTO comments (memory_id, author, text) VALUES ($1, $2, $3) RETURNING *',
      [id, author, text]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בהוספת התגובה' });
  }
});

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'הקובץ גדול מדי (מקסימום 10MB)' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
