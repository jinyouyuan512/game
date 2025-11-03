<template>
  <header class="app-header" :class="{ 'scrolled': isScrolled }">
    <div class="header-container">
      <!-- Logo 和品牌 -->
      <div class="header-brand animate-fade-in" @click.stop="goHome">
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
          class="main-menu"
        >
          <el-menu-item index="/" class="menu-item">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/games" class="menu-item">
            <el-icon><Grid /></el-icon>
            <span>游戏中心</span>
          </el-menu-item>
          <el-sub-menu index="/community" class="menu-item">
            <template #title>
              <el-icon><ChatDotRound /></el-icon>
              <span>社区与社交</span>
            </template>
            <el-menu-item index="/community">
              <el-icon><ChatRound /></el-icon>
              <span>游戏社区</span>
            </el-menu-item>
            <el-menu-item index="/friends">
              <el-icon><User /></el-icon>
              <span>好友系统</span>
            </el-menu-item>
            <el-menu-item index="/add-strategy" v-if="isLoggedIn">
              <el-icon><DocumentAdd /></el-icon>
              <span>提交攻略</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </nav>

      <!-- 搜索框 -->
      <div class="header-search">
        <el-input
          v-model="searchQuery"
          placeholder="搜索游戏或攻略..."
          prefix-icon="el-icon-search"
          @keyup.enter="handleSearch"
          size="small"
          clearable
          class="search-input"
        >
          <template #append>
            <el-button @click="handleSearch" size="small" type="primary" icon="el-icon-search" class="search-btn"></el-button>
          </template>
        </el-input>
      </div>

      <!-- 用户操作区 -->
      <div class="header-actions">
        <!-- 主题切换 -->
        <el-tooltip content="切换主题" placement="bottom">
          <el-button 
            circle 
            :icon="isDark ? Sunny : Moon" 
            @click="toggleTheme"
            class="theme-toggle action-button"
          />
        </el-tooltip>

        <!-- 通知 -->
      <el-badge :value="notificationCount" :hidden="notificationCount === 0" class="badge-animation">
        <el-tooltip content="通知" placement="bottom">
          <el-button 
            circle 
            :icon="Bell" 
            @click="showNotifications"
            class="notification-btn action-button"
          />
        </el-tooltip>
      </el-badge>
      
      <!-- 移动端搜索按钮 -->
      <el-tooltip content="搜索" placement="bottom">
        <el-button 
          circle 
          :icon="Search" 
          @click="openMobileSearch"
          class="mobile-search-btn action-button"
        />
      </el-tooltip>
      


        <!-- 用户菜单 - 优化导航栏整合 -->
        <el-dropdown @command="handleUserCommand" trigger="click" class="user-dropdown integrated-user-menu">
          <div class="user-avatar" @click.stop>
            <el-avatar 
              :size="36" 
              :src="userInfo?.avatar" 
              :icon="UserFilled"
              class="user-avatar-image"
            />
            <span v-if="userInfo" class="username">{{ userInfo.username }}</span>
            <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="user-dropdown-menu modern-dropdown-menu">
              <el-dropdown-item v-if="!isLoggedIn" command="login">
                <el-icon><User /></el-icon>
                <span>登录</span>
              </el-dropdown-item>
              <el-dropdown-item v-if="!isLoggedIn" command="register">
                <el-icon><UserFilled /></el-icon>
                <span>注册</span>
              </el-dropdown-item>
              <template v-if="isLoggedIn">
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><Star /></el-icon>
                  <span>我的收藏</span>
                </el-dropdown-item>
                <el-dropdown-item command="history">
                  <el-icon><Clock /></el-icon>
                  <span>浏览历史</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="settings">
                  <el-icon><Setting /></el-icon>
                  <span>设置</span>
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 移动端菜单按钮 -->
        <el-button 
          circle 
          :icon="Menu" 
          @click="toggleMobileMenu"
          class="mobile-menu-btn action-button"
        />
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="header-decorations">
      <div class="decoration-circle decoration-1"></div>
      <div class="decoration-circle decoration-2"></div>
      <div class="decoration-circle decoration-3"></div>
    </div>

    <!-- 移动端抽屉菜单 - 改进版支持全屏/半屏和分类 -->
    <el-drawer
      v-model="showMobileMenu"
      direction="ltr"
      :size="menuDrawerSize"
      :with-header="false"
      :custom-class="['mobile-drawer', { 'full-screen': isFullScreenMenu }]"
      @close="handleMenuClose"
      @open="handleMenuOpen"
      append-to-body
    >
      <div class="mobile-menu" style="display: flex; flex-direction: column; height: 100%;">
        <!-- 移动端品牌区域 -->
        <div class="mobile-brand enhanced-brand" @click.stop="goHome">
          <div class="logo">
            <el-icon size="24"><Trophy /></el-icon>
          </div>
          <div class="brand-text">
            <h2>游戏攻略站</h2>
          </div>
          <!-- 菜单尺寸切换按钮 -->
          <el-button 
            class="menu-size-toggle"
            size="small"
            circle
            @click.stop="toggleMenuSize"
            title="切换菜单大小"
          >
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>

        <!-- 分类展示的移动端导航菜单 -->
        <div class="mobile-menu-sections">
          <!-- 主要功能分类 -->
          <div class="mobile-menu-section">
            <h3 class="menu-section-title">主要功能</h3>
            <el-menu
              :default-active="activeMenu"
              @select="handleMobileMenuSelect"
              class="mobile-el-menu category-menu"
              background-color="transparent"
              text-color="white"
              active-text-color="#00d4ff"
            >
              <el-menu-item index="/" @click="handleMobileMenuSelect('/')">
                <el-icon><House /></el-icon>
                <span>首页</span>
              </el-menu-item>
              <el-menu-item index="/games" @click="handleMobileMenuSelect('/games')">
                <el-icon><Grid /></el-icon>
                <span>游戏大全</span>
              </el-menu-item>
              <el-menu-item index="/search" @click="handleMobileMenuSelect('/search')">
                <el-icon><Document /></el-icon>
                <span>搜索</span>
              </el-menu-item>
              <el-menu-item index="/ai-test" @click="handleMobileMenuSelect('/ai-test')">
                <el-icon><ChatDotRound /></el-icon>
                <span>AI助手</span>
              </el-menu-item>
            </el-menu>
          </div>
          
          <!-- 社区功能分类 -->
          <div class="mobile-menu-section">
            <h3 class="menu-section-title">社区与社交</h3>
            <el-menu
              @select="handleMobileMenuSelect"
              class="mobile-el-menu category-menu"
              background-color="transparent"
              text-color="white"
              active-text-color="#00d4ff"
            >
              <el-menu-item index="/add-strategy" v-if="isLoggedIn" @click="handleMobileMenuSelect('/add-strategy')">
                <el-icon><DocumentAdd /></el-icon>
                <span>提交攻略</span>
              </el-menu-item>
              <el-menu-item index="/community" @click="handleMobileMenuSelect('/community')">
                <el-icon><ChatRound /></el-icon>
                <span>社区</span>
              </el-menu-item>
              <el-menu-item index="/friends" @click="handleMobileMenuSelect('/friends')">
                <el-icon><User /></el-icon>
                <span>好友系统</span>
              </el-menu-item>
              <el-menu-item index="/friends/requests" @click="handleMobileMenuSelect('/friends/requests')">
                <el-icon><Bell /></el-icon>
                <span>好友请求</span>
              </el-menu-item>
              <el-menu-item index="/community/create" @click="handleMobileMenuSelect('/community/create')">
                <el-icon><Document /></el-icon>
                <span>发布帖子</span>
              </el-menu-item>
            </el-menu>
          </div>
          
          <!-- 开发与管理（登录后显示） -->
          <div class="mobile-menu-section" v-if="isLoggedIn">
            <h3 class="menu-section-title">开发与管理</h3>
            <el-menu
              @select="handleMobileMenuSelect"
              class="mobile-el-menu category-menu"
              background-color="transparent"
              text-color="white"
              active-text-color="#00d4ff"
            >
              <el-menu-item index="/add-game" @click="handleMobileMenuSelect('/add-game')">
                <el-icon><Grid /></el-icon>
                <span>添加游戏</span>
              </el-menu-item>
            </el-menu>
          </div>
          
          <!-- 用户区域分类 -->
          <div class="menu-section user-section">
            <h3 class="section-title">用户中心</h3>
            <div v-if="isLoggedIn" class="mobile-user-info">
              <el-avatar :size="48" :src="userInfo?.avatar" :icon="UserFilled" class="user-avatar-large" />
              <div class="user-details">
                <p class="username">{{ userInfo.username }}</p>
                <p class="user-email">{{ userInfo.email }}</p>
              </div>
            </div>
            
            <div class="mobile-actions">
              <el-button 
                v-if="!isLoggedIn" 
                type="primary" 
                @click="handleUserCommand('login')"
                class="action-button-mobile full-width-btn"
              >
                <el-icon><User /></el-icon>
                <span>登录</span>
              </el-button>
              <el-button 
                v-if="!isLoggedIn" 
                @click="handleUserCommand('register')"
                class="action-button-mobile full-width-btn"
              >
                <el-icon><UserFilled /></el-icon>
                <span>注册</span>
              </el-button>
              <template v-if="isLoggedIn">
                <el-button 
                  @click="handleUserCommand('profile')"
                  class="action-button-mobile full-width-btn"
                >
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-button>
                <el-button 
                  @click="handleUserCommand('favorites')"
                  class="action-button-mobile full-width-btn"
                >
                  <el-icon><Star /></el-icon>
                  <span>我的收藏</span>
                </el-button>
                <el-button 
                  @click="handleUserCommand('history')"
                  class="action-button-mobile full-width-btn"
                >
                  <el-icon><Clock /></el-icon>
                  <span>浏览历史</span>
                </el-button>
                <el-button 
                  @click="handleUserCommand('settings')"
                  class="action-button-mobile full-width-btn"
                >
                  <el-icon><Setting /></el-icon>
                  <span>设置</span>
                </el-button>
                <el-button 
                  type="danger" 
                  @click="handleUserCommand('logout')"
                  class="action-button-mobile full-width-btn logout-btn"
                >
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

  </header>

  <!-- 通知中心 - 完全独立的覆盖层，放在header标签外部 -->
  <div v-if="showNotificationDrawer" id="notification-panel" style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99998;
    display: flex;
    justify-content: flex-end;
    background-color: rgba(0, 0, 0, 0.5);
  " @click="showNotificationDrawer = false">
    <!-- 通知面板 -->
    <div style="
      position: relative;
      z-index: 99999;
      width: 380px;
      height: 100%;
      background-color: #ffffff;
      box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
    " @click.stop>
      <!-- 头部 -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        background-color: #ffffff;
      ">
        <h3 style="margin: 0; font-size: 18px; font-weight: 500;">通知</h3>
        <button 
          @click="showNotificationDrawer = false" 
          style="
            background: none;
            border: none;
            padding: 8px;
            cursor: pointer;
            color: #909399;
            outline: none;
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- 通知列表 -->
      <div style="
        flex: 1;
        overflow-y: auto;
        padding: 0;
        background-color: #ffffff;
      ">
        <!-- 通知项 - 强制显示多个通知 -->
        <div style="padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #409EFF; color: white; margin-right: 12px; font-size: 16px;">
            ℹ️
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 500; margin-bottom: 4px;">系统欢迎通知</div>
            <div style="font-size: 12px; color: #909399;">刚刚</div>
          </div>
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #409EFF; margin-left: 8px;"></div>
        </div>
        
        <div style="padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #67C23A; color: white; margin-right: 12px; font-size: 16px;">
            ✅
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 500; margin-bottom: 4px;">任务完成通知</div>
            <div style="font-size: 12px; color: #909399;">1小时前</div>
          </div>
        </div>
        
        <div style="padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #E6A23C; color: white; margin-right: 12px; font-size: 16px;">
            ⚠️
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 500; margin-bottom: 4px;">系统更新提醒</div>
            <div style="font-size: 12px; color: #909399;">2小时前</div>
          </div>
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #409EFF; margin-left: 8px;"></div>
        </div>
        
        <div style="padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #F56C6C; color: white; margin-right: 12px; font-size: 16px;">
            ❌
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 500; margin-bottom: 4px;">错误提醒</div>
            <div style="font-size: 12px; color: #909399;">昨天</div>
          </div>
        </div>
        
        <div style="padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #909399; color: white; margin-right: 12px; font-size: 16px;">
            🔔
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 500; margin-bottom: 4px;">普通通知</div>
            <div style="font-size: 12px; color: #909399;">3天前</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
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
  SuccessFilled,
  ChatRound,
  Close
} from '@element-plus/icons-vue'
import { Search, DocumentAdd } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 定义属性和事件
const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['toggle-theme', 'toggle-ai-chat', 'update:searchQuery', 'search'])

