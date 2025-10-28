<template>
  <div class="user-settings">
    <div class="settings-container">
      <div class="settings-header">
        <h1 class="page-title">设置</h1>
      </div>

      <div class="settings-content">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="账户设置" name="account">
            <div class="settings-section">
              <h3 class="section-title">账户信息</h3>
              <div class="account-info">
                <div class="info-item">
                  <span class="info-label">用户名：</span>
                  <span class="info-value">{{ userInfo.username }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">邮箱：</span>
                  <span class="info-value">{{ userInfo.email }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">注册时间：</span>
                  <span class="info-value">{{ formatDate(userInfo.createdAt) }}</span>
                </div>
              </div>
              <div class="section-actions">
                <el-button type="primary" @click="editProfile">编辑个人资料</el-button>
                <el-button @click="changePassword">修改密码</el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="通知设置" name="notification">
            <div class="settings-section">
              <h3 class="section-title">通知偏好</h3>
              <div class="notification-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>新攻略通知</h4>
                    <p>当有新攻略发布时接收通知</p>
                  </div>
                  <el-switch v-model="notificationSettings.newStrategy" />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>收藏更新通知</h4>
                    <p>当收藏的内容有更新时接收通知</p>
                  </div>
                  <el-switch v-model="notificationSettings.favoriteUpdate" />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>系统通知</h4>
                    <p>接收系统维护和重要更新通知</p>
                  </div>
                  <el-switch v-model="notificationSettings.system" />
                </div>
              </div>
              <div class="section-actions">
                <el-button type="primary" @click="saveNotificationSettings" :loading="notificationLoading">
                  保存设置
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="隐私设置" name="privacy">
            <div class="settings-section">
              <h3 class="section-title">隐私控制</h3>
              <div class="privacy-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>公开个人资料</h4>
                    <p>允许其他用户查看您的个人资料</p>
                  </div>
                  <el-switch v-model="privacySettings.publicProfile" />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>显示收藏列表</h4>
                    <p>允许其他用户查看您的收藏列表</p>
                  </div>
                  <el-switch v-model="privacySettings.showFavorites" />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>显示浏览历史</h4>
                    <p>允许其他用户查看您的浏览历史</p>
                  </div>
                  <el-switch v-model="privacySettings.showHistory" />
                </div>
              </div>
              <div class="section-actions">
                <el-button type="primary" @click="savePrivacySettings" :loading="privacyLoading">
                  保存设置
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="危险操作" name="danger">
            <div class="settings-section danger-section">
              <h3 class="section-title">危险操作</h3>
              <div class="danger-actions">
                <div class="danger-item">
                  <div class="danger-info">
                    <h4>清空浏览历史</h4>
                    <p>删除您的所有浏览历史记录</p>
                  </div>
                  <el-button type="warning" @click="clearHistory">清空历史</el-button>
                </div>
                <div class="danger-item">
                  <div class="danger-info">
                    <h4>注销账户</h4>
                    <p>永久删除您的账户和所有相关数据</p>
                  </div>
                  <el-button type="danger" @click="deleteAccount">注销账户</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('account')
const notificationLoading = ref(false)
const privacyLoading = ref(false)

const userInfo = ref({
  username: '',
  email: '',
  createdAt: ''
})

const notificationSettings = reactive({
  newStrategy: true,
  favoriteUpdate: true,
  system: true
})

const privacySettings = reactive({
  publicProfile: false,
  showFavorites: false,
  showHistory: false
})

const handleTabClick = (tab) => {
  activeTab.value = tab.name
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const editProfile = () => {
  router.push('/profile')
}

const changePassword = () => {
  router.push('/profile?tab=password')
}

const saveNotificationSettings = async () => {
  notificationLoading.value = true
  try {
    // 这里应该调用API保存通知设置
    // await userStore.updateNotificationSettings(notificationSettings)
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('通知设置已保存')
  } catch (error) {
    ElMessage.error('保存通知设置失败：' + error.message)
  } finally {
    notificationLoading.value = false
  }
}

const savePrivacySettings = async () => {
  privacyLoading.value = true
  try {
    // 这里应该调用API保存隐私设置
    // await userStore.updatePrivacySettings(privacySettings)
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('隐私设置已保存')
  } catch (error) {
    ElMessage.error('保存隐私设置失败：' + error.message)
  } finally {
    privacyLoading.value = false
  }
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有浏览历史吗？此操作不可恢复。',
      '清空历史',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API清空历史记录
    // await userStore.clearHistory()
    
    ElMessage.success('已清空所有浏览历史')
  } catch (error) {
    // 用户取消操作
  }
}

const deleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要注销账户吗？此操作将永久删除您的账户和所有相关数据，且不可恢复。',
      '注销账户',
      {
        confirmButtonText: '确定注销',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    // 这里应该调用API注销账户
    // await userStore.deleteAccount()
    
    // 注销后退出登录并跳转到首页
    await userStore.logout()
    ElMessage.success('账户已注销')
    router.push('/')
  } catch (error) {
    // 用户取消操作
  }
}

onMounted(async () => {
  if (userStore.isAuthenticated) {
    userInfo.value = userStore.user || {}
    
    // 这里应该调用API获取用户设置
    // const settings = await userStore.getSettings()
    // notificationSettings = { ...settings.notification }
    // privacySettings = { ...settings.privacy }
  }
})
</script>

<style scoped>
.user-settings {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.settings-header {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.settings-content {
  padding: 20px;
}

.settings-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.account-info {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 100px;
  color: var(--el-text-color-secondary);
}

.info-value {
  color: var(--el-text-color-primary);
}

.section-actions {
  display: flex;
  gap: 12px;
}

.notification-settings, .privacy-settings {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.setting-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.danger-section {
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: 8px;
  padding: 20px;
}

.danger-actions {
  background: var(--el-color-danger-light-9);
  border-radius: 8px;
  padding: 20px;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-color-danger-light-7);
}

.danger-item:last-child {
  border-bottom: none;
}

.danger-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--el-color-danger);
}

.danger-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>