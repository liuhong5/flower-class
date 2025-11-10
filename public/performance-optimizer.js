// 性能优化模块
class PerformanceOptimizer {
    constructor() {
        this.requestCache = new Map();
        this.debounceTimers = new Map();
        this.retryAttempts = new Map();
        this.init();
    }

    init() {
        this.setupRequestInterceptor();
        this.setupLazyLoading();
        this.setupVirtualScrolling();
    }

    // 请求防抖
    debounce(key, fn, delay = 300) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            fn();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
    }

    // 请求节流
    throttle(key, fn, limit = 1000) {
        if (this.requestCache.has(key)) {
            const lastCall = this.requestCache.get(key);
            if (Date.now() - lastCall < limit) {
                return Promise.resolve(null);
            }
        }
        
        this.requestCache.set(key, Date.now());
        return fn();
    }

    // 请求重试机制
    async retryRequest(url, options, maxRetries = 3) {
        const key = `${url}_${JSON.stringify(options)}`;
        let attempts = this.retryAttempts.get(key) || 0;

        try {
            const response = await fetch(url, options);
            if (response.ok) {
                this.retryAttempts.delete(key);
                return response;
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            attempts++;
            this.retryAttempts.set(key, attempts);
            
            if (attempts < maxRetries) {
                const delay = Math.pow(2, attempts) * 1000; // 指数退避
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.retryRequest(url, options, maxRetries);
            }
            throw error;
        }
    }

    // 请求拦截器
    setupRequestInterceptor() {
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            // 添加请求头
            options.headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            // 超时控制
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            options.signal = controller.signal;

            try {
                const response = await this.retryRequest(url, options);
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        };
    }

    // 懒加载设置
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.classList.remove('lazy');
                            observer.unobserve(element);
                        }
                    }
                });
            });

            document.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('[data-src]').forEach(img => {
                    observer.observe(img);
                });
            });
        }
    }

    // 虚拟滚动优化
    setupVirtualScrolling() {
        this.virtualScrollConfig = {
            itemHeight: 200,
            containerHeight: 600,
            buffer: 5
        };
    }

    // 代码分割和懒加载
    async loadModule(moduleName) {
        try {
            switch (moduleName) {
                case 'charts':
                    return await import('https://cdn.jsdelivr.net/npm/chart.js');
                case 'xlsx':
                    return await import('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
                default:
                    throw new Error(`Unknown module: ${moduleName}`);
            }
        } catch (error) {
            console.error(`Failed to load module ${moduleName}:`, error);
            throw error;
        }
    }

    // 性能监控
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        
        if (duration > 100) {
            console.warn(`Slow operation: ${name} - ${duration.toFixed(2)}ms`);
        }
        
        return result;
    }

    // 内存优化
    cleanup() {
        this.requestCache.clear();
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        this.retryAttempts.clear();
    }
}

// 数据分析模块
class DataAnalytics {
    constructor(app) {
        this.app = app;
        this.analytics = {
            userGrowth: [],
            classActivity: new Map(),
            performanceMetrics: []
        };
    }

    // 学生成长轨迹分析
    async analyzeStudentGrowth(studentId) {
        try {
            const response = await fetch(`/api/analytics/student-growth/${studentId}`);
            const data = await response.json();
            
            return {
                growthRate: this.calculateGrowthRate(data.scores),
                milestones: this.identifyMilestones(data.scores),
                predictions: this.predictFuturePerformance(data.scores),
                recommendations: this.generateRecommendations(data)
            };
        } catch (error) {
            console.error('Growth analysis failed:', error);
            return null;
        }
    }

    // 班级活跃度热力图
    generateActivityHeatmap(classId) {
        const activities = this.analytics.classActivity.get(classId) || [];
        const heatmapData = [];
        
        // 按小时和星期分组
        for (let hour = 0; hour < 24; hour++) {
            for (let day = 0; day < 7; day++) {
                const count = activities.filter(activity => {
                    const date = new Date(activity.timestamp);
                    return date.getHours() === hour && date.getDay() === day;
                }).length;
                
                heatmapData.push({
                    hour,
                    day,
                    count,
                    intensity: Math.min(count / 10, 1) // 标准化强度
                });
            }
        }
        
        return heatmapData;
    }

    // 自定义报表生成
    async generateCustomReport(config) {
        const { type, dateRange, filters, metrics } = config;
        
        try {
            const response = await fetch('/api/analytics/custom-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            
            const data = await response.json();
            
            return {
                summary: this.generateSummary(data, metrics),
                charts: this.generateCharts(data, type),
                insights: this.generateInsights(data),
                exportUrl: this.generateExportUrl(data)
            };
        } catch (error) {
            console.error('Report generation failed:', error);
            return null;
        }
    }

    // 计算成长率
    calculateGrowthRate(scores) {
        if (scores.length < 2) return 0;
        
        const recent = scores.slice(-5);
        const earlier = scores.slice(0, 5);
        
        const recentAvg = recent.reduce((sum, s) => sum + s.value, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, s) => sum + s.value, 0) / earlier.length;
        
        return ((recentAvg - earlierAvg) / earlierAvg * 100).toFixed(2);
    }

    // 识别里程碑
    identifyMilestones(scores) {
        const milestones = [];
        const thresholds = [5, 10, 15, 20, 25];
        
        thresholds.forEach(threshold => {
            const milestone = scores.find(score => score.value >= threshold);
            if (milestone) {
                milestones.push({
                    threshold,
                    date: milestone.date,
                    achievement: `达到${threshold}分`
                });
            }
        });
        
        return milestones;
    }

    // 预测未来表现
    predictFuturePerformance(scores) {
        if (scores.length < 3) return null;
        
        // 简单线性回归预测
        const n = scores.length;
        const sumX = scores.reduce((sum, _, i) => sum + i, 0);
        const sumY = scores.reduce((sum, s) => sum + s.value, 0);
        const sumXY = scores.reduce((sum, s, i) => sum + i * s.value, 0);
        const sumXX = scores.reduce((sum, _, i) => sum + i * i, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // 预测未来7天
        const predictions = [];
        for (let i = 1; i <= 7; i++) {
            const futureIndex = n + i;
            const predictedValue = slope * futureIndex + intercept;
            predictions.push({
                day: i,
                predicted: Math.max(0, Math.round(predictedValue))
            });
        }
        
        return predictions;
    }

    // 生成建议
    generateRecommendations(data) {
        const recommendations = [];
        
        if (data.scores.length > 0) {
            const latestScore = data.scores[data.scores.length - 1].value;
            const avgScore = data.scores.reduce((sum, s) => sum + s.value, 0) / data.scores.length;
            
            if (latestScore < avgScore * 0.8) {
                recommendations.push({
                    type: 'warning',
                    message: '最近表现有所下降，建议增加练习频率'
                });
            } else if (latestScore > avgScore * 1.2) {
                recommendations.push({
                    type: 'success',
                    message: '表现优秀！继续保持当前学习节奏'
                });
            }
        }
        
        return recommendations;
    }
}

// 导出模块
window.PerformanceOptimizer = PerformanceOptimizer;
window.DataAnalytics = DataAnalytics;