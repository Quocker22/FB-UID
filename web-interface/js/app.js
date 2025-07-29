class FacebookUIDFinder {
    constructor() {
        this.groups = [
            {
                id: '1212236082236816',
                name: 'Bộ Tộc',
                icon: 'fas fa-users',
                color: 'btn-primary'
            },
            {
                id: '123456789012345', // Thay bằng ID group thực tế
                name: 'Cộng Đồng',
                icon: 'fas fa-home',
                color: 'btn-secondary'
            },
            {
                id: '234567890123456', // Thay bằng ID group thực tế
                name: 'Hội Nhóm',
                icon: 'fas fa-handshake',
                color: 'btn-accent'
            },
            {
                id: '345678901234567', // Thay bằng ID group thực tế
                name: 'Gia Đình',
                icon: 'fas fa-heart',
                color: 'btn-info'
            }
        ];
        this.selectedGroup = {
            id: '1212236082236816',
            name: 'Bộ Tộc'
        }; // Mặc định chọn Bộ Tộc
        this.initializeElements();
        this.bindEvents();
        this.initializeGroupPresets();
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
        this.groupPresetBtns = document.querySelectorAll('.group-preset-btn');
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
        
        // Bind group preset buttons
        this.groupPresetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupId = btn.getAttribute('data-group-id');
                const groupName = btn.getAttribute('data-group-name');
                this.handleGroupPreset(groupId, groupName);
            });
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
                // Tạo button cho group đã chọn hoặc tất cả các group nếu chưa chọn
                let groupButtons = '';
                if (this.selectedGroup) {
                    // Chỉ hiển thị button cho group đã chọn
                    const group = this.groups.find(g => g.id === this.selectedGroup.id);
                    if (group) {
                        groupButtons = `
                            <button class="btn btn-sm ${group.color} group-btn" 
                                    data-uid="${result.uid}" 
                                    data-group-id="${group.id}"
                                    data-group-name="${group.name}">
                                <i class="${group.icon}"></i>
                                Vào ${group.name}
                            </button>
                        `;
                    }
                } else {
                    // Hiển thị tất cả các group
                    groupButtons = this.groups.map(group => `
                        <button class="btn btn-sm ${group.color} group-btn" 
                                data-uid="${result.uid}" 
                                data-group-id="${group.id}"
                                data-group-name="${group.name}">
                            <i class="${group.icon}"></i>
                            ${group.name}
                        </button>
                    `).join('');
                }

                html += `
                    <div class="alert alert-success bg-green-100 border-green-400 text-green-700 rounded-xl">
                        <div class="flex flex-col w-full space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex flex-col">
                                    <p class="font-semibold">${result.identifier}</p>
                                    <p class="text-sm opacity-75">UID: ${result.uid}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="btn btn-sm btn-outline copy-uid-btn" 
                                            data-uid="${result.uid}">
                                        <i class="fas fa-copy"></i>
                                        Copy UID
                                    </button>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                ${groupButtons}
                            </div>
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

        // Gán sự kiện cho các nút group
        document.querySelectorAll('.group-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const uid = btn.getAttribute('data-uid');
                const groupId = btn.getAttribute('data-group-id');
                const groupName = btn.getAttribute('data-group-name');
                this.openGroupLink(uid, groupId, groupName);
            });
        });

        // Gán sự kiện cho các nút copy UID
        document.querySelectorAll('.copy-uid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const uid = btn.getAttribute('data-uid');
                this.copyUID(uid);
            });
        });
    }
    copyGroupLink(uid, groupId, groupName) {
        const link = `https://www.facebook.com/groups/${groupId}/user/${uid}`;
        navigator.clipboard.writeText(link).then(() => {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg';
            toast.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-check-circle"></i>
                    <span>Đã copy link ${groupName}!</span>
                </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg';
            toast.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Lỗi khi copy link!</span>
                </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 3000);
        });
    }

    openGroupLink(uid, groupId, groupName) {
        const link = `https://www.facebook.com/groups/${groupId}/user/${uid}`;
        window.open(link, '_blank');
        this.showToast(`Đã mở link ${groupName}!`, 'success');
    }

    copyUID(uid) {
        navigator.clipboard.writeText(uid).then(() => {
            this.showToast('Đã copy UID!', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.showToast('Lỗi khi copy UID!', 'error');
        });
    }

    initializeGroupPresets() {
        const groupPresetBtns = document.querySelectorAll('.group-preset-btn');
        groupPresetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleGroupPreset(e.target.closest('.group-preset-btn'));
            });
        });
    }

    handleGroupPreset(btn) {
        const groupId = btn.getAttribute('data-group-id');
        const groupName = btn.getAttribute('data-group-name');
        
        // Cập nhật selectedGroup
        this.selectedGroup = { id: groupId, name: groupName };
        
        // Cập nhật visual state của các button
        this.updateGroupPresetVisualState(btn);
    }

    updateGroupPresetVisualState(activeBtn) {
        const allBtns = document.querySelectorAll('.group-preset-btn');
        
        allBtns.forEach(btn => {
            if (btn === activeBtn) {
                // Active state
                btn.classList.add('active', 'ring-2', 'shadow-lg', 'transform', 'scale-105');
                btn.classList.remove('opacity-70');
                btn.style.opacity = '1';
                
                // Thêm ring color dựa trên background color
                const bgColor = window.getComputedStyle(btn).backgroundColor;
                if (bgColor.includes('29, 119, 242')) { // #1877F2
                    btn.classList.add('ring-[#1877F2]', 'ring-offset-2');
                } else if (bgColor.includes('66, 184, 131')) { // #42B883
                    btn.classList.add('ring-[#42B883]', 'ring-offset-2');
                } else if (bgColor.includes('230, 126, 34')) { // #E67E22
                    btn.classList.add('ring-[#E67E22]', 'ring-offset-2');
                } else if (bgColor.includes('233, 30, 99')) { // #E91E63
                    btn.classList.add('ring-[#E91E63]', 'ring-offset-2');
                }
            } else {
                // Inactive state
                btn.classList.remove('active', 'ring-2', 'shadow-lg', 'transform', 'scale-105');
                btn.classList.remove('ring-[#1877F2]', 'ring-[#42B883]', 'ring-[#E67E22]', 'ring-[#E91E63]', 'ring-offset-2');
                btn.classList.add('opacity-70');
                btn.classList.add('hover:opacity-100', 'transition-all', 'duration-200');
            }
        });
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        
        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg z-50 shadow-lg`;
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }
}

// Copy to clipboard function (deprecated - keeping for backward compatibility)
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
