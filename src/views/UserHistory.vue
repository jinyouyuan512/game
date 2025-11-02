<template>
  <div class="user-history">
    <div class="history-container">
      <div class="history-header">
        <h1 class="page-title">浏览历史</h1>
        <div class="header-actions">
          <el-button type="danger" @click="clearHistory" :disabled="historyItems.length === 0">
            清空历史
          </el-button>
        </div>
      </div>

      <div class="history-content">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="historyItems.length === 0" class="empty-container">
          <el-empty description="暂无浏览历史" />
        </div>
        
        <div v-else class="history-list">
          <div 
            v-for="item in historyItems" 
            :key="item.id" 
            class="history-item"
            @click="navigateToItem(item)"
          >
            <div class="item-image">
              <img :src="item.image" :alt="item.title" />
            </div>
            <div class="item-info">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-meta">
                <span class="item-type">{{ getTypeLabel(item.type) }}</span>
                <span class="item-date">{{ formatDateTime(item.viewedAt) }}</span>
              </div>
            </div>
            <div class="item-actions">
              <el-button type="danger" size="small" @click.stop="removeHistoryItem(item)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

// 历史记录数据 - 将从API获取
const historyItems = ref([])

const getTypeLabel = (type) => {
  const typeMap = {
    game: '游戏',
    strategy: '攻略'
  }
  return typeMap[type] || type
}

const formatDateTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

const navigateToItem = (item) => {
  if (item.type === 'game') {
    router.push(`/games/${item.id}`)
  } else if (item.type === 'strategy') {
    router.push(`/strategies/${item.id}`)
  }
}

const removeHistoryItem = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${item.title}"的浏览记录吗？`,
      '删除记录',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用API删除历史记录
    await userStore.removeHistoryItem(item.id)
    
    // 从列表中移除
    const index = historyItems.value.findIndex(historyItem => historyItem.id === item.id)
    if (index !== -1) {
      historyItems.value.splice(index, 1)
    }
    
    ElMessage.success('已删除浏览记录')
  } catch (error) {
    // 用户取消操作
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
    
    // 调用API清空历史记录
    await userStore.clearHistory()
    
    // 清空列表
    historyItems.value = []
    
    ElMessage.success('已清空所有浏览历史')
  } catch (error) {
    // 用户取消操作
  }
}

onMounted(async () => {
  if (userStore.isAuthenticated) {
    loading.value = true
    try {
      // 调用API获取浏览历史
      const data = await userStore.getHistory()
      historyItems.value = data
    } catch (error) {
      ElMessage.error('获取浏览历史失败')
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.user-history {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.history-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.history-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.history-content {
  padding: 20px;
}

.loading-container, .empty-container {
  padding: 40px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  box-shadow: var(--el-box-shadow-light);
  transform: translateY(-2px);
}

.item-image {
  width: 200px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.item-description {
  margin: 0 0 12px 0;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.item-type {
  padding: 2px 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 4px;
}

.item-actions {
  display: flex;
  align-items: center;
}
</style>