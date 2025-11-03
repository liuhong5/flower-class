# 部署步骤

## 1. 后端部署到 Vercel

1. 注册 [Vercel](https://vercel.com) 账号
2. 连接 GitHub 仓库
3. 在 Vercel 项目设置中添加环境变量：
   - `SUPABASE_URL`: 您的 Supabase URL
   - `SUPABASE_ANON_KEY`: 您的 Supabase 匿名密钥
4. 部署完成后获得域名，如：`https://your-app-name.vercel.app`

## 2. 更新前端配置

修改 `public/config.js` 中的生产环境配置：
```javascript
production: {
    baseURL: 'https://your-actual-vercel-domain.vercel.app',
    socketURL: 'https://your-actual-vercel-domain.vercel.app'
}
```

## 3. 前端部署到 GitHub Pages

1. 将 `public` 文件夹内容推送到 GitHub 仓库的 `gh-pages` 分支
2. 在 GitHub 仓库设置中启用 Pages
3. 选择 `gh-pages` 分支作为源
4. 获得 GitHub Pages 地址：`https://username.github.io/repository-name`

## 4. 国内访问优化

- Vercel 在国内访问速度较好
- GitHub Pages 在国内可能需要科学上网
- 建议使用 Vercel 同时部署前后端

## 5. 一键部署命令

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到 Vercel
vercel --prod
```

部署完成后，国内用户可以通过 Vercel 域名实时共享数据！