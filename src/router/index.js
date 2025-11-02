import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useAdminStore } from '../stores/admin'
import Home from '../views/Home.vue'
import AddGameView from '../views/AddGame.vue'
import StrategyDetailView from '../views/StrategyDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/games',
    name: 'GameCenter',
    component: () => import('../views/GameCenter.vue')
  },
  {
    path: '/games/:id',
    name: 'GameDetail',
    component: () => import('../views/GameDetail.vue'),
    props: true
  },
  // 攻略详情页面
  {
    path: '/strategies/:id',
    name: 'strategy-detail',
    component: StrategyDetailView,
    props: true
  },
  // 社区相关路由
  {
    path: '/community',
    name: 'community',
    component: () => import('../views/Community.vue')
  },
  {
    path: '/community/post/:id',
    name: 'community-post',
    component: () => import('../views/CommunityPost.vue'),
    props: true
  },
  {
    path: '/community/create',
    name: 'create-post',
    component: () => import('../views/CreatePost.vue'),
    meta: {
      title: '发布帖子',
      requiresAuth: true
    }
  },
  // 好友相关路由
  {
    path: '/friends',
    name: 'friends',
    component: () => import('../views/Friends.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/friends/requests',
    name: 'friend-requests',
    component: () => import('../views/FriendRequests.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/add-game',
    name: 'add-game',
    component: AddGameView,
    meta: {
      title: '添加新游戏',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'UserLogin',
    component: () => import('../views/UserLogin.vue')
  },
  {
    path: '/register',
    name: 'UserRegister',
    component: () => import('../views/UserRegister.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue')
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'UserFavorites',
    component: () => import('../views/UserFavorites.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'UserHistory',
    component: () => import('../views/UserHistory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'UserSettings',
    component: () => import('../views/UserSettings.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue')
  },
  { path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/AdminDashboard.vue'),
        meta: { requiresAdminAuth: true }
      },
      {
        path: 'games',
        name: 'AdminGameManage',
        component: () => import('../views/AdminGameManage.vue'),
        meta: { requiresAdminAuth: true }
      },
      { path: 'strategies', name: 'AdminStrategyManage', component: () => import('../views/AdminStrategyManage.vue'), meta: { requiresAdminAuth: true } },
      { path: 'users', name: 'AdminUserManage', component: () => import('../views/AdminUserManage.vue'), meta: { requiresAdminAuth: true } },
      { path: 'settings', name: 'AdminSettings', component: () => import('../views/AdminSettings.vue'), meta: { requiresAdminAuth: true } },
      { path: 'ai', name: 'AdminAIManage', component: () => import('../views/AdminAIManage.vue'), meta: { requiresAdminAuth: true } }
    ]
  },
  {
    path: '/ai-test',
    name: 'AITest',
    component: () => import('../views/AITest.vue')
  },
  {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchResult.vue')
    },
  {
    path: '/simple-search',
    name: 'SimpleSearch',
    component: () => import('../views/SimpleSearch.vue')
  },
  {
    path: '/basic-search',
    name: 'BasicSearch',
    component: () => import('../views/BasicSearch.vue')
  },
  {
    path: '/log-test',
    name: 'LogTest',
    component: () => import('../views/LogTest.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const adminStore = useAdminStore()
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdminAuth = to.matched.some(record => record.meta.requiresAdminAuth)
  
  console.log('路由守卫检查:', { path: to.path, requiresAuth, requiresAdminAuth })
  
  // 普通用户认证检查
  if (requiresAuth && !userStore.isAuthenticated && !localStorage.getItem('user')) {
    console.warn('需要用户认证，重定向到用户登录')
    next({ name: 'UserLogin', query: { redirect: to.fullPath } })
    return
  }
  
  // 管理员认证检查
  if (requiresAdminAuth) {
    // 尝试从多种来源恢复管理员认证状态
    let isAdminAuthenticated = false
    
    // 1. 首先检查store中的认证状态
    if (adminStore.isAuthenticated && adminStore.currentAdmin) {
      isAdminAuthenticated = true
      console.log('已从store获取管理员认证状态')
    } else {
      // 2. 尝试从新格式的存储中恢复
      try {
        const adminSession = localStorage.getItem('admin_session')
        if (adminSession) {
          const parsedSession = JSON.parse(adminSession)
          if (parsedSession.isAuthenticated && parsedSession.admin) {
            adminStore.currentAdmin = parsedSession.admin
            adminStore.isAuthenticated = true
            adminStore.permissions = parsedSession.permissions || []
            isAdminAuthenticated = true
            console.log('已从admin_session恢复管理员状态')
          }
        }
      } catch (error) {
        console.error('读取admin_session失败:', error)
      }
      
      // 3. 尝试从旧格式存储中恢复
      if (!isAdminAuthenticated) {
        try {
          const storedAdmin = localStorage.getItem('admin')
          if (storedAdmin) {
            const parsedAdmin = JSON.parse(storedAdmin)
            adminStore.currentAdmin = parsedAdmin
            adminStore.isAuthenticated = true
            isAdminAuthenticated = true
            console.log('已从旧格式恢复管理员状态')
          }
        } catch (error) {
          console.error('读取旧格式admin失败:', error)
        }
      }
    }
    
    // 根据认证状态决定下一步
    if (isAdminAuthenticated) {
      console.log('管理员认证通过，允许访问:', to.path)
      next()
    } else {
      console.warn('管理员认证失败，重定向到管理员登录')
      next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
    }
  } else {
    // 无需特殊认证的路由直接通过
    next()
  }
})

export default router