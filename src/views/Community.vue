<template>
  <div class="community-container" 
       :class="{
         'platform-pc': currentPlatform === 'pc',
         'platform-mobile': currentPlatform === 'mobile',
         'platform-console': currentPlatform === 'console',
         'orientation-landscape': currentOrientation === 'landscape',
         'orientation-portrait': currentOrientation === 'portrait',
         'interaction-touch': interactionMode === 'touch',
         'interaction-pointer': interactionMode === 'pointer'
       }">
    <div class="community-header">
      <h1>游戏社区</h1>
      <div class="header-actions">
        <el-button type="primary" @click="createPost" icon="Plus">发布帖子</el-button>
      </div>
    </div>
    
    <div class="community-content">
      <div class="sidebar">
        <!-- 游戏频道列表 -->
        <div class="game-channels">
          <h3>游戏频道</h3>
          <el-menu :default-active="activeChannel" class="channel-menu" @select="handleChannelSelect">
            <el-menu-item index="all">综合频道</el-menu-item>
            <el-menu-item index="genshin">原神</el-menu-item>
            <el-menu-item index="lol">英雄联盟</el-menu-item>
            <el-menu-item index="cyberpunk">赛博朋克2077</el-menu-item>
            <el-menu-item index="starfield">星空</el-menu-item>
            <el-menu-item index="blackmyth">黑神话悟空</el-menu-item>
          </el-menu>
        </div>
        
        <!-- 在线用户 -->
        <div class="online-users">
          <h3>在线用户 ({{ onlineUsers.length }})</h3>
          <div class="online-user-item" v-for="user in onlineUsers" :key="user.id">
            <div class="user-avatar-small">
              <img :src="user.avatar || '/default-avatar.png'" alt="用户头像">
              <div class="online-indicator"></div>
            </div>
            <span class="user-name">{{ user.username }}</span>
          </div>
        </div>
      </div>
      
      <div class="main-content">
        <!-- 频道信息 -->
        <div class="channel-info">
          <h2>{{ getCurrentChannelName() }}</h2>
          <p>{{ channelDescription }}</p>
        </div>
        
        <!-- 消息列表 -->
        <div class="messages-list" ref="messagesContainer">
          <div class="message-item" v-for="message in channelMessages" :key="message.id">
            <div class="message-avatar">
              <img :src="message.user.avatar || '/default-avatar.png'" alt="用户头像">
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-username">{{ message.user.username }}</span>
                <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
              </div>
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>
        </div>
        
        <!-- 消息输入框 -->
        <div class="message-input">
          <el-input
            v-model="newMessage"
            placeholder="输入消息..."
            type="textarea"
            :rows="2"
            @keyup.enter.ctrl="sendMessage"
          >
            <template #append>
              <el-button type="primary" @click="sendMessage">发送</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import deviceDetectionService from '../services/DeviceDetectionService'

// 设备信息响应式状态
const currentPlatform = ref(deviceDetectionService.getCurrentPlatform())
const currentOrientation = ref(deviceDetectionService.getCurrentOrientation())
const interactionMode = ref(deviceDetectionService.getInteractionMode())

// 监听设备变化
watch(() => deviceDetectionService.getCurrentPlatform(), (newPlatform) => {
  currentPlatform.value = newPlatform
  console.log('社区页面平台变化:', newPlatform)
})

watch(() => deviceDetectionService.getCurrentOrientation(), (newOrientation) => {
  currentOrientation.value = newOrientation
  console.log('社区页面方向变化:', newOrientation)
})

watch(() => deviceDetectionService.getInteractionMode(), (newMode) => {
  interactionMode.value = newMode
  console.log('社区页面交互模式变化:', newMode)
})

const router = useRouter()
const userStore = useUserStore()
const messagesContainer = ref(null)

// 响应式数据
const activeChannel = ref('all')
const newMessage = ref('')
const channelMessages = ref([])
const onlineUsers = ref([])
const channelDescription = ref('欢迎来到游戏社区，请遵守社区规则，文明交流！')

// 模拟频道消息数据
const mockChannelMessages = {
  all: [
    {
      id: 1,
      content: '大家好，欢迎来到游戏社区！',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: {
        id: 1,
        username: '社区管理员',
        avatar: '/avatar1.png'
      }
    },
    {
      id: 2,
      content: '有没有人一起组队玩原神的？',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      user: {
        id: 2,
        username: '旅行者',
        avatar: '/avatar2.png'
      }
    },
    {
      id: 3,
      content: '英雄联盟S14新版本太好玩了！',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: {
        id: 3,
        username: '峡谷王者',
        avatar: '/avatar3.png'
      }
    }
  ],
  genshin: [
    {
      id: 101,
      content: '4.5版本深渊太难了，求配队建议',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      user: {
        id: 4,
        username: '提瓦特探索者',
        avatar: '/avatar4.png'
      }
    },
    {
      id: 102,
      content: '新角色强度如何？值得抽吗？',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: {
        id: 5,
        username: '原石收藏家',
        avatar: '/avatar5.png'
      }
    }
  ],
  lol: [
    {
      id: 201,
      content: '今天排位遇到一个神级打野，带飞全场！',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      user: {
        id: 6,
        username: '青铜小能手',
        avatar: '/avatar6.png'
      }
    }
  ],
  cyberpunk: [],
  starfield: [],
  blackmyth: []
}

