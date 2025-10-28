<template>
  <div id="app" :data-theme="currentTheme">
    <!-- 全局头部导航 -->
    <AppHeader 
      @toggle-theme="toggleTheme"
      v-model:searchQuery="searchQuery"
      @search="handleSearch"
    />

    <!-- 主内容区域 -->
    <el-main class="app-main">
      <router-view />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import AIChat from './components/AIChat.vue'
import FloatingAIButton from './components/FloatingAIButton.vue'

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
  background-color: var(--bg-color-page);
  color: var(--text-color-primary);
  min-height: 100vh;
  font-family: var(--font-family-primary);
  transition: background-color var(--transition-duration) var(--transition-function),
              color var(--transition-duration) var(--transition-function);
}

.app-main {
  background-color: var(--bg-color-page);
  min-height: calc(100vh - 140px);
  padding: 0;
  transition: background-color var(--transition-duration) var(--transition-function);
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
</style>
