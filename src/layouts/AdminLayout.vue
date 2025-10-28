<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="250px" class="admin-sidebar">
        <div class="sidebar-header">
          <h3>游戏攻略管理</h3>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          class="admin-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><House /></el-icon>
            <span>仪表板</span>
          </el-menu-item>
          <el-menu-item index="/admin/games">
            <el-icon><Grid /></el-icon>
            <span>游戏管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/strategies">
            <el-icon><Document /></el-icon>
            <span>攻略管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/ai">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI对话</span>
          </el-menu-item>
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="admin-header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">管理后台</el-breadcrumb-item>
              <el-breadcrumb-item>{{ getPageTitle() }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="admin-info">
                <el-icon><Avatar /></el-icon>
                <span>{{ adminStore.currentAdmin?.username || '管理员' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                  <el-dropdown-item command="settings">设置</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主内容区域 -->
        <el-main class="admin-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '../stores/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  House,
  Grid,
  Document,
  User,
  ChatDotRound,
  Setting,
  Avatar,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const getPageTitle = () => {
  const titles = {
    '/admin/dashboard': '仪表板',
    '/admin/games': '游戏管理',
    '/admin/strategies': '攻略管理',
    '/admin/users': '用户管理',
    '/admin/ai': 'AI对话',
    '/admin/settings': '系统设置'
  }
  return titles[route.path] || '管理后台'
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中...')
      break
    case 'settings':
      ElMessage.info('设置功能开发中...')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '确认退出',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await adminStore.logout()
        ElMessage.success('已退出登录')
        router.push('/admin/login')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('退出登录失败')
        }
      }
      break
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-sidebar {
  background-color: #304156;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #434a50;
}

.sidebar-header h3 {
  color: #bfcbd9;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.admin-menu {
  border: none;
}

.admin-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.admin-menu .el-menu-item:hover {
  background-color: #434a50 !important;
}

.admin-menu .el-menu-item.is-active {
  background-color: #409EFF !important;
}

.admin-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.header-left .el-breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.admin-info:hover {
  background-color: #f5f7fa;
}

.admin-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>