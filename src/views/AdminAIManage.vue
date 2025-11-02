<template>
  <div class="admin-ai-manage">
    <div class="page-header">
      <h2>AI对话管理</h2>
      <div class="header-actions">
        <el-button type="danger" @click="clearAllConversations" :loading="clearing">
          <el-icon><Delete /></el-icon>
          清空所有对话
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户或问题关键词..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="选择状态" clearable @change="handleFilter">
            <el-option label="全部状态" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleFilter"
          />
        </el-col>
        <el-col :span="4">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 对话列表 -->
    <el-table
      :data="filteredConversations"
      v-loading="loading"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="user.username" label="用户" width="120" />
      <el-table-column prop="start_time" label="开始时间" width="180" />
      <el-table-column prop="last_message_time" label="最后消息时间" width="180" />
      <el-table-column prop="message_count" label="消息数量" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '活跃' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="last_message" label="最后消息" min-width="300">
        <template #default="{ row }">
          <div class="last-message" :title="row.last_message">
            {{ truncateText(row.last_message, 50) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewConversation(row)">查看</el-button>
          <el-button size="small" type="danger" @click="deleteConversation(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalConversations"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 对话详情对话框 -->
    <el-dialog
      v-model="showConversationDetail"
      :title="`对话详情 - ID: ${selectedConversation?.id}`"
      width="80%"
      top="10px"
      fullscreen-icon
      @close="closeConversationDetail"
    >
      <div class="conversation-detail" v-loading="loadingDetail">
        <div class="conversation-info">
          <div class="info-item">
            <span class="info-label">用户：</span>
            <span class="info-value">{{ selectedConversation?.user.username || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">开始时间：</span>
            <span class="info-value">{{ formatDateTime(selectedConversation?.start_time) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">结束时间：</span>
            <span class="info-value">{{ formatDateTime(selectedConversation?.end_time) || '进行中' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">消息数量：</span>
            <span class="info-value">{{ selectedConversation?.message_count || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态：</span>
            <el-tag :type="selectedConversation?.status === 'active' ? 'success' : 'info'">
              {{ selectedConversation?.status === 'active' ? '活跃' : '已结束' }}
            </el-tag>
          </div>
        </div>

        <div class="message-list">
          <div
            v-for="(message, index) in selectedConversation?.messages"
            :key="index"
            :class="['message-item', message.role === 'user' ? 'user-message' : 'ai-message']"
          >
            <div class="message-avatar">
              <el-avatar :size="40" :icon="message.role === 'user' ? User : ChatDotRound" />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-role">{{ message.role === 'user' ? '用户' : 'AI助手' }}</span>
                <span class="message-time">{{ formatDateTime(message.timestamp) }}</span>
              </div>
              <div class="message-body">
                <pre>{{ message.content }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConversationDetail = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Search, User, ChatDotRound } from '@element-plus/icons-vue'

// 状态管理
const loading = ref(false)
const clearing = ref(false)
const loadingDetail = ref(false)
const conversations = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const showConversationDetail = ref(false)
const selectedConversation = ref(null)

// 计算属性
const filteredConversations = computed(() => {
  let result = [...conversations.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(conv => 
      conv.user.username.toLowerCase().includes(query) ||
      conv.last_message.toLowerCase().includes(query)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(conv => conv.status === statusFilter.value)
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    result = result.filter(conv => {
      const startTime = new Date(conv.start_time)
      return startTime >= dateRange.value[0] && startTime <= dateRange.value[1]
    })
  }
  
  return result
})

const totalConversations = computed(() => filteredConversations.value.length)

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 加载对话数据
const loadConversations = async () => {
  loading.value = true
  try {
    // 模拟获取对话数据
    const mockConversations = []
    const users = [
      { id: 1, username: 'user1' },
      { id: 2, username: 'user2' },
      { id: 3, username: 'user3' },
      { id: 4, username: 'user4' }
    ]
    
    for (let i = 1; i <= 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const startDate = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
      const lastMessageDate = new Date(startDate.getTime() + Math.floor(Math.random() * 60 * 60 * 1000))
      const messageCount = Math.floor(Math.random() * 20) + 1
      const isActive = Math.random() > 0.5
      
      mockConversations.push({
        id: i,
        user: user,
        start_time: startDate.toISOString(),
        last_message_time: lastMessageDate.toISOString(),
        end_time: isActive ? null : new Date(lastMessageDate.getTime() + Math.floor(Math.random() * 30 * 60 * 1000)).toISOString(),
        message_count: messageCount,
        status: isActive ? 'active' : 'ended',
        last_message: i % 3 === 0 
          ? '请问如何快速升级？' 
          : i % 3 === 1 
          ? '如何击败最终BOSS？' 
          : '求推荐一些好用的装备搭配'
      })
    }
    
    // 按最后消息时间排序
    mockConversations.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time))
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    conversations.value = mockConversations
  } catch (error) {
    console.error('加载对话数据失败:', error)
    ElMessage.error('加载对话数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}

// 查看对话详情
const viewConversation = async (conversation) => {
  loadingDetail.value = true
  try {
    // 模拟获取对话详情
    const messages = []
    const gameNames = ['原神', '王者荣耀', '英雄联盟', '和平精英', '绝地求生']
    
    for (let i = 0; i < conversation.message_count; i++) {
      const isUser = i % 2 === 0
      
      if (isUser) {
        // 用户消息
        const userQuestions = [
          `请问${gameNames[Math.floor(Math.random() * gameNames.length)]}中如何快速升级？`,
          `这个BOSS太难了，有什么技巧吗？`,
          `什么装备最适合这个职业？`,
          `在哪里可以获得稀有道具？`,
          `有什么隐藏任务吗？`
        ]
        messages.push({
          role: 'user',
          content: userQuestions[Math.floor(Math.random() * userQuestions.length)],
          timestamp: new Date(conversation.start_time.getTime() + i * 60000).toISOString()
        })
      } else {
        // AI消息
        messages.push({
          role: 'assistant',
          content: `感谢您的问题！针对您的疑问，我建议您：\n1. 首先完成主线任务，这是最稳定的经验来源\n2. 参与每日活动和挑战\n3. 组队刷副本效率更高\n4. 使用经验加成道具\n\n如果您有更具体的问题，请随时告诉我！`,
          timestamp: new Date(conversation.start_time.getTime() + (i + 0.5) * 60000).toISOString()
        })
      }
    }
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 600))
    
    selectedConversation.value = {
      ...conversation,
      messages: messages
    }
    
    showConversationDetail.value = true
  } catch (error) {
    console.error('加载对话详情失败:', error)
    ElMessage.error('加载对话详情失败')
  } finally {
    loadingDetail.value = false
  }
}

// 关闭对话详情
const closeConversationDetail = () => {
  selectedConversation.value = null
}

// 删除对话
const deleteConversation = (conversation) => {
  ElMessageBox.confirm(
    `确定要删除对话ID ${conversation.id} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const index = conversations.value.findIndex(conv => conv.id === conversation.id)
      if (index > -1) {
        conversations.value.splice(index, 1)
      }
      
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除对话失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 清空所有对话
const clearAllConversations = () => {
  ElMessageBox.confirm(
    '确定要清空所有对话记录吗？此操作不可恢复！',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(async () => {
    clearing.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      conversations.value = []
      
      ElMessage.success('所有对话已清空')
    } catch (error) {
      console.error('清空对话失败:', error)
      ElMessage.error('清空失败')
    } finally {
      clearing.value = false
    }
  }).catch(() => {
    // 取消清空
  })
}

// 初始加载
onMounted(() => {
  loadConversations()
})
</script>

<style scoped>
.admin-ai-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.last-message {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 对话详情样式 */
.conversation-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.message-list {
  max-height: 600px;
  overflow-y: auto;
  padding: 10px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.user-message {
  flex-direction: row;
}

.ai-message {
  flex-direction: row;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 8px;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 52px);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-role {
  font-weight: 500;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-body {
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.message-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  color: #303133;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .conversation-info {
    flex-direction: column;
    gap: 12px;
  }
  
  .info-item {
    width: 100%;
  }
}
</style>