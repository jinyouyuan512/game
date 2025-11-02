<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <el-icon><Lock /></el-icon>
          </div>
          <h1 class="login-title">管理员登录</h1>
          <p class="login-subtitle">AI游戏攻略平台 - 后台管理系统</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="loginForm.remember">
              记住登录状态
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <div class="demo-info">
            <el-alert
              title="演示账号"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>用户名: admin</p>
                <p>密码: admin123</p>
              </template>
            </el-alert>
          </div>
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../stores/admin'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const adminStore = useAdminStore()

const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  remember: false
})

const loading = ref(false)

const handleLogin = async () => {
  console.log('开始登录流程...', {
    username: loginForm.username,
    password: loginForm.password
  })
  
  if (!loginForm.username || !loginForm.password) {
    console.warn('用户名或密码为空')
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  loading.value = true
  
  try {
    // 直接调用后端API，绕过store可能存在的问题
    console.log('直接调用登录API...')
    const response = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: loginForm.username,
        password: loginForm.password
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || '登录失败')
    }
    
    const data = await response.json()
    console.log('登录API返回数据:', data)
    
    // 手动设置管理员会话数据
    const adminSession = {
      admin: data.admin,
      sessionToken: data.sessionToken,
      isAuthenticated: true
    }
    
    // 保存到本地存储
    localStorage.setItem('admin_session', JSON.stringify(adminSession))
    console.log('管理员会话已保存')
    
    // 清除可能的冲突数据
    sessionStorage.clear()
    localStorage.removeItem('user_session')
    
    ElMessage.success('登录成功！正在跳转到管理后台...')
    console.log('直接跳转到管理后台...')
    
    // 使用最简单直接的方式跳转
    setTimeout(() => {
      window.location.href = '/admin/dashboard'
    }, 100)
    
  } catch (error) {
    console.error('登录失败:', error.message || '未知错误')
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
    console.log('登录流程结束')
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-card {
  background: var(--fill-color-light);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color-light);
  border-radius: 20px;
  padding: 40px;
  box-shadow: var(--box-shadow);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.logo .el-icon {
  font-size: 32px;
  color: white;
}

.login-title {
  font-size: 2rem;
  color: var(--text-color-primary);
  margin-bottom: 10px;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: var(--text-color-secondary);
  font-size: 14px;
}

.login-form {
  margin-bottom: 30px;
}

.login-form .el-form-item {
  margin-bottom: 25px;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(45deg, #00d4ff, #0099cc);
  border: none;
  border-radius: 25px;
}

.login-button:hover {
  background: linear-gradient(45deg, #00b8e6, #0088bb);
}

.login-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.demo-info {
  margin-bottom: 20px;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1));
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.shape-4 {
  width: 120px;
  height: 120px;
  bottom: 20%;
  right: 10%;
  animation-delay: 3s;
}

.shape-5 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 4s;
  opacity: 0.3;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0 15px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #00d4ff;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

:deep(.el-input__inner) {
  color: #ffffff;
  font-size: 16px;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

:deep(.el-input__prefix) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-input__suffix) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-checkbox) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #00d4ff;
  border-color: #00d4ff;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #00d4ff;
}

:deep(.el-alert) {
  background-color: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 10px;
}

:deep(.el-alert__title) {
  color: #00d4ff;
}

:deep(.el-alert__content) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-alert__content p) {
  margin: 5px 0;
  font-size: 14px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
  
  .logo .el-icon {
    font-size: 24px;
  }
}
</style>