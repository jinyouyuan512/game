<template>
  <div class="game-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">游戏中心</h1>
        <p class="page-subtitle">探索热门游戏，获取专业攻略</p>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-section">
      <div class="container">
        <div class="filter-bar">
          <router-link to="/add-game" class="add-game-btn">
            <el-button type="primary" plain>
              <el-icon><Plus /></el-icon>
              添加游戏
            </el-button>
          </router-link>
          
          <div class="filter-group">
            <label>游戏分类：</label>
            <el-select
              v-model="selectedCategory"
              placeholder="选择分类"
              clearable
              @change="handleCategoryChange"
            >
              <el-option
                v-for="cat in categories"
                :key="cat.value"
                :label="cat.label"
                :value="cat.value"
              />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label>排序方式：</label>
            <el-select
              v-model="sortBy"
              placeholder="排序方式"
              @change="handleSortChange"
            >
              <el-option label="最新发布" value="created_at" />
              <el-option label="名称排序" value="name" />
              <el-option label="开发商" value="developer" />
              <el-option label="浏览量" value="views" />
            </el-select>
          </div>

          <div class="search-group">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索游戏名称、开发商或简介..."
              @keyup.enter="handleSearch"
              @clear="handleSearch"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </div>
        </div>
        
        <!-- 筛选结果统计 -->
        <div v-if="!loading && totalGames > 0" class="filter-stats">
          <span>共找到 {{ totalGames }} 款游戏</span>
          <span v-if="selectedCategory" class="filter-tag">
            分类: {{ categories.find(c => c.value === selectedCategory)?.label }}
            <el-button size="small" text @click="selectedCategory = ''; handleCategoryChange()">
              <el-icon><Close /></el-icon>
            </el-button>
          </span>
          <span v-if="searchKeyword" class="filter-tag">
            搜索: {{ searchKeyword }}
            <el-button size="small" text @click="searchKeyword = ''; handleSearch()">
              <el-icon><Close /></el-icon>
            </el-button>
          </span>
          <el-button
            v-if="selectedCategory || searchKeyword"
            size="small"
            plain
            @click="resetFilters"
          >
            重置所有筛选
          </el-button>
        </div>
      </div>
    </div>

    <!-- 游戏列表 -->
    <div class="games-content">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="games-grid loading-state">
          <div v-for="i in 4" :key="i" class="game-card-loading">
            <el-skeleton animated :rows="1" style="height: 220px; border-radius: 12px;"></el-skeleton>
            <div class="skeleton-content">
              <el-skeleton animated :rows="1" style="width: 80%; margin-top: 15px;"></el-skeleton>
              <el-skeleton animated :rows="2" style="width: 100%; margin-top: 10px;"></el-skeleton>
              <el-skeleton animated :rows="1" style="width: 60%; margin-top: 10px;"></el-skeleton>
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <el-alert
            :title="'加载失败：' + error"
            type="error"
            show-icon
            :closable="false"
          ></el-alert>
          <el-button type="primary" @click="loadGames" class="retry-button">
            重试
          </el-button>
        </div>

        <!-- 游戏列表 -->
        <div v-else-if="filteredGames.length > 0" class="games-grid">
          <div
            v-for="game in filteredGames"
            :key="game.id"
            class="game-card"
            @click="goToGameDetail(game.id)"
          >
            <div class="game-cover">
              <img
                :src="game.cover_image_url || '/game-placeholder.svg'"
                :alt="game.name"
                @error="handleImageError"
                class="game-image"
              />
              <div class="game-category-badge">{{ game.category || '未分类' }}</div>
              <div v-if="game.views > 0" class="game-views">
                <el-icon><View /></el-icon> {{ game.views }}
              </div>
              <div class="game-overlay">
                <div class="overlay-content">
                  <el-button type="primary" round>
                    <el-icon><View /></el-icon>
                    查看攻略
                  </el-button>
                  <div class="game-stats">
                    <span class="stat-item">
                      <el-icon><Document /></el-icon>
                      {{ getStrategyCount(game.id) }} 篇攻略
                    </span>
                    <span v-if="game.rating" class="stat-item rating">
                      <el-icon><Star /></el-icon>
                      {{ game.rating }}分
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="game-info">
              <h3 class="game-title">{{ game.name }}</h3>
              <p class="game-description">{{ game.description || '暂无描述' }}</p>
              
              <div class="game-meta">
                <div class="meta-row">
                  <span class="developer">{{ game.developer || '未知开发商' }}</span>
                  <span class="release-date" v-if="game.release_date">
                    {{ formatDate(game.release_date) }}
                  </span>
                </div>
                
                <div class="meta-row">
                  <div class="game-tags">
                    <el-tag v-if="game.platform" size="small" effect="plain">
                      {{ game.platform }}
                    </el-tag>
                    <el-tag v-if="game.genre" size="small" effect="plain">
                      {{ game.genre }}
                    </el-tag>
                  </div>
                  <div class="game-actions">
                    <el-button
                      size="small"
                      type="primary"
                      @click.stop="goToGameDetail(game.id)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-empty description="暂无符合条件的游戏">
            <el-button type="primary" @click="resetFilters">重置筛选</el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div v-if="!loading && totalGames > pageSize" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48]"
            :total="totalGames"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '../stores/game'
