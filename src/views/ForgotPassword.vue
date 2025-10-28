<template>
  <div class="forgot-password">
    <div class="forgot-container">
      <div class="forgot-card">
        <div class="forgot-header">
          <div class="logo">
            <el-icon><Lock /></el-icon>
          </div>
          <h1 class="forgot-title">忘记密码</h1>
          <p class="forgot-subtitle">输入您的邮箱，我们将发送重置密码链接</p>
        </div>

        <el-form
          ref="forgotFormRef"
          :model="forgotForm"
          :rules="forgotRules"
          class="forgot-form"
          @submit.prevent="handleForgotPassword"
        >
          <el-form-item prop="email">
            <el-input
              v-model="forgotForm.email"
              placeholder="请输入您的邮箱地址"
              size="large"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleForgotPassword"
              class="forgot-button"
            >
              {{ loading ? '发送中...' : '发送重置链接' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="forgot-footer">
          <p class="back-link">
            <router-link to="/login" class="link">返回登录</router-link>
          </p>
          <p class="register-link">
            还没有账号？
            <router-link to="/register" class="link">立即注册</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Message } from '@element-plus/icons-vue'

const router = useRouter()

const forgotForm = reactive({
  email: ''
})

const loading = ref(false)

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleForgotPassword = async () => {
  // 这里应该调用后端API发送重置密码邮件
  loading.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('重置密码链接已发送到您的邮箱，请查收')
    
    // 可以选择跳转到登录页面或显示成功页面
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    ElMessage.error('发送失败，请检查邮箱地址是否正确')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-password {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.forgot-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.forgot-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 40px 30px;
  backdrop-filter: blur(10px);
}

.forgot-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin-bottom: 20px;
  color: white;
  font-size: 24px;
}

.forgot-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px;
}

.forgot-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.forgot-form {
  margin-bottom: 20px;
}

.forgot-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.forgot-button:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.forgot-footer {
  text-align: center;
  font-size: 14px;
  color: #909399;
}

.back-link {
  margin-bottom: 10px;
}

.register-link {
  margin-top: 10px;
}

.link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* 深度选择器修复Element Plus组件样式 */
:deep(.el-input__inner) {
  color: #303133;
  background-color: transparent;
}

:deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  padding-top: 4px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .forgot-container {
    padding: 10px;
  }
  
  .forgot-card {
    padding: 30px 20px;
  }
  
  .forgot-title {
    font-size: 22px;
  }
}
</style>