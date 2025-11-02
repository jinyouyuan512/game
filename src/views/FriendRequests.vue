<template>
  <div class="friend-requests-container">
    <div class="friend-requests-header">
      <h1>好友请求</h1>
      <el-button type="text" @click="markAllAsRead" v-if="hasUnreadRequests">标记全部已读</el-button>
    </div>
    
    <div class="friend-requests-content">
      <div class="request-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="收到的请求" name="received" />
          <el-tab-pane label="发出的请求" name="sent" />
        </el-tabs>
      </div>
      
      <div class="requests-list">
        <!-- 收到的请求 -->
        <div v-if="activeTab === 'received'">
          <div class="request-card" v-for="request in receivedRequests" :key="request.id">
            <div class="request-avatar-container">
              <img :src="request.sender.avatar || '/default-avatar.png'" alt="用户头像" class="request-avatar">
              <div v-if="!request.is_read" class="unread-indicator" />
            </div>
            
            <div class="request-info">
              <div class="request-name-row">
                <h3 class="request-username">{{ request.sender.username }}</h3>
                <span class="request-time">{{ formatDate(request.created_at) }}</span>
              </div>
              <div class="request-message" v-if="request.message">
                {{ request.message }}
              </div>
              <div class="request-games" v-if="request.sender.common_games && request.sender.common_games.length > 0">
                <span class="common-games-label">共同游戏:</span>
                <el-tag v-for="game in request.sender.common_games.slice(0, 3)" :key="game.id" size="small">
                  {{ game.name }}
                </el-tag>
                <span v-if="request.sender.common_games.length > 3" class="more-games">
                  +{{ request.sender.common_games.length - 3 }}
                </span>
              </div>
            </div>
            
            <div class="request-actions">
              <el-button type="primary" size="small" @click="acceptRequest(request.id)">接受</el-button>
              <el-button type="default" size="small" @click="declineRequest(request.id)">拒绝</el-button>
            </div>
          </div>
          
          <div v-if="receivedRequests.length === 0" class="empty-state">
            <el-empty description="暂无收到的好友请求" />
          </div>
        </div>
        
        <!-- 发出的请求 -->
        <div v-if="activeTab === 'sent'">
          <div class="request-card" v-for="request in sentRequests" :key="request.id">
            <div class="request-avatar-container">
              <img :src="request.receiver.avatar || '/default-avatar.png'" alt="用户头像" class="request-avatar">
            </div>
            
            <div class="request-info">
              <div class="request-name-row">
                <h3 class="request-username">{{ request.receiver.username }}</h3>
                <span class="request-time">{{ formatDate(request.created_at) }}</span>
              </div>
              <div class="request-status" :class="request.status">
                <el-tag :type="getStatusType(request.status)">{{ getStatusText(request.status) }}</el-tag>
              </div>
              <div class="request-games" v-if="request.receiver.common_games && request.receiver.common_games.length > 0">
                <span class="common-games-label">共同游戏:</span>
                <el-tag v-for="game in request.receiver.common_games.slice(0, 3)" :key="game.id" size="small">
                  {{ game.name }}
                </el-tag>
              </div>
            </div>
            
            <div class="request-actions">
              <el-button type="default" size="small" @click="cancelRequest(request.id)" :disabled="request.status !== 'pending'">
                取消请求
              </el-button>
            </div>
          </div>
          
          <div v-if="sentRequests.length === 0" class="empty-state">
            <el-empty description="暂无发出的好友请求" />
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="(activeTab === 'received' && receivedRequests.length > 0) || 
                               (activeTab === 'sent' && sentRequests.length > 0)">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="activeTab === 'received' ? receivedRequests.length : sentRequests.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const activeTab = ref('received')
const currentPage = ref(1)
const pageSize = ref(10)

// 模拟数据 - 收到的好友请求
const receivedRequests = ref([
  {
    id: 1,
    sender: {
      id: 10,
      username: '游戏达人',
      avatar: '/avatar6.png',
      common_games: [
        { id: 1, name: '原神' },
        { id: 2, name: '英雄联盟' }
      ]
    },
    message: '我们一起玩游戏吧！',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    is_read: false,
    status: 'pending'
  },
  {
    id: 2,
    sender: {
      id: 11,
      username: '策略大师',
      avatar: '/avatar7.png',
      common_games: [
        { id: 3, name: '文明6' },
        { id: 4, name: '王国风云3' },
        { id: 5, name: '欧陆风云4' },
        { id: 6, name: '钢铁雄心4' }
      ]
    },
    message: '看你也喜欢策略游戏，交个朋友吧！',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
    is_read: true,
    status: 'pending'
  },
  {
    id: 3,
    sender: {
      id: 12,
      username: '射击高手',
      avatar: '/avatar8.png',
      common_games: [
        { id: 7, name: 'CS2' },
        { id: 8, name: 'VALORANT' }
      ]
    },
    message: '组队打排位赛吗？',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    is_read: true,
    status: 'pending'
  }
])

