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
              <el-option label="全部" value="" />
              <el-option label="RPG" value="RPG" />
              <el-option label="动作" value="Action" />
              <el-option label="策略" value="Strategy" />
              <el-option label="射击" value="Shooter" />
              <el-option label="模拟" value="Simulation" />
              <el-option label="竞技" value="Competitive" />
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
            </el-select>
          </div>

          <div class="search-group">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索游戏名称或开发商..."
              @keyup.enter="handleSearch"
              @clear="handleSearch"
              clearable
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏列表 -->
    <div class="games-content">
      <div class="container">
        <div class="games-grid" v-loading="gameStore.loading">
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
              />
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
                  </div>
                </div>
              </div>
            </div>
            
            <div class="game-info">
              <h3 class="game-title">{{ game.name }}</h3>
              <p class="game-description">{{ game.description }}</p>
              
              <div class="game-meta">
                <div class="meta-row">
                  <el-tag v-if="game.category" type="info" size="small">
                    {{ game.category }}
                  </el-tag>
                  <span class="release-date" v-if="game.release_date">
                    {{ formatDate(game.release_date) }}
                  </span>
                </div>
                
                <div class="meta-row">
                  <span class="developer">{{ game.developer }}</span>
                  <div class="game-actions">
                    <el-button
                      size="small"
                      type="primary"
                      @click.stop="goToGameDetail(game.id)"
                    >
                      查看攻略
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!gameStore.loading && filteredGames.length === 0" class="empty-state">
          <el-empty description="暂无游戏数据">
            <el-button type="primary" @click="resetFilters">重置筛选</el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div v-if="filteredGames.length > 0" class="pagination-wrapper">
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
import { Plus } from '@element-plus/icons-vue'

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

// 计算属性
const filteredGames = computed(() => {
  let games = [...gameStore.games]
  
  // 分类筛选
  if (selectedCategory.value) {
    games = games.filter(game => game.category === selectedCategory.value)
  }
  
  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    games = games.filter(game => 
      game.name.toLowerCase().includes(keyword) ||
      game.developer.toLowerCase().includes(keyword) ||
      (game.description && game.description.toLowerCase().includes(keyword))
    )
  }
  
  // 排序
  games.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'developer':
        return a.developer.localeCompare(b.developer)
      case 'created_at':
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return games.slice(start, end)
})

const totalGames = computed(() => {
  let games = [...gameStore.games]
  
  if (selectedCategory.value) {
    games = games.filter(game => game.category === selectedCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    games = games.filter(game => 
      game.name.toLowerCase().includes(keyword) ||
      game.developer.toLowerCase().includes(keyword) ||
      (game.description && game.description.toLowerCase().includes(keyword))
    )
  }
  
  return games.length
})

// 方法
const handleCategoryChange = () => {
  currentPage.value = 1
}

const handleSortChange = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilters = () => {
  selectedCategory.value = ''
  sortBy.value = 'created_at'
  searchKeyword.value = ''
  currentPage.value = 1
}

const goToGameDetail = (gameId) => {
  router.push(`/games/${gameId}`)
}

const getStrategyCount = (gameId) => {
  // 这里可以从store中获取该游戏的攻略数量
  // 暂时返回随机数作为演示
  return Math.floor(Math.random() * 20) + 1
}

const handleImageError = (event) => {
  event.target.src = '/game-placeholder.svg'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 监听路由参数变化
watch(() => route.query, (newQuery) => {
  if (newQuery.category) {
    selectedCategory.value = newQuery.category
  }
  if (newQuery.search) {
    searchKeyword.value = newQuery.search
  }
}, { immediate: true })

onMounted(async () => {
  await gameStore.fetchGames()
})
</script>

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

.games-content {
  padding: 60px 0;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.game-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
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

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-card:hover .game-cover img {
  transform: scale(1.1);
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
}

.game-stats {
  margin-top: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.game-info {
  padding: 25px;
}

.game-title {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: #00d4ff;
  font-weight: bold;
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
}

.release-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.developer {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
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