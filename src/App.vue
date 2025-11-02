<template>
  <div id="app" 
       :data-theme="currentTheme"
       :class="{
         'platform-pc': currentPlatform === 'pc',
         'platform-mobile': currentPlatform === 'mobile',
         'platform-console': currentPlatform === 'console',
         'orientation-landscape': currentOrientation === 'landscape',
         'orientation-portrait': currentOrientation === 'portrait',
         'interaction-touch': interactionMode === 'touch',
         'interaction-pointer': interactionMode === 'pointer'
       }">
    <!-- 全局头部导航 -->
    <AppHeader 
      @toggle-theme="toggleTheme"
      v-model:searchQuery="searchQuery"
      @search="handleSearch"
    />

    <!-- 主内容区域 -->
    <el-main class="app-main orientation-responsive">
      <div class="container safe-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="keepAliveComponents">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </el-main>

    <!-- 全局页脚 -->
    <AppFooter />

    <!-- AI聊天组件 -->
    <AIChat 
      :visible="showAIChat" 
      @close="showAIChat = false"
    />
    
    <!-- 浮动AI助手按钮 -->
    <FloatingAIButton @toggle-ai-chat="toggleAIChat" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import AIChat from './components/AIChat.vue'
import FloatingAIButton from './components/FloatingAIButton.vue'
import deviceDetectionService from './services/DeviceDetectionService'

// 设备信息响应式状态
const currentPlatform = ref(deviceDetectionService.getCurrentPlatform())
const currentOrientation = ref(deviceDetectionService.getCurrentOrientation())
const interactionMode = ref(deviceDetectionService.getInteractionMode())
const keepAliveComponents = ref(['Home'])

// 监听设备变化
watch(() => deviceDetectionService.getCurrentPlatform(), (newPlatform) => {
  currentPlatform.value = newPlatform
  console.log('全局平台变化:', newPlatform)
  // 根据平台调整keep-alive策略
  if (newPlatform === 'mobile') {
    keepAliveComponents.value = ['Home', 'GameDetail', 'strategy-detail']
  } else {
    keepAliveComponents.value = ['Home']
  }
})

watch(() => deviceDetectionService.getCurrentOrientation(), (newOrientation) => {
  currentOrientation.value = newOrientation
  console.log('全局方向变化:', newOrientation)
})

watch(() => deviceDetectionService.getInteractionMode(), (newMode) => {
  interactionMode.value = newMode
  console.log('全局交互模式变化:', newMode)
})

const router = useRouter()
const showAIChat = ref(false)

const toggleAIChat = () => {
  showAIChat.value = !showAIChat.value
  // 记录用户使用过AI助手
  if (showAIChat.value) {
    localStorage.setItem('hasUsedAI', 'true')
  }
}
const searchQuery = ref('')
const currentTheme = ref('light')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', currentTheme.value)
  document.documentElement.setAttribute('data-theme', currentTheme.value)
}

onMounted(() => {
  // 从本地存储恢复主题设置
  const savedTheme = localStorage.getItem('theme') || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>

<style>
/* 导入主题和响应式样式 */
@import './styles/theme.css';
@import './styles/responsive.css';

#app {
  font-family: var(--font-family-primary), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-page);
  transition: background-color var(--transition-duration) var(--transition-function),
              color var(--transition-duration) var(--transition-function);
}

.app-main {
  flex: 1;
  min-height: calc(100vh - 140px);
  padding: 0;
  position: relative;
  transition: background-color var(--transition-duration) var(--transition-function);
}

/* 全局平台特定样式 */
.platform-pc .app-main {
  min-height: calc(100vh - 200px);
  padding: 40px 0;
}

.platform-mobile .app-main {
  min-height: calc(100vh - 150px);
  padding: 20px 0;
}

.platform-console .app-main {
  min-height: calc(100vh - 180px);
  padding: 30px 0;
}

/* 方向响应式样式 */
.orientation-landscape .app-main {
  padding: 30px 0;
}

.orientation-portrait .app-main {
  padding: 20px 0;
}

/* 全局动画优化 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 设备特定优化 */
.platform-mobile .el-button {
  min-height: 44px;
  font-size: 16px;
  padding: 12px 24px;
}

.platform-console .el-button {
  min-height: 40px;
  font-size: 18px;
  padding: 10px 20px;
}

