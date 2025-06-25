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
		const fetch = (await import('node-fetch')).default;
		const fs = await import('fs');
		
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
				fs.writeFileSync(`debug_${i}.html`, html);

				const patterns = [
					// Meta tags patterns (thường xuất hiện trong HTML của Facebook)
					/content="fb:\/\/profile\/(\d+)"/,
					/content="fb:\/\/profile\/\?id=(\d+)/,
					/app-argument=fb:\/\/profile\/(\d+)"/,
					/app-argument=fb:\/\/profile\/\?id=(\d+)/,
					
					// JSON patterns - cả có và không có dấu ngoặc kép
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
					
					// Patterns cho các field khác có thể chứa UID
					/"id":(\d{10,})/,
					/"id":"(\d{10,})"/,
					/userID:(\d+)/,
					/pageID:(\d+)/,
					/profileID:(\d+)/,
					
					// HTML attributes patterns
					/data-testid="page_id" value="(\d+)"/,
					/page_id=(\d+)/,
					/profile_id=(\d+)/,
					
					// URL patterns trong các link
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

// Export the class
module.exports = { FacebookUIDFetcher };

// CLI usage (only if run directly)
if (require.main === module) {
	(async () => {
		const input = process.argv[2];
		if (!input) {
			console.log('Usage: node fetch_facebook_uid.js <facebook_url_or_username>');
			process.exit(1);
		}
		const fetcher = new FacebookUIDFetcher(input);
		try {
			const uid = await fetcher.fetchUID();
			if (uid) {
				console.log('UID:', uid);
			} else {
				console.log('Không tìm thấy UID. Kiểm tra file debug.html để xem HTML thực tế.');
			}
		} catch (e) {
			console.error(e.message);
		}
	})();
}