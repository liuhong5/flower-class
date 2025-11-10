// 数据分析增强
class AnalyticsEnhancements {
    constructor() {
        this.charts = {};
        this.analyticsData = {};
        this.init();
    }

    init() {
        this.setupGrowthTracking();
        this.setupHeatmap();
        this.setupCustomReports();
        this.setupPredictiveAnalytics();
    }

    // 学生成长轨迹分析
    setupGrowthTracking() {
        this.growthTracker = {
            trackStudent: (studentId, score, timestamp = Date.now()) => {
                const key = `growth_${studentId}`;
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                data.push({ score, timestamp, date: new Date().toISOString().split('T')[0] });
                localStorage.setItem(key, JSON.stringify(data));
            },

            getGrowthData: (studentId, days = 30) => {
                const key = `growth_${studentId}`;
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
                return data.filter(item => item.timestamp > cutoff);
            },

            generateGrowthChart: (studentId, containerId) => {
                const data = this.getGrowthData(studentId);
                const ctx = document.getElementById(containerId);
                
                if (this.charts[containerId]) {
                    this.charts[containerId].destroy();
                }

                this.charts[containerId] = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.map(d => d.date),
                        datasets: [{
                            label: '成长轨迹',
                            data: data.map(d => d.score),
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: { display: true, text: '学生成长轨迹' }
                        }
                    }
                });
            }
        };
    }

    // 班级活跃度热力图
    setupHeatmap() {
        this.heatmapGenerator = {
            generateClassHeatmap: (classId, containerId) => {
                const activities = this.getClassActivities(classId);
                const heatmapData = this.processHeatmapData(activities);
                this.renderHeatmap(containerId, heatmapData);
            },

            processHeatmapData: (activities) => {
                const heatmap = {};
                const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                const hours = Array.from({length: 24}, (_, i) => i);

                days.forEach(day => {
                    heatmap[day] = {};
                    hours.forEach(hour => {
                        heatmap[day][hour] = 0;
                    });
                });

                activities.forEach(activity => {
                    const date = new Date(activity.timestamp);
                    const day = days[date.getDay()];
                    const hour = date.getHours();
                    if (heatmap[day] && heatmap[day][hour] !== undefined) {
                        heatmap[day][hour]++;
                    }
                });

                return heatmap;
            },

            renderHeatmap: (containerId, data) => {
                const container = document.getElementById(containerId);
                container.innerHTML = '<div class="heatmap-grid"></div>';
                
                const grid = container.querySelector('.heatmap-grid');
                Object.entries(data).forEach(([day, hours]) => {
                    const dayRow = document.createElement('div');
                    dayRow.className = 'heatmap-row';
                    dayRow.innerHTML = `<span class="day-label">${day}</span>`;
                    
                    Object.entries(hours).forEach(([hour, count]) => {
                        const cell = document.createElement('div');
                        cell.className = 'heatmap-cell';
                        cell.style.backgroundColor = this.getHeatmapColor(count);
                        cell.title = `${day} ${hour}:00 - ${count}次活动`;
                        dayRow.appendChild(cell);
                    });
                    
                    grid.appendChild(dayRow);
                });
            },

            getHeatmapColor: (count) => {
                const intensity = Math.min(count / 10, 1);
                return `rgba(76, 175, 80, ${intensity})`;
            }
        };
    }

    // 自定义报表生成
    setupCustomReports() {
        this.reportGenerator = {
            generateReport: (type, filters = {}) => {
                switch(type) {
                    case 'weekly': return this.generateWeeklyReport(filters);
                    case 'monthly': return this.generateMonthlyReport(filters);
                    case 'student': return this.generateStudentReport(filters);
                    case 'class': return this.generateClassReport(filters);
                    default: return null;
                }
            },

            generateWeeklyReport: (filters) => {
                const data = this.getWeeklyData(filters);
                return {
                    title: '周报告',
                    summary: {
                        totalActivities: data.activities.length,
                        averageScore: data.averageScore,
                        topPerformers: data.topPerformers
                    },
                    charts: [
                        { type: 'bar', data: data.dailyStats },
                        { type: 'pie', data: data.activityTypes }
                    ]
                };
            },

            exportReport: (report, format = 'pdf') => {
                if (format === 'excel') {
                    this.exportToExcel(report);
                } else {
                    this.exportToPDF(report);
                }
            },

            exportToExcel: (report) => {
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(report.data);
                XLSX.utils.book_append_sheet(wb, ws, report.title);
                XLSX.writeFile(wb, `${report.title}_${new Date().toISOString().split('T')[0]}.xlsx`);
            }
        };
    }

    // 预测分析
    setupPredictiveAnalytics() {
        this.predictor = {
            predictStudentPerformance: (studentId, days = 7) => {
                const history = this.growthTracker.getGrowthData(studentId, 30);
                if (history.length < 3) return null;

                const trend = this.calculateTrend(history);
                const prediction = this.extrapolateTrend(trend, days);
                
                return {
                    predictedScore: prediction.score,
                    confidence: prediction.confidence,
                    trend: trend.direction,
                    recommendations: this.generateRecommendations(trend)
                };
            },

            calculateTrend: (data) => {
                const n = data.length;
                const sumX = data.reduce((sum, _, i) => sum + i, 0);
                const sumY = data.reduce((sum, item) => sum + item.score, 0);
                const sumXY = data.reduce((sum, item, i) => sum + (i * item.score), 0);
                const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0);

                const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                const intercept = (sumY - slope * sumX) / n;

                return {
                    slope,
                    intercept,
                    direction: slope > 0 ? 'up' : slope < 0 ? 'down' : 'stable'
                };
            },

            extrapolateTrend: (trend, days) => {
                const futureX = days;
                const predictedScore = trend.slope * futureX + trend.intercept;
                const confidence = Math.max(0.1, Math.min(0.9, 1 - Math.abs(trend.slope) * 0.1));

                return { score: Math.round(predictedScore), confidence };
            },

            generateRecommendations: (trend) => {
                const recommendations = [];
                
                if (trend.direction === 'down') {
                    recommendations.push('建议增加练习频率');
                    recommendations.push('关注学习方法调整');
                } else if (trend.direction === 'up') {
                    recommendations.push('保持当前学习节奏');
                    recommendations.push('可以尝试更有挑战性的任务');
                } else {
                    recommendations.push('尝试新的学习策略');
                    recommendations.push('增加学习动力');
                }

                return recommendations;
            }
        };
    }

    // 获取班级活动数据
    getClassActivities(classId) {
        const activities = JSON.parse(localStorage.getItem(`activities_${classId}`) || '[]');
        return activities;
    }

    // 获取周数据
    getWeeklyData(filters) {
        // 模拟数据，实际应从API获取
        return {
            activities: [],
            averageScore: 85,
            topPerformers: ['张三', '李四', '王五'],
            dailyStats: [10, 15, 12, 18, 20, 8, 5],
            activityTypes: { watering: 60, scoring: 30, other: 10 }
        };
    }

    // 显示分析面板
    showAnalyticsPanel() {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <h3>数据分析面板</h3>
            <div class="analytics-tabs">
                <button onclick="analyticsEnhancements.showGrowthAnalysis()" class="tab-btn active">成长分析</button>
                <button onclick="analyticsEnhancements.showHeatmapAnalysis()" class="tab-btn">活跃度分析</button>
                <button onclick="analyticsEnhancements.showPredictiveAnalysis()" class="tab-btn">预测分析</button>
                <button onclick="analyticsEnhancements.showCustomReports()" class="tab-btn">自定义报表</button>
            </div>
            <div id="analyticsContent" class="analytics-content">
                <canvas id="growthChart" width="400" height="200"></canvas>
            </div>
        `;
        
        modal.style.display = 'block';
        this.showGrowthAnalysis();
    }

    showGrowthAnalysis() {
        const content = document.getElementById('analyticsContent');
        content.innerHTML = `
            <div class="growth-analysis">
                <h4>学生成长轨迹分析</h4>
                <select id="studentSelect" onchange="analyticsEnhancements.updateGrowthChart()">
                    <option value="">选择学生</option>
                </select>
                <canvas id="growthChart" width="400" height="200"></canvas>
                <div id="growthInsights" class="insights"></div>
            </div>
        `;
    }

    showHeatmapAnalysis() {
        const content = document.getElementById('analyticsContent');
        content.innerHTML = `
            <div class="heatmap-analysis">
                <h4>班级活跃度热力图</h4>
                <select id="classHeatmapSelect" onchange="analyticsEnhancements.updateHeatmap()">
                    <option value="">选择班级</option>
                </select>
                <div id="heatmapContainer" class="heatmap-container"></div>
            </div>
        `;
    }

    showPredictiveAnalysis() {
        const content = document.getElementById('analyticsContent');
        content.innerHTML = `
            <div class="predictive-analysis">
                <h4>预测分析</h4>
                <div class="prediction-controls">
                    <select id="predictionStudent">
                        <option value="">选择学生</option>
                    </select>
                    <button onclick="analyticsEnhancements.generatePrediction()">生成预测</button>
                </div>
                <div id="predictionResults" class="prediction-results"></div>
            </div>
        `;
    }

    showCustomReports() {
        const content = document.getElementById('analyticsContent');
        content.innerHTML = `
            <div class="custom-reports">
                <h4>自定义报表</h4>
                <div class="report-builder">
                    <select id="reportType">
                        <option value="weekly">周报告</option>
                        <option value="monthly">月报告</option>
                        <option value="student">学生报告</option>
                        <option value="class">班级报告</option>
                    </select>
                    <button onclick="analyticsEnhancements.generateCustomReport()">生成报表</button>
                    <button onclick="analyticsEnhancements.exportReport()">导出报表</button>
                </div>
                <div id="reportContent" class="report-content"></div>
            </div>
        `;
    }
}

// 初始化
const analyticsEnhancements = new AnalyticsEnhancements();