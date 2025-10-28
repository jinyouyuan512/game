<template>
  <div class="user-login">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <el-icon><UserFilled /></el-icon>
          </div>
          <h1 class="login-title">用户登录</h1>
          <p class="login-subtitle">欢迎回到AI游戏攻略平台</p>
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
              placeholder="请输入用户名或邮箱"
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

          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">
              记住登录状态
            </el-checkbox>
            <router-link to="/forgot-password" class="forgot-link">
              忘记密码？
            </router-link>
          </div>

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

        <div class="social-login">
          <div class="divider">
            <span>或使用第三方账号登录</span>
          </div>
          <div class="social-buttons">
            <el-button class="social-button wechat" @click="handleWechatLogin">
              <el-icon><ChatDotRound /></el-icon>
              微信登录
            </el-button>
            <el-button class="social-button qq" @click="handleQQLogin">
              <el-icon><ChatDotSquare /></el-icon>
              QQ登录
            </el-button>
          </div>
        </div>

        <div class="login-footer">
          <p class="register-link">
            还没有账号？
            <router-link to="/register" class="link">立即注册</router-link>
          </p>
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
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled, ChatDotRound, ChatDotSquare } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loading = ref(false)

const loginRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  loading.value = true
  
  try {
    const result = await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    if (result.success) {
      ElMessage.success('登录成功！')
      
      // 检查是否有重定向地址
      const redirect = router.currentRoute.value.query.redirect
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/')
      }
    } else {
      ElMessage.error(result.error || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const handleWechatLogin = () => {
  ElMessage.info('微信登录功能开发中...')
}

const handleQQLogin = () => {
  ElMessage.info('QQ登录功能开发中...')
}
</script>

<style scoped>
.user-login {
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
  max-width: 450px;
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

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.forgot-link {
  color: #00d4ff;
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  color: #00b8e6;
  text-decoration: underline;
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

.social-login {
  margin-bottom: 30px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.social-buttons {
  display: flex;
  gap: 15px;
}

.social-button {
  flex: 1;
  height: 45px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-color-secondary);
  border-radius: 12px;
}

.social-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.social-button.wechat:hover {
  color: #07c160;
  border-color: #07c160;
}

.social-button.qq:hover {
  color: #12b7f5;
  border-color: #12b7f5;
}

.login-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  text-align: center;
}

.register-link {
  color: var(--text-color-secondary);
  font-size: 14px;
}

.link {
  color: #00d4ff;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  color: #00b8e6;
  text-decoration: underline;
}

/* 背景装饰样式 */
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
  
  .social-buttons {
    flex-direction: column;
  }
}

/* 合并第二个样式块的样式 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.login-form :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 4px 12px;
  transition: all 0.3s;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(64, 158, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.login-form :deep(.el-input__inner) {
  color: #303133;
  background-color: transparent;
  font-size: 14px;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #a8abb2;
}

.login-form :deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  padding-top: 4px;
}

.login-btn {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.login-form :deep(.el-checkbox__label) {
  color: #606266;
  font-size: 14px;
}

.login-form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}

.login-form :deep(.el-link) {
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s;
}

.login-form :deep(.el-link:hover) {
  color: #337ecc;
}

.divider {
  margin: 20px 0;
  text-align: center;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, #dcdfe6, transparent);
}

.divider span {
  background: rgba(255, 255, 255, 0.9);
  padding: 0 15px;
  color: #909399;
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.social-btn.wechat:hover {
  color: #07c160;
  border-color: #07c160;
}

.social-btn.qq:hover {
  color: #12b7f5;
  border-color: #12b7f5;
}

.social-btn.weibo:hover {
  color: #e6162d;
  border-color: #e6162d;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.register-link a:hover {
  color: #337ecc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 22px;
  }
  
  .login-btn {
    font-size: 15px;
  }
}
</style>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.login-form :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 4px 12px;
  transition: all 0.3s;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(64, 158, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.login-form :deep(.el-input__inner) {
  color: #303133;
  background-color: transparent;
  font-size: 14px;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #a8abb2;
}

.login-form :deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  padding-top: 4px;
}

.login-btn {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.login-form :deep(.el-checkbox__label) {
  color: #606266;
  font-size: 14px;
}

.login-form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}

.login-form :deep(.el-link) {
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s;
}

.login-form :deep(.el-link:hover) {
  color: #337ecc;
}

.divider {
  margin: 20px 0;
  text-align: center;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, #dcdfe6, transparent);
}

.divider span {
  background: rgba(255, 255, 255, 0.9);
  padding: 0 15px;
  color: #909399;
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.social-btn.wechat:hover {
  color: #07c160;
  border-color: #07c160;
}

.social-btn.qq:hover {
  color: #12b7f5;
  border-color: #12b7f5;
}

.social-btn.weibo:hover {
  color: #e6162d;
  border-color: #e6162d;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.register-link a:hover {
  color: #337ecc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 22px;
  }
  
  .login-btn {
    font-size: 15px;
  }
}