<template>
  <div class="friends-container">
    <div class="friends-header">
      <h1>我的好友</h1>
      <div class="header-actions">
        <el-button type="info" @click="editProfileVisible = true">
          个人资料
        </el-button>
        <el-button type="primary" @click="openAddFriendDialog" icon="Plus">添加好友</el-button>
      </div>
    </div>
    
    <div class="friends-content">
      <div class="friends-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="全部好友" name="all" />
          <el-tab-pane label="在线好友" name="online" />
          <el-tab-pane label="游戏好友" name="game" />
        </el-tabs>
      </div>
      
      <div class="friends-search">
        <el-input v-model="searchQuery" placeholder="搜索好友" prefix-icon="Search">
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      
      <div class="friends-list">
        <div class="friend-card" v-for="friend in filteredFriends" :key="friend.id">
          <div class="friend-avatar-container">
            <img :src="friend.avatar || '/default-avatar.png'" alt="好友头像" class="friend-avatar">
            <div class="online-status" :class="{ 'online': friend.is_online }" />
          </div>
          
          <div class="friend-info">
            <div class="friend-name-row">
              <h3 class="friend-name">{{ friend.username }}</h3>
              <span v-if="friend.game_playing" class="playing-game">正在玩: {{ friend.game_playing }}</span>
            </div>
            <div class="friend-status" v-if="friend.status_message">
              {{ friend.status_message }}
            </div>
          </div>
          
          <div class="friend-actions">
            <el-button type="primary" size="small" @click="sendMessage(friend.id)">发消息</el-button>
            <el-dropdown>
              <el-button size="small">
                更多 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="viewProfile(friend.id)">查看资料</el-dropdown-item>
                  <el-dropdown-item @click="removeFriend(friend.id)">删除好友</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div v-if="filteredFriends.length === 0" class="empty-state">
          <el-empty description="暂无好友" />
        </div>
      </div>
      
      <div class="pagination" v-if="filteredFriends.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredFriends.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 好友请求提示 -->
    <div v-if="friendRequests.length > 0" class="friend-requests-notice" @click="showFriendRequest = true">
      您有 {{ friendRequests.length }} 个好友请求 <el-icon><ArrowDown /></el-icon>
    </div>
    
    <!-- 添加好友对话框 -->
    <el-dialog
      v-model="addFriendDialogVisible"
      title="添加好友"
      width="400px"
      :before-close="handleDialogClose"
    >
      <el-form :model="addFriendForm" :rules="addFriendRules" ref="addFriendFormRef">
        <el-form-item label="搜索方式" prop="searchType">
          <el-radio-group v-model="addFriendForm.searchType">
            <el-radio label="username">用户名</el-radio>
            <el-radio label="email">邮箱</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="搜索内容" prop="searchValue">
          <el-input
            v-model="addFriendForm.searchValue"
            :placeholder="addFriendForm.searchType === 'username' ? '请输入用户名' : '请输入邮箱'"
          />
        </el-form-item>
        <el-form-item v-if="searchResults.length > 0" label="搜索结果">
          <div class="search-results">
            <div class="search-result-item" v-for="user in searchResults" :key="user.id">
              <img :src="user.avatar || '/default-avatar.png'" alt="用户头像" class="search-result-avatar">
              <div class="search-result-info">
                <div class="search-result-username">{{ user.username }}</div>
                <div class="search-result-email">{{ user.email }}</div>
              </div>
              <el-button type="primary" size="small" @click="sendFriendRequest(user.id)">
                发送请求
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="searchUser">搜索</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 好友请求面板 -->
    <el-drawer
      title="好友请求"
      v-model="showFriendRequest"
      direction="bottom"
      size="40%"
    >
      <div v-if="friendRequests.length === 0" class="empty-state">
        <p>暂无好友请求</p>
      </div>
      <div v-else class="friend-requests-list">
        <el-card
          v-for="request in friendRequests"
          :key="request.id"
          class="friend-request-card"
          :body-style="{ padding: '15px' }"
        >
          <div class="request-info">
            <img :src="request.sender.avatar" :alt="request.sender.username" class="request-avatar">
            <div class="request-details">
              <div class="request-username">{{ request.sender.username }}</div>
              <div class="request-message">{{ request.message }}</div>
              <div class="request-time">{{ formatLastSeen(request.timestamp) }}</div>
            </div>
            <div class="request-actions">
              <el-button type="success" size="small" @click="acceptFriendRequest(request.id)">
                接受
              </el-button>
              <el-button type="danger" size="small" @click="declineFriendRequest(request.id)">
                拒绝
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </el-drawer>
    
    <!-- 聊天对话框 -->
    <el-dialog
      :title="`与 ${selectedFriend?.username} 聊天`"
      v-model="chatDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="chat-container">
        <div class="chat-messages">
          <div v-if="currentChat && currentChat.length === 0" class="empty-chat">
            <p>暂无聊天记录，开始聊天吧！</p>
          </div>
          <div
            v-for="message in currentChat"
            :key="message.id"
            class="chat-message"
            :class="{ 'sent': message.senderId === currentUser.id, 'received': message.senderId !== currentUser.id }"
          >
            <div class="message-avatar">
              <img
                :src="message.senderId === currentUser.id ? currentUser.avatar : selectedFriend?.avatar"
                :alt="message.senderId === currentUser.id ? currentUser.username : selectedFriend?.username"
              >
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
        <div class="chat-input-area">
          <el-input
            v-model="newChatMessage"
            placeholder="输入消息..."
            type="textarea"
            :rows="2"
            @keyup.enter.ctrl="sendChatMessage"
          ></el-input>
          <el-button type="primary" @click="sendChatMessage">发送</el-button>
        </div>
      </div>
    </el-dialog>
    
    <!-- 好友资料对话框 -->
    <el-dialog
      :title="`${selectedFriend?.username} 的资料`"
      v-model="friendProfileVisible"
      width="500px"
    >
      <div class="friend-profile">
        <div class="profile-header">
          <img :src="selectedFriend?.avatar" :alt="selectedFriend?.username" class="profile-avatar">
          <div class="profile-status">
            <div class="status-dot" :class="{ online: selectedFriend?.is_online }"></div>
            <span>{{ selectedFriend?.is_online ? '在线' : '离线' }}</span>
          </div>
        </div>
        <div class="profile-body">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ selectedFriend?.username }}</el-descriptions-item>
            <el-descriptions-item label="等级">{{ selectedFriend?.level }}</el-descriptions-item>
            <el-descriptions-item label="成就">{{ selectedFriend?.achievements }}</el-descriptions-item>
            <el-descriptions-item label="个性签名">{{ selectedFriend?.status_message || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="简介">{{ selectedFriend?.bio || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="位置">{{ selectedFriend?.location || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="加入时间">{{ selectedFriend?.joinDate }}</el-descriptions-item>
            <el-descriptions-item label="Discord" v-if="selectedFriend?.socialLinks.discord">
              {{ selectedFriend?.socialLinks.discord }}
            </el-descriptions-item>
            <el-descriptions-item label="Steam" v-if="selectedFriend?.socialLinks.steam">
              {{ selectedFriend?.socialLinks.steam }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="profile-actions">
          <el-button type="primary" @click="openChat(selectedFriend)">发送消息</el-button>
          <el-button>删除好友</el-button>
        </div>
      </div>
    </el-dialog>
    
    <!-- 编辑个人资料对话框 -->
    <el-dialog
      title="编辑个人资料"
      v-model="editProfileVisible"
      width="600px"
    >
      <el-form
        :model="userProfile"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="userProfile.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input v-model="userProfile.statusMessage" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="userProfile.bio" type="textarea" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="userProfile.location"></el-input>
        </el-form-item>
        <el-form-item label="Discord">
          <el-input v-model="userProfile.socialLinks.discord"></el-input>
        </el-form-item>
        <el-form-item label="Steam">
          <el-input v-model="userProfile.socialLinks.steam"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editProfileVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User, Plus, Star, Setting, More, Message, Phone, InfoFilled, VideoCamera, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const addFriendFormRef = ref(null)

// 响应式数据
const activeTab = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const addFriendDialogVisible = ref(false)
const chatDialogVisible = ref(false)
const friendProfileVisible = ref(false)
const searchResults = ref([])
const selectedFriend = ref(null)
const currentChat = ref(null)
const newChatMessage = ref('')
const showFriendRequest = ref(false)
const editProfileVisible = ref(false)

// 模拟好友数据
const friends = ref([
  {
    id: 1,
    username: '旅行者',
    avatar: '/avatar1.png',
    is_online: true,
    status_message: '探索提瓦特大陆中...',
    game_playing: '原神',
    lastSeen: new Date(),
    level: 56,
    achievements: 320,
    bio: '喜欢探索开放世界游戏，最爱原神',
    location: '璃月港',
    joinDate: '2023-01-15',
    socialLinks: {
      discord: '旅行者#1234',
      steam: 'traveler_genshin'
    }
  },
  {
    id: 2,
    username: '峡谷王者',
    avatar: '/avatar2.png',
    is_online: true,
    status_message: '冲击王者！',
    game_playing: '英雄联盟',
    lastSeen: new Date(),
    level: 98,
    achievements: 450,
    bio: '专注LOL十年，擅长打野位置',
    location: '召唤师峡谷',
    joinDate: '2022-11-20',
    socialLinks: {
      discord: 'lol_king#5678',
      steam: 'league_master'
    }
  },
  {
    id: 3,
    username: '夜之城菜鸟',
    avatar: '/avatar3.png',
    is_online: false,
    status_message: '菜鸟一只，求带飞',
    game_playing: null,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    level: 23,
    achievements: 89,
    bio: '刚接触赛博朋克，未来可期',
    location: '夜之城',
    joinDate: '2024-03-10',
    socialLinks: {}
  },
  {
    id: 4,
    username: '星空探险家',
    avatar: '/avatar4.png',
    is_online: true,
    status_message: '寻找新的星球',
    game_playing: '星空',
    lastSeen: new Date(),
    level: 60,
    achievements: 500,
    bio: '全收集玩家，深渊满星',
    location: '蒙德',
    joinDate: '2021-09-05',
    socialLinks: {
      discord: 'teyvat_explorer#4321'
    }
  },
  {
    id: 5,
    username: '巫师猎魔人',
    avatar: '/avatar5.png',
    is_online: false,
    status_message: '猎魔人的旅程永不停歇',
    game_playing: null,
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
    level: 18,
    achievements: 45,
    bio: '快乐游戏，享受过程',
    location: '召唤师峡谷',
    joinDate: '2024-05-12',
    socialLinks: {}
  }
])

// 模拟聊天记录数据
const chatHistory = {
  1: [
    { id: 1, senderId: 1, content: '嗨，一起玩原神吗？', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
    { id: 2, senderId: 999, content: '好啊，我刚好在线', timestamp: new Date(Date.now() - 59 * 60 * 1000) },
    { id: 3, senderId: 1, content: '来我世界吧，一起打深渊', timestamp: new Date(Date.now() - 58 * 60 * 1000) }
  ],
  2: [
    { id: 4, senderId: 999, content: '你LOL段位多少了？', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { id: 5, senderId: 2, content: '大师，你呢？', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
  ]
}

// 模拟好友请求数据
const friendRequests = ref([
  {
    id: 101,
    sender: {
      id: 10,
      username: '星空探索者',
      avatar: '/avatar10.png'
    },
    message: '看到你也喜欢星空，一起玩吧！',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 102,
    sender: {
      id: 11,
      username: '悟空迷',
      avatar: '/avatar11.png'
    },
    message: '黑神话悟空爱好者一枚',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }
])

// 添加好友表单
const addFriendForm = reactive({
  searchType: 'username',
  searchValue: ''
})

// 用户个人资料表单
const userProfile = reactive({
  username: '当前用户',
  statusMessage: '在线',
  bio: '热爱游戏的玩家',
  location: '未知',
  socialLinks: {
    discord: '',
    steam: ''
  }
})

const addFriendRules = {
  searchType: [
    { required: true, message: '请选择搜索方式', trigger: 'change' }
  ],
  searchValue: [
    { required: true, message: '请输入搜索内容', trigger: 'blur' }
  ]
}

// 计算属性
const filteredFriends = computed(() => {
  let filtered = [...friends.value]
  
  // 根据标签筛选
  if (activeTab.value === 'online') {
    filtered = filtered.filter(friend => friend.is_online)
  } else if (activeTab.value === 'game') {
    filtered = filtered.filter(friend => friend.game_playing)
  }
  
  // 根据搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(friend => 
      friend.username.toLowerCase().includes(query) ||
      (friend.game_playing && friend.game_playing.toLowerCase().includes(query))
    )
  }
  
  return filtered
})

// 当前用户信息
const currentUser = computed(() => userStore.user || {
  id: 999,
  username: '当前用户',
  avatar: '/default-avatar.png'
})

// 方法
const handleTabClick = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}

const openAddFriendDialog = () => {
  addFriendDialogVisible.value = true
  searchResults.value = []
}

const handleDialogClose = () => {
  addFriendFormRef.value?.resetFields()
  searchResults.value = []
  addFriendDialogVisible.value = false
}

const searchUser = async () => {
  const isValid = await addFriendFormRef.value.validate()
  if (!isValid) return
  
  // 模拟搜索用户
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 模拟搜索结果
  searchResults.value = [
    {
      id: 10,
      username: '游戏达人',
      email: 'gamer@example.com',
      avatar: '/avatar6.png'
    },
    {
      id: 11,
      username: '策略大师',
      email: 'strategy@example.com',
      avatar: '/avatar7.png'
    }
  ]
}

const sendFriendRequest = (userId) => {
  ElMessageBox.confirm('确定要发送好友请求吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('好友请求发送成功')
    searchResults.value = []
  }).catch(() => {
    // 取消发送
  })
}

const openChat = (friend) => {
  selectedFriend.value = friend
  // 初始化聊天记录
  if (!chatHistory[friend.id]) {
    chatHistory[friend.id] = []
  }
  currentChat.value = chatHistory[friend.id]
  chatDialogVisible.value = true
}

const sendMessage = (friendId) => {
  const friend = friends.value.find(f => f.id === friendId)
  openChat(friend)
}

const sendChatMessage = () => {
  if (!newChatMessage.value.trim() || !selectedFriend.value) return
  
  const message = {
    id: Date.now(),
    senderId: currentUser.value.id,
    content: newChatMessage.value.trim(),
    timestamp: new Date()
  }
  
  currentChat.value.push(message)
  newChatMessage.value = ''
}

const viewProfile = (friendId) => {
  selectedFriend.value = friends.value.find(f => f.id === friendId)
  friendProfileVisible.value = true
}

const removeFriend = (friendId) => {
  ElMessageBox.confirm('确定要删除这个好友吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = friends.value.findIndex(f => f.id === friendId)
    if (index > -1) {
      friends.value.splice(index, 1)
      ElMessage.success('删除好友成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

const acceptFriendRequest = (requestId) => {
  const request = friendRequests.value.find(r => r.id === requestId)
  if (request) {
    // 添加到好友列表
    friends.value.push({
      id: request.sender.id,
      username: request.sender.username,
      avatar: request.sender.avatar,
      is_online: true,
      status_message: '',
      game_playing: null,
      lastSeen: new Date(),
      level: 1,
      achievements: 0,
      bio: '',
      location: '',
      joinDate: new Date().toISOString().split('T')[0],
      socialLinks: {}
    })
    // 移除请求
    friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
    ElMessage.success('已添加为好友')
  }
}

const declineFriendRequest = (requestId) => {
  friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
  ElMessage.info('已拒绝好友请求')
}

const openEditProfile = () => {
  editProfileVisible.value = true
}

const saveProfile = () => {
  // 模拟保存个人资料
  ElMessage.success('个人资料已更新')
  editProfileVisible.value = false
}

const formatLastSeen = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString()
}

const formatMessageTime = (date) => {
  const now = new Date(date)
  return now.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.friends-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.friends-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.friends-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.friends-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.friends-tabs {
  margin-bottom: 20px;
}

.friends-search {
  margin-bottom: 20px;
}

.friend-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f7fa;
  transition: background-color 0.3s;
}

.friend-card:hover {
  background-color: #fafafa;
}

.friend-card:last-child {
  border-bottom: none;
}

.friend-avatar-container {
  position: relative;
  margin-right: 20px;
}

.friend-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #909399;
  border: 2px solid #fff;
}

.online-status.online {
  background-color: #67c23a;
}

.friend-info {
  flex: 1;
}

.friend-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.friend-name {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.playing-game {
  font-size: 12px;
  color: #67c23a;
}

.friend-status {
  font-size: 14px;
  color: #909399;
}

.friend-actions {
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

/* 搜索结果样式 */
.search-results {
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f5f7fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.search-result-info {
  flex: 1;
}

.search-result-username {
  font-weight: 500;
  color: #333;
}

.search-result-email {
  font-size: 12px;
  color: #909399;
}

/* 资料弹窗样式 */
.profile-info {
  text-align: center;
}

.profile-info h3 {
  margin: 10px 0;
  color: #333;
}

.profile-info p {
  margin: 5px 0;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .friends-container {
    padding: 10px;
  }
  
  .friends-content {
    padding: 16px;
  }
  
  .friend-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .friend-avatar-container {
    margin-right: 0;
  }
  
  .friend-actions {
    align-self: flex-end;
  }
}
</style>