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
		try {
			const response = await fetch(this.url, {
				method: 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
					'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
					'Accept-Encoding': 'gzip, deflate, br',
					'Connection': 'keep-alive',
					'Upgrade-Insecure-Requests': '1',
					'Sec-Fetch-Dest': 'document',
					'Sec-Fetch-Mode': 'navigate',
					'Sec-Fetch-Site': 'none',
					'Cache-Control': 'max-age=0'
				},
				redirect: 'follow'
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const html = await response.text();
			fs.writeFileSync('debug.html', html);

			const patterns = [
				/"userID":"(\d+)"/,
				/"user_id":"(\d+)"/,
				/"entity_id":"(\d+)"/,
				/"page_id":"(\d+)"/,
				/data-testid="page_id" value="(\d+)"/,
				/page_id=(\d+)/,
				/profile_id=(\d+)/,
				/"profile_id":"(\d+)"/,
				/"actorID":"(\d+)"/,
				/"actor_id":"(\d+)"/
			];

			for (const pattern of patterns) {
				const match = html.match(pattern);
				if (match && match[1]) {
					return match[1];
				}
			}
			return null;
		} catch (error) {
			throw new Error('Lỗi: ' + error.message);
		}
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