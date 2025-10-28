<template>
  <div class="strategy-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">攻略大全</h1>
        <p class="page-subtitle">发现最新、最热门的游戏攻略，助你成为游戏高手</p>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <el-card class="search-card">
        <div class="search-bar">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input
                v-model="searchQuery"
                placeholder="搜索攻略标题、内容或作者..."
                clearable
                @input="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="5">
              <el-select v-model="gameFilter" placeholder="选择游戏" clearable @change="handleFilter">
                <el-option label="全部游戏" value="" />
                <el-option
                  v-for="game in games"
                  :key="game.id"
                  :label="game.name"
                  :value="game.id"
                />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="difficultyFilter" placeholder="难度等级" clearable @change="handleFilter">
                <el-option label="全部难度" value="" />
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
                <el-option label="最新发布" value="created_at" />
                <el-option label="最多浏览" value="views" />
                <el-option label="最多点赞" value="likes" />
                <el-option label="标题排序" value="title" />
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-button @click="resetFilters">重置筛选</el-button>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 攻略列表 -->
    <div class="strategy-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="filteredStrategies.length === 0" class="empty-state">
        <el-empty description="暂无攻略数据">
          <el-button type="primary" @click="resetFilters">重置筛选条件</el-button>
        </el-empty>
      </div>
      
      <div v-else class="strategy-grid">
        <el-card
          v-for="strategy in paginatedStrategies"
          :key="strategy.id"
          class="strategy-card"
          shadow="hover"
          @click="viewStrategy(strategy.id)"
        >
          <div class="strategy-header">
            <div class="strategy-game">
              <el-tag size="small">{{ strategy.game_name }}</el-tag>
            </div>
            <div class="strategy-difficulty">
              <el-tag :type="getDifficultyType(strategy.difficulty)" size="small">
                {{ getDifficultyText(strategy.difficulty) }}
              </el-tag>
            </div>
          </div>
          
          <h3 class="strategy-title">{{ strategy.title }}</h3>
          
          <p class="strategy-excerpt">{{ getExcerpt(strategy.content) }}</p>
          
          <div class="strategy-meta">
            <div class="meta-left">
              <span class="author">
                <el-icon><User /></el-icon>
                {{ strategy.author }}
              </span>
              <span class="date">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(strategy.created_at) }}
              </span>
            </div>
            <div class="meta-right">
              <span class="views">
                <el-icon><View /></el-icon>
                {{ strategy.views || 0 }}
              </span>
              <span class="likes">
                <el-icon><Star /></el-icon>
                {{ strategy.likes || 0 }}
              </span>
            </div>
          </div>
          
          <div class="strategy-tags" v-if="strategy.tags">
            <el-tag
              v-for="tag in getTags(strategy.tags)"
              :key="tag"
              size="small"
              type="info"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-card>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredStrategies.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="filteredStrategies.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { apiClient } from '../lib/api'
import { ElMessage } from 'element-plus'
import { Search, User, Calendar, View, Star } from '@element-plus/icons-vue'

const router = useRouter()
const gameStore = useGameStore()

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const gameFilter = ref('')
const difficultyFilter = ref('')
const sortBy = ref('created_at')
const currentPage = ref(1)
const pageSize = ref(12)
const strategies = ref([])
const games = ref([])

// 计算属性
const filteredStrategies = computed(() => {
  let result = [...strategies.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(strategy => 
      strategy.title.toLowerCase().includes(query) ||
      strategy.content.toLowerCase().includes(query) ||
      strategy.author.toLowerCase().includes(query)
    )
  }
  
  // 游戏过滤
  if (gameFilter.value) {
    result = result.filter(strategy => strategy.game_id === gameFilter.value)
  }
  
  // 难度过滤
  if (difficultyFilter.value) {
    result = result.filter(strategy => strategy.difficulty === difficultyFilter.value)
  }
  
  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'views':
        return (b.views || 0) - (a.views || 0)
      case 'likes':
        return (b.likes || 0) - (a.likes || 0)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'created_at':
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })
  
  return result
})

const paginatedStrategies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStrategies.value.slice(start, end)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  gameFilter.value = ''
  difficultyFilter.value = ''
  sortBy.value = 'created_at'
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const viewStrategy = (id) => {
  router.push(`/strategies/${id}`)
}

const getDifficultyType = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
}

const getDifficultyText = (difficulty) => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}

const getExcerpt = (content) => {
  if (!content) return ''
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

const getTags = (tags) => {
  if (!tags) return []
  return tags.split(',').map(tag => tag.trim()).filter(tag => tag)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 获取数据
const fetchStrategies = async () => {
  loading.value = true
  try {
    // 调用本地API获取攻略数据
    const data = await apiClient.get('/api/strategies?status=published')
    
    // 使用API返回的数据，已经包含了game_name字段
    strategies.value = data
  } catch (error) {
    console.error('获取攻略数据失败:', error)
    ElMessage.error('获取攻略数据失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const fetchGames = async () => {
  try {
    await gameStore.fetchGames()
    games.value = gameStore.games
  } catch (error) {
    console.error('获取游戏数据失败:', error)
  }
}

// 生命周期
onMounted(() => {
  fetchStrategies()
  fetchGames()
})
</script>

<style scoped>
.strategy-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.header-content {
  padding: 20px 0;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.search-filter-section {
  margin-bottom: 24px;
}

.search-card {
  border-radius: 8px;
}

.search-bar {
  padding: 16px 0;
}

.strategy-content {
  min-height: 400px;
}

.loading-container {
  padding: 20px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.strategy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.strategy-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.strategy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.strategy-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: #303133;
  line-height: 1.4;
}

.strategy-excerpt {
  color: #606266;
  margin: 0 0 16px 0;
  flex-grow: 1;
  line-height: 1.6;
}

.strategy-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #909399;
}

.meta-left, .meta-right {
  display: flex;
  gap: 16px;
}

.meta-left span, .meta-right span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.strategy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  margin-right: 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .strategy-list {
    padding: 16px;
  }
  
  .strategy-grid {
    grid-template-columns: 1fr;
  }
  
  .search-bar .el-col {
    margin-bottom: 10px;
  }
}
</style>