// 响应式数据
const isDark = ref(false)
const isMobile = ref(false)
const isScrolled = ref(false)
const showMobileMenu = ref(false)
const showNotificationDrawer = ref(false)
const searchQuery = ref(props.searchQuery)
const notifications = ref([
  // 模拟数据 - 确保有内容显示
  {
    id: 1,
    type: 'info',
    title: '欢迎使用系统',
    message: '欢迎来到游戏攻略站！',
    read: false,
    created_at: new Date() // 刚刚
  },
  {
    id: 2,
    type: 'success',
    title: '任务已完成',
    message: '您的任务已经成功完成',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60) // 1小时前
  },
  {
    id: 3,
    type: 'warning',
    title: '系统更新提醒',
    message: '系统将于今晚进行维护升级',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2小时前
  }
])

// 移动端菜单相关状态
const isFullScreenMenu = ref(false)
const menuDrawerSize = ref('280px')
const menuAnimationInProgress = ref(false)

// 计算属性
const activeMenu = computed(() => route.path)
const userInfo = computed(() => userStore.user)
const isLoggedIn = computed(() => userStore.isAuthenticated)

const notificationCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

// 方法
const checkMobile = () => {
  // 改进的移动设备检测：结合宽度、触摸能力和设备方向
  const isMobileWidth = window.innerWidth < 768
  const isTabletWidth = window.innerWidth < 1024 && window.innerWidth >= 768
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // 在横屏模式下，即使宽度超过768px，如果是触摸设备仍然视为移动设备
  const isPortrait = window.innerHeight > window.innerWidth
  
  // 对于平板设备，在竖屏模式下使用移动菜单
  if (isTabletWidth && isPortrait) {
    isMobile.value = true
  } else if (hasTouch && isTabletWidth) {
    // 对于横屏平板，我们仍然保持移动菜单可访问
    isMobile.value = true
  } else {
    // 普通情况下根据宽度判断
    isMobile.value = isMobileWidth
  }
  
  // 根据设备方向和尺寸调整默认菜单大小
  updateMenuSizeBasedOnDevice()
}

