<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo 和品牌 -->
      <div class="header-brand" @click="goHome">
        <div class="logo">
          <el-icon size="32"><Trophy /></el-icon>
        </div>
        <div class="brand-text">
          <h1 class="brand-title">游戏攻略站</h1>
          <p class="brand-subtitle">Game Strategy Hub</p>
        </div>
      </div>

      <!-- 主导航菜单 -->
      <nav class="header-nav">
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          background-color="transparent"
          text-color="#ffffff"
          active-text-color="#00d4ff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/games">
            <el-icon><Grid /></el-icon>
            <span>游戏中心</span>
          </el-menu-item>
          <el-menu-item index="/strategies">
            <el-icon><Document /></el-icon>
            <span>攻略大全</span>
          </el-menu-item>
        </el-menu>
      </nav>

      <!-- 搜索框 -->
      <div class="header-search">
        <SearchBox />
      </div>

      <!-- 用户操作区 -->
      <div class="header-actions">
        <!-- 主题切换 -->
        <el-tooltip content="切换主题" placement="bottom">
          <el-button 
            circle 
            :icon="isDark ? Sunny : Moon" 
            @click="toggleTheme"
            class="theme-toggle"
          />
        </el-tooltip>

        <!-- 通知 -->
        <el-badge :value="notificationCount" :hidden="notificationCount === 0">
          <el-tooltip content="通知" placement="bottom">
            <el-button 
              circle 
              :icon="Bell" 
              @click="showNotifications"
              class="notification-btn"
            />
          </el-tooltip>
        </el-badge>

        <!-- 用户菜单 -->
        <el-dropdown @command="handleUserCommand" trigger="click">
          <div class="user-avatar">
            <el-avatar 
              :size="36" 
              :src="userInfo?.avatar" 
              :icon="UserFilled"
            />
            <span v-if="userInfo" class="username">{{ userInfo.username }}</span>
            <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="!isLoggedIn" command="login">
              <el-icon><User /></el-icon>
              登录
            </el-dropdown-item>
            <el-dropdown-item v-if="!isLoggedIn" command="register">
              <el-icon><UserFilled /></el-icon>
              注册
            </el-dropdown-item>
              <template v-if="isLoggedIn">
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><Star /></el-icon>
                  我的收藏
                </el-dropdown-item>
                <el-dropdown-item command="history">
                  <el-icon><Clock /></el-icon>
                  浏览历史
                </el-dropdown-item>
                <el-dropdown-item divided command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 移动端菜单按钮 -->
        <el-button 
          v-if="isMobile"
          circle 
          :icon="Menu" 
          @click="toggleMobileMenu"
          class="mobile-menu-btn"
        />
      </div>
    </div>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="showMobileMenu"
      title="导航菜单"
      direction="rtl"
      size="280px"
      :with-header="false"
    >
      <div class="mobile-menu">
        <div class="mobile-brand">
          <div class="logo">
            <el-icon size="24"><Trophy /></el-icon>
          </div>
          <div class="brand-text">
            <h2>游戏攻略站</h2>
          </div>
        </div>

        <el-menu
          :default-active="activeMenu"
          @select="handleMobileMenuSelect"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/games">
            <el-icon><Grid /></el-icon>
            <span>游戏中心</span>
          </el-menu-item>
          <el-menu-item index="/strategies">
            <el-icon><Document /></el-icon>
            <span>攻略大全</span>
          </el-menu-item>
          <el-menu-item index="/ai-chat">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI助手</span>
          </el-menu-item>
        </el-menu>

        <div class="mobile-user-section">
          <div v-if="isLoggedIn" class="mobile-user-info">
            <el-avatar :size="48" :src="userInfo?.avatar" :icon="UserFilled" />
            <div class="user-details">
              <p class="username">{{ userInfo.username }}</p>
              <p class="user-email">{{ userInfo.email }}</p>
            </div>
          </div>
          
          <div class="mobile-actions">
            <el-button v-if="!isLoggedIn" type="primary" @click="handleUserCommand('login')">
              登录
            </el-button>
            <el-button v-if="!isLoggedIn" @click="handleUserCommand('register')">
              注册
            </el-button>
            <template v-if="isLoggedIn">
              <el-button @click="handleUserCommand('profile')">个人中心</el-button>
              <el-button @click="handleUserCommand('settings')">设置</el-button>
              <el-button type="danger" @click="handleUserCommand('logout')">退出</el-button>
            </template>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 通知抽屉 -->
    <el-drawer
      v-model="showNotificationDrawer"
      title="通知中心"
      direction="rtl"
      size="320px"
    >
      <div class="notification-list">
        <div v-if="notifications.length === 0" class="no-notifications">
          <el-empty description="暂无通知" />
        </div>
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <el-icon :color="getNotificationColor(notification.type)">
              <component :is="getNotificationIcon(notification.type)" />
            </el-icon>
          </div>
          <div class="notification-content">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-message">{{ notification.message }}</p>
            <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
          </div>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import SearchBox from './SearchBox.vue'
