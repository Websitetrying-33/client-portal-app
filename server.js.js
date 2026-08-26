const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios'); // Kailangan para sa pagkuha ng data mula sa external APIs

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database (Automatic Sync Ready).');
        
        db.run(`CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, invoiceRef TEXT, billingPeriod TEXT, scope TEXT, amount TEXT, status TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS contracts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, status TEXT, signedDate TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS videos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, status TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS schedule (id INTEGER PRIMARY KEY AUTOINCREMENT, platform TEXT, postTitle TEXT, scheduleDate TEXT, status TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, priority TEXT, status TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, qualifiedLeads TEXT, bookedCalls TEXT, roi TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS assets (id INTEGER PRIMARY KEY AUTOINCREMENT, fileName TEXT, fileSize TEXT, fileUrl TEXT)`);

        // Seed initial data
        db.get(`SELECT COUNT(*) as count FROM invoices`, (err, row) => {
            if (row.count === 0) {
                db.run(`INSERT INTO invoices (invoiceRef, billingPeriod, scope, amount, status) VALUES ('INV-2026-AU09', 'August – September 2026', 'Q3 Meta & TikTok Scale Campaign + Creative Retainer', 'AUD $4,100', 'Pending')`);
                db.run(`INSERT INTO contracts (title, status, signedDate) VALUES ('Master Services Agreement (MSA)', 'Signed & Verified', '2025-10-15')`);
                db.run(`INSERT INTO videos (title, status) VALUES ('Cut #4: Q3 Brand Awareness V2.mp4', 'Pending Review')`);
                db.run(`INSERT INTO schedule (platform, postTitle, scheduleDate, status) VALUES ('LinkedIn', 'Executive Thought Leadership', 'Tomorrow at 9:00 AM AEST', 'Ready')`);
                db.run(`INSERT INTO tasks (title, priority, status) VALUES ('Q3 Meta Ads Scaling Setup', 'High', 'In Progress')`);
                db.run(`INSERT INTO leads (qualifiedLeads, bookedCalls, roi) VALUES ('142 (+18%)', '34 (78% show)', '4.8x')`);
                db.run(`INSERT INTO assets (fileName, fileSize, fileUrl) VALUES ('Brand_Guidelines_2026.pdf', '4.2 MB', '#')`);
            }
        });
    }
});

// ==========================================
// AUTOMATED API FETCHERS (Placeholder / Webhook Hooks)
// ==========================================

// Function para kunin ang live data mula sa Meta Marketing API (Ads / Leads)
async function fetchLiveMetaAdsData() {
    try {
        // Dito ilalagay ang Meta Graph API call kapag na-setup na ang Access Token ng client
        // const response = await axios.get(`https://graph.facebook.com/v18.0/ACT_ID/insights?access_token=YOUR_TOKEN`);
        // return mapped data...
        return null; // Bumabalik sa local DB kung walang API token na naka-set
    } catch (error) {
        console.error('Meta API Sync Error:', error.message);
        return null;
    }
}

// Function para kunin ang live files mula sa Google Drive API (Assets Vault)
async function fetchLiveGoogleDriveFiles() {
    try {
        // Dito ilalagay ang Google Drive API call para i-sync ang shared folder ng client
        return null;
    } catch (error) {
        console.error('Google Drive API Sync Error:', error.message);
        return null;
    }
}

// ==========================================
// API ENDPOINTS
// ==========================================

app.get('/api/all-data', async (req, res) => {
    // Subukan munang mag-sync mula sa live APIs kung available
    const liveMetaLeads = await fetchLiveMetaAdsData();
    const liveDriveAssets = await fetchLiveGoogleDriveFiles();

    db.serialize(() => {
        const data = {};
        db.get(`SELECT * FROM invoices LIMIT 1`, (err, row) => { data.invoice = row; });
        db.all(`SELECT * FROM contracts`, (err, rows) => { data.contracts = rows; });
        db.all(`SELECT * FROM videos`, (err, rows) => { data.videos = rows; });
        db.all(`SELECT * FROM schedule`, (err, rows) => { data.schedule = rows; });
        db.all(`SELECT * FROM tasks`, (err, rows) => { data.tasks = rows; });
        
        // Gamitin ang live API data kung meron, kundi gamitin ang database
        db.get(`SELECT * FROM leads LIMIT 1`, (err, row) => { 
            data.leads = liveMetaLeads || row; 
        });
        
        db.all(`SELECT * FROM assets`, (err, rows) => { 
            data.assets = liveDriveAssets || rows; 
            res.json(data);
        });
    });
});

// Webhook endpoint para sa real-time updates mula sa client systems (Stripe, Zapier, Make.com)
app.post('/api/webhook/sync', (req, res) => {
    const { section, payload } = req.body;
    console.log(`Received automated sync for section: ${section}`, payload);
    
    // Dito kusang mag-a-update ang database kapag may pumasok na trigger mula sa Zapier/Make.com
    res.json({ success: true, message: 'Data synced successfully via webhook.' });
});

// Standard CRUD / Management Endpoints
app.put('/api/invoice', (req, res) => {
    const { invoiceRef, billingPeriod, scope, amount } = req.body;
    db.run(`UPDATE invoices SET invoiceRef = ?, billingPeriod = ?, scope = ?, amount = ? WHERE id = 1`,
        [invoiceRef, billingPeriod, scope, amount], function(err) { res.json({ success: true }); });
});

app.post('/api/contract', (req, res) => {
    const { title, status, signedDate } = req.body;
    db.run(`INSERT INTO contracts (title, status, signedDate) VALUES (?, ?, ?)`, [title, status || 'Signed & Verified', signedDate], function(err) {
        res.json({ success: true, id: this.lastID });
    });
});

app.post('/api/video/status', (req, res) => {
    const { id, status } = req.body;
    db.run(`UPDATE videos SET status = ? WHERE id = ?`, [status, id], function(err) { res.json({ success: true }); });
});

app.post('/api/schedule', (req, res) => {
    const { platform, postTitle, scheduleDate, status } = req.body;
    db.run(`INSERT INTO schedule (platform, postTitle, scheduleDate, status) VALUES (?, ?, ?, ?)`, [platform, postTitle, scheduleDate, status || 'Ready'], function(err) {
        res.json({ success: true, id: this.lastID });
    });
});

app.post('/api/tasks', (req, res) => {
    const { title, priority, status } = req.body;
    db.run(`INSERT INTO tasks (title, priority, status) VALUES (?, ?, ?)`, [title, priority || 'Normal', status || 'In Progress'], function(err) {
        res.json({ success: true, id: this.lastID });
    });
});

app.post('/api/tasks/status', (req, res) => {
    const { id, status } = req.body;
    db.run(`UPDATE tasks SET status = ? WHERE id = ?`, [status, id], function(err) { res.json({ success: true }); });
});

app.put('/api/leads', (req, res) => {
    const { qualifiedLeads, bookedCalls, roi } = req.body;
    db.run(`UPDATE leads SET qualifiedLeads = ?, bookedCalls = ?, roi = ? WHERE id = 1`, [qualifiedLeads, bookedCalls, roi], function(err) { res.json({ success: true }); });
});

app.post('/api/assets', (req, res) => {
    const { fileName, fileSize, fileUrl } = req.body;
    db.run(`INSERT INTO assets (fileName, fileSize, fileUrl) VALUES (?, ?, ?)`, [fileName, fileSize || '2.1 MB', fileUrl || '#'], function(err) {
        res.json({ success: true, id: this.lastID });
    });
});

app.listen(PORT, () => {
    console.log(`Automated Command Center running on http://localhost:${PORT}`);
});