import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import Home from '../views/Home.vue'
import AddGameView from '../views/AddGame.vue'
import AddStrategyView from '../views/AddStrategy.vue'

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
  {
    path: '/strategies',
    name: 'StrategyList',
    component: () => import('../views/StrategyList.vue')
  },
  {
    path: '/strategies/:id',
    name: 'StrategyDetail',
    component: () => import('../views/StrategyDetail.vue'),
    props: true
  },
  {
    path: '/add-game',
    name: 'add-game',
    component: AddGameView,
    meta: {
      title: '添加新游戏'
    }
  },
  {
    path: '/add-strategy',
    name: 'add-strategy',
    component: AddStrategyView,
    meta: {
      title: '提交游戏攻略'
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
  {
    path: '/admin',
    redirect: '/admin/login'
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue')
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
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
      {
        path: 'strategies',
        name: 'AdminStrategyManage',
        component: () => import('../views/AdminStrategyManage.vue'),
        meta: { requiresAdminAuth: true }
      }
    ]
  },
  {
    path: '/ai-test',
    name: 'AITest',
    component: () => import('../views/AITest.vue')
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('../views/SearchResults.vue')
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
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdminAuth = to.matched.some(record => record.meta.requiresAdminAuth)
  
  if (requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'UserLogin', query: { redirect: to.fullPath } })
  } else if (requiresAdminAuth && (!userStore.isAuthenticated || !userStore.user?.is_admin)) {
    next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router