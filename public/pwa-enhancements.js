// PWA增强功能
class PWAEnhancements {
    constructor() {
        this.installPrompt = null;
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.setupInstallPrompt();
        this.setupOfflineDetection();
        this.setupBackgroundSync();
        this.setupPeriodicSync();
    }

    // 安装提示
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallBanner();
        });
    }

    showInstallBanner() {
        const banner = document.createElement('div');
        banner.className = 'install-banner';
        banner.innerHTML = `
            <div class="install-content">
                <i class="fas fa-download"></i>
                <span>安装应用到桌面</span>
                <button onclick="pwaEnhancements.install()" class="install-btn">安装</button>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">×</button>
            </div>
        `;
        document.body.appendChild(banner);
    }

    async install() {
        if (!this.installPrompt) return;
        const result = await this.installPrompt.prompt();
        if (result.outcome === 'accepted') {
            document.querySelector('.install-banner')?.remove();
        }
        this.installPrompt = null;
    }

    // 离线检测
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineBanner();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineBanner();
        });
    }

    showOfflineBanner() {
        let banner = document.getElementById('offlineBanner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'offlineBanner';
            banner.className = 'offline-banner';
            banner.innerHTML = '<i class="fas fa-wifi"></i> 离线模式 - 数据将在连接恢复后同步';
            document.body.appendChild(banner);
        }
    }

    hideOfflineBanner() {
        document.getElementById('offlineBanner')?.remove();
    }

    // 后台同步
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                this.registration = registration;
            });
        }
    }

    async syncOfflineData() {
        const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        for (const action of offlineQueue) {
            try {
                await fetch(action.url, action.options);
            } catch (error) {
                console.error('同步失败:', error);
            }
        }
        localStorage.removeItem('offlineQueue');
    }

    // 定期同步
    setupPeriodicSync() {
        if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                registration.periodicSync.register('background-sync', {
                    minInterval: 24 * 60 * 60 * 1000 // 24小时
                });
            });
        }
    }
}

// 初始化
const pwaEnhancements = new PWAEnhancements();