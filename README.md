# 云端花园管理系统

一个基于 Node.js + Supabase 的实时花园管理系统，支持多用户协作和实时数据同步。

## 🌟 最新更新

### v2.0 功能增强版
- ✅ 虚拟滚动优化 - 大数据量性能提升
- ✅ 离线功能完善 - 断网也能正常使用
- ✅ 输入验证加强 - 实时验证用户输入
- ✅ 实时统计增强 - 多维度数据分析
- ✅ 预测分析 - AI驱动的趋势预测
- ✅ 自适应布局 - 智能响应式设计
- ✅ 微交互增强 - 流畅的用户体验
- ✅ 模块化重构 - 清晰的代码架构
- ✅ 错误处理完善 - 友好的错误提示
- ✅ 社交功能增强 - 评论点赞分享
- ✅ AI助手集成 - 智能建议和分析
- ✅ 推送通知系统 - 实时消息推送

## 功能特性

### 🌱 核心功能
- **用户权限管理**: 编辑员和普通用户两种角色
- **班级管理**: 创建和管理不同班级
- **花朵管理**: 添加、删除花朵，给花朵浇水加分
- **花田管理**: 创建花田，给花田整体加分
- **实时排行榜**: 花朵和花田分别排名
- **浇水动画**: 美观的浇水生长动画效果
- **实时同步**: 所有用户实时看到数据变化

### 🚀 增强功能
- **成就系统**: 50+种成就，激励学生成长
- **预测分析**: 基于历史数据的趋势预测
- **社交互动**: 评论、点赞、分享功能
- **AI助手**: 智能建议和表现分析
- **推送通知**: 重要事件实时提醒
- **离线支持**: 断网状态下正常使用
- **虚拟滚动**: 大数据量流畅显示

### 📱 移动端优化
- **响应式设计**: 完美适配手机和平板
- **触摸优化**: 44px最小触摸目标
- **底部导航**: 移动端专用导航
- **浮动按钮**: 快速操作入口
- **下拉刷新**: 移动端刷新体验

## 技术栈

- **后端**: Node.js + Express
- **数据库**: Supabase (PostgreSQL)
- **实时通信**: Socket.IO
- **前端**: 原生 JavaScript + CSS3
- **认证**: JWT Token
- **推送**: Web Push API + Service Worker
- **部署**: 支持多种云平台

## 快速开始

### 1. 环境准备
```bash
# 克隆项目
git clone https://github.com/your-username/garden-management.git
cd garden-management

# 安装依赖
npm install
```

### 2. 配置数据库
1. 创建 Supabase 项目
2. 执行 `supabase-setup.sql` 初始化数据库
3. 配置环境变量

### 3. 启动项目
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 项目结构

```
并行花朵/
├── public/                    # 前端文件
│   ├── index.html            # 主页面
│   ├── styles.css            # 样式文件
│   ├── script.js             # 主要逻辑
│   ├── achievements-system.js # 成就系统
│   ├── garden-enhancements.js # 功能增强
│   ├── push-notifications.js  # 推送通知
│   ├── mobile-optimize.js     # 移动端优化
│   └── sw.js                 # Service Worker
├── server.js                 # 服务器主文件
├── package.json              # 项目配置
├── supabase-setup.sql        # 数据库初始化
├── ENHANCEMENTS.md           # 功能增强说明
└── README.md                 # 项目说明
```

## 使用说明

### 账号类型
- **编辑员**: 由系统管理员分配，拥有完整管理权限
- **普通用户**: 可自行注册，初始密码 `user123`

### 主要功能

#### 班级管理
- 创建和删除班级
- 批量操作支持
- 班级统计分析

#### 花朵管理
- 添加学生花朵
- 浇水加分（+1分）
- 成就系统激励
- 预测分析

#### 花田管理
- 创建主题花田
- 添加花朵到花田
- 花田整体加分
- 协作管理

#### 排行榜系统
- 实时排名更新
- 多维度统计
- 图表可视化
- 数据导出

## 成就系统

### 花朵成就 (25种)
- 基础成就: 初露锋芒、小苗成长、茁壮成长
- 成长成就: 向阳花开、含苞待放、花开绽放
- 绽放成就: 美丽盛开、花中之王、花束之美
- 时间成就: 早起的鸟儿、晨光初现、夜猫子
- 连续成就: 连续进步、势如破竹、火箭速度
- 季节成就: 春天的花朵、夏日阳光、秋收硕果
- 创意成就: 创意之星、灵感闪现、彩虹之花
- 团队成就: 团队合作、集体荣誉、团队之星
- 坚持成就: 坚持不懈、目标达成、攀登高峰

### 花田成就 (25种)
- 基础到传奇: 从花田初建到传奇花园
- 效率成就: 高效花田、超级效率、闪电速度
- 创新成就: 创新花田、实验先锋、精准策略
- 环保成就: 绿色花田、可持续发展、生态卫士
- 美学成就: 美丽花田、艺术花园、建筑大师
- 社区成就: 社区花田、合作典范、社区之光

### 班级成就 (20种)
- 参与度成就: 活跃班级、热闹班级、超级活跃
- 文化成就: 书香班级、文艺班级、活力班级
- 创新成就: 创新班级、智慧班级、科研班级
- 团结成就: 团结班级、凝聚力强、众星捧月
- 特色成就: 特色班级、多彩班级、明星班级

## AI助手功能

### 智能建议
- 个性化成长建议
- 学习策略推荐
- 目标设定指导

### 表现分析
- 多维度数据分析
- 优势劣势识别
- 改进方案建议

### 趋势预测
- 分数趋势预测
- 成就解锁概率
- 排名变化预测

## 推送通知

### 通知类型
- 🌱 浇水成功通知
- 🏆 成就解锁提醒
- 🌿 花田加分通知
- 📊 排名更新提醒
- ⏰ 每日活动提醒

### 推送方式
- 浏览器原生通知
- Web Push API
- Service Worker支持
- 离线消息缓存

## 部署指南

### Vercel 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### Railway 部署
1. 连接 GitHub 仓库
2. 设置环境变量
3. 自动部署

### 自托管部署
```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 环境变量

```env
# Supabase 配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT 密钥
JWT_SECRET=your_jwt_secret

# 推送通知
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 支持与反馈

- 📧 邮箱: support@garden-system.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-username/garden-management/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/your-username/garden-management/discussions)

---

🌸 **享受您的云端花园管理体验！**

> 让每一朵花都能在数字花园中绽放光彩 ✨