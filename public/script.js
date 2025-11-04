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

        // 搜索功能
        document.getElementById('flowerSearch').addEventListener('input', (e) => {
            this.searchFlowers(e.target.value);
        });

        document.getElementById('gardenSearch').addEventListener('input', (e) => {
            this.searchGardens(e.target.value);
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

        // 初始化主题
        this.initTheme();
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
                const flowerElement = document.getElementById(`flower-${flowerId}`);
                if (flowerElement) {
                    flowerElement.classList.add('watered');
                    setTimeout(() => {
                        flowerElement.classList.remove('watered');
                    }, 800);
                }
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
                this.closeModal();
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
                    <h4>加分记录</h4>
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
            await Promise.all(promises);
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
            const flowerData = flowers.map(f => ({
                '花朵名称': f.name,
                '班级ID': f.class_id,
                '分数': f.score,
                '创建时间': new Date(f.created_at).toLocaleString()
            }));
            const flowerWs = XLSX.utils.json_to_sheet(flowerData);
            XLSX.utils.book_append_sheet(wb, flowerWs, '花朵数据');
            
            // 花田数据
            const gardenData = gardens.map(g => ({
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
            alert('导出失败');
        }
    }

    // 统计图表
    async loadStatsChart() {
        if (!this.currentRankingClass) return;
        
        try {
            const [flowersRes, gardensRes] = await Promise.all([
                fetch(`/api/flowers?classId=${this.currentRankingClass}`),
                fetch(`/api/gardens?classId=${this.currentRankingClass}`)
            ]);
            
            const flowers = await flowersRes.json();
            const gardens = await gardensRes.json();
            
            const ctx = document.getElementById('statsChart').getContext('2d');
            
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
            
            document.getElementById('chartContainer').style.display = 'block';
        } catch (error) {
            console.error('加载图表失败:', error);
        }
    }
}

// 初始化应用
const app = new GardenApp();