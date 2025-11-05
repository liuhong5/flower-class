// 扩展成就系统 - 花朵和花田成就
class AchievementSystem {
    constructor(app) {
        this.app = app;
        this.achievements = {
            flower: this.getFlowerAchievements(),
            garden: this.getGardenAchievements(),
            class: this.getClassAchievements()
        };
    }

    // 花朵成就定义
    getFlowerAchievements() {
        return [
            // 基础成就
            { type: 'basic', icon: '🌱', name: '初露锋芒', desc: '获得第一分', condition: (f) => f.score >= 1 },
            { type: 'basic', icon: '🌿', name: '小苗成长', desc: '达到3分', condition: (f) => f.score >= 3 },
            { type: 'basic', icon: '🌱', name: '茁壮成长', desc: '达到5分', condition: (f) => f.score >= 5 },
            
            // 成长成就
            { type: 'growth', icon: '🌻', name: '向阳花开', desc: '达到8分', condition: (f) => f.score >= 8 },
            { type: 'growth', icon: '🌼', name: '含苞待放', desc: '达到12分', condition: (f) => f.score >= 12 },
            { type: 'growth', icon: '🌸', name: '花开绽放', desc: '达到15分', condition: (f) => f.score >= 15 },
            
            // 绽放成就
            { type: 'bloom', icon: '🌺', name: '美丽盛开', desc: '达到20分', condition: (f) => f.score >= 20 },
            { type: 'bloom', icon: '🌹', name: '花中之王', desc: '达到25分', condition: (f) => f.score >= 25 },
            { type: 'bloom', icon: '💐', name: '花束之美', desc: '达到30分', condition: (f) => f.score >= 30 },
            
            // 特殊成就
            { type: 'special', icon: '⚡', name: '快速成长', desc: '短时间内获得10分', condition: (f) => f.score >= 10 },
            { type: 'special', icon: '📈', name: '稳步前进', desc: '保持稳定增长', condition: (f) => f.score >= 8 && f.score < 15 },
            { type: 'special', icon: '🎯', name: '精准提升', desc: '连续获得分数', condition: (f) => f.score >= 6 },
            
            // 卓越成就
            { type: 'excellence', icon: '⭐', name: '优秀表现', desc: '达到18分以上', condition: (f) => f.score >= 18 },
            { type: 'excellence', icon: '🏆', name: '杰出成就', desc: '达到22分以上', condition: (f) => f.score >= 22 },
            { type: 'excellence', icon: '👑', name: '王者风范', desc: '达到28分以上', condition: (f) => f.score >= 28 },
            
            // 里程碑成就
            { type: 'milestone', icon: '🥉', name: '铜牌里程碑', desc: '达到10分里程碑', condition: (f) => f.score >= 10 },
            { type: 'milestone', icon: '🥈', name: '银牌里程碑', desc: '达到20分里程碑', condition: (f) => f.score >= 20 },
            { type: 'milestone', icon: '🥇', name: '金牌里程碑', desc: '达到30分里程碑', condition: (f) => f.score >= 30 },
            
            // 大师成就
            { type: 'master', icon: '🎖️', name: '花朵大师', desc: '达到35分', condition: (f) => f.score >= 35 },
            { type: 'master', icon: '🏅', name: '成长导师', desc: '达到40分', condition: (f) => f.score >= 40 },
            
            // 传奇成就
            { type: 'legendary', icon: '💎', name: '完美表现', desc: '达到45分', condition: (f) => f.score >= 45 },
            { type: 'legendary', icon: '🌟', name: '传奇花朵', desc: '达到50分', condition: (f) => f.score >= 50 }
        ];
    }

