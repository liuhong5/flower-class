# Railway 部署步骤

## 🚀 快速部署

### 1. 准备代码
```bash
# 推送到 GitHub
git init
git add .
git commit -m "Railway部署"
git remote add origin https://github.com/liuhong5/flower-class.git
git push -u origin main
```

### 2. Railway 部署
1. 访问 [railway.app](https://railway.app)
2. 用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择您的仓库

### 3. 配置环境变量
在 Railway 项目设置中添加：
- `SUPABASE_URL`: 您的 Supabase URL
- `SUPABASE_ANON_KEY`: 您的 Supabase 匿名密钥
- `NODE_ENV`: production

### 4. 获取域名
- 部署完成后获得域名：`https://your-app.up.railway.app`
- 复制这个域名

### 5. 更新前端配置
修改 `public/config.js`：
```javascript
production: {
    baseURL: 'https://你的实际域名.up.railway.app',
    socketURL: 'https://你的实际域名.up.railway.app'
}
```

### 6. 重新部署
```bash
git add .
git commit -m "更新域名配置"
git push
```

## 🌐 访问地址
部署完成后，国内用户可以通过 Railway 域名访问：
- 电脑：`https://your-app.up.railway.app`
- 手机：`https://your-app.up.railway.app`

## 💡 优势
- ✅ 国内访问速度好
- ✅ 免费额度充足
- ✅ 自动HTTPS
- ✅ 支持实时数据同步
- ✅ 自动重启和监控

## 🔧 故障排除
如果部署失败：
1. 检查 `package.json` 中的 `start` 脚本
2. 确认环境变量设置正确
3. 查看 Railway 部署日志