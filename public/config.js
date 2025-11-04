// API配置
const API_CONFIG = {
    // 本地开发
    development: {
        baseURL: 'http://localhost:3000',
        socketURL: 'http://localhost:3000'
    },
    // 生产环境 - Vercel域名
    production: {
        baseURL: 'https://flower-class-mf5xu47vm-hong-lius-projects-c1a73057.vercel.app',
        socketURL: 'https://flower-class-mf5xu47vm-hong-lius-projects-c1a73057.vercel.app'
    }
};

// 自动检测环境
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const config = isProduction ? API_CONFIG.production : API_CONFIG.development;

window.API_BASE_URL = config.baseURL;
window.SOCKET_URL = config.socketURL;