<template>
  <div class="user-register">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="logo">
            <el-icon><UserFilled /></el-icon>
          </div>
          <h1 class="register-title">用户注册</h1>
          <p class="register-subtitle">加入AI游戏攻略平台</p>
        </div>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              size="large"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="registerForm.agreeTerms">
              我已阅读并同意 <a href="#" class="terms-link">用户协议</a> 和 <a href="#" class="terms-link">隐私政策</a>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleRegister"
              class="register-button"
            >
              {{ loading ? '注册中...' : '注册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="register-footer">
          <p class="login-link">
            已有账号？
            <router-link to="/login" class="link">立即登录</router-link>
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
import { User, Lock, UserFilled, Message } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const loading = ref(false)

// 验证密码
const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    callback()
  }
}

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerForm.agreeTerms) {
    ElMessage.warning('请同意用户协议和隐私政策')
    return
  }
  
  loading.value = true
  
  try {
    const result = await userStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })
    
    if (result.success) {
      ElMessage.success('注册成功！')
      
      // 注册成功后自动登录
      const loginResult = await userStore.login({
        username: registerForm.username,
        password: registerForm.password
      })
      
      if (loginResult.success) {
        ElMessage.success('自动登录成功！')
        
        // 检查是否有重定向地址
        const redirect = router.currentRoute.value.query.redirect
        if (redirect) {
          router.push(redirect)
        } else {
          router.push('/')
        }
      } else {
        // 自动登录失败，仍跳转到首页
        router.push('/')
      }
    } else {
      ElMessage.error(result.error || '注册失败')
    }
  } catch (error) {
    ElMessage.error('注册失败：' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.05"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.05"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.03"/><circle cx="10" cy="50" r="0.5" fill="white" opacity="0.03"/><circle cx="90" cy="30" r="0.5" fill="white" opacity="0.03"/><circle cx="30" cy="90" r="0.5" fill="white" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.register-form {
  width: 100%;
  max-width: 450px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.register-form :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 4px 12px;
  transition: all 0.3s;
}

.register-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(64, 158, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.register-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.register-form :deep(.el-input__inner) {
  color: #303133;
  background-color: transparent;
  font-size: 14px;
}

.register-form :deep(.el-input__inner::placeholder) {
  color: #a8abb2;
}

.register-form :deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  padding-top: 4px;
}

.register-btn {
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

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.register-btn:active {
  transform: translateY(0);
}

.register-form :deep(.el-checkbox__label) {
  color: #606266;
  font-size: 14px;
}

.register-form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}

.register-form :deep(.el-link) {
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s;
}

.register-form :deep(.el-link:hover) {
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

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.login-link a:hover {
  color: #337ecc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-form {
    padding: 30px 20px;
  }
  
  .register-title {
    font-size: 22px;
  }
  
  .register-btn {
    font-size: 15px;
  }
}
</style>