import { Plus, Search, View, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()

// 筛选和搜索状态
const selectedCategory = ref('')
const sortBy = ref('created_at')
const searchKeyword = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(12)

// 从store获取数据和状态
const filteredGames = computed(() => gameStore.games)
const totalGames = computed(() => gameStore.gamesTotal)
const loading = computed(() => gameStore.gamesLoading)
const error = computed(() => gameStore.gamesError)

// 分类列表
const categories = computed(() => [
  { label: '全部', value: '' },
  { label: 'RPG', value: 'RPG' },
  { label: '动作', value: 'Action' },
  { label: '策略', value: 'Strategy' },
  { label: '射击', value: 'Shooter' },
  { label: '模拟', value: 'Simulation' },
  { label: '竞技', value: 'Competitive' }
])

// 方法
/**
 * 加载游戏数据
 */
const loadGames = async () => {
  try {
    const filters = {
      category: selectedCategory.value || undefined,
      sortBy: sortBy.value,
      sortOrder: 'desc', // 默认降序
      page: currentPage.value,
      pageSize: pageSize.value,
      q: searchKeyword.value.trim() || undefined
    }
    
    await gameStore.fetchGames(filters)
  } catch (err) {
    console.error('加载游戏失败:', err)
    ElMessage.error('加载游戏失败，请稍后重试')
  }
}

/**
 * 处理分类变更
 */
const handleCategoryChange = () => {
  currentPage.value = 1
  loadGames()
}

/**
 * 处理排序变更
 */
const handleSortChange = () => {
  currentPage.value = 1
  loadGames()
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  currentPage.value = 1
  
  // 如果搜索关键词较长，使用高级搜索页面
  if (searchKeyword.value.trim().length > 3) {
    // 可以选择跳转到搜索结果页面
    // router.push({ name: 'SearchResults', query: { q: searchKeyword.value.trim() } })
    // 或者直接在这里加载搜索结果
    loadGames()
  } else {
    loadGames()
  }
}

/**
 * 处理页大小变更
 */
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadGames()
}

/**
 * 处理页码变更
 */
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadGames()
  
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 重置筛选条件
 */
const resetFilters = () => {
  selectedCategory.value = ''
  sortBy.value = 'created_at'
  searchKeyword.value = ''
  currentPage.value = 1
  loadGames()
}

/**
 * 跳转到游戏详情页
 */
const goToGameDetail = (gameId) => {
  router.push(`/games/${gameId}`)
}

/**
 * 获取游戏攻略数量
 */
const getStrategyCount = (gameId) => {
  // 从store中获取攻略数量
  if (gameStore.strategyCountMap && gameStore.strategyCountMap[gameId]) {
    return gameStore.strategyCountMap[gameId]
  }
  return 0
}

/**
 * 处理图片加载错误
 */
const handleImageError = (event) => {
  event.target.src = '/game-placeholder.svg'
}

/**
 * 格式化日期
 */
const formatDate = (dateString) => {
  try {
    if (!dateString) return '未发布'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '未发布'
    }
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (err) {
    return '未发布'
  }
}

// 监听路由参数变化
watch(() => route.query, (newQuery) => {
  if (newQuery.category !== undefined) {
    selectedCategory.value = newQuery.category || ''
  }
  if (newQuery.search !== undefined) {
    searchKeyword.value = newQuery.search || ''
  }
  // 当路由参数变化时重新加载数据
  loadGames()
}, { immediate: true })

// 组件挂载时获取数据
onMounted(async () => {
  await loadGames()
})</script>

<style scoped>
.game-center {
  background: var(--bg-color-page);
  color: var(--text-color-primary);
  min-height: 100vh;
}

