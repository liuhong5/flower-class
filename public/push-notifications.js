// 推送通知系统
class PushNotificationSystem {
    constructor(app) {
        this.app = app;
        this.registration = null;
        this.subscription = null;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            await this.registerServiceWorker();
            await this.requestPermission();
            this.setupEventListeners();
        }
    }

    async registerServiceWorker() {
        try {
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    async requestPermission() {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            await this.subscribeToPush();
        }
        return permission;
    }

    async subscribeToPush() {
        try {
            const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // 需要配置
            this.subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
            });
            
            // 发送订阅信息到服务器
            await this.sendSubscriptionToServer(this.subscription);
        } catch (error) {
            console.error('Push subscription failed:', error);
        }
    }

    async sendSubscriptionToServer(subscription) {
        try {
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.app.token}`
                },
                body: JSON.stringify({
                    subscription,
                    userId: this.app.username
                })
            });
        } catch (error) {
            console.error('Failed to send subscription to server:', error);
        }
    }

    setupEventListeners() {
        // 监听重要事件并发送推送
        this.app.socket.on('flowerWatered', (data) => {
            this.sendLocalNotification('浇水成功', `${data.name} 获得了1分！🌱`);
        });

        this.app.socket.on('achievementUnlocked', (data) => {
            this.sendLocalNotification('成就解锁', `恭喜解锁成就：${data.name} 🏆`);
        });

        this.app.socket.on('gardenScored', (data) => {
            this.sendLocalNotification('花田加分', `${data.name} 获得了${data.points}分！🌿`);
        });

        this.app.socket.on('classRankingUpdate', (data) => {
            this.sendLocalNotification('排名更新', `班级排名发生变化，快来查看！📊`);
        });
    }

    sendLocalNotification(title, body, options = {}) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/badge-icon.png',
                tag: 'garden-notification',
                requireInteraction: false,
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // 3秒后自动关闭
            setTimeout(() => notification.close(), 3000);
        }
    }

    // 发送服务器推送
    async sendServerPush(type, data) {
        try {
            await fetch('/api/push/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.app.token}`
                },
                body: JSON.stringify({ type, data })
            });
        } catch (error) {
            console.error('Failed to send server push:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// 推送通知配置
const PUSH_NOTIFICATIONS = {
    types: {
        WATER_SUCCESS: {
            title: '浇水成功 💧',
            icon: '🌱',
            sound: true
        },
        ACHIEVEMENT_UNLOCK: {
            title: '成就解锁 🏆',
            icon: '⭐',
            sound: true
        },
        GARDEN_SCORE: {
            title: '花田加分 🌿',
            icon: '📈',
            sound: false
        },
        RANKING_UPDATE: {
            title: '排名更新 📊',
            icon: '🏆',
            sound: false
        },
        DAILY_REMINDER: {
            title: '每日提醒 ⏰',
            icon: '🔔',
            sound: true
        }
    }
};

// 导出推送通知系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PushNotificationSystem;
} else {
    window.PushNotificationSystem = PushNotificationSystem;
}