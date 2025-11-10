// 无障碍访问优化
class AccessibilityEnhancements {
    constructor() {
        this.keyboardNavIndex = 0;
        this.focusableElements = [];
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReader();
        this.setupHighContrast();
        this.setupFocusManagement();
    }

    // 键盘导航
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.updateFocusableElements();
            }
            
            if (e.altKey) {
                switch(e.key) {
                    case '1': this.switchTab('classes'); break;
                    case '2': this.switchTab('flowers'); break;
                    case '3': this.switchTab('gardens'); break;
                    case '4': this.switchTab('rankings'); break;
                }
            }
        });

        // 跳转链接
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = '跳转到主内容';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    updateFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
    }

    // 屏幕阅读器支持
    setupScreenReader() {
        // 添加ARIA标签
        document.querySelectorAll('.card').forEach((card, index) => {
            card.setAttribute('role', 'article');
            card.setAttribute('aria-label', `项目 ${index + 1}`);
        });

        // 实时区域
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => liveRegion.textContent = '', 1000);
        }
    }

    // 高对比度主题
    setupHighContrast() {
        const contrastBtn = document.createElement('button');
        contrastBtn.className = 'contrast-toggle';
        contrastBtn.innerHTML = '<i class="fas fa-adjust"></i>';
        contrastBtn.title = '切换高对比度';
        contrastBtn.onclick = () => this.toggleHighContrast();
        
        document.querySelector('.nav-user').insertBefore(contrastBtn, document.getElementById('themeToggle'));
    }

    toggleHighContrast() {
        const isHighContrast = document.documentElement.getAttribute('data-theme') === 'high-contrast';
        document.documentElement.setAttribute('data-theme', isHighContrast ? '' : 'high-contrast');
        localStorage.setItem('highContrast', !isHighContrast);
    }

    // 焦点管理
    setupFocusManagement() {
        // 模态框焦点陷阱
        document.addEventListener('keydown', (e) => {
            const modal = document.querySelector('.modal:not([style*="display: none"])');
            if (modal && e.key === 'Tab') {
                this.trapFocus(e, modal);
            }
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    switchTab(tabName) {
        if (window.app) {
            app.switchTab(tabName);
            this.announceToScreenReader(`已切换到${tabName}标签页`);
        }
    }
}

// 初始化
const accessibilityEnhancements = new AccessibilityEnhancements();