// 模拟在线用户数据
const mockOnlineUsers = [
  {
    id: 2,
    username: '旅行者',
    avatar: '/avatar2.png'
  },
  {
    id: 3,
    username: '峡谷王者',
    avatar: '/avatar3.png'
  },
  {
    id: 4,
    username: '提瓦特探索者',
    avatar: '/avatar4.png'
  }
]

// 频道信息配置
const channelInfo = {
  all: {
    name: '综合频道',
    description: '所有游戏的综合讨论区'
  },
  genshin: {
    name: '原神频道',
    description: '《原神》相关讨论，包括角色、装备、攻略等'
  },
  lol: {
    name: '英雄联盟频道',
    description: '《英雄联盟》相关讨论，包括赛事、英雄、战术等'
  },
  cyberpunk: {
    name: '赛博朋克2077频道',
    description: '《赛博朋克2077》相关讨论'
  },
  starfield: {
    name: '星空频道',
    description: '《星空》相关讨论'
  },
  blackmyth: {
    name: '黑神话悟空频道',
    description: '《黑神话悟空》相关讨论'
  }
}

// 计算属性
const currentUser = computed(() => userStore.user || {
  id: 999,
  username: '当前用户',
  avatar: '/default-avatar.png'
})

// 方法
const loadChannelData = () => {
  // 加载当前频道的消息
  channelMessages.value = mockChannelMessages[activeChannel.value] || []
  onlineUsers.value = mockOnlineUsers
  
  // 更新频道描述
  channelDescription.value = channelInfo[activeChannel.value]?.description || '欢迎来到游戏社区'
  
  // 滚动到底部
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleChannelSelect = (channelId) => {
  activeChannel.value = channelId
  loadChannelData()
}

const createPost = () => {
  router.push('/community/create')
}

const sendMessage = () => {
  if (!newMessage.value.trim()) {
    ElMessage.warning('消息内容不能为空')
    return
  }
  
  const newMsg = {
    id: Date.now(),
    content: newMessage.value.trim(),
    timestamp: new Date(),
    user: currentUser.value
  }
  
  // 添加到当前频道
  if (!mockChannelMessages[activeChannel.value]) {
    mockChannelMessages[activeChannel.value] = []
  }
  mockChannelMessages[activeChannel.value].push(newMsg)
  channelMessages.value.push(newMsg)
  
  // 清空输入框
  newMessage.value = ''
  
  // 滚动到底部
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const getCurrentChannelName = () => {
  return channelInfo[activeChannel.value]?.name || '综合频道'
}

const formatMessageTime = (date) => {
  const now = new Date(date)
  return now.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 生命周期
onMounted(() => {
  // 初始化用户状态
  userStore.initializeAuth()
  loadChannelData()
})
</script>

<style scoped>
.community-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.community-header h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.community-content {
  display: flex;
  gap: 30px;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.category-section,
.hot-topics {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-section h3,
.hot-topics h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.category-menu {
  border: none;
}

.hot-topic-item {
  margin-bottom: 10px;
}

.hot-topic-item a {
  color: #606266;
  text-decoration: none;
  transition: color 0.3s;
}

.hot-topic-item a:hover {
  color: #409eff;
}

.main-content {
  flex: 1;
}

.search-bar {
  margin-bottom: 20px;
}

.post-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.post-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.username {
  font-weight: 500;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.post-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  transition: color 0.3s;
}

.post-title:hover {
  color: #409eff;
}

.post-excerpt {
  margin: 0 0 15px 0;
  color: #606266;
  line-height: 1.6;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 14px;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* 深色主题适配 */
:deep(.dark) .post-card {
  background-color: var(--bg-color-dark-card);
  color: var(--text-color-light);
}

:deep(.dark) .post-card h3 {
  color: var(--text-color-light);
}

/* 平台特定样式优化 */
/* PC平台优化 */
.platform-pc .community-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 40px;
}

.platform-pc .post-card {
  padding: 30px;
  margin-bottom: 24px;
}

.platform-pc .post-grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* 主机平台优化 */
.platform-console .community-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.platform-console .post-card {
  padding: 25px;
  margin-bottom: 20px;
}

.platform-console .create-post-btn {
  padding: 15px 30px;
  font-size: 18px;
}

/* 移动平台优化 */
.platform-mobile .community-header {
  padding: 20px 0;
  text-align: center;
}

.platform-mobile .community-header h1 {
  font-size: 24px;
}

.platform-mobile .community-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.platform-mobile .post-card {
  padding: 20px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.platform-mobile .post-grid {
  grid-template-columns: 1fr;
  gap: 16px;
}

/* 方向响应式样式 */
.orientation-landscape .post-card .post-header {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.orientation-portrait .post-card .post-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
}

.orientation-landscape .post-stats {
  flex-direction: row;
  gap: 20px;
}

.orientation-portrait .post-stats {
  flex-wrap: wrap;
  gap: 15px;
}

/* 交互模式适配 */
.interaction-touch .post-card .el-button,
.interaction-touch .create-post-btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-size: 16px;
}

.interaction-pointer .post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.interaction-pointer .create-post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .community-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
}
</style>