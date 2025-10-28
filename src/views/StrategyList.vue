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
        
        <!-- 筛选结果统计 -->
        <div v-if="searchQuery || gameFilter || difficultyFilter" class="filter-stats">
          <span>找到 {{ totalCount }} 篇攻略</span>
          <el-tag
            v-if="gameFilter"
            closable
            size="small"
            @close="removeFilter('game')"
            class="filter-tag"
          >
            游戏: {{ games.find(g => g.id === gameFilter)?.name }}
          </el-tag>
          <el-tag
            v-if="difficultyFilter"
            closable
            size="small"
            @close="removeFilter('difficulty')"
            class="filter-tag"
          >
            难度: {{ getDifficultyText(difficultyFilter) }}
          </el-tag>
        </div>
      </el-card>
    </div>

    <!-- 攻略列表 -->
    <div class="strategy-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div v-for="i in 8" :key="i" class="strategy-card-loading">
          <el-skeleton :rows="7" animated />
        </div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <el-result
          icon="error"
          title="加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" class="retry-button" @click="loadStrategies">
              重新加载
            </el-button>
          </template>
        </el-result>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="strategies.length === 0" class="empty-state">
        <el-empty description="暂无攻略数据">
          <el-button type="primary" @click="resetFilters">重置筛选条件</el-button>
        </el-empty>
      </div>
      
      <!-- 攻略列表 -->
      <div v-else class="strategy-grid">
        <el-card
          v-for="strategy in strategies"
          :key="strategy.id"
          class="strategy-card"
          shadow="hover"
          @click="viewStrategy(strategy.id)"
        >
          <div class="strategy-header">
            <div class="strategy-game">
              <el-tag size="small" effect="dark">{{ strategy.game_name || '未知游戏' }}</el-tag>
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
                {{ strategy.author || '匿名' }}
              </span>
              <span class="date">
                <el-icon><Clock /></el-icon>
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
          
          <!-- 攻略标签 -->
          <div class="strategy-tags" v-if="strategy.tags && getTags(strategy.tags).length > 0">
            <span class="tags-label">标签：</span>
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
          
          <!-- 游戏信息 -->
          <div class="game-info" v-if="strategy.gameInfo">
            <img
              v-if="strategy.gameInfo.cover_image_url"
              :src="strategy.gameInfo.cover_image_url"
              :alt="strategy.gameInfo.name"
              class="game-thumbnail"
            />
            <span class="game-details">{{ strategy.gameInfo.name }}</span>
          </div>
        </el-card>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="strategies.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { ElMessage } from 'element-plus'
import { Search, User, Calendar, View, Star, Clock, Close } from '@element-plus/icons-vue'

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
const error = ref(null)

// 计算属性
const strategies = computed(() => gameStore.strategies)
const games = computed(() => gameStore.games)
const totalCount = computed(() => gameStore.strategiesTotal)

// 方法
const loadStrategies = async () => {
  error.value = null
  loading.value = true
  
  try {
    await gameStore.fetchStrategies({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      gameId: gameFilter.value,
      difficulty: difficultyFilter.value,
      sortBy: sortBy.value,
      sortOrder: 'desc'
    })
  } catch (err) {
    console.error('获取攻略数据失败:', err)
    error.value = err.message || '获取攻略数据失败'
    ElMessage.error('获取攻略数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadStrategies()
}

const handleFilter = () => {
  currentPage.value = 1
  loadStrategies()
}

const handleSort = () => {
  currentPage.value = 1
  loadStrategies()
}

const resetFilters = () => {
  searchQuery.value = ''
  gameFilter.value = ''
  difficultyFilter.value = ''
  sortBy.value = 'created_at'
  currentPage.value = 1
  loadStrategies()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadStrategies()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadStrategies()
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
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const removeFilter = (type) => {
  if (type === 'game') {
    gameFilter.value = ''
  } else if (type === 'difficulty') {
    difficultyFilter.value = ''
  }
  handleFilter()
}

// 生命周期
onMounted(async () => {
  try {
    await gameStore.fetchGames()
    await loadStrategies()
  } catch (err) {
    console.error('初始化数据失败:', err)
  }
})
</script>

<style scoped>
.strategy-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 40px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 0;
}

.search-filter-section {
  margin-bottom: 30px;
}

.search-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.search-bar {
  padding: 20px;
}

/* 筛选结果统计 */
.filter-stats {
  padding: 15px 20px 15px;
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-stats span {
  font-weight: 500;
  color: #606266;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 加载状态 */
.loading-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.strategy-card-loading {
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #fef0f0;
  border-radius: 12px;
  margin: 20px 0;
}

.retry-button {
  margin-top: 20px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #f5f7fa;
  border-radius: 12px;
}

.strategy-content {
  margin-bottom: 30px;
}

/* 攻略网格 */
.strategy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

/* 攻略卡片 */
.strategy-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px !important;
  overflow: hidden;
  position: relative;
}

.strategy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.strategy-card:hover .strategy-title {
  color: #667eea;
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

.strategy-game .el-tag {
  background-color: #1e293b;
  color: #f8fafc;
  border: none;
}

.strategy-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.strategy-excerpt {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 元数据部分 */
.strategy-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 0.85rem;
  color: #999;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-left,
.meta-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.author,
.date,
.views,
.likes {
  display: flex;
  align-items: center;
  gap: 5px;
}

.views {
  color: #667eea;
  font-weight: 500;
}

/* 标签部分 */
.strategy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #f0f2f5;
}

.tags-label {
  font-size: 0.85rem;
  color: #909399;
  margin-right: 4px;
}

.tag-item {
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.tag-item:hover {
  transform: scale(1.05);
}

/* 游戏信息 */
.game-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f2f5;
}

.game-thumbnail {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  object-fit: cover;
}

.game-details {
  font-size: 0.9rem;
  color: #606266;
  font-weight: 500;
}

/* 分页部分 */
.pagination-container {
  margin-top: 40px;
  text-align: center;
  padding: 20px 0;
  background-color: #fafafa;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .strategy-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .strategy-list {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .search-bar .el-row {
    gap: 10px;
  }
  
  .search-bar .el-col {
    flex: 1;
    max-width: 100%;
  }
  
  .filter-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .strategy-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .strategy-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .meta-left,
  .meta-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .strategy-card {
    border-radius: 8px !important;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 30px 15px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .loading-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .strategy-excerpt {
    -webkit-line-clamp: 4;
  }
}
</style>