// 模拟数据 - 发出的好友请求
const sentRequests = ref([
  {
    id: 101,
    receiver: {
      id: 20,
      username: '电竞选手',
      avatar: '/avatar9.png',
      common_games: [
        { id: 2, name: '英雄联盟' }
      ]
    },
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: 'pending'
  },
  {
    id: 102,
    receiver: {
      id: 21,
      username: '单机玩家',
      avatar: '/avatar10.png',
      common_games: [
        { id: 9, name: '赛博朋克2077' },
        { id: 10, name: '艾尔登法环' }
      ]
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'accepted'
  },
  {
    id: 103,
    receiver: {
      id: 22,
      username: '卡牌大师',
      avatar: '/avatar11.png',
      common_games: [
        { id: 11, name: '炉石传说' }
      ]
    },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'rejected'
  }
])

// 计算属性
const hasUnreadRequests = computed(() => {
  return receivedRequests.value.some(request => !request.is_read)
})

// 方法
const handleTabClick = () => {
  currentPage.value = 1
  // 将收到的请求标记为已读
  if (activeTab.value === 'received') {
    receivedRequests.value.forEach(request => {
      request.is_read = true
    })
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}

const markAllAsRead = () => {
  receivedRequests.value.forEach(request => {
    request.is_read = true
  })
  ElMessage.success('已将所有请求标记为已读')
}

const acceptRequest = (requestId) => {
  ElMessageBox.confirm('确定要接受这个好友请求吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const index = receivedRequests.value.findIndex(r => r.id === requestId)
    if (index > -1) {
      const request = receivedRequests.value[index]
      ElMessage.success(`成功添加 ${request.sender.username} 为好友`)
      receivedRequests.value.splice(index, 1)
    }
  }).catch(() => {
    // 取消操作
  })
}

const declineRequest = (requestId) => {
  ElMessageBox.confirm('确定要拒绝这个好友请求吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = receivedRequests.value.findIndex(r => r.id === requestId)
    if (index > -1) {
      receivedRequests.value.splice(index, 1)
      ElMessage.success('已拒绝好友请求')
    }
  }).catch(() => {
    // 取消操作
  })
}

const cancelRequest = (requestId) => {
  ElMessageBox.confirm('确定要取消这个好友请求吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = sentRequests.value.findIndex(r => r.id === requestId)
    if (index > -1) {
      sentRequests.value.splice(index, 1)
      ElMessage.success('已取消好友请求')
    }
  }).catch(() => {
    // 取消操作
  })
}

const getStatusType = (status) => {
  switch (status) {
    case 'pending':
      return 'info'
    case 'accepted':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '等待验证'
    case 'accepted':
      return '已接受'
    case 'rejected':
      return '已拒绝'
    default:
      return status
  }
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  
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
    return new Date(date).toLocaleDateString()
  }
}
</script>

<style scoped>
.friend-requests-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.friend-requests-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.friend-requests-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.friend-requests-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.request-tabs {
  margin-bottom: 20px;
}

.request-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f7fa;
  transition: background-color 0.3s;
}

.request-card:hover {
  background-color: #fafafa;
}

.request-card:last-child {
  border-bottom: none;
}

.request-avatar-container {
  position: relative;
  margin-right: 20px;
}

.request-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.unread-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #f56c6c;
  border: 2px solid #fff;
}

.request-info {
  flex: 1;
}

.request-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.request-username {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.request-time {
  font-size: 12px;
  color: #909399;
}

.request-message {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  max-width: 500px;
}

.request-status {
  margin-bottom: 10px;
}

.request-games {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.common-games-label {
  font-size: 12px;
  color: #909399;
}

.more-games {
  font-size: 12px;
  color: #409eff;
}

.request-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  padding: 60px 0;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .friend-requests-container {
    padding: 10px;
  }
  
  .friend-requests-content {
    padding: 16px;
  }
  
  .request-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .request-avatar-container {
    margin-right: 0;
  }
  
  .request-actions {
    align-self: flex-end;
    width: 100%;
    justify-content: flex-end;
  }
  
  .request-message {
    max-width: 100%;
  }
}
</style>