.page-header {
  background: var(--tech-bg-dark);
  padding: 80px 0 60px;
  text-align: center;
  position: relative;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%2300d4ff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.page-title {
  font-size: 3rem;
  margin-bottom: 15px;
  background: linear-gradient(45deg, #00d4ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
}

.filter-section {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: bold;
  white-space: nowrap;
}

.search-group {
  flex: 1;
  min-width: 300px;
}

.search-group :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
}

.search-group :deep(.el-input__prefix) {
  color: #00d4ff;
}

/* 筛选结果统计 */
.filter-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(0, 212, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.filter-stats span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  font-size: 13px;
  color: #00d4ff;
}

.games-content {
  padding: 60px 0;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

/* 加载状态 */
.loading-state {
  opacity: 0.7;
}

.game-card-loading {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  padding-bottom: 25px;
}

.skeleton-content {
  padding: 0 25px;
}

/* 错误状态 */
.error-state {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  margin-bottom: 60px;
}

.retry-button {
  margin-top: 20px;
}

/* 游戏卡片 */
.game-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
}

.game-cover {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-card:hover .game-image {
  transform: scale(1.1);
}

/* 分类标签 */
.game-category-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(0, 212, 255, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
}

/* 浏览量 */
.game-views {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 10;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover .game-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: #fff;
}

.game-stats {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.stat-item.rating {
  color: #ffd700;
}

.game-info {
  padding: 25px;
}

.game-title {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: #00d4ff;
  font-weight: bold;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.game-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.game-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.release-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.developer {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  flex: 1;
}

/* 游戏标签 */
.game-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.game-tags :deep(.el-tag) {
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

.game-tags :deep(.el-tag):hover {
  background-color: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  color: #00d4ff;
}

.game-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Element Plus 组件样式覆盖 */
:deep(.el-select) {
  min-width: 120px;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-input__wrapper:hover) {
  border-color: #00d4ff;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

:deep(.el-input__inner) {
  color: #ffffff;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

:deep(.el-select-dropdown) {
  background-color: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

:deep(.el-select-dropdown__item) {
  color: #ffffff;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(0, 212, 255, 0.2);
}

:deep(.el-select-dropdown__item.selected) {
  background-color: rgba(0, 212, 255, 0.3);
  color: #00d4ff;
}

:deep(.el-pagination) {
  --el-pagination-text-color: rgba(255, 255, 255, 0.8);
  --el-pagination-bg-color: rgba(255, 255, 255, 0.1);
  --el-pagination-hover-color: #00d4ff;
}

:deep(.el-pager li) {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-pager li:hover) {
  color: #00d4ff;
  border-color: #00d4ff;
}

:deep(.el-pager li.is-active) {
  background-color: #00d4ff;
  color: #ffffff;
  border-color: #00d4ff;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .container {
    max-width: 960px;
    padding: 0 30px;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }
  
  .filter-bar {
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .page-header {
    padding: 60px 0 40px;
  }
  
  .page-title {
    font-size: 2.5rem;
  }
  
  .filter-section {
    padding: 30px 0;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 0 30px;
  }
  
  .page-title {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .filter-section {
    padding: 20px 0;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .filter-group label {
    font-size: 14px;
    font-weight: 600;
  }
  
  .search-group {
    min-width: auto;
  }
  
  .games-content {
    padding: 30px 0;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .game-card {
    margin: 0 10px;
  }
  
  .game-cover {
    height: 180px;
  }
  
  .game-info {
    padding: 15px;
  }
  
  .game-title {
    font-size: 1.1rem;
  }
  
  .game-description {
    font-size: 0.9rem;
    -webkit-line-clamp: 2;
  }
  
  .meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .meta-tags {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .pagination-wrapper {
    padding-top: 30px;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 15px;
  }
  
  .page-header {
    padding: 30px 0 20px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .page-subtitle {
    font-size: 0.9rem;
  }
  
  .filter-section {
    padding: 15px 0;
  }
  
  .filter-bar {
    gap: 15px;
  }
  
  .games-content {
    padding: 20px 0;
  }
  
  .game-card {
    margin: 0 5px;
  }
  
  .game-cover {
    height: 160px;
  }
  
  .game-info {
    padding: 12px;
  }
  
  .game-title {
    font-size: 1rem;
    margin-bottom: 8px;
  }
  
  .game-description {
    font-size: 0.85rem;
    margin-bottom: 10px;
  }
  
  .meta-item {
    font-size: 12px;
  }
  
  .overlay-content .el-button {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .game-stats .stat-item {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.6rem;
  }
  
  .games-grid {
    gap: 15px;
  }
  
  .game-cover {
    height: 140px;
  }
  
  .filter-group label {
    font-size: 13px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .page-header {
    padding: 20px 0 15px;
  }
  
  .filter-section {
    padding: 15px 0;
  }
  
  .games-content {
    padding: 20px 0;
  }
}

/* 高分辨率屏幕优化 */
@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 35px;
  }
  
  .game-cover {
    height: 220px;
  }
}

/* 平板横屏优化 */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .games-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }
  
  .filter-bar {
    flex-wrap: wrap;
    gap: 15px;
  }
}

/* 打印样式 */
@media print {
  .filter-section,
  .game-overlay,
  .pagination-wrapper {
    display: none;
  }
  
  .page-header {
    background: none;
    color: black;
  }
  
  .game-card {
    border: 1px solid #ccc;
    break-inside: avoid;
  }
  
  .games-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}
</style>