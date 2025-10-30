import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { testApiConnection } from './lib/api'

import './style.css'

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
