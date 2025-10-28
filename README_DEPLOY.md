# 部署和验证指南

## 项目准备状态

✅ 项目已成功构建（`npm run build`）
✅ Git仓库已初始化并提交
✅ Supabase环境变量已配置
✅ Netlify配置文件已创建

## GitHub仓库设置（用户操作）

1. 登录GitHub，创建一个新的空仓库
2. 在本地项目中添加远程仓库：
   ```bash
   git remote add origin <GitHub仓库URL>
   git branch -M main
   git push -u origin main
   ```

## Netlify部署步骤（用户操作）

1. 登录[Netlify](https://app.netlify.com/)
2. 点击"Add new site" > "Import an existing project"
3. 选择"GitHub"，并授权访问你的GitHub仓库
4. 选择刚才创建的仓库
5. 配置构建设置：
   - 构建命令：`npm run build` （已在netlify.toml中配置）
   - 发布目录：`dist` （已在netlify.toml中配置）
6. 点击"Show advanced" > "Add environment variable"添加以下环境变量：
   - `VITE_SUPABASE_URL`: 从.env文件获取
   - `VITE_SUPABASE_ANON_KEY`: 从.env文件获取
7. 点击"Deploy site"开始部署

## 功能验证（部署后）

部署完成后，通过以下步骤验证项目功能：

1. **访问主页**：检查页面加载是否正常
2. **导航测试**：验证各个路由是否可以正常访问
3. **用户功能**：测试登录、注册功能
4. **数据交互**：测试与Supabase数据库的交互功能（如添加游戏、发布攻略等）
5. **响应式测试**：在不同设备尺寸下验证UI显示

## 常见问题排查

1. **构建失败**：检查Netlify日志，确认构建命令和环境变量配置正确
2. **Supabase连接问题**：验证环境变量是否正确设置，确认Supabase项目权限设置
3. **路由问题**：netlify.toml中已配置重定向规则，确保单页应用路由正常工作
4. **CORS错误**：在Supabase控制台中配置正确的CORS设置

## 性能优化建议

1. **代码分割**：考虑使用动态导入减少初始加载时间
2. **图片优化**：压缩和优化静态资源
3. **缓存策略**：配置适当的缓存头

完成以上步骤后，您的Vue + Supabase应用将成功部署到Netlify并正常运行。