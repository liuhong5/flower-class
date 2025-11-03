# 云端花园管理系统

一个基于 Node.js + Supabase 的实时花园管理系统，支持多用户协作和实时数据同步。

## 功能特性

- 🌱 **用户权限管理**: 编辑员和普通用户两种角色
- 🏫 **班级管理**: 创建和管理不同班级
- 🌸 **花朵管理**: 添加、删除花朵，给花朵浇水加分
- 🌿 **花田管理**: 创建花田，给花田整体加分
- 🏆 **实时排行榜**: 花朵和花田分别排名
- 💧 **浇水动画**: 美观的浇水生长动画效果
- 🔄 **实时同步**: 所有用户实时看到数据变化
- 📱 **响应式设计**: 支持手机和电脑访问

## 账号信息

- **编辑员**: 用户名 ******* 密码 ******
- **普通用户**: 用户名 `user`, 密码 `user123`

## 部署步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 注册账号并创建新项目
3. 在项目设置中找到 API 配置信息

### 2. 配置数据库

1. 在 Supabase 项目的 SQL Editor 中执行 `supabase-setup.sql` 文件中的所有 SQL 语句
2. 这将创建所需的表结构和示例数据

### 3. 配置环境变量

在 `server.js` 文件中修改以下配置：

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';  // 替换为您的 Supabase URL
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';  // 替换为您的 Supabase 匿名密钥
```

### 4. 安装依赖并启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或启动生产服务器
npm start
```

### 5. 云端部署选项

#### 选项 A: Vercel 部署
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置环境变量
4. 部署完成

#### 选项 B: Railway 部署
1. 访问 [Railway](https://railway.app)
2. 连接 GitHub 仓库
3. 设置环境变量
4. 自动部署

#### 选项 C: Heroku 部署
1. 安装 Heroku CLI
2. 创建 Heroku 应用
3. 设置环境变量
4. 推送代码部署

## 使用说明

### 编辑员功能
- 创建和管理班级
- 添加和删除花朵
- 给花朵浇水（加1分）
- 创建和删除花田
- 给花田加分
- 查看所有数据和排行榜

### 普通用户功能
- 查看所有班级、花朵、花田信息
- 查看实时排行榜
- 观看浇水动画效果

## 技术栈

- **后端**: Node.js + Express
- **数据库**: Supabase (PostgreSQL)
- **实时通信**: Socket.IO
- **前端**: 原生 JavaScript + CSS3
- **认证**: JWT Token
- **部署**: 支持多种云平台

## 项目结构

```
并行花朵/
├── server.js              # 服务器主文件
├── package.json           # 项目配置
├── supabase-setup.sql     # 数据库初始化脚本
├── README.md             # 项目说明
└── public/               # 前端文件
    ├── index.html        # 主页面
    ├── styles.css        # 样式文件
    └── script.js         # 前端逻辑
```

## 注意事项

1. 确保 Supabase 项目的 RLS (Row Level Security) 已正确配置
2. 在生产环境中请修改 JWT_SECRET 为更安全的密钥
3. 建议启用 HTTPS 以确保数据传输安全
4. 定期备份 Supabase 数据库数据

## 支持与反馈

如有问题或建议，请通过以下方式联系：
- 创建 GitHub Issue
- 发送邮件反馈

---

🌸 享受您的云端花园管理体验！