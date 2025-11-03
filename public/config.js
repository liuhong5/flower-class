// API配置
const API_CONFIG = {
    // 本地开发
    development: {
        baseURL: 'http://localhost:3000',
        socketURL: 'http://localhost:3000'
    },
    // 生产环境 - 替换为您的Railway域名
    production: {
        baseURL: 'https://your-app-name.up.railway.app',
        socketURL: 'https://your-app-name.up.railway.app'
    }
};

// 自动检测环境
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const config = isProduction ? API_CONFIG.production : API_CONFIG.development;

window.API_BASE_URL = config.baseURL;
window.SOCKET_URL = config.socketURL;