# Netlify 部署指南

恭喜！您的项目代码已成功推送到 GitHub 仓库。现在您需要在 Netlify 上连接此仓库并完成部署。请按照以下步骤操作：

## 1. 访问 Netlify 并登录

- 打开浏览器，访问 [Netlify](https://app.netlify.com/)
- 使用您的 GitHub 账号登录（推荐，以便轻松连接仓库）

## 2. 连接 GitHub 仓库

- 登录后，点击右上角的 "Add new site" → "Import an existing project"
- 选择 "GitHub" 作为您的 git 提供商
- 如果这是您首次连接 GitHub，您需要授权 Netlify 访问您的 GitHub 账户
- 搜索并选择仓库：`jinyouyuan512/game`

## 3. 配置构建设置

Netlify 应该会自动检测到您的项目设置（因为我们已经创建了 `netlify.toml` 文件），但请确认以下设置：

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js version**: 18 (或更高版本)

## 4. 设置环境变量

在 "Environment variables" 部分，添加以下环境变量（与您在 `.env` 文件中设置的相同）：

- `VITE_SUPABASE_URL`: 您的 Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY`: 您的 Supabase 项目匿名密钥

## 5. 部署站点

- 点击 "Deploy site" 按钮开始部署过程
- Netlify 将会开始构建和部署您的站点
- 部署完成后，您将获得一个 Netlify 子域名（例如：your-site-name.netlify.app）

## 6. 验证部署

部署完成后，请访问生成的 URL 验证站点是否正常运行。您应该能够：

- 访问网站首页
- 浏览游戏列表
- 查看游戏详情
- 使用搜索功能

## 7. 自定义域名（可选）

如果您有自己的域名，可以在 Netlify 站点设置中添加自定义域名并配置 DNS。

## 8. 部署自动化

Netlify 会自动监控您的 GitHub 仓库。每当您推送到 `master` 分支时，Netlify 会自动触发新的构建和部署。

## 遇到问题？

如果在部署过程中遇到问题，请查看 Netlify 的构建日志以获取详细错误信息。常见问题包括：

- 环境变量设置不正确
- 依赖项安装失败
- 构建命令错误

请参考项目根目录下的 `README_DEPLOY.md` 文件获取更多部署和验证信息。