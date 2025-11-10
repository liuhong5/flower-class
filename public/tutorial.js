// 新手教程系统
class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.steps = [
            {
                target: '.sidebar .menu-item[data-tab="classes"]',
                title: '班级管理',
                content: '这里可以创建和管理班级，点击进入班级管理页面',
                position: 'right'
            },
            {
                target: '#addClassBtn',
                title: '添加班级',
                content: '点击这个按钮可以添加新的班级',
                position: 'bottom'
            },
            {
                target: '.sidebar .menu-item[data-tab="flowers"]',
                title: '花朵管理',
                content: '在这里管理学生花朵，给花朵浇水加分',
                position: 'right'
            },
            {
                target: '#classSelect',
                title: '选择班级',
                content: '首先选择一个班级来查看该班级的花朵',
                position: 'bottom'
            },
            {
                target: '#addFlowerBtn',
                title: '添加花朵',
                content: '点击添加新的学生花朵',
                position: 'bottom'
            },
            {
                target: '.sidebar .menu-item[data-tab="gardens"]',
                title: '花田管理',
                content: '创建主题花田，将多个花朵组织在一起',
                position: 'right'
            },
            {
                target: '.sidebar .menu-item[data-tab="rankings"]',
                title: '排行榜',
                content: '查看花朵和花田的排名情况',
                position: 'right'
            }
        ];
    }

    // 检查是否为新用户
    checkNewUser() {
        const hasSeenTutorial = localStorage.getItem('tutorialCompleted');
        const isNewUser = !hasSeenTutorial;
        
        if (isNewUser) {
            setTimeout(() => this.showWelcomeDialog(), 1000);
        }
    }

    // 显示欢迎对话框
    showWelcomeDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'tutorial-welcome-dialog';
        dialog.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-header">
                    <i class="fas fa-seedling"></i>
                    <h2>欢迎来到云端花园！</h2>
                </div>
                <p>这是您第一次使用我们的系统，是否需要查看新手教程？</p>
                <div class="welcome-actions">
                    <button onclick="tutorialSystem.startTutorial()" class="tutorial-btn start">
                        <i class="fas fa-play"></i> 开始教程
                    </button>
                    <button onclick="tutorialSystem.skipTutorial()" class="tutorial-btn skip">
                        <i class="fas fa-times"></i> 跳过
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    // 开始教程
    startTutorial() {
        document.querySelector('.tutorial-welcome-dialog')?.remove();
        this.isActive = true;
        this.currentStep = 0;
        this.showStep();
        this.createTutorialOverlay();
    }

    // 跳过教程
    skipTutorial() {
        document.querySelector('.tutorial-welcome-dialog')?.remove();
        localStorage.setItem('tutorialCompleted', 'true');
    }

    // 创建教程遮罩
    createTutorialOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'tutorialOverlay';
        overlay.className = 'tutorial-overlay';
        document.body.appendChild(overlay);
    }

    // 显示当前步骤
    showStep() {
        if (this.currentStep >= this.steps.length) {
            this.completeTutorial();
            return;
        }

        const step = this.steps[this.currentStep];
        const target = document.querySelector(step.target);
        
        if (!target) {
            this.nextStep();
            return;
        }

        this.highlightElement(target);
        this.showTooltip(target, step);
    }

    // 高亮元素
    highlightElement(element) {
        document.querySelectorAll('.tutorial-highlight').forEach(el => 
            el.classList.remove('tutorial-highlight'));
        element.classList.add('tutorial-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 显示提示框
    showTooltip(target, step) {
        const existing = document.querySelector('.tutorial-tooltip');
        if (existing) existing.remove();

        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <h4>${step.title}</h4>
                <span class="step-counter">${this.currentStep + 1}/${this.steps.length}</span>
            </div>
            <p>${step.content}</p>
            <div class="tooltip-actions">
                ${this.currentStep > 0 ? '<button onclick="tutorialSystem.prevStep()" class="tooltip-btn prev">上一步</button>' : ''}
                <button onclick="tutorialSystem.nextStep()" class="tooltip-btn next">
                    ${this.currentStep === this.steps.length - 1 ? '完成' : '下一步'}
                </button>
                <button onclick="tutorialSystem.exitTutorial()" class="tooltip-btn exit">退出</button>
            </div>
        `;

        document.body.appendChild(tooltip);
        this.positionTooltip(tooltip, target, step.position);
    }

    // 定位提示框
    positionTooltip(tooltip, target, position) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch(position) {
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 10;
                break;
            case 'bottom':
                top = rect.bottom + 10;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 10;
                break;
            default: // top
                top = rect.top - tooltipRect.height - 10;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
        }

        tooltip.style.top = Math.max(10, top) + 'px';
        tooltip.style.left = Math.max(10, Math.min(window.innerWidth - tooltipRect.width - 10, left)) + 'px';
    }

    // 下一步
    nextStep() {
        this.currentStep++;
        this.showStep();
    }

    // 上一步
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    }

    // 退出教程
    exitTutorial() {
        this.isActive = false;
        this.cleanup();
        localStorage.setItem('tutorialCompleted', 'true');
    }

    // 完成教程
    completeTutorial() {
        this.cleanup();
        localStorage.setItem('tutorialCompleted', 'true');
        
        const congratsDialog = document.createElement('div');
        congratsDialog.className = 'tutorial-congrats-dialog';
        congratsDialog.innerHTML = `
            <div class="congrats-content">
                <i class="fas fa-trophy"></i>
                <h2>恭喜完成教程！</h2>
                <p>您已经掌握了基本操作，现在可以开始使用云端花园了！</p>
                <button onclick="this.parentElement.parentElement.remove()" class="congrats-btn">
                    开始使用
                </button>
            </div>
        `;
        document.body.appendChild(congratsDialog);
        
        setTimeout(() => congratsDialog.remove(), 5000);
    }

    // 清理教程元素
    cleanup() {
        document.querySelector('.tutorial-overlay')?.remove();
        document.querySelector('.tutorial-tooltip')?.remove();
        document.querySelectorAll('.tutorial-highlight').forEach(el => 
            el.classList.remove('tutorial-highlight'));
    }

    // 重新开始教程
    restartTutorial() {
        this.currentStep = 0;
        this.startTutorial();
    }

    // 添加教程按钮到帮助菜单
    addTutorialButton() {
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            const tutorialBtn = document.createElement('button');
            tutorialBtn.className = 'theme-toggle';
            tutorialBtn.title = '新手教程';
            tutorialBtn.innerHTML = '<i class="fas fa-graduation-cap"></i>';
            tutorialBtn.onclick = () => this.restartTutorial();
            
            helpBtn.parentNode.insertBefore(tutorialBtn, helpBtn.nextSibling);
        }
    }
}

// 初始化教程系统
const tutorialSystem = new TutorialSystem();

// 页面加载完成后检查新用户
document.addEventListener('DOMContentLoaded', () => {
    tutorialSystem.checkNewUser();
    tutorialSystem.addTutorialButton();
});