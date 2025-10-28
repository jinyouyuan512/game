<template>
  <div class="search-results">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">搜索结果</h1>
        <p class="page-subtitle">为您找到与 "{{ searchKeyword }}" 相关的内容</p>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-bar-container">
      <div class="container">
        <div class="search-bar-wrapper">
          <el-input
            v-model="searchInput"
            placeholder="搜索游戏或攻略..."
            @keyup.enter="handleSearch"
            clearable
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 搜索统计 -->
    <div class="search-stats">
      <div class="container">
        <div class="stats-content">
          <span class="total-count">找到 {{ totalResults }} 条结果</span>
          <span class="search-time">搜索用时: {{ searchTime }}ms</span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 结果内容 -->
    <template v-else>
      <!-- 游戏结果 -->
      <div v-if="games.length > 0" class="results-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Game /></el-icon>
              游戏结果 <span class="result-count">({{ games.length }})</span>
            </h2>
          </div>
          
          <div class="games-grid">
            <el-card
              v-for="game in games"
              :key="game.id"
              class="game-card"
              shadow="hover"
              @click="goToGameDetail(game.id)"
            >
              <div class="game-cover">
                <img
                  :src="game.cover_image_url || '/game-placeholder.svg'"
                  :alt="game.name"
                  @error="handleImageError"
                />
              </div>
              <h3 class="game-title">{{ game.name }}</h3>
              <p class="game-description">{{ getExcerpt(game.description, 100) }}</p>
              <div class="game-meta">
                <el-tag v-if="game.category" type="info" size="small">
                  {{ game.category }}
                </el-tag>
                <span class="developer">{{ game.developer }}</span>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 攻略结果 -->
      <div v-if="strategies.length > 0" class="results-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Document /></el-icon>
              攻略结果 <span class="result-count">({{ strategies.length }})</span>
            </h2>
          </div>
          
          <div class="strategies-list">
            <el-card
              v-for="strategy in strategies"
              :key="strategy.id"
              class="strategy-card"
              shadow="hover"
              @click="goToStrategyDetail(strategy.id)"
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
              <p class="strategy-excerpt">{{ getExcerpt(strategy.content, 150) }}</p>
              
              <div class="strategy-meta">
                <div class="meta-left">
                  <span class="author">{{ strategy.author }}</span>
                  <span class="date">{{ formatDate(strategy.created_at) }}</span>
                </div>
                <div class="meta-right">
                  <span class="views">
                    <el-icon><View /></el-icon>
                    {{ strategy.views || 0 }}
                  </span>
                  <span class="likes" v-if="strategy.likes">
                    <el-icon><Star /></el-icon>
                    {{ strategy.likes }}
                  </span>
                </div>
              </div>
              
              <div class="strategy-tags" v-if="strategy.tags && strategy.tags.length > 0">
                <el-tag
                  v-for="tag in strategy.tags"
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
        </div>
      </div>

      <!-- 无结果状态 -->
      <div v-if="games.length === 0 && strategies.length === 0" class="empty-state">
        <div class="container">
          <el-empty description="没有找到相关内容">
            <el-button type="primary" @click="handleSearch">重新搜索</el-button>
          </el-empty>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '../lib/api'
import { Search, Game, Document, View, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const searchKeyword = ref(route.query.q || '')
const searchInput = ref(route.query.q || '')
const games = ref([])
const strategies = ref([])
const loading = ref(false)
const searchTime = ref(0)

// 计算属性
const totalResults = computed(() => games.value.length + strategies.value.length)

// 方法
const handleSearch = async () => {
  if (!searchInput.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  // 更新URL参数
  router.push({ name: 'SearchResults', query: { q: searchInput.value } })
  
  // 执行搜索
  await performSearch(searchInput.value)
}

const performSearch = async (keyword) => {
  loading.value = true
  const startTime = performance.now()
  
  try {
    console.log('执行搜索:', keyword)
    const response = await apiClient.get(`/api/search?q=${encodeURIComponent(keyword)}`)
    
    games.value = response.games || []
    strategies.value = response.strategies || []
    
    const endTime = performance.now()
    searchTime.value = Math.round(endTime - startTime)
    
    console.log('搜索结果:', { games: games.value.length, strategies: strategies.value.length })
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
    
    // 提供一些模拟数据作为后备
    games.value = [
      { id: 1, name: '英雄联盟', description: '英雄联盟是一款多人在线战术竞技游戏', category: 'MOBA', developer: 'Riot Games' },
      { id: 2, name: '王者荣耀', description: '王者荣耀是一款热门的MOBA手游', category: 'MOBA', developer: '腾讯游戏' }
    ]
    strategies.value = [
      { id: 1, title: '英雄联盟新手攻略', content: '英雄联盟新手入门指南，教你如何快速上手', game_name: '英雄联盟', author: '游戏达人', difficulty: 'easy', created_at: new Date() }
    ]
  } finally {
    loading.value = false
  }
}

const goToGameDetail = (gameId) => {
  router.push(`/game/${gameId}`)
}

const goToStrategyDetail = (strategyId) => {
  router.push(`/strategy/${strategyId}`)
}

const handleImageError = (event) => {
  event.target.src = '/game-placeholder.svg'
}

const getExcerpt = (text, maxLength = 100) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
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

// 监听路由变化
onMounted(() => {
  if (searchKeyword.value) {
    performSearch(searchKeyword.value)
  }
})
</script>

<style scoped>
.search-results {
  min-height: 80vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0;
  margin-bottom: 30px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 18px;
  opacity: 0.9;
}

.search-bar-container {
  margin-bottom: 20px;
}

.search-bar-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.search-stats {
  background-color: #f5f7fa;
  padding: 15px 0;
  margin-bottom: 30px;
  border-radius: 8px;
}

.stats-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-count {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
}

.search-time {
  color: #6b7280;
}

.results-section {
  margin-bottom: 40px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-count {
  font-size: 16px;
  font-weight: normal;
  color: #6b7280;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.game-card {
  cursor: pointer;
  transition: transform 0.2s;
  height: 100%;
}

.game-card:hover {
  transform: translateY(-5px);
}

.game-cover {
  height: 180px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 15px;
}

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.game-card:hover .game-cover img {
  transform: scale(1.05);
}

.game-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.game-description {
  color: #6b7280;
  margin-bottom: 10px;
  line-height: 1.5;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.developer {
  color: #4b5563;
  font-size: 14px;
}

.strategies-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.strategy-card {
  cursor: pointer;
  transition: all 0.2s;
}

.strategy-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.strategy-header {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.strategy-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #1f2937;
}

.strategy-excerpt {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 15px;
}

.strategy-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.meta-left, .meta-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.author, .date {
  color: #4b5563;
  font-size: 14px;
}

.views, .likes {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6b7280;
}

.strategy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
}

.empty-state {
  padding: 60px 0;
}

.loading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }
  
  .stats-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>