    // 花田成就定义
    getGardenAchievements() {
        return [
            // 基础成就
            { type: 'basic', icon: '🌱', name: '花田初建', desc: '获得第一分', condition: (g) => g.score >= 1 },
            { type: 'basic', icon: '🌿', name: '小有规模', desc: '达到5分', condition: (g) => g.score >= 5 },
            { type: 'basic', icon: '🍀', name: '欣欣向荣', desc: '达到10分', condition: (g) => g.score >= 10 },
            
            // 成长成就
            { type: 'growth', icon: '🌳', name: '蒸蒸日上', desc: '达到20分', condition: (g) => g.score >= 20 },
            { type: 'growth', icon: '🌲', name: '茂盛发展', desc: '达到35分', condition: (g) => g.score >= 35 },
            { type: 'growth', icon: '🎋', name: '枝繁叶茂', desc: '达到50分', condition: (g) => g.score >= 50 },
            
            // 绽放成就
            { type: 'bloom', icon: '🌺', name: '繁花似锦', desc: '达到70分', condition: (g) => g.score >= 70 },
            { type: 'bloom', icon: '🌸', name: '花海盛景', desc: '达到90分', condition: (g) => g.score >= 90 },
            { type: 'bloom', icon: '🌼', name: '百花齐放', desc: '达到110分', condition: (g) => g.score >= 110 },
            
            // 特殊成就
            { type: 'special', icon: '⚖️', name: '均衡发展', desc: '分数在合理范围', condition: (g) => g.score >= 30 && g.score <= 80 },
            { type: 'special', icon: '🎯', name: '目标达成', desc: '稳定增长', condition: (g) => g.score >= 40 },
            { type: 'special', icon: '📊', name: '数据之星', desc: '分数增长稳定', condition: (g) => g.score >= 25 },
            
            // 卓越成就
            { type: 'excellence', icon: '⭐', name: '卓越花田', desc: '达到100分以上', condition: (g) => g.score >= 100 },
            { type: 'excellence', icon: '🏆', name: '顶级花园', desc: '达到130分以上', condition: (g) => g.score >= 130 },
            { type: 'excellence', icon: '👑', name: '花田之王', desc: '达到160分以上', condition: (g) => g.score >= 160 },
            
            // 里程碑成就
            { type: 'milestone', icon: '🥉', name: '花田铜奖', desc: '达到50分里程碑', condition: (g) => g.score >= 50 },
            { type: 'milestone', icon: '🥈', name: '花田银奖', desc: '达到100分里程碑', condition: (g) => g.score >= 100 },
            { type: 'milestone', icon: '🥇', name: '花田金奖', desc: '达到150分里程碑', condition: (g) => g.score >= 150 },
            
            // 大师成就
            { type: 'master', icon: '🎖️', name: '花园大师', desc: '达到180分', condition: (g) => g.score >= 180 },
            { type: 'master', icon: '🏅', name: '园艺专家', desc: '达到200分', condition: (g) => g.score >= 200 },
            
            // 传奇成就
            { type: 'legendary', icon: '💎', name: '花园天堂', desc: '达到250分', condition: (g) => g.score >= 250 },
            { type: 'legendary', icon: '🌟', name: '传奇花园', desc: '达到300分', condition: (g) => g.score >= 300 }
        ];
    }

    // 班级成就定义
    getClassAchievements() {
        return [
            // 参与度成就
            { type: 'participation', icon: '🎯', name: '活跃班级', desc: '花朵数量达到10个', condition: (stats) => stats.totalFlowers >= 10 },
            { type: 'participation', icon: '🏫', name: '热闹班级', desc: '花朵数量达到15个', condition: (stats) => stats.totalFlowers >= 15 },
            { type: 'participation', icon: '🎪', name: '超级活跃', desc: '花朵数量达到20个', condition: (stats) => stats.totalFlowers >= 20 },
            
            // 生产力成就
            { type: 'productivity', icon: '🏭', name: '高产班级', desc: '花田数量达到5个', condition: (stats) => stats.totalGardens >= 5 },
            { type: 'productivity', icon: '🏗️', name: '建设能手', desc: '花田数量达到8个', condition: (stats) => stats.totalGardens >= 8 },
            { type: 'productivity', icon: '🏛️', name: '建设大师', desc: '花田数量达到12个', condition: (stats) => stats.totalGardens >= 12 },
            
            // 质量成就
            { type: 'quality', icon: '🏆', name: '优秀班级', desc: '平均分达到15分', condition: (stats) => stats.avgScore >= 15 },
            { type: 'quality', icon: '👑', name: '杰出班级', desc: '平均分达到20分', condition: (stats) => stats.avgScore >= 20 },
            { type: 'quality', icon: '💎', name: '完美班级', desc: '平均分达到25分', condition: (stats) => stats.avgScore >= 25 },
            
            // 高分成就
            { type: 'highscore', icon: '⭐', name: '高分集中', desc: '高分项目达到5个', condition: (stats) => stats.highScoreCount >= 5 },
            { type: 'highscore', icon: '🌟', name: '精英荟萃', desc: '高分项目达到8个', condition: (stats) => stats.highScoreCount >= 8 },
            { type: 'highscore', icon: '✨', name: '群星璀璨', desc: '高分项目达到12个', condition: (stats) => stats.highScoreCount >= 12 },
            
            // 总分成就
            { type: 'totalscore', icon: '🥉', name: '铜级班级', desc: '总分达到300分', condition: (stats) => stats.totalScore >= 300 },
            { type: 'totalscore', icon: '🥈', name: '银级班级', desc: '总分达到500分', condition: (stats) => stats.totalScore >= 500 },
            { type: 'totalscore', icon: '🥇', name: '金级班级', desc: '总分达到800分', condition: (stats) => stats.totalScore >= 800 },
            
            // 平衡发展成就
            { type: 'balance', icon: '⚖️', name: '均衡发展', desc: '花朵和花田数量均衡', condition: (stats) => stats.totalFlowers >= 8 && stats.totalGardens >= 4 },
            { type: 'balance', icon: '🎭', name: '和谐班级', desc: '各项指标均衡', condition: (stats) => stats.totalFlowers >= 12 && stats.totalGardens >= 6 && stats.avgScore >= 15 },
            
            // 传奇成就
            { type: 'legendary', icon: '🏆', name: '传奇班级', desc: '总分达到1000分', condition: (stats) => stats.totalScore >= 1000 },
            { type: 'legendary', icon: '👑', name: '王者班级', desc: '总分达到1500分', condition: (stats) => stats.totalScore >= 1500 },
            { type: 'legendary', icon: '💎', name: '钻石班级', desc: '总分达到2000分', condition: (stats) => stats.totalScore >= 2000 }
        ];
    }

