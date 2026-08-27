const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para mabasa ang JSON bodies
app.use(express.json());

// 1. Initialize SQLite Database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // 2. Gawin ang table kung wala pa
        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT DEFAULT 'Pending Review'
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            }
        });
    }
});

// ==========================================
// API ENDPOINTS
// ==========================================

// Add Video Asset
app.post('/api/video', (req, res) => {
    const { title, status } = req.body;
    
    // I-check kung may title ba
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    db.run(`INSERT INTO videos (title, status) VALUES (?, ?)`, 
        [title, status || 'Pending Review'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

// Test route para makita kung buhay ang server
app.get('/', (req, res) => {
    res.send('Video API is running!');
});

// Simulan ang server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