const handleResize = () => {
  checkMobile()
  // 仅在明确不是移动设备时才关闭菜单，避免在设备旋转时意外关闭
  const isDefinitelyNotMobile = window.innerWidth >= 1024 && !('ontouchstart' in window)
  if (isDefinitelyNotMobile) {
    showMobileMenu.value = false
  }
}

const handleOrientationChange = () => {
  // 设备方向变化时重新检查移动设备状态
  checkMobile()
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const goHome = () => {
  console.log('🏠 点击游戏攻略站，准备跳转到首页')
  
  // 确保清除任何搜索状态
  searchQuery.value = ''
  
  // 关闭移动端菜单（如果打开的话）
  showMobileMenu.value = false
  // 发出事件通知父组件
  emit('update:searchQuery', '')
  
  // 最简单直接的方式：使用window.location.href强制跳转到首页
  // 这种方式会完全重新加载页面，确保所有状态都被重置
  console.log('🔄 使用window.location.href强制跳转')
  window.location.href = window.location.origin + '/'
}

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleMobileMenuSelect = (index) => {
  router.push(index)
  showMobileMenu.value = false
}

// 移动端搜索触发：导航至搜索页作为替代入口
const openMobileSearch = () => {
  router.push('/search')
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

const handleUserCommand = async (command) => {
  try {
    switch (command) {
      case 'login':
        await router.push('/login')
        break
      case 'register':
        await router.push('/register')
        break
      case 'profile':
        await router.push('/profile')
        break
      case 'favorites':
        await router.push('/favorites')
        break
      case 'history':
        await router.push('/history')
        break
      case 'settings':
        await router.push('/settings')
        break
      case 'logout':
        await handleLogout()
        break
    }
  } finally {
    // 移动端场景：关闭抽屉，避免遮挡导致“看起来未跳转”
    showMobileMenu.value = false
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

// 搜索相关方法
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}

// 监听searchQuery变化
watch(searchQuery, (newValue) => {
  emit('update:searchQuery', newValue)
})

watch(() => props.searchQuery, (newValue) => {
  searchQuery.value = newValue
})

const markAsRead = (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

// 移动端菜单相关方法
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleMenuOpen = () => {
  // 菜单打开时添加动画类
  setTimeout(() => {
    const drawer = document.querySelector('.mobile-drawer')
    const menu = document.querySelector('.mobile-menu')
    if (drawer) {
      drawer.classList.add('menu-open')
      // 添加可见性类以激活加速动画
      if (menu) {
        setTimeout(() => {
          menu.classList.add('menu-visible')
        }, 50)
      }
    }
  }, 10)
}

const handleMenuClose = () => {
  // 移除菜单可见性类
  const menu = document.querySelector('.mobile-menu')
  if (menu) {
    menu.classList.remove('menu-visible')
  }
  
  // 菜单关闭前添加动画类
  const drawer = document.querySelector('.mobile-drawer')
  if (drawer) {
    drawer.classList.remove('menu-open')
  }
  
  // 重置状态
  if (!menuAnimationInProgress.value) {
    setTimeout(() => {
      updateMenuSizeBasedOnDevice()
    }, 300)
  }
}

const toggleMenuSize = () => {
  if (menuAnimationInProgress.value) return
  
  menuAnimationInProgress.value = true
  isFullScreenMenu.value = !isFullScreenMenu.value
  
  // 更新菜单大小
  if (isFullScreenMenu.value) {
    menuDrawerSize.value = '100%'
  } else {
    // 根据设备方向选择合适的半屏尺寸
    const isPortrait = window.innerHeight > window.innerWidth
    menuDrawerSize.value = isPortrait ? '80%' : '50%'
  }
  
  // 添加动画效果
  const drawer = document.querySelector('.mobile-drawer')
  if (drawer) {
    drawer.classList.add('resizing')
    setTimeout(() => {
      drawer.classList.remove('resizing')
      menuAnimationInProgress.value = false
    }, 300)
  } else {
    // 抽屉元素不存在时，延迟重置状态
    setTimeout(() => {
      menuAnimationInProgress.value = false
    }, 300)
  }
}

const updateMenuSizeBasedOnDevice = () => {
  const isPortrait = window.innerHeight > window.innerWidth
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
  
  // 根据设备类型和方向设置默认菜单尺寸
  if (isTablet) {
    menuDrawerSize.value = isPortrait ? '70%' : '50%'
    isFullScreenMenu.value = false
  } else if (window.innerWidth < 768) {
    // 小屏手机默认使用全屏
    menuDrawerSize.value = '100%'
    isFullScreenMenu.value = true
  } else {
    // 桌面设备默认半屏
    menuDrawerSize.value = '30%'
    isFullScreenMenu.value = false
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

// 触摸优化函数 - 针对移动设备的优化
let lastTapTime = 0
const DOUBLE_TAP_THRESHOLD = 300 // 双击时间阈值(ms)

const handleTouchStart = (e) => {
  // 检测双击事件，用于快速切换菜单尺寸
  const currentTime = new Date().getTime()
  const tapLength = currentTime - lastTapTime
  
  if (tapLength < DOUBLE_TAP_THRESHOLD && tapLength > 0) {
    // 双击菜单区域时切换菜单尺寸
    if (e.target.closest('.mobile-drawer') && showMobileMenu.value) {
      toggleMenuSize()
    }
  }
  
  lastTapTime = currentTime
  
  // 触摸时的反馈增强
  if (e.target.closest('.menu-size-toggle')) {
    const button = e.target.closest('.menu-size-toggle')
    button.style.transform = 'scale(0.95)'
    setTimeout(() => {
      button.style.transform = ''
    }, 150)
  }
  
  // 优化长列表滚动性能 - 预加载可见区域外的内容
  if (isMobile.value && showMobileMenu.value) {
    // 这里可以添加预加载逻辑
  }
}

// 生命周期
onMounted(() => {
  checkMobile()
  loadTheme()
  // 初始化用户状态
  userStore.initializeAuth()
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
  // 添加设备方向变化监听
  window.addEventListener('orientationchange', handleOrientationChange)
  // 一些设备可能不支持orientationchange事件，使用resize作为后备
  // 初始检查滚动位置
  handleScroll()
  
  // 添加触摸事件监听以优化移动设备体验
  document.addEventListener('touchstart', handleTouchStart)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
  // 移除设备方向变化监听
  window.removeEventListener('orientationchange', handleOrientationChange)
  // 移除触摸事件监听
  document.removeEventListener('touchstart', handleTouchStart)
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

.app-header.scrolled {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.98) 0%, rgba(118, 75, 162, 0.98) 100%);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  height: 60px;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2rem);
  display: flex;
  align-items: center;
  height: 70px;
  gap: 20px;
  position: relative;
  z-index: 2;
  transition: height 0.3s ease;
}

.app-header.scrolled .header-container {
  height: 60px;
}

/* 品牌区域 */
.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 8px;
}

.header-brand:hover {
  transform: translateY(-2px) scale(1.03);
  background: rgba(255, 255, 255, 0.1);
}

.logo {
  color: #00d4ff;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.header-brand:hover .logo {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.5));
}

.brand-text {
  color: white;
}

.brand-title {
  font-size: clamp(1.125rem, 3vw, 1.25rem);
  font-weight: 700;
  margin: 0;
  line-height: 1;
  background: linear-gradient(45deg, #ffffff, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.header-brand:hover .brand-title {
  background: linear-gradient(45deg, #ffffff, #00e6ff);
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.brand-subtitle {
  font-size: 11px;
  opacity: 0.8;
  margin: 0;
  line-height: 1;
  font-weight: 300;
  letter-spacing: 1px;
  transition: opacity 0.3s ease;
}

.header-brand:hover .brand-subtitle {
  opacity: 1;
}

/* 导航菜单 */
.header-nav {
  flex: 1;
  max-width: 400px;
  min-width: 0; /* 允许在窄屏下收缩，避免溢出 */
}

.main-menu {
  width: 100%;
}

.menu-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  transition: left 0.3s ease;
}

.menu-item:hover::before {
  left: 0;
}

.header-nav :deep(.el-menu) {
  border-bottom: none;
  background: transparent;
}

.header-nav :deep(.el-menu-item) {
  color: white;
  border-bottom: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.header-nav :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.15);
  border-bottom-color: #00d4ff;
  transform: translateY(-2px);
}

.header-nav :deep(.el-menu-item.is-active) {
  background-color: rgba(0, 212, 255, 0.25);
  border-bottom-color: #00d4ff;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

/* 搜索框 */
.header-search {
  flex: 1;
  max-width: 300px;
  min-width: 200px;
  position: relative;
  min-width: 0; /* 允许在窄屏下收缩，避免溢出 */
}

.search-input {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.search-input:hover {
  border-color: rgba(0, 212, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
}

.search-input .el-input__inner {
  background: transparent;
  color: white;
  border: none;
}

.search-input .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-btn {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #00d4ff, #667eea);
  border: none;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
}

/* 用户操作区 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
}

.action-button {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.action-button:hover::before {
  left: 100%;
}

.action-button:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.theme-toggle,
.notification-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  position: relative;
  overflow: hidden;
}

.theme-toggle::before,
.notification-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.theme-toggle:hover::before,
.notification-btn:hover::before {
  left: 100%;
}

.theme-toggle:hover,
.notification-btn:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.user-dropdown {
  position: relative;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
}

.el-avatar {
  transition: transform 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-avatar:hover .el-avatar {
  transform: scale(1.1);
  border-color: #00d4ff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
}

.username {
  color: white;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.user-avatar:hover .username {
  color: #00d4ff;
}

.dropdown-icon {
  color: white;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.user-avatar:hover .dropdown-icon {
  transform: rotate(180deg);
}

.mobile-menu-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  transition: all 0.3s ease;
  display: none;
}

.mobile-search-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  transition: all 0.3s ease;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex !important;
  }
  .mobile-search-btn {
    display: flex !important;
  }
}

.mobile-menu-btn:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.5);
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.user-dropdown-menu {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.user-dropdown-menu .el-dropdown-item {
  color: white;
  background: transparent;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-dropdown-menu .el-dropdown-item:hover {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}

/* 徽章动画 */
.badge-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 装饰元素 */
.header-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.2;
  animation: float 15s infinite ease-in-out;
}

.decoration-1 {
  width: 200px;
  height: 200px;
  background: #00d4ff;
  top: -100px;
  left: -50px;
  animation-delay: 0s;
}

.decoration-2 {
  width: 150px;
  height: 150px;
  background: #ff0080;
  bottom: -75px;
  right: 20%;
  animation-delay: 2s;
}

.decoration-3 {
  width: 100px;
  height: 100px;
  background: #7928ca;
  top: -50px;
  right: 10%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(20px, 20px);
  }
  50% {
    transform: translate(0, 40px);
  }
  75% {
    transform: translate(-20px, 20px);
  }
}

/* 移动端菜单 */
.mobile-drawer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.2);
  /* 确保抽屉在任何设备方向下都能正常显示 */
  position: fixed !important;
  top: 0 !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  height: 100vh !important;
  max-height: none !important;
  display: flex !important;
  flex-direction: column !important;
  /* 添加平滑过渡动画 */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-100%);
}

/* 菜单打开状态 */
.mobile-drawer.menu-open {
  transform: translateX(0);
}

/* 菜单大小调整动画 */
.mobile-drawer.resizing {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 确保Element Plus的动画与我们的自定义动画兼容 */
:global(.el-drawer__wrapper .el-drawer-fade-enter-from),
:global(.el-drawer__wrapper .el-drawer-fade-leave-to) {
  opacity: 1 !important;
}

:global(.el-drawer__wrapper .el-drawer-ltr-enter-from),
:global(.el-drawer__wrapper .el-drawer-ltr-leave-to) {
  transform: translateX(-100%) !important;
}

:global(.el-drawer__wrapper .el-drawer-ltr-enter-active),
:global(.el-drawer__wrapper .el-drawer-ltr-leave-active) {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.mobile-menu {
  padding: 20px;
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 确保菜单容器在设备旋转时不会被截断 */
  overflow: visible !important;
  min-height: 100% !important;
}

/* 确保移动端菜单中的所有div元素都可见 */
.mobile-menu > div {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  transform: none !important;
}

/* 强制Element Plus抽屉组件在设备旋转时保持正确的显示 */
:global(.el-drawer__wrapper) {
  height: 100vh !important;
  min-height: 100vh !important;
  display: flex !important;
  align-items: stretch !important;
}

:global(.el-drawer__container) {
  display: block !important;
  height: 100vh !important;
  min-height: 100vh !important;
}

/* 确保移动菜单按钮在设备旋转后仍然可见和可点击 */
.mobile-menu-toggle {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 1001 !important;
}

/* 为设备方向变化添加过渡效果 */
@media (orientation: landscape) {
  .mobile-drawer {
    width: 300px !important;
    max-width: 80vw !important;
  }
}

@media (orientation: portrait) {
  .mobile-drawer {
    width: 100% !important;
    max-width: 100vw !important;
  }
}
.mobile-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

/* 菜单尺寸切换按钮 */
.menu-size-toggle {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  transition: all 0.3s ease !important;
}

.menu-size-toggle:hover {
  background: rgba(0, 212, 255, 0.2) !important;
  border-color: rgba(0, 212, 255, 0.5) !important;
  transform: scale(1.1) !important;
}

/* 菜单分类标题样式 */
.menu-section-title {
  color: white;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 16px 0;
  padding: 0 20px;
  position: relative;
  opacity: 0;
  transform: translateX(-20px);
  animation: slideIn 0.5s ease forwards;
}

/* 为不同分类添加延迟动画 */
.menu-section-title:nth-child(1) { animation-delay: 0.1s; }
.menu-section-title:nth-child(3) { animation-delay: 0.2s; }
.menu-section-title:nth-child(5) { animation-delay: 0.3s; }
.menu-section-title:nth-child(7) { animation-delay: 0.4s; }

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: #00d4ff;
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.mobile-menu-section {
  margin-bottom: 24px;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.5s ease forwards;
}

/* 为不同菜单项添加延迟动画 */
.mobile-menu-section:nth-child(1) { animation-delay: 0.2s; }
.mobile-menu-section:nth-child(2) { animation-delay: 0.3s; }
.mobile-menu-section:nth-child(3) { animation-delay: 0.4s; }
.mobile-menu-section:nth-child(4) { animation-delay: 0.5s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 适配不同设备尺寸的菜单 */
@media (width <= 375px) {
  /* 小屏手机优化 */
  .mobile-menu {
    padding: 16px;
  }
  
  .mobile-menu-section {
    margin-bottom: 20px;
  }
  
  .menu-section-title {
    font-size: 12px;
    padding: 0 16px;
  }
  
  .mobile-el-menu .el-menu-item, 
  .mobile-el-menu .el-sub-menu__title {
    height: 44px !important;
    line-height: 44px !important;
    font-size: 14px;
  }
}

@media (width >= 376px) and (width < 768px) {
  /* 中等手机优化 */
  .mobile-menu {
    padding: 20px;
  }
  
  .mobile-el-menu .el-menu-item, 
  .mobile-el-menu .el-sub-menu__title {
    height: 52px !important;
    line-height: 52px !important;
  }
}

@media (width >= 768px) and (width < 1024px) {
  /* 平板设备优化 */
  .mobile-menu {
    padding: 24px;
  }
  
  .mobile-drawer {
    width: 70% !important;
  }
  
  /* 平板横屏优化 */
  @media (orientation: landscape) {
    .mobile-drawer {
      width: 50% !important;
    }
  }
}

/* 动画加速处理 */
.mobile-menu.menu-visible .mobile-menu-section {
  animation-duration: 0.3s;
}

.mobile-menu.menu-visible .menu-section-title {
  animation-duration: 0.3s;
}

/* 深色主题适配 */
:global(.dark) .mobile-drawer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
}

:global(.dark) .menu-size-toggle {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:global(.dark) .menu-size-toggle:hover {
  background: rgba(0, 212, 255, 0.1) !important;
  border-color: rgba(0, 212, 255, 0.3) !important;
}

.mobile-brand .logo {
  color: #00d4ff;
}

.mobile-brand h2 {
  margin: 0;
  color: white;
  font-size: 18px;
  background: linear-gradient(45deg, #ffffff, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-el-menu {
  background: transparent !important;
}

.mobile-el-menu .el-menu-item,
.mobile-el-menu .el-sub-menu__title {
  color: white;
  background: transparent;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.mobile-el-menu .el-menu-item:hover,
.mobile-el-menu .el-sub-menu__title:hover {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}

.mobile-el-menu .el-menu-item.is-active {
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
}

.mobile-user-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  color: white;
  margin: 0 0 4px 0;
}

.user-details .user-email {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-actions .el-button {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 全局通知抽屉样式覆盖 */
:global(.el-drawer.notification-drawer) {
  z-index: 9999 !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.3) !important;
  color: white !important;
  height: 100vh !important;
  top: 0 !important;
  bottom: 0 !important;
  left: auto !important;
  right: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  max-height: none !important;
  position: fixed !important;
}

/* 深色主题下的通知抽屉 */
:global(.dark .el-drawer.notification-drawer) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.5) !important;
}

/* 通知抽屉标题样式 */
:global(.el-drawer.notification-drawer .el-drawer__header) {
  padding: 20px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  margin: 0 !important;
  flex-shrink: 0;
}

:global(.el-drawer.notification-drawer .el-drawer__title) {
  color: white !important;
  font-weight: 600 !important;
  font-size: 18px !important;
}

/* 通知抽屉内容区域样式 - 强制完整显示 */
:global(.el-drawer.notification-drawer .el-drawer__body) {
  padding: 0 !important;
  height: calc(100vh - 80px) !important;
  max-height: none !important;
  overflow-y: auto !important;
  flex: 1 !important;
  margin: 0 !important;
  width: 100% !important;
  position: relative !important;
}

/* 确保通知列表占满空间 */
.notification-list {
  padding: 0 !important;
  min-height: 100% !important;
  padding-bottom: 20px !important;
}

/* 修复Element Plus可能的默认样式覆盖 */
:global(.el-drawer__container) {
  display: block !important;
}

:global(.el-drawer__wrapper) {
  height: 100vh !important;
  display: flex !important;
  align-items: stretch !important;
}

/* 响应式优化 */
@media (max-width: 768px) {
  :deep(.el-drawer.notification-drawer) {
    width: 100% !important;
    max-width: 320px;
  }
  
  :deep(.el-drawer.notification-drawer .el-drawer__body) {
    max-height: calc(100vh - 70px);
  }
}

@media (max-height: 500px) {
  :deep(.el-drawer.notification-drawer .el-drawer__body) {
    max-height: calc(100vh - 80px);
  }
}

/* 简化版通知面板样式 */
.notification-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: block;
}

.notification-backdrop {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.notification-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 350px;
  background-color: #ffffff;
  z-index: 2;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notification-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #ffffff;
}

.notification-sidebar-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333333;
}

.notification-close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #666666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.notification-close-btn:hover {
  background-color: #f5f5f5;
  color: #333333;
}

.notification-content-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
}

.no-notifications {
  text-align: center;
  padding: 40px 20px;
  color: #999999;
  font-size: 14px;
}

.notification-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.notification-item:hover {
  background-color: #f5f5f5;
  transform: translateX(2px);
}

.notification-item.unread {
  background-color: #e6f7ff;
  border-color: #1890ff;
  position: relative;
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  top: 16px;
  left: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #1890ff;
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-item-title {
  font-size: 15px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.notification-item-message {
  font-size: 14px;
  color: #666666;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.notification-item-time {
  font-size: 12px;
  color: #999999;
}

/* 深色主题适配 */
:global(.dark) {
  .notification-sidebar {
    background-color: #1f1f1f;
    color: #ffffff;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  }
  
  .notification-sidebar-header {
    background-color: #1f1f1f;
    border-bottom-color: #333333;
  }
  
  .notification-sidebar-title {
    color: #ffffff;
  }
  
  .notification-close-btn {
    color: #999999;
  }
  
  .notification-close-btn:hover {
    background-color: #333333;
    color: #ffffff;
  }
  
  .notification-item {
    background-color: #2a2a2a;
  }
  
  .notification-item:hover {
    background-color: #333333;
  }
  
  .notification-item.unread {
    background-color: #0f1d2a;
    border-color: #1890ff;
  }
  
  .notification-item-title {
    color: #ffffff;
  }
  
  .notification-item-message {
    color: #cccccc;
  }
  
  .notification-item-time {
    color: #666666;
  }
  
  .no-notifications {
    color: #666666;
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .notification-sidebar {
    width: 100% !important;
  }
}

@media (max-width: 480px) {
  .notification-sidebar {
    width: 100% !important;
  }
  
  .notification-content-area {
    padding: 12px;
  }
  
  .notification-item {
    padding: 14px;
  }
}

.el-badge {
  margin-right: 0.5rem;
}

.el-badge__content {
  background: linear-gradient(45deg, #ff0080, #7928ca);
  border: none;
  box-shadow: 0 2px 8px rgba(255, 0, 128, 0.5);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-container {
    padding: 0 1.5rem;
  }
  
  .header-search {
    max-width: 250px;
  }
  
  .brand-title {
    font-size: clamp(1rem, 2vw, 1.125rem);
  }
}

@media (max-width: 992px) {
  .header-search {
    max-width: 180px;
  }
  
  .username {
    display: none;
  }

  /* 缩小按钮与间距，避免操作区溢出 */
  .header-actions {
    gap: 8px;
  }
  .action-button,
  .theme-toggle,
  .notification-btn,
  .mobile-menu-btn,
  .mobile-search-btn {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }
  
  /* 收敛整体间距，提升可用空间 */
  .header-container {
    gap: 12px;
    padding: 0 1.25rem;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: 60px;
    gap: 15px;
    justify-content: space-between;
  }
  
  .header-nav {
    display: none;
  }
  
  .header-search {
    display: none;
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
  
  .action-button,
  .theme-toggle,
  .notification-btn,
  .mobile-menu-btn {
    width: 36px;
    height: 36px;
    min-width: 36px;
    display: flex !important;
    align-items: center;
    justify-content: center;
  }
  
  .decoration-circle {
    transform: scale(0.7);
  }
}

/* 默认隐藏移动端菜单按钮，在小屏幕上显示 */
.mobile-menu-btn {
  display: none;
}

/* 移动端菜单样式 */
.mobile-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.mobile-el-menu {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  transform: none !important;
  margin-top: 20px;
}

.mobile-el-menu .el-menu-item {
  padding-left: 20px !important;
  margin-bottom: 5px;
}

.mobile-el-menu .el-sub-menu .el-menu-item {
  padding-left: 40px !important;
}

@media (max-width: 480px) {
  .header-search {
    display: none;
  }
  
  .header-actions {
    gap: 8px;
  }
  
  .logo {
    margin-right: 8px;
  }
  
  .brand-title {
    font-size: 14px;
  }
}

/* 深色主题适配 */
:global(.dark) .app-header {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
}

:global(.dark) .app-header.scrolled {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
}

:global(.dark) .mobile-drawer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
}

/* 高分辨率屏幕优化 */
@media (-webkit-device-pixel-ratio: 2), (resolution: 192dpi) {
  .app-header {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .decoration-circle {
    filter: blur(30px);
  }
}

/* 横屏模式优化 */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .header-container {
    padding: 0 1rem;
    height: 55px;
  }
  
  .brand-title {
    font-size: 14px;
  }
  
  .decoration-circle {
    transform: scale(0.5);
  }
}

/* 打印样式 */
@media print {
  .app-header {
    position: static;
    background: white;
    color: black;
    box-shadow: none;
    height: auto;
  }
  
  .header-decorations {
    display: none;
  }
  
  .header-search,
  .header-actions {
    display: none;
  }
  
  .brand-text h1 {
    -webkit-text-fill-color: black;
    background: none;
  }
  
  .header-container {
    height: auto;
    padding: 1rem;
  }
}
</style>