    // 检查花朵成就
    checkFlowerAchievements(flower) {
        const flowerAchievements = this.achievements.flower;
        flowerAchievements.forEach(achievement => {
            if (achievement.condition(flower)) {
                this.unlockAchievement('flower', flower.id, achievement, flower);
            }
        });
    }

    // 检查花田成就
    checkGardenAchievements(garden) {
        const gardenAchievements = this.achievements.garden;
        gardenAchievements.forEach(achievement => {
            if (achievement.condition(garden)) {
                this.unlockAchievement('garden', garden.id, achievement, garden);
            }
        });
    }

    // 检查班级成就
    checkClassAchievements(classId, stats) {
        const classAchievements = this.achievements.class;
        classAchievements.forEach(achievement => {
            if (achievement.condition(stats)) {
                this.unlockAchievement('class', classId, achievement, stats);
            }
        });
    }

    // 解锁成就
    unlockAchievement(type, id, achievement, data) {
        const achievementId = `${type}_${id}_${achievement.type}_${achievement.name}`;
        const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        
        if (unlockedAchievements.includes(achievementId)) return;
        
        unlockedAchievements.push(achievementId);
        localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
        
        this.showAchievementNotification(type, achievement, data);
    }

    // 显示成就通知
    showAchievementNotification(type, achievement, data) {
        const notification = document.createElement('div');
        notification.className = `achievement-notification ${type}-achievement ${achievement.type}`;
        
        let title, subtitle;
        switch(type) {
            case 'flower':
                title = '🌸 花朵成就解锁！';
                subtitle = `${data.name} - ${data.score}分`;
                break;
            case 'garden':
                title = '🌿 花田成就解锁！';
                subtitle = `${data.name} - ${data.score}分`;
                break;
            case 'class':
                title = '🏆 班级成就解锁！';
                subtitle = '班级荣誉';
                break;
        }
        
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">${title}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
                <div class="achievement-subtitle">${subtitle}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // 获取成就列表HTML
    getAchievementsList(type, id, currentData) {
        const achievements = this.achievements[type];
        const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        
        const groupedAchievements = {};
        achievements.forEach(achievement => {
            if (!groupedAchievements[achievement.type]) {
                groupedAchievements[achievement.type] = [];
            }
            groupedAchievements[achievement.type].push(achievement);
        });
        
        const typeNames = {
            'basic': '🌱 基础成就',
            'growth': '🌿 成长成就',
            'bloom': '🌸 绽放成就',
            'special': '⭐ 特殊成就',
            'excellence': '🏆 卓越成就',
            'milestone': '🏅 里程碑成就',
            'master': '👑 大师成就',
            'legendary': '💎 传奇成就',
            'participation': '🎯 参与度成就',
            'productivity': '🏭 生产力成就',
            'quality': '🏆 质量成就',
            'highscore': '⭐ 高分成就',
            'totalscore': '🥇 总分成就',
            'balance': '⚖️ 平衡成就'
        };
        
        let html = '';
        Object.keys(groupedAchievements).forEach(achievementType => {
            const typeAchievements = groupedAchievements[achievementType];
            if (typeAchievements.length > 0) {
                html += `<div class="achievement-group">
                    <h4 class="achievement-group-title">${typeNames[achievementType] || achievementType}</h4>
                    <div class="achievement-group-items">`;
                
                typeAchievements.forEach(achievement => {
                    const achievementId = `${type}_${id}_${achievement.type}_${achievement.name}`;
                    const unlocked = achievement.condition(currentData);
                    const isUnlocked = unlockedAchievements.includes(achievementId);
                    
                    html += `<div class="achievement-item ${unlocked ? 'unlocked' : 'locked'} ${achievement.type}">
                        <div class="achievement-icon-small">${unlocked ? achievement.icon : '🔒'}</div>
                        <div class="achievement-details">
                            <div class="achievement-name-small">${achievement.name}</div>
                            <div class="achievement-desc-small">${achievement.desc}</div>
                            <div class="achievement-status">${unlocked ? '✅ 已解锁' : '🔒 未解锁'}</div>
                        </div>
                    </div>`;
                });
                
                html += `</div></div>`;
            }
        });
        
        return html;
    }
}

// 导出成就系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
} else {
    window.AchievementSystem = AchievementSystem;
}