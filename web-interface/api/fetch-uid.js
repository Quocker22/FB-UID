const fetch = require('node-fetch');

class FacebookUIDFetcher {
    constructor(identifier) {
        this.baseUrl = 'https://www.facebook.com/';
        this.identifier = identifier;
        this.url = this._buildUrl(identifier);
    }

    _buildUrl(identifier) {
        if (identifier.startsWith('http')) return identifier;
        return this.baseUrl + identifier + '/';
    }

    async fetchUID() {
        // Thử cả desktop và mobile version
        const urls = [
            this.url,
            this.url.replace('www.facebook.com', 'm.facebook.com'),
            this.url.replace('facebook.com', 'm.facebook.com')
        ];
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            console.log(`Thử URL ${i + 1}: ${url}`);
            
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    },
                    redirect: 'follow'
                });

                if (!response.ok) {
                    console.log(`HTTP error! Status: ${response.status} cho URL: ${url}`);
                    continue;
                }

                const html = await response.text();

                const patterns = [
                    // Meta tags patterns
                    /content="fb:\/\/profile\/(\d+)"/,
                    /content="fb:\/\/profile\/\?id=(\d+)/,
                    /app-argument=fb:\/\/profile\/(\d+)"/,
                    /app-argument=fb:\/\/profile\/\?id=(\d+)/,
                    
                    // JSON patterns
                    /"userID":(\d+)/,
                    /"userID":"(\d+)"/,
                    /"user_id":(\d+)/,
                    /"user_id":"(\d+)"/,
                    /"entity_id":(\d+)/,
                    /"entity_id":"(\d+)"/,
                    /"page_id":(\d+)/,
                    /"page_id":"(\d+)"/,
                    /"profile_id":(\d+)/,
                    /"profile_id":"(\d+)"/,
                    /"actorID":(\d+)/,
                    /"actorID":"(\d+)"/,
                    /"actor_id":(\d+)/,
                    /"actor_id":"(\d+)"/,
                    /"pageID":(\d+)/,
                    /"pageID":"(\d+)"/,
                    /"profileID":(\d+)/,
                    /"profileID":"(\d+)"/,
                    
                    // Other patterns
                    /"id":(\d{10,})/,
                    /"id":"(\d{10,})"/,
                    /userID:(\d+)/,
                    /pageID:(\d+)/,
                    /profileID:(\d+)/,
                    
                    // HTML attributes patterns
                    /data-testid="page_id" value="(\d+)"/,
                    /page_id=(\d+)/,
                    /profile_id=(\d+)/,
                    
                    // URL patterns
                    /facebook\.com\/profile\.php\?id=(\d+)/,
                    /\/profile\/(\d+)/
                ];

                for (const pattern of patterns) {
                    const match = html.match(pattern);
                    if (match && match[1]) {
                        return match[1];
                    }
                }
                return null;
            } catch (error) {
                console.log(`Lỗi với URL ${url}: ${error.message}`);
                continue;
            }
        }
        
        throw new Error('Không thể truy cập được profile này từ tất cả các URL đã thử.');
    }
}

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
}