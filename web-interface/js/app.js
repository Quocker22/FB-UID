class FacebookUIDFinder {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.urlInput = document.getElementById('url-input');
        this.downloadBtn = document.getElementById('download-btn');
        this.resultContainer = document.getElementById('result-container');
        this.loading = document.getElementById('loading');
        this.downloadResult = document.getElementById('download-result');
        this.errorContainer = document.getElementById('error-container');
        this.errorMessage = document.getElementById('error-message');
        this.clearInput = document.getElementById('clear-input');
    }

    bindEvents() {
        this.downloadBtn.addEventListener('click', () => this.handleSubmit());
        this.clearInput.addEventListener('click', () => this.clearInputField());
        this.urlInput.addEventListener('input', () => this.toggleClearButton());
        this.urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleSubmit();
            }
        });
    }

    toggleClearButton() {
        const hasValue = this.urlInput.value.trim().length > 0;
        this.clearInput.style.opacity = hasValue ? '1' : '0';
    }

    clearInputField() {
        this.urlInput.value = '';
        this.toggleClearButton();
        this.hideResult();
    }

    showLoading() {
        this.loading.classList.remove('hidden');
        this.downloadResult.classList.add('hidden');
        this.errorContainer.classList.add('hidden');
        this.resultContainer.classList.remove('hidden');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    showResult(content) {
        this.downloadResult.innerHTML = content;
        this.downloadResult.classList.remove('hidden');
        this.resultContainer.classList.remove('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorContainer.classList.remove('hidden');
        this.resultContainer.classList.remove('hidden');
    }

    hideResult() {
        this.resultContainer.classList.add('hidden');
        this.loading.classList.add('hidden');
        this.downloadResult.classList.add('hidden');
        this.errorContainer.classList.add('hidden');
    }

    async fetchUID(identifier) {
        try {
            const response = await fetch('/api/fetch-uid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(`Lỗi khi tìm UID: ${error.message}`);
        }
    }

    buildUrl(identifier) {
        if (identifier.startsWith('http')) return identifier;
        return `https://www.facebook.com/${identifier}/`;
    }

    async handleSubmit() {
        const input = this.urlInput.value.trim();
        if (!input) {
            this.showError('Vui lòng nhập Facebook URL hoặc username');
            return;
        }

        const identifiers = input.split('\n').filter(line => line.trim());
        if (identifiers.length === 0) {
            this.showError('Vui lòng nhập ít nhất một Facebook URL hoặc username');
            return;
        }

        this.showLoading();

        try {
            const results = [];
            
            for (const identifier of identifiers) {
                const trimmedId = identifier.trim();
                if (!trimmedId) continue;

                try {
                    const result = await this.fetchUID(trimmedId);
                    results.push({
                        identifier: trimmedId,
                        uid: result.uid,
                        url: this.buildUrl(trimmedId),
                        success: true
                    });
                } catch (error) {
                    results.push({
                        identifier: trimmedId,
                        error: error.message,
                        url: this.buildUrl(trimmedId),
                        success: false
                    });
                }
            }

            this.displayResults(results);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    displayResults(results) {
        let html = '<div class="space-y-4">';
        
        results.forEach((result, index) => {
            if (result.success) {
                const copyBtnId = `copy-btn-${index}`;
                html += `
                    <div class="alert alert-success bg-green-100 border-green-400 text-green-700 rounded-xl">
                        <div class="flex items-center justify-between w-full">
                            <div class="flex flex-col items-start space-x-3">
                                <p>Link gúp Bộ tộc:</p>
                                <a class="text-sm underline text-blue-700 hover:text-blue-900" href="https://www.facebook.com/groups/1212236082236816/user/${result.uid}" target="_blank" rel="noopener noreferrer">https://www.facebook.com/groups/1212236082236816/user/${result.uid}</a>
                            </div>
                            <button id="${copyBtnId}" class="btn btn-sm btn-outline btn-success" type="button">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="alert alert-error bg-red-100 border-red-400 text-red-700 rounded-xl">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-exclamation-circle text-red-600"></i>
                            <div>
                                <div class="font-semibold">${result.identifier}</div>
                                <div class="text-sm opacity-75">${result.error}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        html += '</div>';
        this.showResult(html);

        // Gán lại sự kiện cho các nút copy
        results.forEach((result, index) => {
            if (result.success) {
                const copyBtn = document.getElementById(`copy-btn-${index}`);
                if (copyBtn) {
                    copyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        copyToClipboard(result.uid);
                    });
                }
            }
        });
    }
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(`https://www.facebook.com/groups/1212236082236816/user/${text}`).then(() => {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
        toast.textContent = 'Đã copy Link!';
        document.body.appendChild(toast);
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new FacebookUIDFinder();
});
