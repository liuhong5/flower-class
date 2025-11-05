class GardenApp {
    constructor() {
        this.socket = io(window.SOCKET_URL);
        this.token = localStorage.getItem('token');
        this.apiBaseURL = window.API_BASE_URL;
        this.userRole = localStorage.getItem('userRole');
        this.username = localStorage.getItem('username');
        this.currentClass = null;
        this.currentRankingClass = null;
        this.selectedFlowers = new Set();
        this.selectedGardens = new Set();
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.allFlowers = [];
        this.allGardens = [];
        this.filteredFlowers = [];
        this.filteredGardens = [];
        this.searchDebounceTimer = null;
        this.isFullscreen = false;
        
        // 初始化成就系统
        if (typeof AchievementSystem !== 'undefined') {
            this.achievementSystem = new AchievementSystem(this);
        }
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSocketListeners();
        
        if (this.token) {
            this.showMainInterface();
            this.loadData();
        } else {
            this.showLoginInterface();
        }
    }

    setupEventListeners() {
        // 登录表单
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // 注册按钮
        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showRegisterModal();
        });

        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // 主题切换
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 移动端菜单
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // 导出功能
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // 防抖搜索功能
        document.getElementById('flowerSearch').addEventListener('input', (e) => {
            this.debounceSearch(() => this.searchFlowers(e.target.value));
        });

        document.getElementById('gardenSearch').addEventListener('input', (e) => {
            this.debounceSearch(() => this.searchGardens(e.target.value));
        });

        // 快捷键支持
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 侧边栏导航
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchTab(item.dataset.tab);
            });
        });

        // 添加按钮
        document.getElementById('addClassBtn').addEventListener('click', () => {
            this.showAddClassModal();
        });

        document.getElementById('addFlowerBtn').addEventListener('click', () => {
            this.showAddFlowerModal();
        });

        document.getElementById('addGardenBtn').addEventListener('click', () => {
            this.showAddGardenModal();
        });

        // 班级选择
        document.getElementById('classSelect').addEventListener('change', (e) => {
            this.currentClass = e.target.value;
            this.loadFlowers();
        });

        document.getElementById('gardenClassSelect').addEventListener('change', (e) => {
            this.currentClass = e.target.value;
            this.loadGardens();
        });
        
        document.getElementById('rankingClassSelect').addEventListener('change', (e) => {
            this.currentRankingClass = e.target.value;
            if (this.currentRankingClass) {
                document.getElementById('rankingsContent').style.display = 'grid';
                document.getElementById('noClassSelected').style.display = 'none';
                this.loadRankings();
            } else {
                document.getElementById('rankingsContent').style.display = 'none';
                document.getElementById('noClassSelected').style.display = 'block';
            }
        });

        // 模态框关闭
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal')) {
                this.closeModal();
            }
        });
        
        // 修改密码按钮
        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            this.showChangePasswordModal();
        });

        // 初始化主题
        this.initTheme();
        
        // 初始化虚拟滚动
        this.initVirtualScroll();
    }

    setupSocketListeners() {
        this.socket.on('classCreated', (classData) => {
            this.loadClasses();
            this.loadClassSelects();
        });

        this.socket.on('flowerCreated', (flowerData) => {
            this.loadFlowers();
        });

        this.socket.on('flowerWatered', (flowerData) => {
            this.loadFlowers();
            this.loadRankings();
            this.showWaterAnimation();
        });

        this.socket.on('flowerDeleted', (data) => {
            this.loadFlowers();
        });

        this.socket.on('gardenCreated', (gardenData) => {
            this.loadGardens();
        });

        this.socket.on('gardenScored', (gardenData) => {
            this.loadGardens();
            this.loadRankings();
            // 如果花田详情打开，刷新显示
            if (document.getElementById('gardenDetailModal').style.display === 'block') {
                const gardenId = gardenData.id;
                this.showGardenDetail(gardenId);
            }
        });

        this.socket.on('gardenDeleted', (data) => {
            this.loadGardens();
        });
        
        this.socket.on('flowerAddedToGarden', (data) => {
            if (document.getElementById('gardenDetailModal').style.display === 'block') {
                this.showGardenDetail(data.gardenId);
            }
        });
        
        this.socket.on('flowerRemovedFromGarden', (data) => {
            if (document.getElementById('gardenDetailModal').style.display === 'block') {
                this.showGardenDetail(data.gardenId);
            }
        });
        
        this.socket.on('classDeleted', (data) => {
            this.loadClasses();
            this.loadClassSelects();
        });
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.userRole = data.role;
                this.username = data.username;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('userRole', this.userRole);
                localStorage.setItem('username', this.username);

                this.showMainInterface();
                this.loadData();
            } else {
                alert(data.error || '登录失败');
            }
        } catch (error) {
            alert('登录失败，请检查网络连接');
        }
    }

    logout() {
        this.token = null;
        this.userRole = null;
        this.username = null;
        
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');

        this.showLoginInterface();
    }

    showLoginInterface() {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('mainContainer').style.display = 'none';
    }

    showMainInterface() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'grid';
        
        document.getElementById('userInfo').textContent = `${this.username} (${this.userRole === 'editor' ? '编辑员' : '普通用户'})`;
        
        if (this.userRole === 'editor') {
            document.body.classList.add('user-editor');
        } else {
            document.body.classList.remove('user-editor');
        }
    }

    switchTab(tabName) {
        // 更新侧边栏
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容区
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // 加载对应数据
        switch (tabName) {
            case 'classes':
                this.loadClasses();
                break;
            case 'flowers':
                this.loadFlowers();
                break;
            case 'gardens':
                this.loadGardens();
                break;
            case 'rankings':
                // 不自动加载排行榜，需要选择班级
                break;
        }
    }

    async loadData() {
        await this.loadClasses();
        await this.loadClassSelects();
        await this.loadFlowers();
        await this.loadGardens();
        await this.loadRankings();
    }

    async loadClasses() {
        try {
            const response = await fetch('/api/classes');
            const classes = await response.json();
            
            const container = document.getElementById('classesList');
            container.innerHTML = '';

            classes.forEach(classItem => {
                const card = this.createClassCard(classItem);
                container.appendChild(card);
            });
        } catch (error) {
            console.error('加载班级失败:', error);
        }
    }

    async loadClassSelects() {
        try {
            const response = await fetch('/api/classes');
            const classes = await response.json();
            
            const selects = ['classSelect', 'gardenClassSelect', 'rankingClassSelect'];
            
            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                const currentValue = select.value;
                
                if (selectId === 'rankingClassSelect') {
                    select.innerHTML = '<option value="">选择班级查看排行榜</option>';
                } else {
                    select.innerHTML = '<option value="">选择班级</option>';
                }
                
                classes.forEach(classItem => {
                    const option = document.createElement('option');
                    option.value = classItem.id;
                    option.textContent = classItem.name;
                    if (classItem.id == currentValue) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            });
        } catch (error) {
            console.error('加载班级选择失败:', error);
        }
    }

    async loadFlowers() {
        try {
            const url = this.currentClass ? `/api/flowers?classId=${this.currentClass}` : '/api/flowers';
            const response = await fetch(url);
            this.allFlowers = await response.json();
            this.filteredFlowers = [...this.allFlowers];
            
            this.renderFlowers();
        } catch (error) {
            console.error('加载花朵失败:', error);
        }
    }

    async loadGardens() {
        try {
            const url = this.currentClass ? `/api/gardens?classId=${this.currentClass}` : '/api/gardens';
            const response = await fetch(url);
            this.allGardens = await response.json();
            this.filteredGardens = [...this.allGardens];
            
            this.renderGardens();
        } catch (error) {
            console.error('加载花田失败:', error);
        }
    }

    async loadRankings() {
        try {
            const url = this.currentRankingClass ? `/api/rankings?classId=${this.currentRankingClass}` : '/api/rankings';
            const response = await fetch(url);
            const rankings = await response.json();
            
            this.displayRankings('flowerRankings', rankings.flowers, '🌸');
            this.displayRankings('gardenRankings', rankings.gardens, '🌿');
        } catch (error) {
            console.error('加载排行榜失败:', error);
        }
    }

    displayRankings(containerId, items, icon) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        items.forEach((item, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            
            rankingItem.innerHTML = `
                <div class="ranking-position">#${index + 1}</div>
                <div class="ranking-name">${icon} ${item.name}</div>
                <div class="ranking-score">${item.score}分</div>
            `;
            
            container.appendChild(rankingItem);
        });
    }

    createClassCard(classItem) {
        const card = document.createElement('div');
        card.className = 'card clickable';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-school"></i>
                    ${classItem.name}
                </div>
                <div class="card-actions">
                    <button class="enter-class-btn" onclick="app.enterClass(${classItem.id}, '${classItem.name}')">
                        <i class="fas fa-arrow-right"></i>
                        进入
                    </button>
                    ${this.userRole === 'editor' ? `
                        <button class="delete-btn" onclick="app.deleteClass(${classItem.id}, '${classItem.name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="card-content">
                <p>创建时间: ${new Date(classItem.created_at).toLocaleDateString()}</p>
            </div>
        `;
        
        // 添加点击事件
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.enter-class-btn') && !e.target.closest('.delete-btn')) {
                this.enterClass(classItem.id, classItem.name);
            }
        });
        
        return card;
    }

    createFlowerCard(flower) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const flowerIcon = this.getFlowerIcon(flower.score);
        
        card.innerHTML = `
            ${this.userRole === 'editor' ? `
                <input type="checkbox" class="card-checkbox" onchange="app.toggleFlowerSelection(${flower.id}, this)">
            ` : ''}
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-flower"></i>
                    ${flower.name}
                </div>
                <div class="card-actions">
                    <button class="action-btn achievement-btn" onclick="app.showFlowerAchievements(${flower.id})" title="查看成就">
                        <i class="fas fa-trophy"></i>
                    </button>
                    ${this.userRole === 'editor' ? `
                        <button class="action-btn water-btn" onclick="app.waterFlower(${flower.id})">
                            <i class="fas fa-tint"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="app.deleteFlower(${flower.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="flower-visual" id="flower-${flower.id}">${flowerIcon}</div>
            <div class="card-score">${flower.score} 分</div>
        `;
        
        // 添加选择事件
        const checkbox = card.querySelector('.card-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                card.classList.toggle('selected', checkbox.checked);
            });
        }
        
        return card;
    }

    createGardenCard(garden) {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            ${this.userRole === 'editor' ? `
                <input type="checkbox" class="card-checkbox" onchange="app.toggleGardenSelection(${garden.id}, this)">
            ` : ''}
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-leaf"></i>
                    ${garden.name}
                </div>
                <div class="card-actions">
                    <button class="action-btn view-btn" onclick="app.showGardenDetail(${garden.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${this.userRole === 'editor' ? `
                        <button class="action-btn score-btn" onclick="app.showScoreGardenModal(${garden.id})">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="app.deleteGarden(${garden.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="flower-visual">🌿</div>
            <div class="card-score">${garden.score} 分</div>
        `;
        
        // 添加选择事件
        const checkbox = card.querySelector('.card-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                card.classList.toggle('selected', checkbox.checked);
            });
        }
        
        return card;
    }

    getFlowerIcon(score) {
        if (score >= 20) return '🌺';
        if (score >= 15) return '🌸';
        if (score >= 10) return '🌼';
        if (score >= 5) return '🌻';
        return '🌱';
    }

    async waterFlower(flowerId) {
        try {
            const response = await fetch(`/api/flowers/${flowerId}/water`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const updatedFlower = await response.json();
                const flowerElement = document.getElementById(`flower-${flowerId}`);
                if (flowerElement) {
                    flowerElement.classList.add('watered');
                    setTimeout(() => {
                        flowerElement.classList.remove('watered');
                    }, 800);
                }
                // 检查花朵成就
                this.checkFlowerAchievements(updatedFlower);
            } else {
                alert('浇水失败');
            }
        } catch (error) {
            alert('浇水失败，请检查网络连接');
        }
    }

    async deleteFlower(flowerId) {
        if (!confirm('确定要删除这朵花吗？')) return;

        try {
            const response = await fetch(`/api/flowers/${flowerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                alert('删除失败');
            }
        } catch (error) {
            alert('删除失败，请检查网络连接');
        }
    }

    async deleteGarden(gardenId) {
        if (!confirm('确定要删除这个花田吗？')) return;

        try {
            const response = await fetch(`/api/gardens/${gardenId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                alert('删除失败');
            }
        } catch (error) {
            alert('删除失败，请检查网络连接');
        }
    }

    showAddClassModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h3>添加班级</h3>
            <form class="modal-form" onsubmit="app.addClass(event)">
                <input type="text" id="className" placeholder="班级名称" required>
                <button type="submit">添加班级</button>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';
    }

    showAddFlowerModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h3>添加花朵</h3>
            <form class="modal-form" onsubmit="app.addFlower(event)">
                <input type="text" id="flowerName" placeholder="花朵名称（学生姓名）" required>
                <select id="flowerClass" required>
                    <option value="">选择班级</option>
                </select>
                <button type="submit">添加花朵</button>
            </form>
        `;
        
        // 填充班级选项并设置默认值
        this.populateClassSelect('flowerClass');
        if (this.currentClass) {
            document.getElementById('flowerClass').value = this.currentClass;
        }
        document.getElementById('modal').style.display = 'block';
    }

    showAddGardenModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h3>添加花田</h3>
            <form class="modal-form" onsubmit="app.addGarden(event)">
                <input type="text" id="gardenName" placeholder="花田名称" required>
                <select id="gardenClass" required>
                    <option value="">选择班级</option>
                </select>
                <button type="submit">添加花田</button>
            </form>
        `;
        
        // 填充班级选项并设置默认值
        this.populateClassSelect('gardenClass');
        if (this.currentClass) {
            document.getElementById('gardenClass').value = this.currentClass;
        }
        document.getElementById('modal').style.display = 'block';
    }

    showScoreGardenModal(gardenId) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h3>给花田加分</h3>
            <form class="modal-form" onsubmit="app.scoreGarden(event, ${gardenId})">
                <input type="number" id="scorePoints" placeholder="输入加分数量" min="1" required>
                <button type="submit">确认加分</button>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';
    }

    async populateClassSelect(selectId) {
        try {
            const response = await fetch('/api/classes');
            const classes = await response.json();
            
            const select = document.getElementById(selectId);
            classes.forEach(classItem => {
                const option = document.createElement('option');
                option.value = classItem.id;
                option.textContent = classItem.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('加载班级选项失败:', error);
        }
    }

    async addClass(event) {
        event.preventDefault();
        
        const name = document.getElementById('className').value;
        
        try {
            const response = await fetch('/api/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                this.closeModal();
            } else {
                alert('添加班级失败');
            }
        } catch (error) {
            alert('添加班级失败，请检查网络连接');
        }
    }

    async addFlower(event) {
        event.preventDefault();
        
        const name = document.getElementById('flowerName').value;
        const classId = document.getElementById('flowerClass').value;
        
        try {
            const response = await fetch('/api/flowers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ name, classId })
            });

            if (response.ok) {
                this.closeModal();
            } else {
                alert('添加花朵失败');
            }
        } catch (error) {
            alert('添加花朵失败，请检查网络连接');
        }
    }

    async addGarden(event) {
        event.preventDefault();
        
        const name = document.getElementById('gardenName').value;
        const classId = document.getElementById('gardenClass').value;
        
        try {
            const response = await fetch('/api/gardens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ name, classId })
            });

            if (response.ok) {
                this.closeModal();
            } else {
                alert('添加花田失败');
            }
        } catch (error) {
            alert('添加花田失败，请检查网络连接');
        }
    }

    async scoreGarden(event, gardenId) {
        event.preventDefault();
        
        const points = parseInt(document.getElementById('scorePoints').value);
        
        try {
            const response = await fetch(`/api/gardens/${gardenId}/score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ points })
            });

            if (response.ok) {
                const updatedGarden = await response.json();
                this.closeModal();
                
                // 检查花田成就
                this.checkGardenAchievements(updatedGarden);
                // 检查班级成就
                this.checkClassAchievements();
                
                // 如果花田详情打开，刷新显示
                if (document.getElementById('gardenDetailModal').style.display === 'block') {
                    this.showGardenDetail(gardenId);
                }
            } else {
                alert('加分失败');
            }
        } catch (error) {
            alert('加分失败，请检查网络连接');
        }
    }

    async showGardenDetail(gardenId) {
        try {
            // 获取花田信息
            const gardenResponse = await fetch(`/api/gardens`);
            const gardens = await gardenResponse.json();
            const garden = gardens.find(g => g.id == gardenId);
            
            // 获取花田中的花朵
            const flowersResponse = await fetch(`/api/gardens/${gardenId}/flowers`);
            const gardenFlowers = await flowersResponse.json();
            
            // 获取花田加分记录
            const scoresResponse = await fetch(`/api/gardens/${gardenId}/scores`);
            const scoreHistory = await scoresResponse.json();
            
            // 获取花田统计信息
            const statsResponse = await fetch(`/api/gardens/${gardenId}/stats`);
            const stats = await statsResponse.json();
            
            // 获取所有花朵用于添加
            const allFlowersResponse = await fetch('/api/flowers');
            const allFlowers = await allFlowersResponse.json();
            
            // 筛选当前班级的花朵
            const classFlowers = this.currentClass ? 
                allFlowers.filter(f => f.class_id == this.currentClass) : 
                allFlowers;
            
            const availableFlowers = classFlowers.filter(f => 
                !gardenFlowers.some(gf => gf.id === f.id)
            );
            
            const modalBody = document.getElementById('gardenDetailBody');
            modalBody.innerHTML = `
                <h3><i class="fas fa-leaf"></i> ${garden.name} - 花朵管理</h3>
                
                <div class="garden-stats">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">${stats.totalFlowers}</div>
                            <div class="stat-label">花朵数量</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${stats.averageScore}</div>
                            <div class="stat-label">平均分</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${stats.maxScore}</div>
                            <div class="stat-label">最高分</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${stats.gardenBonusScore}</div>
                            <div class="stat-label">花田加分</div>
                        </div>
                    </div>
                </div>
                
                ${this.userRole === 'editor' ? `
                <div class="add-flower-section">
                    <h4>添加花朵到花田</h4>
                    <select id="availableFlowers">
                        <option value="">选择花朵</option>
                        ${availableFlowers.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
                    </select>
                    <button onclick="app.addFlowerToGarden(${gardenId})" class="add-btn">
                        <i class="fas fa-plus"></i> 添加
                    </button>
                </div>
                ` : ''}
                
                <div class="garden-flowers">
                    <h4>花田中的花朵 (${gardenFlowers.length}朵)</h4>
                    <div class="flowers-grid">
                        ${gardenFlowers.map(flower => `
                            <div class="flower-item">
                                <span class="flower-name">🌸 ${flower.name}</span>
                                <span class="flower-score">${flower.score}分</span>
                                ${this.userRole === 'editor' ? `
                                    <button onclick="app.removeFlowerFromGarden(${gardenId}, ${flower.id})" class="remove-btn">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="score-history">
                    <h4>加分记录（不计入花朵总分）</h4>
                    <div class="score-table">
                        ${scoreHistory.length > 0 ? `
                            <table>
                                <thead>
                                    <tr>
                                        <th>日期</th>
                                        <th>加分</th>
                                        <th>操作人</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${scoreHistory.map(score => `
                                        <tr>
                                            <td>${new Date(score.scored_at).toLocaleDateString()}</td>
                                            <td>+${score.points}分</td>
                                            <td>${score.scored_by}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p>暂无加分记录</p>'}
                    </div>
                </div>
            `;
            
            document.getElementById('gardenDetailModal').style.display = 'block';
        } catch (error) {
            alert('获取花田详情失败');
        }
    }
    
    async addFlowerToGarden(gardenId) {
        const flowerId = document.getElementById('availableFlowers').value;
        if (!flowerId) {
            alert('请选择花朵');
            return;
        }
        
        try {
            const response = await fetch(`/api/gardens/${gardenId}/flowers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ flowerId })
            });
            
            if (response.ok) {
                this.showGardenDetail(gardenId); // 刷新显示
            } else {
                alert('添加花朵失败');
            }
        } catch (error) {
            alert('添加花朵失败');
        }
    }
    
    async removeFlowerFromGarden(gardenId, flowerId) {
        if (!confirm('确定要从花田中移除这朵花吗？')) return;
        
        try {
            const response = await fetch(`/api/gardens/${gardenId}/flowers/${flowerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                this.showGardenDetail(gardenId); // 刷新显示
            } else {
                alert('移除花朵失败');
            }
        } catch (error) {
            alert('移除花朵失败');
        }
    }
    
    closeGardenDetail() {
        document.getElementById('gardenDetailModal').style.display = 'none';
    }

    enterClass(classId, className) {
        // 设置当前班级
        this.currentClass = classId;
        this.currentRankingClass = classId;
        
        // 更新所有班级选择器
        const selects = ['classSelect', 'gardenClassSelect', 'rankingClassSelect'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.value = classId;
            }
        });
        
        // 显示排行榜内容
        document.getElementById('rankingsContent').style.display = 'grid';
        document.getElementById('noClassSelected').style.display = 'none';
        
        // 切换到花朵管理页面
        this.switchTab('flowers');
        
        // 加载数据
        this.loadFlowers();
        this.loadGardens();
        this.loadRankings();
        
        // 显示提示
        this.showNotification(`已进入 ${className}`);
    }
    
    showNotification(message) {
        // 创建提示框
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // 3秒后隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    async deleteClass(classId, className) {
        if (!confirm(`确定要删除班级“${className}”吗？这将同时删除该班级下的所有花朵和花田！`)) return;
        
        try {
            const response = await fetch(`/api/classes/${classId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                this.showNotification(`已删除班级“${className}”`);
                this.loadClasses();
                this.loadClassSelects();
                
                // 如果删除的是当前班级，清空选择
                if (this.currentClass == classId) {
                    this.currentClass = null;
                    this.currentRankingClass = null;
                    document.getElementById('rankingsContent').style.display = 'none';
                    document.getElementById('noClassSelected').style.display = 'block';
                }
            } else {
                alert('删除班级失败');
            }
        } catch (error) {
            alert('删除班级失败，请检查网络连接');
        }
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    showWaterAnimation() {
        const animation = document.getElementById('waterAnimation');
        animation.classList.add('active');
        
        setTimeout(() => {
            animation.classList.remove('active');
        }, 2000);
    }
    // 主题切换功能
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // 移动端菜单
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('mobile-open');
    }

    // 搜索功能
    searchFlowers(query) {
        this.filteredFlowers = this.allFlowers.filter(flower =>
            flower.name.toLowerCase().includes(query.toLowerCase())
        );
        this.currentPage = 1;
        this.renderFlowers();
    }

    searchGardens(query) {
        this.filteredGardens = this.allGardens.filter(garden =>
            garden.name.toLowerCase().includes(query.toLowerCase())
        );
        this.currentPage = 1;
        this.renderGardens();
    }

    // 渲染花朵（支持分页）
    renderFlowers() {
        const container = document.getElementById('flowersList');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const flowersToShow = this.filteredFlowers.slice(startIndex, endIndex);

        container.innerHTML = '';
        flowersToShow.forEach((flower, index) => {
            const card = this.createFlowerCard(flower);
            card.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(card);
        });

        this.renderPagination('flowerPagination', this.filteredFlowers.length);
    }

    // 渲染花田（支持分页）
    renderGardens() {
        const container = document.getElementById('gardensList');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const gardensToShow = this.filteredGardens.slice(startIndex, endIndex);

        container.innerHTML = '';
        gardensToShow.forEach((garden, index) => {
            const card = this.createGardenCard(garden);
            card.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(card);
        });

        this.renderPagination('gardenPagination', this.filteredGardens.length);
    }

    // 渲染分页
    renderPagination(containerId, totalItems) {
        const container = document.getElementById(containerId);
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // 上一页
        paginationHTML += `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick="app.changePage(${this.currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;
        
        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="current-page">${i}</button>`;
            } else if (i === 1 || i === totalPages || Math.abs(i - this.currentPage) <= 2) {
                paginationHTML += `<button onclick="app.changePage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span>...</span>`;
            }
        }
        
        // 下一页
        paginationHTML += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="app.changePage(${this.currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;
        
        container.innerHTML = paginationHTML;
    }

    changePage(page) {
        this.currentPage = page;
        const activeTab = document.querySelector('.tab-content.active').id;
        if (activeTab === 'flowersTab') {
            this.renderFlowers();
        } else if (activeTab === 'gardensTab') {
            this.renderGardens();
        }
    }

    // 批量操作功能
    toggleFlowerSelection(flowerId, checkbox) {
        if (checkbox.checked) {
            this.selectedFlowers.add(flowerId);
        } else {
            this.selectedFlowers.delete(flowerId);
        }
        this.updateBatchToolbar('flower');
    }

    toggleGardenSelection(gardenId, checkbox) {
        if (checkbox.checked) {
            this.selectedGardens.add(gardenId);
        } else {
            this.selectedGardens.delete(gardenId);
        }
        this.updateBatchToolbar('garden');
    }

    updateBatchToolbar(type) {
        const toolbar = document.getElementById(`${type}BatchToolbar`);
        const count = type === 'flower' ? this.selectedFlowers.size : this.selectedGardens.size;
        const countElement = document.getElementById(`selected${type.charAt(0).toUpperCase() + type.slice(1)}Count`);
        
        if (count > 0) {
            toolbar.classList.add('active');
            countElement.textContent = count;
        } else {
            toolbar.classList.remove('active');
        }
    }

    async batchWaterFlowers() {
        if (this.selectedFlowers.size === 0) return;
        
        const promises = Array.from(this.selectedFlowers).map(flowerId =>
            this.waterFlower(flowerId)
        );
        
        try {
            await Promise.all(promises);
            this.cancelBatchSelection();
            this.showNotification(`已为 ${this.selectedFlowers.size} 朵花浇水`);
        } catch (error) {
            alert('批量浇水失败');
        }
    }

    showBatchScoreModal() {
        if (this.selectedGardens.size === 0) return;
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h3>批量给花田加分</h3>
            <p>已选择 ${this.selectedGardens.size} 个花田</p>
            <form class="modal-form" onsubmit="app.batchScoreGardens(event)">
                <input type="number" id="batchScorePoints" placeholder="输入加分数量" min="1" required>
                <button type="submit">确认加分</button>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';
    }

    async batchScoreGardens(event) {
        event.preventDefault();
        
        const points = parseInt(document.getElementById('batchScorePoints').value);
        const promises = Array.from(this.selectedGardens).map(gardenId =>
            fetch(`/api/gardens/${gardenId}/score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ points })
            })
        );
        
        try {
            const responses = await Promise.all(promises);
            const updatedGardens = await Promise.all(responses.map(r => r.json()));
            
            // 检查每个花田的成就
            updatedGardens.forEach(garden => {
                this.checkGardenAchievements(garden);
            });
            
            // 检查班级成就
            this.checkClassAchievements();
            
            this.closeModal();
            this.cancelBatchSelection();
            this.showNotification(`已为 ${this.selectedGardens.size} 个花田加分`);
        } catch (error) {
            alert('批量加分失败');
        }
    }

    cancelBatchSelection() {
        this.selectedFlowers.clear();
        this.selectedGardens.clear();
        document.querySelectorAll('.card-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.card.selected').forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.batch-toolbar').forEach(toolbar => toolbar.classList.remove('active'));
    }

    // 数据导出功能
    async exportData() {
        // 等待XLSX库加载
        let retries = 0;
        while (typeof XLSX === 'undefined' && retries < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
        }
        
        if (typeof XLSX === 'undefined') {
            alert('导出功能加载失败，请刷新页面重试');
            return;
        }
        
        try {
            const [flowersRes, gardensRes, classesRes] = await Promise.all([
                fetch('/api/flowers'),
                fetch('/api/gardens'),
                fetch('/api/classes')
            ]);
            
            const flowers = await flowersRes.json();
            const gardens = await gardensRes.json();
            const classes = await classesRes.json();
            
            const wb = XLSX.utils.book_new();
            
            // 花朵数据
            const flowerData = (flowers.data || flowers).map(f => ({
                '花朵名称': f.name,
                '班级ID': f.class_id,
                '分数': f.score,
                '创建时间': new Date(f.created_at).toLocaleString()
            }));
            const flowerWs = XLSX.utils.json_to_sheet(flowerData);
            XLSX.utils.book_append_sheet(wb, flowerWs, '花朵数据');
            
            // 花田数据
            const gardenData = (gardens.data || gardens).map(g => ({
                '花田名称': g.name,
                '班级ID': g.class_id,
                '分数': g.score,
                '创建时间': new Date(g.created_at).toLocaleString()
            }));
            const gardenWs = XLSX.utils.json_to_sheet(gardenData);
            XLSX.utils.book_append_sheet(wb, gardenWs, '花田数据');
            
            // 班级数据
            const classData = classes.map(c => ({
                '班级名称': c.name,
                '创建时间': new Date(c.created_at).toLocaleString()
            }));
            const classWs = XLSX.utils.json_to_sheet(classData);
            XLSX.utils.book_append_sheet(wb, classWs, '班级数据');
            
            XLSX.writeFile(wb, `花园数据_${new Date().toISOString().split('T')[0]}.xlsx`);
            this.showNotification('数据导出成功');
        } catch (error) {
            console.error('导出错误:', error);
            alert('导出失败: ' + error.message);
        }
    }

    // 统计图表
    async loadStatsChart() {
        if (!this.currentRankingClass || typeof Chart === 'undefined') return;
        
        try {
            const [flowersRes, gardensRes] = await Promise.all([
                fetch(`/api/flowers?classId=${this.currentRankingClass}`),
                fetch(`/api/gardens?classId=${this.currentRankingClass}`)
            ]);
            
            const flowersData = await flowersRes.json();
            const gardensData = await gardensRes.json();
            
            const flowers = flowersData.data || flowersData;
            const gardens = gardensData.data || gardensData;
            
            const ctx = document.getElementById('statsChart')?.getContext('2d');
            if (!ctx) return;
            
            if (this.chart) {
                this.chart.destroy();
            }
            
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [...flowers.map(f => f.name), ...gardens.map(g => g.name)],
                    datasets: [{
                        label: '分数',
                        data: [...flowers.map(f => f.score), ...gardens.map(g => g.score)],
                        backgroundColor: [
                            ...flowers.map(() => 'rgba(76, 175, 80, 0.8)'),
                            ...gardens.map(() => 'rgba(33, 150, 243, 0.8)')
                        ],
                        borderColor: [
                            ...flowers.map(() => 'rgba(76, 175, 80, 1)'),
                            ...gardens.map(() => 'rgba(33, 150, 243, 1)')
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            const chartContainer = document.getElementById('chartContainer');
            if (chartContainer) {
                chartContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('加载图表失败:', error);
        }
    }
    // 防抖搜索
    debounceSearch(callback) {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(callback, 300);
    }

    // 快捷键处理
    handleKeyboardShortcuts(e) {
        // ESC关闭弹窗
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeGardenDetail();
            if (this.isFullscreen) {
                this.exitFullscreen();
            }
        }
        
        // Ctrl+S保存（阻止浏览器默认保存）
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.exportData();
        }
        
        // F11全屏排行榜
        if (e.key === 'F11' && document.querySelector('#rankingsTab.active')) {
            e.preventDefault();
            this.toggleFullscreen();
        }
    }

    // 虚拟滚动初始化
    initVirtualScroll() {
        this.virtualScrollConfig = {
            itemHeight: 200, // 卡片高度
            containerHeight: 600, // 容器高度
            buffer: 5 // 缓冲区项目数
        };
    }

    // 虚拟滚动渲染
    renderVirtualList(container, items, createItemFn) {
        if (items.length < 50) {
            // 少于50项时使用普通渲染
            container.innerHTML = '';
            items.forEach((item, index) => {
                const element = createItemFn(item);
                element.style.animationDelay = `${index * 0.05}s`;
                container.appendChild(element);
            });
            return;
        }

        // 大数据量使用虚拟滚动
        const { itemHeight, containerHeight, buffer } = this.virtualScrollConfig;
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const totalHeight = items.length * itemHeight;

        container.style.height = `${containerHeight}px`;
        container.style.overflow = 'auto';
        container.innerHTML = `<div style="height: ${totalHeight}px; position: relative;"></div>`;
        
        const viewport = container.firstChild;
        let startIndex = 0;

        const renderVisibleItems = () => {
            const scrollTop = container.scrollTop;
            startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(startIndex + visibleCount + buffer, items.length);
            
            viewport.innerHTML = '';
            
            for (let i = startIndex; i < endIndex; i++) {
                const item = items[i];
                const element = createItemFn(item);
                element.style.position = 'absolute';
                element.style.top = `${i * itemHeight}px`;
                element.style.width = '100%';
                viewport.appendChild(element);
            }
        };

        container.addEventListener('scroll', () => {
            requestAnimationFrame(renderVisibleItems);
        });

        renderVisibleItems();
    }

    // 图片懒加载
    lazyLoadImage(img, src) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = src;
                    image.classList.remove('lazy');
                    observer.unobserve(image);
                }
            });
        });
        
        img.classList.add('lazy');
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5sb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';
        observer.observe(img);
    }

    // 全屏功能
    toggleFullscreen() {
        const rankingsTab = document.getElementById('rankingsTab');
        if (!this.isFullscreen) {
            rankingsTab.classList.add('fullscreen');
            this.isFullscreen = true;
            this.showNotification('按ESC或F11退出全屏');
        } else {
            this.exitFullscreen();
        }
    }

    exitFullscreen() {
        const rankingsTab = document.getElementById('rankingsTab');
        rankingsTab.classList.remove('fullscreen');
        this.isFullscreen = false;
    }

    // 打印功能
    printRankings() {
        const printContent = document.getElementById('rankingsContent').cloneNode(true);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>花园排行榜</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .rankings-container { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                        .ranking-section { break-inside: avoid; }
                        .ranking-section h3 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
                        .ranking-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
                        .ranking-position { font-weight: bold; color: #4CAF50; }
                        .ranking-name { flex: 1; margin-left: 15px; }
                        .ranking-score { font-weight: bold; }
                        @media print { .rankings-container { grid-template-columns: 1fr; } }
                    </style>
                </head>
                <body>
                    <h1>🌸 云端花园排行榜</h1>
                    <p>打印时间: ${new Date().toLocaleString()}</p>
                    ${printContent.outerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
    // 多种图表类型
    async loadAdvancedCharts() {
        if (!this.currentRankingClass || typeof Chart === 'undefined') return;
        
        try {
            const [flowersRes, gardensRes] = await Promise.all([
                fetch(`/api/flowers?classId=${this.currentRankingClass}`),
                fetch(`/api/gardens?classId=${this.currentRankingClass}`)
            ]);
            
            const flowersData = await flowersRes.json();
            const gardensData = await gardensRes.json();
            
            const flowers = flowersData.data || flowersData;
            const gardens = gardensData.data || gardensData;
            
            // 柱状图 - 分数对比
            this.createBarChart(flowers, gardens);
            
            // 饼图 - 分数分布
            this.createPieChart(flowers, gardens);
            
            // 雷达图 - 综合评估
            this.createRadarChart(flowers, gardens);
            
            // 趋势图 - 分数趋势
            this.createTrendChart();
            
            // 实时统计
            this.updateRealTimeStats(flowers, gardens);
            
        } catch (error) {
            console.error('加载高级图表失败:', error);
        }
    }

    createBarChart(flowers, gardens) {
        const barCtx = document.getElementById('statsChart')?.getContext('2d');
        if (!barCtx) return;
        
        // 销毁之前的图表
        if (this.barChart) {
            this.barChart.destroy();
        }
        
        // 合并花朵和花田数据，按分数排序
        const allItems = [
            ...flowers.map(f => ({ name: f.name, score: f.score, type: '花朵' })),
            ...gardens.map(g => ({ name: g.name, score: g.score, type: '花田' }))
        ].sort((a, b) => b.score - a.score).slice(0, 10); // 只显示前10名
        
        this.barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: allItems.map(item => item.name),
                datasets: [{
                    label: '分数',
                    data: allItems.map(item => item.score),
                    backgroundColor: allItems.map(item => 
                        item.type === '花朵' ? 'rgba(76, 175, 80, 0.8)' : 'rgba(33, 150, 243, 0.8)'
                    ),
                    borderColor: allItems.map(item => 
                        item.type === '花朵' ? 'rgba(76, 175, 80, 1)' : 'rgba(33, 150, 243, 1)'
                    ),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            generateLabels: function() {
                                return [
                                    {
                                        text: '花朵',
                                        fillStyle: 'rgba(76, 175, 80, 0.8)',
                                        strokeStyle: 'rgba(76, 175, 80, 1)',
                                        lineWidth: 2
                                    },
                                    {
                                        text: '花田',
                                        fillStyle: 'rgba(33, 150, 243, 0.8)',
                                        strokeStyle: 'rgba(33, 150, 243, 1)',
                                        lineWidth: 2
                                    }
                                ];
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: '分数排行榜 (前10名)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '分数'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '名称'
                        }
                    }
                }
            }
        });
    }

    createPieChart(flowers, gardens) {
        const pieCtx = document.getElementById('pieChart')?.getContext('2d');
        if (!pieCtx) return;
        
        // 销毁之前的图表
        if (this.pieChart) {
            this.pieChart.destroy();
        }
        
        const scoreRanges = {
            '0-5分': 0, '6-10分': 0, '11-15分': 0, '16-20分': 0, '20分以上': 0
        };
        
        [...flowers, ...gardens].forEach(item => {
            if (item.score <= 5) scoreRanges['0-5分']++;
            else if (item.score <= 10) scoreRanges['6-10分']++;
            else if (item.score <= 15) scoreRanges['11-15分']++;
            else if (item.score <= 20) scoreRanges['16-20分']++;
            else scoreRanges['20分以上']++;
        });
        
        this.pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(scoreRanges),
                datasets: [{
                    data: Object.values(scoreRanges),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '分数分布'
                    }
                }
            }
        });
    }

    createRadarChart(flowers, gardens) {
        const radarCtx = document.getElementById('radarChart')?.getContext('2d');
        if (!radarCtx) return;
        
        // 销毁之前的图表
        if (this.radarChart) {
            this.radarChart.destroy();
        }
        
        const avgFlowerScore = flowers.reduce((sum, f) => sum + f.score, 0) / flowers.length || 0;
        const avgGardenScore = gardens.reduce((sum, g) => sum + g.score, 0) / gardens.length || 0;
        const maxScore = Math.max(...flowers.map(f => f.score), ...gardens.map(g => g.score));
        
        this.radarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['平均分', '最高分', '参与度', '活跃度', '成长性'],
                datasets: [{
                    label: '班级表现',
                    data: [avgFlowerScore, maxScore, flowers.length, gardens.length, avgFlowerScore * 0.8],
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '班级综合表现'
                    }
                }
            }
        });
    }

    async createTrendChart() {
        const trendCtx = document.getElementById('trendChart')?.getContext('2d');
        if (!trendCtx) return;
        
        // 销毁之前的图表
        if (this.trendChart) {
            this.trendChart.destroy();
        }
        
        // 模拟趋势数据（实际应从服务器获取历史数据）
        const dates = [];
        const scores = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString());
            scores.push(Math.floor(Math.random() * 50) + 50);
        }
        
        this.trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '总分趋势',
                    data: scores,
                    borderColor: 'rgba(33, 150, 243, 1)',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '分数趋势 (近7天)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '总分'
                        }
                    }
                }
            }
        });
    }

    updateRealTimeStats(flowers, gardens) {
        const statsContainer = document.getElementById('realTimeStats');
        if (!statsContainer) return;
        
        const totalFlowers = flowers.length;
        const totalGardens = gardens.length;
        const totalScore = [...flowers, ...gardens].reduce((sum, item) => sum + item.score, 0);
        const avgScore = totalScore / (totalFlowers + totalGardens) || 0;
        const topScore = Math.max(...flowers.map(f => f.score), ...gardens.map(g => g.score));
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${totalFlowers}</div>
                <div class="stat-label">花朵总数</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalGardens}</div>
                <div class="stat-label">花田总数</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalScore}</div>
                <div class="stat-label">总分数</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${avgScore.toFixed(1)}</div>
                <div class="stat-label">平均分</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${topScore}</div>
                <div class="stat-label">最高分</div>
            </div>
        `;
    }
    // 评论系统
    async showCommentsModal(type, id) {
        try {
            const response = await fetch(`/api/${type}/${id}/comments`);
            const comments = await response.json();
            
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <h3>💬 评论</h3>
                <div class="comments-list">
                    ${comments.map(comment => `
                        <div class="comment-item">
                            <div class="comment-header">
                                <strong>${comment.author}</strong>
                                <span class="comment-time">${new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            <div class="comment-content">${comment.content}</div>
                        </div>
                    `).join('')}
                </div>
                ${this.userRole === 'editor' ? `
                    <form class="comment-form" onsubmit="app.addComment(event, '${type}', ${id})">
                        <textarea id="commentContent" placeholder="添加评论..." required></textarea>
                        <button type="submit">发表评论</button>
                    </form>
                ` : ''}
            `;
            document.getElementById('modal').style.display = 'block';
        } catch (error) {
            console.error('加载评论失败:', error);
        }
    }

    async addComment(event, type, id) {
        event.preventDefault();
        const content = document.getElementById('commentContent').value;
        
        try {
            const response = await fetch(`/api/${type}/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ content })
            });
            
            if (response.ok) {
                this.showCommentsModal(type, id);
            }
        } catch (error) {
            alert('添加评论失败');
        }
    }

    // 标签系统
    async showTagsModal(flowerId) {
        try {
            const [tagsRes, flowerTagsRes] = await Promise.all([
                fetch('/api/tags'),
                fetch(`/api/flowers/${flowerId}/tags`)
            ]);
            
            const allTags = await tagsRes.json();
            const flowerTags = await flowerTagsRes.json();
            
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <h3>🏷️ 标签管理</h3>
                <div class="current-tags">
                    <h4>当前标签:</h4>
                    <div class="tags-container">
                        ${flowerTags.map(tag => `
                            <span class="tag tag-${tag.color}">
                                ${tag.name}
                                ${this.userRole === 'editor' ? `
                                    <button onclick="app.removeTag(${flowerId}, ${tag.id})" class="tag-remove">×</button>
                                ` : ''}
                            </span>
                        `).join('')}
                    </div>
                </div>
                ${this.userRole === 'editor' ? `
                    <div class="available-tags">
                        <h4>可用标签:</h4>
                        <div class="tags-container">
                            ${allTags.filter(tag => !flowerTags.some(ft => ft.id === tag.id)).map(tag => `
                                <span class="tag tag-${tag.color}" onclick="app.addTag(${flowerId}, ${tag.id})">
                                    ${tag.name} +
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    <form class="tag-form" onsubmit="app.createTag(event, ${flowerId})">
                        <input type="text" id="tagName" placeholder="新标签名称" required>
                        <select id="tagColor">
                            <option value="blue">蓝色</option>
                            <option value="green">绿色</option>
                            <option value="red">红色</option>
                            <option value="yellow">黄色</option>
                            <option value="purple">紫色</option>
                        </select>
                        <button type="submit">创建标签</button>
                    </form>
                ` : ''}
            `;
            document.getElementById('modal').style.display = 'block';
        } catch (error) {
            console.error('加载标签失败:', error);
        }
    }

    async addTag(flowerId, tagId) {
        try {
            const response = await fetch(`/api/flowers/${flowerId}/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ tagId })
            });
            
            if (response.ok) {
                this.showTagsModal(flowerId);
            }
        } catch (error) {
            alert('添加标签失败');
        }
    }

    async removeTag(flowerId, tagId) {
        try {
            const response = await fetch(`/api/flowers/${flowerId}/tags/${tagId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                this.showTagsModal(flowerId);
            }
        } catch (error) {
            alert('移除标签失败');
        }
    }

    async createTag(event, flowerId) {
        event.preventDefault();
        const name = document.getElementById('tagName').value;
        const color = document.getElementById('tagColor').value;
        
        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ name, color })
            });
            
            if (response.ok) {
                this.showTagsModal(flowerId);
            }
        } catch (error) {
            alert('创建标签失败');
        }
    }
    // 成就系统 - 花朵成就检查
    checkFlowerAchievements(flower) {
        if (this.achievementSystem) {
            this.achievementSystem.checkFlowerAchievements(flower);
        }
    }
    
    // 花田成就检查
    checkGardenAchievements(garden) {
        if (this.achievementSystem) {
            this.achievementSystem.checkGardenAchievements(garden);
        }
    }
    
    // 班级成就检查
    async checkClassAchievements() {
        if (!this.achievementSystem || !this.currentRankingClass) return;
        
        try {
            const [flowersRes, gardensRes] = await Promise.all([
                fetch(`/api/flowers?classId=${this.currentRankingClass}`),
                fetch(`/api/gardens?classId=${this.currentRankingClass}`)
            ]);
            
            const flowers = await flowersRes.json();
            const gardens = await gardensRes.json();
            
            const stats = {
                totalFlowers: flowers.length,
                totalGardens: gardens.length,
                totalScore: [...flowers, ...gardens].reduce((sum, item) => sum + item.score, 0),
                avgScore: (flowers.length + gardens.length) > 0 ? 
                    [...flowers, ...gardens].reduce((sum, item) => sum + item.score, 0) / (flowers.length + gardens.length) : 0,
                highScoreCount: [...flowers, ...gardens].filter(item => item.score >= 20).length
            };
            
            this.achievementSystem.checkClassAchievements(this.currentRankingClass, stats);
        } catch (error) {
            console.error('检查班级成就失败:', error);
        }
    }

    unlockFlowerAchievement(achievement, flower) {
        // 检查是否已解锁
        const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        if (unlockedAchievements.includes(achievement.id)) return;
        
        // 解锁成就
        unlockedAchievements.push(achievement.id);
        localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
        
        // 显示成就通知
        this.showFlowerAchievementNotification(achievement, flower);
    }

    showFlowerAchievementNotification(achievement, flower) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification flower-achievement';
        notification.innerHTML = `
            <div class="achievement-icon">🌸</div>
            <div class="achievement-content">
                <div class="achievement-title">花朵成就解锁！</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-flower">🌱 ${this.getFlowerIcon(flower.score)}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    // 通知系统
    initNotificationSystem() {
        // 请求通知权限
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // 监听重要事件
        this.socket.on('importantUpdate', (data) => {
            this.showSystemNotification(data.title, data.message);
        });
    }

    showSystemNotification(title, message) {
        // 浏览器通知
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico',
                tag: 'garden-notification'
            });
        }
        
        // 页面内通知
        this.showNotification(`${title}: ${message}`);
    }

    // PWA支持
    initPWA() {
        // 注册Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
        
        // 添加到主屏幕提示
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt();
        });
    }

    showInstallPrompt() {
        const installBanner = document.createElement('div');
        installBanner.className = 'install-banner';
        installBanner.innerHTML = `
            <div class="install-content">
                <span>📱 将花园管理系统添加到主屏幕</span>
                <button id="installBtn" class="install-btn">安装</button>
                <button id="dismissBtn" class="dismiss-btn">×</button>
            </div>
        `;
        
        document.body.appendChild(installBanner);
        
        document.getElementById('installBtn').addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    deferredPrompt = null;
                    document.body.removeChild(installBanner);
                });
            }
        });
        
        document.getElementById('dismissBtn').addEventListener('click', () => {
            document.body.removeChild(installBanner);
        });
    }

    // 离线功能
    initOfflineSupport() {
        // 缓存关键数据
        window.addEventListener('online', () => {
            this.showNotification('网络已连接');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('网络已断开，进入离线模式');
        });
    }

    syncOfflineData() {
        const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
        
        offlineActions.forEach(async (action) => {
            try {
                await fetch(action.url, action.options);
            } catch (error) {
                console.error('同步离线数据失败:', error);
            }
        });
        
        localStorage.removeItem('offlineActions');
    }

    // 显示注册模态框
    showRegisterModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="modal-header">
                <h3>注册新用户</h3>
                <button class="modal-close-btn" onclick="app.closeModal()">×</button>
            </div>
            <p class="register-info">注册后将成为普通用户，初始密码为 <strong>user123</strong></p>
            <form class="modal-form" onsubmit="app.registerUser(event)">
                <input type="text" id="newUsername" placeholder="请输入用户名" required minlength="3" maxlength="20">
                <div class="form-note">用户名长度3-20个字符</div>
                <div class="modal-buttons">
                    <button type="submit" class="primary-btn">注册用户</button>
                    <button type="button" class="secondary-btn" onclick="app.closeModal()">取消</button>
                </div>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';
    }
    
    // 显示修改密码模态框
    showChangePasswordModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="modal-header">
                <h3>修改密码</h3>
                <button class="modal-close-btn" onclick="app.closeModal()">×</button>
            </div>
            <form class="modal-form" onsubmit="app.changePassword(event)">
                <input type="password" id="oldPassword" placeholder="请输入原密码" required>
                <input type="password" id="newPassword" placeholder="请输入新密码" required minlength="6">
                <input type="password" id="confirmPassword" placeholder="再次输入新密码" required minlength="6">
                <div class="form-note">密码长度至少6个字符</div>
                <div class="modal-buttons">
                    <button type="submit" class="primary-btn">修改密码</button>
                    <button type="button" class="secondary-btn" onclick="app.closeModal()">取消</button>
                </div>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';
    }
    
    // 修改密码
    async changePassword(event) {
        event.preventDefault();
        
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        
        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.closeModal();
                alert('密码修改成功！');
            } else {
                alert(data.error || '修改密码失败');
            }
        } catch (error) {
            alert('修改密码失败，请检查网络连接');
        }
    }

    // 注册用户
    async registerUser(event) {
        event.preventDefault();
        
        const username = document.getElementById('newUsername').value.trim();
        
        if (username.length < 3 || username.length > 20) {
            alert('用户名长度必须在3-20个字符之间');
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (response.ok) {
                this.closeModal();
                alert(`用户 "${username}" 注册成功！\n初始密码：user123\n请使用新用户名和密码登录。`);
            } else {
                alert(data.error || '注册失败');
            }
        } catch (error) {
            alert('注册失败，请检查网络连接');
        }
    }

    // 查看花朵成就
    showFlowerAchievements(flowerId) {
        const flower = this.allFlowers.find(f => f.id === flowerId);
        if (!flower) return;
        
        const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const totalAchievements = this.achievementSystem ? 
            this.achievementSystem.achievements.flower.length : 6;
        const unlockedCount = unlockedAchievements.filter(id => 
            id.includes(`flower_${flowerId}_`)).length;
        const progress = Math.round((unlockedCount / totalAchievements) * 100);
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="achievement-modal-header">
                <h3>🏆 ${flower.name} 的成就</h3>
                <button class="modal-close-btn" onclick="app.closeModal()">×</button>
            </div>
            <div class="flower-achievement-display">
                <div class="flower-icon-large">${this.getFlowerIcon(flower.score)}</div>
                <div class="flower-info">
                    <div class="flower-score-large">${flower.score} 分</div>
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${unlockedCount}/${totalAchievements} 成就已解锁 (${progress}%)</div>
                    </div>
                </div>
            </div>
            <div class="achievements-list">
                ${this.getFlowerAchievementsList(flower, unlockedAchievements)}
            </div>
        `;
        document.getElementById('modal').style.display = 'block';
    }
    
    // 查看班级成就
    showClassAchievements() {
        if (!this.currentRankingClass) {
            alert('请先选择一个班级');
            return;
        }
        
        const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        const classAchievements = unlockedAchievements.filter(id => 
            id.includes(`class_${this.currentRankingClass}_`));
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="achievement-modal-header">
                <h3>🏆 班级荣誉成就</h3>
                <button class="modal-close-btn" onclick="app.closeModal()">×</button>
            </div>
            <div class="class-achievement-display">
                <div class="class-icon">🏫</div>
                <div class="class-info">
                    <div class="class-name">当前班级</div>
                    <div class="achievement-count">${classAchievements.length} 项荣誉</div>
                </div>
            </div>
            <div class="class-achievements-list">
                ${this.getClassAchievementsList(classAchievements)}
            </div>
        `;
        document.getElementById('modal').style.display = 'block';
    }
    
    getClassAchievementsList(unlockedAchievements) {
        if (this.achievementSystem) {
            // 获取当前班级统计数据
            const stats = {
                totalFlowers: this.allFlowers.length,
                totalGardens: this.allGardens.length,
                totalScore: [...this.allFlowers, ...this.allGardens].reduce((sum, item) => sum + item.score, 0),
                avgScore: (this.allFlowers.length + this.allGardens.length) > 0 ? 
                    [...this.allFlowers, ...this.allGardens].reduce((sum, item) => sum + item.score, 0) / (this.allFlowers.length + this.allGardens.length) : 0,
                highScoreCount: [...this.allFlowers, ...this.allGardens].filter(item => item.score >= 20).length
            };
            
            return this.achievementSystem.getAchievementsList('class', this.currentRankingClass, stats);
        }
        
        return '<p>成就系统未加载</p>';
    }

    getFlowerAchievementsList(flower, unlockedAchievements) {
        if (this.achievementSystem) {
            return this.achievementSystem.getAchievementsList('flower', flower.id, flower);
        }
        
        // 备用简单版本
        const basicAchievements = [
            { name: `${flower.name}的第一分`, icon: '🌱', unlocked: flower.score >= 1 },
            { name: `${flower.name}达到5分`, icon: '🌻', unlocked: flower.score >= 5 },
            { name: `${flower.name}达到10分`, icon: '🌼', unlocked: flower.score >= 10 },
            { name: `${flower.name}达到15分`, icon: '🌸', unlocked: flower.score >= 15 },
            { name: `${flower.name}达到20分`, icon: '🌺', unlocked: flower.score >= 20 },
            { name: `${flower.name}盛开了！`, icon: '🌹', unlocked: flower.score >= 25 }
        ];
        
        return basicAchievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon-small">${achievement.unlocked ? achievement.icon : '🔒'}</div>
                <div class="achievement-name-small">${achievement.name}</div>
                <div class="achievement-status">${achievement.unlocked ? '✅ 已解锁' : '🔒 未解锁'}</div>
            </div>
        `).join('');
    }
    
    // 移动端优化功能
    toggleFabMenu() {
        const menu = document.getElementById('fabMenu');
        menu.classList.toggle('show');
    }
    
    quickAddFlower() {
        this.toggleFabMenu();
        this.showAddFlowerModal();
    }
    
    quickAddGarden() {
        this.toggleFabMenu();
        this.showAddGardenModal();
    }
    
    quickWater() {
        this.toggleFabMenu();
        // 批量浇水最近的花朵
        const flowers = document.querySelectorAll('.water-btn');
        if (flowers.length > 0) {
            const onclickStr = flowers[0].getAttribute('onclick');
            const flowerId = onclickStr ? onclickStr.match(/\d+/)?.[0] : null;
            if (flowerId) {
                this.waterFlower(parseInt(flowerId));
            }
        }
    }
    
    // 性能优化 - 虚拟滚动
    renderVirtualFlowers() {
        const container = document.getElementById('flowersList');
        if (!container || this.filteredFlowers.length < 50) {
            this.renderFlowers();
            return;
        }
        
        const itemHeight = 200;
        const containerHeight = 600;
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        
        container.style.height = `${containerHeight}px`;
        container.style.overflow = 'auto';
        
        let startIndex = 0;
        const renderVisible = () => {
            const scrollTop = container.scrollTop;
            startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(startIndex + visibleCount + 5, this.filteredFlowers.length);
            
            container.innerHTML = '';
            for (let i = startIndex; i < endIndex; i++) {
                const flower = this.filteredFlowers[i];
                if (flower) {
                    const card = this.createFlowerCard(flower);
                    card.style.position = 'absolute';
                    card.style.top = `${i * itemHeight}px`;
                    card.style.width = '100%';
                    container.appendChild(card);
                }
            }
        };
        
        container.addEventListener('scroll', () => {
            requestAnimationFrame(renderVisible);
        });
        
        renderVisible();
    }
    
    // 图片懒加载
    lazyLoadImages() {
        if (!('IntersectionObserver' in window)) return;
        
        const images = document.querySelectorAll('img[data-src]');
        if (images.length === 0) return;
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// 初始化应用
const app = new GardenApp();

// 移动端性能优化
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('Service Worker registration failed');
    });
}

// 预加载关键资源
try {
    const preloadLinks = [
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
        'https://cdn.jsdelivr.net/npm/chart.js'
    ];
    
    preloadLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = href.includes('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
} catch (error) {
    console.log('Preload failed:', error);
}