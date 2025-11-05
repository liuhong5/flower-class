// 云端花园管理系统 - 功能增强模块
class GardenEnhancements {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.initVirtualScroll();
        this.initOfflineSupport();
        this.initInputValidation();
        this.initRealTimeStats();
        this.initPredictiveAnalysis();
        this.initAdaptiveLayout();
        this.initMicroInteractions();
        this.initModularArchitecture();
        this.initErrorHandling();
        this.initSocialFeatures();
        this.initAIAssistant();
    }

    // 3. 虚拟滚动优化
    initVirtualScroll() {
        this.virtualScrollConfig = {
            itemHeight: window.innerWidth <= 768 ? 180 : 220,
            buffer: window.innerWidth <= 768 ? 3 : 5,
            threshold: 30
        };

        this.renderVirtualList = (container, items, createItemFn) => {
            if (items.length < this.virtualScrollConfig.threshold) {
                return this.renderNormalList(container, items, createItemFn);
            }

            const { itemHeight, buffer } = this.virtualScrollConfig;
            const containerHeight = container.clientHeight || 600;
            const visibleCount = Math.ceil(containerHeight / itemHeight);
            
            container.style.height = `${containerHeight}px`;
            container.style.overflow = 'auto';
            
            let startIndex = 0;
            const renderVisible = () => {
                const scrollTop = container.scrollTop;
                startIndex = Math.floor(scrollTop / itemHeight);
                const endIndex = Math.min(startIndex + visibleCount + buffer, items.length);
                
                const fragment = document.createDocumentFragment();
                for (let i = startIndex; i < endIndex; i++) {
                    if (items[i]) {
                        const element = createItemFn(items[i]);
                        element.style.position = 'absolute';
                        element.style.top = `${i * itemHeight}px`;
                        element.style.width = '100%';
                        fragment.appendChild(element);
                    }
                }
                
                container.innerHTML = '';
                container.appendChild(fragment);
            };

            container.addEventListener('scroll', () => {
                requestAnimationFrame(renderVisible);
            });
            
            renderVisible();
        };
    }

    // 5. 离线功能完善
    initOfflineSupport() {
        this.offlineQueue = [];
        this.maxOfflineActions = 50;

        // 检测网络状态
        this.updateNetworkStatus = () => {
            const isOnline = navigator.onLine;
            const statusBar = document.getElementById('networkStatus');
            
            if (isOnline) {
                statusBar.className = 'network-status online';
                statusBar.textContent = '网络已连接';
                this.syncOfflineData();
                setTimeout(() => statusBar.style.display = 'none', 2000);
            } else {
                statusBar.className = 'network-status offline';
                statusBar.textContent = '离线模式';
                statusBar.style.display = 'block';
            }
        };

        // 离线数据同步
        this.syncOfflineData = async () => {
            const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
            
            for (const action of queue) {
                try {
                    await fetch(action.url, action.options);
                } catch (error) {
                    console.error('同步失败:', error);
                }
            }
            
            localStorage.removeItem('offlineQueue');
        };

        // 添加离线操作到队列
        this.addOfflineAction = (url, options) => {
            if (this.offlineQueue.length >= this.maxOfflineActions) {
                this.offlineQueue.shift();
            }
            
            this.offlineQueue.push({ url, options, timestamp: Date.now() });
            localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
        };

        window.addEventListener('online', this.updateNetworkStatus);
        window.addEventListener('offline', this.updateNetworkStatus);
    }

    // 8. 输入验证加强
    initInputValidation() {
        this.validationRules = {
            flowerName: {
                pattern: /^[\u4e00-\u9fa5a-zA-Z\s]{1,20}$/,
                message: '花朵名称只能包含中文、英文和空格，长度1-20字符'
            },
            gardenName: {
                pattern: /^[\u4e00-\u9fa5a-zA-Z\s]{1,30}$/,
                message: '花田名称只能包含中文、英文和空格，长度1-30字符'
            },
            className: {
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s]{1,15}$/,
                message: '班级名称只能包含中文、英文、数字和空格，长度1-15字符'
            },
            score: {
                min: 1,
                max: 100,
                message: '分数必须在1-100之间'
            }
        };

        this.validateInput = (value, type) => {
            const rule = this.validationRules[type];
            if (!rule) return { valid: true };

            if (type === 'score') {
                const num = parseInt(value);
                if (isNaN(num) || num < rule.min || num > rule.max) {
                    return { valid: false, message: rule.message };
                }
            } else {
                if (!rule.pattern.test(value)) {
                    return { valid: false, message: rule.message };
                }
            }

            return { valid: true };
        };

        // 实时验证
        this.addRealTimeValidation = (input, type) => {
            input.addEventListener('input', (e) => {
                const result = this.validateInput(e.target.value, type);
                const errorElement = input.nextElementSibling;
                
                if (!result.valid) {
                    input.classList.add('invalid');
                    if (errorElement && errorElement.classList.contains('error-message')) {
                        errorElement.textContent = result.message;
                    } else {
                        const error = document.createElement('div');
                        error.className = 'error-message';
                        error.textContent = result.message;
                        input.parentNode.insertBefore(error, input.nextSibling);
                    }
                } else {
                    input.classList.remove('invalid');
                    if (errorElement && errorElement.classList.contains('error-message')) {
                        errorElement.remove();
                    }
                }
            });
        };
    }

    // 10. 实时统计增强
    initRealTimeStats() {
        this.statsConfig = {
            updateInterval: 30000,
            metrics: ['growth_rate', 'participation', 'consistency'],
            timeRanges: ['today', 'week', 'month']
        };

        this.calculateAdvancedStats = (data) => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

            return {
                today: this.getStatsForPeriod(data, today, now),
                week: this.getStatsForPeriod(data, weekAgo, now),
                month: this.getStatsForPeriod(data, monthAgo, now),
                growthRate: this.calculateGrowthRate(data),
                participationRate: this.calculateParticipation(data),
                consistencyScore: this.calculateConsistency(data)
            };
        };

        this.getStatsForPeriod = (data, start, end) => {
            const filtered = data.filter(item => {
                const date = new Date(item.updated_at || item.created_at);
                return date >= start && date <= end;
            });

            return {
                count: filtered.length,
                totalScore: filtered.reduce((sum, item) => sum + item.score, 0),
                avgScore: filtered.length > 0 ? filtered.reduce((sum, item) => sum + item.score, 0) / filtered.length : 0
            };
        };

        this.calculateGrowthRate = (data) => {
            if (data.length < 2) return 0;
            const sorted = data.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
            const recent = sorted.slice(-7);
            const older = sorted.slice(-14, -7);
            
            const recentAvg = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
            const olderAvg = older.reduce((sum, item) => sum + item.score, 0) / older.length;
            
            return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1) : 0;
        };

        this.updateRealTimeStats = () => {
            if (this.app.allFlowers && this.app.allGardens) {
                const stats = this.calculateAdvancedStats([...this.app.allFlowers, ...this.app.allGardens]);
                this.displayAdvancedStats(stats);
            }
        };

        setInterval(this.updateRealTimeStats, this.statsConfig.updateInterval);
    }

    // 11. 预测分析
    initPredictiveAnalysis() {
        this.predictScoreTrend = (history) => {
            if (history.length < 3) return null;
            
            const points = history.map((item, index) => ({
                x: index,
                y: item.score
            }));

            // 简单线性回归
            const n = points.length;
            const sumX = points.reduce((sum, p) => sum + p.x, 0);
            const sumY = points.reduce((sum, p) => sum + p.y, 0);
            const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
            const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // 预测未来7天
            const predictions = [];
            for (let i = 1; i <= 7; i++) {
                const futureX = n + i;
                const predictedY = slope * futureX + intercept;
                predictions.push(Math.max(0, Math.round(predictedY)));
            }

            return {
                trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
                predictions,
                confidence: this.calculateConfidence(points, slope, intercept)
            };
        };

        this.calculateConfidence = (points, slope, intercept) => {
            const predictions = points.map(p => slope * p.x + intercept);
            const errors = points.map((p, i) => Math.abs(p.y - predictions[i]));
            const avgError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
            return Math.max(0, Math.min(100, 100 - avgError * 2));
        };

        this.predictAchievementProbability = (currentScore, targetScore) => {
            const difference = targetScore - currentScore;
            const difficulty = Math.min(difference / 10, 5);
            const baseProbability = Math.max(10, 90 - difficulty * 15);
            return Math.round(baseProbability);
        };
    }

    // 12. 自适应布局
    initAdaptiveLayout() {
        this.layoutConfig = {
            breakpoints: {
                mobile: 768,
                tablet: 1024,
                desktop: 1200
            },
            cardSizes: {
                mobile: { min: 280, max: 350 },
                tablet: { min: 300, max: 380 },
                desktop: { min: 320, max: 400 }
            }
        };

        this.updateAdaptiveLayout = () => {
            const width = window.innerWidth;
            const cardsGrid = document.querySelector('.cards-grid');
            
            if (!cardsGrid) return;

            let cardSize;
            if (width <= this.layoutConfig.breakpoints.mobile) {
                cardSize = this.layoutConfig.cardSizes.mobile;
            } else if (width <= this.layoutConfig.breakpoints.tablet) {
                cardSize = this.layoutConfig.cardSizes.tablet;
            } else {
                cardSize = this.layoutConfig.cardSizes.desktop;
            }

            const optimalSize = Math.min(cardSize.max, Math.max(cardSize.min, width * 0.3));
            cardsGrid.style.gridTemplateColumns = `repeat(auto-fit, minmax(${optimalSize}px, 1fr))`;
        };

        window.addEventListener('resize', this.updateAdaptiveLayout);
        this.updateAdaptiveLayout();
    }

    // 13. 微交互增强
    initMicroInteractions() {
        this.addHoverEffects = () => {
            document.addEventListener('mouseover', (e) => {
                if (e.target.closest('.card')) {
                    const card = e.target.closest('.card');
                    card.style.transform = 'translateY(-8px) scale(1.02)';
                    card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                }
            });

            document.addEventListener('mouseout', (e) => {
                if (e.target.closest('.card')) {
                    const card = e.target.closest('.card');
                    card.style.transform = 'translateY(0) scale(1)';
                }
            });
        };

        this.addClickFeedback = () => {
            document.addEventListener('click', (e) => {
                if (e.target.closest('button, .card')) {
                    const element = e.target.closest('button, .card');
                    element.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        element.style.transform = '';
                    }, 150);
                }
            });
        };

        this.addLoadingStates = () => {
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const loadingElements = document.querySelectorAll('.loading-trigger');
                loadingElements.forEach(el => el.classList.add('loading'));
                
                try {
                    const response = await originalFetch(...args);
                    return response;
                } finally {
                    loadingElements.forEach(el => el.classList.remove('loading'));
                }
            };
        };

        this.addHoverEffects();
        this.addClickFeedback();
        this.addLoadingStates();
    }

    // 14. 模块化重构
    initModularArchitecture() {
        this.modules = {
            auth: new AuthModule(this.app),
            data: new DataModule(this.app),
            ui: new UIModule(this.app),
            analytics: new AnalyticsModule(this.app)
        };

        // 模块间通信
        this.eventBus = {
            events: {},
            on(event, callback) {
                if (!this.events[event]) this.events[event] = [];
                this.events[event].push(callback);
            },
            emit(event, data) {
                if (this.events[event]) {
                    this.events[event].forEach(callback => callback(data));
                }
            }
        };
    }

    // 15. 错误处理完善
    initErrorHandling() {
        this.errorTypes = {
            NETWORK: 'network',
            VALIDATION: 'validation',
            PERMISSION: 'permission',
            UNKNOWN: 'unknown'
        };

        this.handleError = (error, type = this.errorTypes.UNKNOWN) => {
            const errorInfo = {
                type,
                message: error.message,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            // 记录错误日志
            this.logError(errorInfo);

            // 显示用户友好的错误信息
            switch (type) {
                case this.errorTypes.NETWORK:
                    this.showRetryDialog(error);
                    break;
                case this.errorTypes.VALIDATION:
                    this.highlightInvalidFields(error);
                    break;
                case this.errorTypes.PERMISSION:
                    this.showPermissionDialog(error);
                    break;
                default:
                    this.showGenericError(error);
            }
        };

        this.logError = (errorInfo) => {
            const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
            logs.push(errorInfo);
            if (logs.length > 100) logs.shift();
            localStorage.setItem('errorLogs', JSON.stringify(logs));
        };

        // 全局错误捕获
        window.addEventListener('error', (e) => {
            this.handleError(e.error, this.errorTypes.UNKNOWN);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleError(e.reason, this.errorTypes.NETWORK);
        });
    }

    // 19. 社交功能增强
    initSocialFeatures() {
        this.socialFeatures = {
            comments: new Map(),
            likes: new Map(),
            shares: new Map()
        };

        this.addComment = async (type, id, content) => {
            const comment = {
                id: Date.now(),
                author: this.app.username,
                content,
                timestamp: new Date().toISOString(),
                likes: 0
            };

            if (!this.socialFeatures.comments.has(`${type}_${id}`)) {
                this.socialFeatures.comments.set(`${type}_${id}`, []);
            }
            
            this.socialFeatures.comments.get(`${type}_${id}`).push(comment);
            this.saveToLocalStorage();
            
            return comment;
        };

        this.likeItem = (type, id) => {
            const key = `${type}_${id}`;
            const currentLikes = this.socialFeatures.likes.get(key) || 0;
            this.socialFeatures.likes.set(key, currentLikes + 1);
            this.saveToLocalStorage();
            
            return currentLikes + 1;
        };

        this.shareItem = (type, id, data) => {
            const shareData = {
                title: `云端花园 - ${data.name}`,
                text: `看看我的${type === 'flower' ? '花朵' : '花田'}成长情况！`,
                url: window.location.href
            };

            if (navigator.share) {
                navigator.share(shareData);
            } else {
                // 复制到剪贴板
                navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                this.app.showNotification('链接已复制到剪贴板');
            }
        };

        this.saveToLocalStorage = () => {
            localStorage.setItem('socialData', JSON.stringify({
                comments: Array.from(this.socialFeatures.comments.entries()),
                likes: Array.from(this.socialFeatures.likes.entries()),
                shares: Array.from(this.socialFeatures.shares.entries())
            }));
        };

        this.loadFromLocalStorage = () => {
            const data = JSON.parse(localStorage.getItem('socialData') || '{}');
            if (data.comments) this.socialFeatures.comments = new Map(data.comments);
            if (data.likes) this.socialFeatures.likes = new Map(data.likes);
            if (data.shares) this.socialFeatures.shares = new Map(data.shares);
        };

        this.loadFromLocalStorage();
    }

    // 18. AI助手集成
    initAIAssistant() {
        this.aiAssistant = {
            suggestions: new Map(),
            insights: new Map(),
            predictions: new Map()
        };

        this.generateSuggestions = (context) => {
            const suggestions = [];
            
            if (context.type === 'flower' && context.score < 10) {
                suggestions.push({
                    type: 'improvement',
                    title: '成长建议',
                    content: '建议多参与课堂互动，积极完成作业来获得更多分数',
                    priority: 'high'
                });
            }

            if (context.type === 'garden' && context.flowerCount < 5) {
                suggestions.push({
                    type: 'expansion',
                    title: '扩展建议',
                    content: '考虑添加更多花朵到花田中，增加团队协作',
                    priority: 'medium'
                });
            }

            return suggestions;
        };

        this.analyzePerformance = (data) => {
            const insights = [];
            const avgScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
            
            if (avgScore > 20) {
                insights.push({
                    type: 'positive',
                    title: '表现优异',
                    content: '整体表现超过平均水平，继续保持！'
                });
            } else if (avgScore < 10) {
                insights.push({
                    type: 'improvement',
                    title: '有待提升',
                    content: '建议制定学习计划，逐步提升表现'
                });
            }

            return insights;
        };

        this.predictTrends = (history) => {
            const trend = this.predictScoreTrend(history);
            if (!trend) return [];

            const predictions = [];
            if (trend.trend === 'increasing') {
                predictions.push({
                    type: 'positive',
                    title: '上升趋势',
                    content: `预测未来一周将继续上升，置信度${trend.confidence}%`
                });
            } else if (trend.trend === 'decreasing') {
                predictions.push({
                    type: 'warning',
                    title: '下降趋势',
                    content: '建议调整学习策略，扭转下降趋势'
                });
            }

            return predictions;
        };
    }
}

// 辅助模块类
class AuthModule {
    constructor(app) {
        this.app = app;
    }
}

class DataModule {
    constructor(app) {
        this.app = app;
        this.cache = new Map();
    }
}

class UIModule {
    constructor(app) {
        this.app = app;
    }
}

class AnalyticsModule {
    constructor(app) {
        this.app = app;
    }
}

// 导出增强模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GardenEnhancements;
} else {
    window.GardenEnhancements = GardenEnhancements;
}