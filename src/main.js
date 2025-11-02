import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { testApiConnection } from './lib/api'
import deviceDetectionService from './services/DeviceDetectionService'

import './style.css'
import './styles/theme.css'

// 注册PWA Service Worker（如插件存在则启用）
try {
  const { registerSW } = await import('virtual:pwa-register')
  registerSW({ immediate: true })
  console.log('PWA Service Worker 已注册')
} catch (e) {
  // 在开发或未安装插件情况下忽略错误
  console.log('PWA未启用或开发环境下跳过注册')
}

// 应用启动时执行API连接测试
console.log('===== 应用启动，开始API连接测试 =====');
testApiConnection().then(result => {
  console.log('API连接测试成功:', result);
}).catch(error => {
  console.error('API连接测试失败:', error);
});

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

app.mount('#app')