.interaction-touch .el-link,
.interaction-touch .el-button {
  min-height: 44px;
  min-width: 44px;
}

/* 滚动条优化 */
.platform-pc ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.platform-pc ::-webkit-scrollbar-track {
  background: var(--bg-color-secondary);
}

.platform-pc ::-webkit-scrollbar-thumb {
  background: var(--text-color-secondary);
  border-radius: 4px;
}

.platform-pc ::-webkit-scrollbar-thumb:hover {
  background: var(--text-color-primary);
}

/* 全局滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--fill-color-light);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color-dark);
  border-radius: 4px;
  transition: background-color var(--transition-duration) var(--transition-function);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-color-darker);
}

/* 全局链接样式 */
a {
  color: var(--primary-color);
  transition: color var(--transition-duration) var(--transition-function), transform 0.2s ease;
  text-decoration: none;
}

a:hover {
  color: var(--primary-color);
  transform: translateY(-1px);
}

/* 全局按钮样式优化 */
.el-button {
  border-radius: 8px;
  transition: all var(--transition-duration) var(--transition-function);
}

.el-button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 全局样式重置 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family-primary);
  background-color: var(--bg-color-page);
  color: var(--text-color-primary);
  transition: background-color var(--transition-duration) var(--transition-function),
              color var(--transition-duration) var(--transition-function);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--fill-color-light);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color-dark);
  border-radius: 4px;
  transition: background-color var(--transition-duration) var(--transition-function);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-color-darker);
}

/* Element Plus 组件主题适配 */
.el-button {
  transition: all var(--transition-duration) var(--transition-function);
}

.el-card {
  background-color: var(--bg-color-card);
  border-color: var(--border-color);
  color: var(--text-color-primary);
  transition: all var(--transition-duration) var(--transition-function);
}

.el-input__inner {
  background-color: var(--bg-color);
  border-color: var(--border-color);
  color: var(--text-color-primary);
  transition: all var(--transition-duration) var(--transition-function);
}

.el-input__inner:focus {
  border-color: var(--primary-color);
}

.el-menu {
  background-color: var(--bg-color-card);
  border-color: var(--border-color);
}

.el-menu-item {
  color: var(--text-color-primary);
  transition: all var(--transition-duration) var(--transition-function);
}

.el-menu-item:hover {
  background-color: var(--fill-color);
}

.el-menu-item.is-active {
  color: var(--primary-color);
  background-color: var(--fill-color-light);
}

/* 响应式布局调整 */
@media (max-width: 767px) {
  .app-main {
    min-height: calc(100vh - 120px);
  }
}

/* 加载动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-duration) var(--transition-function);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all var(--transition-duration) var(--transition-function);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 深色主题全局样式 */
[data-theme="dark"] {
  background-color: #0a0a0a;
  color: #ffffff;
}

[data-theme="dark"] .el-card {
  background-color: #1a1a1a;
  border-color: #333;
}

[data-theme="dark"] .el-input__wrapper {
  background-color: #1a1a1a;
  border-color: #333;
}

[data-theme="dark"] .el-button {
  background-color: #1a1a1a;
  border-color: #333;
  color: #ffffff;
}

[data-theme="dark"] .el-menu {
  background-color: #1a1a1a;
}

[data-theme="dark"] .el-menu-item {
  color: #ffffff;
}

[data-theme="dark"] .el-menu-item:hover {
  background-color: #333;
}

/* 全局通知中心样式 - 确保显示在最顶层 */
.notification-container {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  z-index: 99999 !important;
  width: 380px !important;
  height: 100vh !important;
  max-height: 100vh !important;
  overflow: visible !important;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15) !important;
}

.notification-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  z-index: 99998 !important;
  pointer-events: auto !important;
}

.notification-sidebar {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  background-color: var(--bg-color-card, #ffffff) !important;
  color: var(--text-color-primary, #333333) !important;
  overflow-y: auto !important;
}

/* 深色主题通知中心样式 */
[data-theme="dark"] .notification-sidebar {
  background-color: var(--bg-color-card, #1a1a1a) !important;
  color: var(--text-color-primary, #ffffff) !important;
}

/* 移动设备适配 */
@media (max-width: 767px) {
  .notification-container {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