import {
  Trophy,
  House,
  Grid,
  Document,
  ChatDotRound,
  Bell,
  User,
  UserFilled,
  Star,
  Clock,
  Setting,
  SwitchButton,
  ArrowDown,
  Menu,
  Sunny,
  Moon,
  InfoFilled,
  WarningFilled,
  SuccessFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 定义事件
const emit = defineEmits(['toggle-theme', 'toggle-ai-chat'])

// 响应式数据
const isDark = ref(false)
const isMobile = ref(false)
const showMobileMenu = ref(false)
const showNotificationDrawer = ref(false)
const notifications = ref([
  {
    id: 1,
    type: 'info',
    title: '新攻略发布',
    message: '《原神》4.3版本攻略已更新',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30) // 30分钟前
  },
  {
    id: 2,
    type: 'success',
    title: '收藏提醒',
    message: '您收藏的攻略有新的更新',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2小时前
  },
  {
    id: 3,
    type: 'warning',
    title: '系统维护',
    message: '系统将于今晚进行维护升级',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1天前
  }
])

// 计算属性
const activeMenu = computed(() => route.path)
const userInfo = computed(() => userStore.user)
const isLoggedIn = computed(() => userStore.isAuthenticated)

const notificationCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

// 方法
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const handleResize = () => {
  checkMobile()
  if (!isMobile.value) {
    showMobileMenu.value = false
  }
}

const goHome = () => {
  router.push('/')
}

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleMobileMenuSelect = (index) => {
  router.push(index)
  showMobileMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  ElMessage.success(`已切换到${isDark.value ? '深色' : '浅色'}主题`)
  // 发出主题切换事件给父组件
  emit('toggle-theme')
}

const showNotifications = () => {
  showNotificationDrawer.value = true
}

const handleUserCommand = (command) => {
  switch (command) {
    case 'login':
      router.push('/login')
      break
    case 'register':
      router.push('/register')
      break
    case 'profile':
      router.push('/profile')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'history':
      router.push('/history')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  } catch (error) {
    ElMessage.error('退出登录失败')
  }
}

const markAsRead = (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    info: InfoFilled,
    success: SuccessFilled,
    warning: WarningFilled,
    error: WarningFilled
  }
  return icons[type] || InfoFilled
}

const getNotificationColor = (type) => {
  const colors = {
    info: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    error: '#f56c6c'
  }
  return colors[type] || '#409eff'
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  isDark.value = savedTheme === 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
}

// 生命周期
onMounted(() => {
  checkMobile()
  loadTheme()
  // 初始化用户状态
  userStore.initializeAuth()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 70px;
  gap: 20px;
}

/* 品牌区域 */
.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s;
  flex-shrink: 0;
}

.header-brand:hover {
  transform: scale(1.05);
}

.logo {
  color: #00d4ff;
  display: flex;
  align-items: center;
}

.brand-text {
  color: white;
}

.brand-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.brand-subtitle {
  font-size: 11px;
  opacity: 0.8;
  margin: 0;
  line-height: 1;
  font-weight: 300;
  letter-spacing: 1px;
}

/* 导航菜单 */
.header-nav {
  flex: 1;
  max-width: 400px;
}

.header-nav :deep(.el-menu) {
  border-bottom: none;
}

.header-nav :deep(.el-menu-item) {
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.header-nav :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  border-bottom-color: #00d4ff;
}

.header-nav :deep(.el-menu-item.is-active) {
  background-color: rgba(0, 212, 255, 0.2);
  border-bottom-color: #00d4ff;
}

/* 搜索框 */
.header-search {
  flex: 1;
  max-width: 300px;
  min-width: 200px;
}

/* 用户操作区 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.theme-toggle,
.notification-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s;
}

.theme-toggle:hover,
.notification-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 0.2);
}

.username {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.dropdown-icon {
  color: white;
  font-size: 12px;
}

.mobile-menu-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

/* 移动端菜单 */
.mobile-menu {
  padding: 20px;
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
}

.mobile-brand .logo {
  color: #667eea;
}

.mobile-brand h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.mobile-user-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.user-details {
  flex: 1;
}

.user-details .username {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.user-details .user-email {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 通知列表 */
.notification-list {
  padding: 0;
}

.no-notifications {
  padding: 40px 20px;
  text-align: center;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread {
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.notification-message {
  font-size: 13px;
  color: #606266;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: 60px;
  }
  
  .header-nav {
    display: none;
  }
  
  .header-search {
    max-width: 200px;
    min-width: 150px;
  }
  
  .brand-title {
    font-size: 16px;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-search {
    display: none;
  }
  
  .header-actions {
    gap: 8px;
  }
}

/* 深色主题 */
:global(.dark) .mobile-menu {
  background-color: #1a1a1a;
  color: white;
}

:global(.dark) .mobile-brand {
  border-bottom-color: #333;
}

:global(.dark) .mobile-brand h2 {
  color: white;
}

:global(.dark) .mobile-user-section {
  border-top-color: #333;
}

:global(.dark) .user-details .username {
  color: white;
}

:global(.dark) .notification-item {
  border-bottom-color: #333;
}

:global(.dark) .notification-item:hover {
  background-color: #2a2a2a;
}

:global(.dark) .notification-title {
  color: white;
}

:global(.dark) .notification-message {
  color: #ccc;
}
</style>