<template>
  <div class="user-profile">
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="page-title">个人中心</h1>
        <div class="profile-tabs">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="基本信息" name="basic">
              <div class="basic-info">
                <div class="avatar-section">
                  <el-avatar :size="100" :src="userInfo?.avatar" :icon="UserFilled" />
                  <el-button type="primary" class="change-avatar-btn">更换头像</el-button>
                </div>
                <div class="info-section">
                  <el-form :model="userInfo" label-width="80px">
                    <el-form-item label="用户名">
                      <el-input v-model="userInfo.username" disabled />
                    </el-form-item>
                    <el-form-item label="邮箱">
                      <el-input v-model="userInfo.email" disabled />
                    </el-form-item>
                    <el-form-item label="注册时间">
                      <el-input :value="formatDate(userInfo.createdAt)" disabled />
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="password">
              <div class="password-form">
                <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
                  <el-form-item label="当前密码" prop="currentPassword">
                    <el-input v-model="passwordForm.currentPassword" type="password" show-password />
                  </el-form-item>
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" show-password />
                  </el-form-item>
                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="updatePassword" :loading="passwordLoading">修改密码</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const activeTab = ref('basic')
const passwordLoading = ref(false)

const userInfo = ref({
  username: '',
  email: '',
  avatar: '',
  createdAt: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const passwordFormRef = ref(null)

const handleTabClick = (tab) => {
  activeTab.value = tab.name
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    // 这里应该调用API更新密码
    // await userStore.updatePassword(passwordForm)
    
    ElMessage.success('密码修改成功')
    
    // 重置表单
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error('密码修改失败：' + error.message)
    }
  } finally {
    passwordLoading.value = false
  }
}

onMounted(async () => {
  // 获取用户信息
  if (userStore.isAuthenticated) {
    userInfo.value = userStore.user || {}
  }
})
</script>

<style scoped>
.user-profile {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.profile-header {
  padding: 20px;
}

.page-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.profile-tabs {
  margin-top: 20px;
}

.basic-info {
  display: flex;
  gap: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.change-avatar-btn {
  margin-top: 10px;
}

.info-section {
  flex: 1;
}

.password-form {
  max-width: 500px;
}
</style>