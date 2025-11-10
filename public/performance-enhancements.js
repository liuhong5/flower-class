// 前端性能优化
class PerformanceEnhancements {
    constructor() {
        this.imageCache = new Map();
        this.requestCache = new Map();
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupRequestOptimization();
        this.setupVirtualScrolling();
    }

    // 懒加载
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadElement(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });

            document.querySelectorAll('[data-lazy]').forEach(el => observer.observe(el));
        }
    }

    loadElement(element) {
        if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
    }

    // 图片优化
    setupImageOptimization() {
        this.convertToWebP();
        this.compressImages();
    }

    convertToWebP() {
        if (this.supportsWebP()) {
            document.querySelectorAll('img[src$=".jpg"], img[src$=".png"]').forEach(img => {
                const webpSrc = img.src.replace(/\.(jpg|png)$/, '.webp');
                this.loadImageWithFallback(img, webpSrc, img.src);
            });
        }
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    loadImageWithFallback(img, webpSrc, fallbackSrc) {
        const webpImg = new Image();
        webpImg.onload = () => img.src = webpSrc;
        webpImg.onerror = () => img.src = fallbackSrc;
        webpImg.src = webpSrc;
    }

    compressImages() {
        // 客户端图片压缩
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.files[0]) {
                this.compressImage(e.target.files[0]).then(compressed => {
                    e.target.files = compressed;
                });
            }
        });
    }

    async compressImage(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const maxWidth = 800;
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // 请求优化
    setupRequestOptimization() {
        this.debounce = this.createDebounce();
        this.throttle = this.createThrottle();
    }

    createDebounce() {
        let timeout;
        return (func, delay = 300) => {
            clearTimeout(timeout);
            timeout = setTimeout(func, delay);
        };
    }

    createThrottle() {
        let lastCall = 0;
        return (func, delay = 100) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func();
            }
        };
    }

    // 虚拟滚动
    setupVirtualScrolling() {
        this.virtualScrollContainers = document.querySelectorAll('[data-virtual-scroll]');
        this.virtualScrollContainers.forEach(container => {
            this.initVirtualScroll(container);
        });
    }

    initVirtualScroll(container) {
        const itemHeight = 100;
        const visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
        let startIndex = 0;

        container.addEventListener('scroll', this.throttle(() => {
            startIndex = Math.floor(container.scrollTop / itemHeight);
            this.renderVirtualItems(container, startIndex, visibleItems);
        }));
    }

    renderVirtualItems(container, startIndex, visibleItems) {
        const items = container.dataset.items ? JSON.parse(container.dataset.items) : [];
        const endIndex = Math.min(startIndex + visibleItems, items.length);
        
        container.innerHTML = '';
        for (let i = startIndex; i < endIndex; i++) {
            const item = this.createVirtualItem(items[i], i);
            container.appendChild(item);
        }
    }

    createVirtualItem(data, index) {
        const item = document.createElement('div');
        item.className = 'virtual-item';
        item.style.transform = `translateY(${index * 100}px)`;
        item.innerHTML = `<div class="item-content">${data.name || data.title}</div>`;
        return item;
    }

    // 资源预加载
    preloadResources() {
        const criticalResources = [
            '/styles.css',
            '/script.js',
            '/garden-enhancements.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }
}

// 初始化
const performanceEnhancements = new PerformanceEnhancements();