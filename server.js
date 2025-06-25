const express = require('express');
const path = require('path');
const { FacebookUIDFetcher } = require('./fetch_facebook_uid.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('web-interface'));

// API endpoint for fetching UID
app.post('/api/fetch-uid', async (req, res) => {
    try {
        const { identifier } = req.body;
        
        if (!identifier) {
            return res.status(400).json({ error: 'Identifier is required' });
        }

        const fetcher = new FacebookUIDFetcher(identifier);
        const uid = await fetcher.fetchUID();

        if (uid) {
            res.json({ uid, success: true });
        } else {
            res.status(404).json({ error: 'UID not found', success: false });
        }
    } catch (error) {
        console.error('Error fetching UID:', error);
        res.status(500).json({ 
            error: error.message || 'Internal server error',
            success: false 
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-interface', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Facebook UID Finder is ready!`);
}); 