const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite Database Setup (Persistent or In-Memory fallback)
const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDatabase();
    }
});

// Initialize Tables & Seed Data
function initDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoiceRef TEXT,
            billingPeriod TEXT,
            scope TEXT,
            amount TEXT,
            status TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            status TEXT,
            signedDate TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            status TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT,
            postTitle TEXT,
            scheduleDate TEXT,
            status TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            priority TEXT,
            status TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            qualifiedLeads TEXT,
            bookedCalls TEXT,
            roi TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fileName TEXT,
            fileSize TEXT,
            fileUrl TEXT
        )`);

        // Seed initial data para sa Sydney Agency Pitch (Kung wala pang laman)
        db.get(`SELECT COUNT(*) as count FROM invoices`, (err, row) => {
            if (!err && row && row.count === 0) {
                db.run(`INSERT INTO invoices (invoiceRef, billingPeriod, scope, amount, status) VALUES ('MYOB-INV-2026-088', 'August – September 2026', 'Social Media Management, Reels Creative Retainer & Lead Ads Scale', 'AUD $4,850.00', 'Pending Payment')`);
                
                db.run(`INSERT INTO contracts (title, status, signedDate) VALUES ('Master Service Agreement & NDA (Sydney Agency)', 'Signed & Verified', '2025-10-15')`);
                db.run(`INSERT INTO contracts (title, status, signedDate) VALUES ('Q3-Q4 Influencer & Content Licensing Addendum', 'Signed & Verified', '2026-01-10')`);

                db.run(`INSERT INTO videos (title, status) VALUES ('Reel #12 - Bondi Beach Lifestyle Promo (v2).mp4', 'Pending Review')`);
                db.run(`INSERT INTO videos (title, status) VALUES ('Client UGC Testimonial - Sydney CBD Shoot.mp4', 'Approved ✓')`);

                db.run(`INSERT INTO schedule (platform, postTitle, scheduleDate, status) VALUES ('Instagram', 'Behind-the-Scenes Reel: Sydney Office Launch', 'Tomorrow at 10:00 AM AEST', 'Ready')`);
                db.run(`INSERT INTO schedule (platform, postTitle, scheduleDate, status) VALUES ('TikTok', 'Top 3 Social Media Mistakes Growing Brands Make', 'Aug 30, 2026 - 3:00 PM AEST', 'Scheduled')`);

                db.run(`INSERT INTO tasks (title, priority, status) VALUES ('Setup Client Portal Onboarding & Zapier Sync', 'High', 'Completed')`);
                db.run(`INSERT INTO tasks (title, priority, status) VALUES ('Q3 Meta Ads & Lead Pipeline Customization', 'High', 'In Progress')`);

                db.run(`INSERT INTO leads (qualifiedLeads, bookedCalls, roi) VALUES ('184 (+24%)', '42 (82% show rate)', '5.4x')`);

                db.run(`INSERT INTO assets (fileName, fileSize, fileUrl) VALUES ('Sydney_Agency_Brand_Guidelines_2026.pdf', '5.1 MB', '#')`);
                db.run(`INSERT INTO assets (fileName, fileSize, fileUrl) VALUES ('Client_Raw_Footage_Dropbox_Folder.link', '124 GB', '#')`);
                db.run(`INSERT INTO assets (fileName, fileSize, fileUrl) VALUES ('Q3_Performance_Report_MYOB_Export.pdf', '2.8 MB', '#')`);
            }
        });
    });
}

// --- API ENDPOINTS ---

// Get All Dashboard Data
app.get('/api/all-data', (req, res) => {
    const data = {};
    db.serialize(() => {
        db.get(`SELECT * FROM invoices LIMIT 1`, (err, row) => {
            data.invoice = row || {};
            db.all(`SELECT * FROM contracts`, (err, rows) => {
                data.contracts = rows || [];
                db.all(`SELECT * FROM videos`, (err, rows) => {
                    data.videos = rows || [];
                    db.all(`SELECT * FROM schedule`, (err, rows) => {
                        data.schedule = rows || [];
                        db.all(`SELECT * FROM tasks`, (err, rows) => {
                            data.tasks = rows || [];
                            db.get(`SELECT * FROM leads LIMIT 1`, (err, row) => {
                                data.leads = row || {};
                                db.all(`SELECT * FROM assets`, (err, rows) => {
                                    data.assets = rows || [];
                                    res.json(data);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Update Invoice
app.put('/api/invoice', (req, res) => {
    const { invoiceRef, billingPeriod, scope, amount } = req.body;
    db.run(`UPDATE invoices SET invoiceRef = ?, billingPeriod = ?, scope = ?, amount = ? WHERE id = 1`, 
        [invoiceRef, billingPeriod, scope, amount], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Add Contract
app.post('/api/contract', (req, res) => {
    const { title, status, signedDate } = req.body;
    db.run(`INSERT INTO contracts (title, status, signedDate) VALUES (?, ?, ?)`, 
        [title, status, signedDate], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

// Add Video Asset
app.post('/api/video', (req, res) => {
    const { title, status } = req.body;
    db.run(`INSERT INTO videos (title, status) VALUES (?, ?)`, 
        [title, status || 'Pending Review'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

// Update Video Status
app.post('/api/video/status', (req, res) => {
    const { id, status } = req.body;
    db.run(`UPDATE videos SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Add Schedule Item
app.post('/api/schedule', (req, res) => {
    const { platform, postTitle, scheduleDate, status } = req.body;
    db.run(`INSERT INTO schedule (platform, postTitle, scheduleDate, status) VALUES (?, ?, ?, ?)`, 
        [platform, postTitle, scheduleDate, status], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

// Add Task
app.post('/api/tasks', (req, res) => {
    const { title, priority, status } = req.body;
    db.run(`INSERT INTO tasks (title, priority, status) VALUES (?, ?, ?)`, 
        [title, priority, status], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

// Update Leads & ROI
app.put('/api/leads', (req, res) => {
    const { qualifiedLeads, bookedCalls, roi } = req.body;
    db.run(`SELECT * FROM leads`, (err, rows) => {
        if (rows && rows.length > 0) {
            db.run(`UPDATE leads SET qualifiedLeads = ?, bookedCalls = ?, roi = ? WHERE id = 1`, 
                [qualifiedLeads, bookedCalls, roi], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        } else {
            db.run(`INSERT INTO leads (qualifiedLeads, bookedCalls, roi) VALUES (?, ?, ?)`, 
                [qualifiedLeads, bookedCalls, roi], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        }
    });
});

// Add Asset / File
app.post('/api/assets', (req, res) => {
    const { fileName, fileSize, fileUrl } = req.body;
    db.run(`INSERT INTO assets (fileName, fileSize, fileUrl) VALUES (?, ?, ?)`, 
        [fileName, fileSize, fileUrl || '#'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

// Fallback to index.html for SPA routing (Dapat nasa dulo ito)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
