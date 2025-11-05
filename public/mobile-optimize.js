// 移动端性能优化脚本
(function() {
    'use strict';
    
    // 检测移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 预加载关键资源
        const preloadResources = [
            '/styles.css',
            '/script.js'
        ];
        
        preloadResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
        
        // 优化滚动性能
        let ticking = false;
        function updateScrollPosition() {
            // 节流滚动事件
            ticking = false;
        }
        
        document.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }, { passive: true });
        
        // 优化触摸事件
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
        
        // 延迟加载非关键脚本
        setTimeout(() => {
            if (typeof Chart === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                script.async = true;
                document.head.appendChild(script);
            }
        }, 2000);
        
        // 内存清理
        setInterval(() => {
            if (window.app && window.app.cardCache) {
                // 清理过期缓存
                if (window.app.cardCache.size > 100) {
                    window.app.cardCache.clear();
                }
            }
        }, 30000);
    }
})();