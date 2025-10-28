# Netlify 环境变量配置指南

## 必需的环境变量

在Netlify部署时，需要配置以下环境变量：

1. **VITE_API_BASE_URL**
   - 用于生产环境的API基础URL
   - 由于这是一个全栈应用，在Netlify上部署前端时，需要将此设置为后端API的完整URL
   - 如果后端也部署在Netlify上，请使用Netlify Functions URL或自定义域名

2. **VITE_SUPABASE_URL**
   - 已存在于.env文件中的Supabase URL
   - 请在Netlify环境变量中保持一致

3. **VITE_SUPABASE_ANON_KEY**
   - 已存在于.env文件中的Supabase匿名密钥
   - 请在Netlify环境变量中保持一致

## 配置步骤

1. 登录Netlify控制面板
2. 选择您的网站项目
3. 点击"Site settings"（网站设置）
4. 在左侧菜单中选择"Environment variables"（环境变量）
5. 点击"Add a variable"（添加变量）
6. 为每个变量输入名称和值
7. 确保"Deploy preview"和"Production"环境都包含这些变量

## 重要说明

- 环境变量更新后，需要重新部署网站才能生效
- 在生产环境中，API_BASE_URL应该指向实际的后端服务URL，而不是使用相对路径
- 如果您的后端与前端部署在不同的服务器上，请确保CORS配置正确
- 部署前请清除构建缓存，以确保新的环境变量被正确读取

## 故障排除

如果部署后游戏中心和攻略大全页面仍然显示空白，请检查：
1. 环境变量是否正确配置
2. 后端API是否正常运行
3. 浏览器控制台是否有API调用错误
4. 后端是否有示例数据（可以通过直接访问API端点检查）