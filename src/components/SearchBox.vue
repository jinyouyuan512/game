<template>
  <div class="search-box">
    <el-input
      v-model="searchQuery"
      placeholder="搜索游戏或攻略..."
      @input="handleInput"
      @keyup.enter="handleSearch"
      @focus="showSuggestions = true"
      @clear="handleClear"
      clearable
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
      <template #append>
        <el-button @click="handleSearch">
          <el-icon><Search /></el-icon>
        </el-button>
      </template>
    </el-input>

    <!-- 搜索建议下拉框 -->
    <div v-if="showSuggestions && (gameSuggestions.length > 0 || strategySuggestions.length > 0)" class="search-suggestions">
      <div v-if="gameSuggestions.length > 0" class="suggestion-section">
        <div class="suggestion-title">游戏</div>
        <div
          v-for="game in gameSuggestions"
          :key="game.id"
          class="suggestion-item"
          @click="selectGame(game)"
        >
          <div class="suggestion-content">
            <div class="suggestion-name">{{ game.name }}</div>
            <div class="suggestion-meta">{{ game.category }} · {{ game.developer }}</div>
          </div>
        </div>
      </div>
      <div v-if="strategySuggestions.length > 0" class="suggestion-section">
        <div class="suggestion-title">攻略</div>
        <div
          v-for="strategy in strategySuggestions"
          :key="strategy.id"
          class="suggestion-item"
          @click="selectStrategy(strategy)"
        >
          <div class="suggestion-content">
            <div class="suggestion-name">{{ strategy.title }}</div>
            <div class="suggestion-meta">{{ strategy.game_name }} · {{ strategy.author }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索历史 -->
    <div v-if="showSuggestions && searchHistory.length > 0 && !searchQuery" class="search-history">
      <div class="history-header">
        <span>搜索历史</span>
        <el-button type="text" size="small" @click="clearHistory">清空</el-button>
      </div>
      <div class="history-list">
        <div
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-item"
          @click="selectHistory(item)"
        >
          <el-icon><Clock /></el-icon>
          <span>{{ item }}</span>
          <el-button type="text" size="small" @click.stop="removeHistory(index)">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 热门搜索 -->
    <div v-if="showSuggestions && !searchQuery" class="hot-searches">
      <div class="hot-header">
        <span>热门搜索</span>
      </div>
      <div class="hot-tags">
        <el-tag
          v-for="tag in hotTags"
          :key="tag"
          size="small"
          @click="selectTag(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { ElMessage } from 'element-plus'
import { Search, Clock, Close } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const showSuggestions = ref(false)
const gameSuggestions = ref([])
const strategySuggestions = ref([])
const searchHistory = ref([])
const hotTags = ref(['原神', '王者荣耀', '塞尔达传说', '我的世界', '艾尔登法环'])

// 方法
const handleInput = async () => {
  if (!searchQuery.value.trim()) {
    gameSuggestions.value = []
    strategySuggestions.value = []
    return
  }

  try {
    // 调用后端搜索建议API
    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery.value)}&limit=5`)
    const data = await response.json()
    
    if (data.games) {
      gameSuggestions.value = data.games
    }
    
    if (data.strategies) {
      strategySuggestions.value = data.strategies
    }
  } catch (error) {
    console.error('搜索建议失败:', error)
    // 如果API调用失败，回退到本地模拟数据
    gameSuggestions.value = []
    strategySuggestions.value = []
  }
}

// 获取热门搜索标签
const fetchHotSearches = async () => {
  try {
    const response = await fetch('/api/search/hot?limit=10')
    const data = await response.json()
    
    if (data.hot_searches && data.hot_searches.length > 0) {
      hotTags.value = data.hot_searches
    }
  } catch (error) {
    console.error('获取热门搜索失败:', error)
    // 保持默认热门搜索标签
  }
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return

  // 添加到搜索历史
  addToHistory(searchQuery.value)

  // 跳转到搜索结果页
  router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  
  // 关闭建议框
  showSuggestions.value = false
}

const handleClear = () => {
  searchQuery.value = ''
  gameSuggestions.value = []
  strategySuggestions.value = []
}

const selectGame = (game) => {
  searchQuery.value = game.name
  addToHistory(game.name)
  router.push(`/games/${game.id}`)
  showSuggestions.value = false
}

const selectStrategy = (strategy) => {
  searchQuery.value = strategy.title
  addToHistory(strategy.title)
  router.push(`/strategies/${strategy.id}`)
  showSuggestions.value = false
}

const selectHistory = (query) => {
  searchQuery.value = query
  handleSearch()
}

const selectTag = (tag) => {
  searchQuery.value = tag
  handleSearch()
}

const addToHistory = (query) => {
  // 移除重复项
  const index = searchHistory.value.indexOf(query)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
  }
  
  // 添加到开头
  searchHistory.value.unshift(query)
  
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  
  // 保存到本地存储
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

const removeHistory = (index) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
  ElMessage.success('搜索历史已清空')
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.search-box')) {
    showSuggestions.value = false
  }
}

// 生命周期
onMounted(() => {
  // 加载搜索历史
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
  
  // 获取热门搜索
  fetchHotSearches()
  
  // 添加点击外部关闭事件监听
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-box {
  position: relative;
  width: 100%;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-section {
  padding: 8px 0;
}

.suggestion-title {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  background: #f5f7fa;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.suggestion-content {
  flex: 1;
}

.suggestion-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.suggestion-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 8px 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  background: #f5f7fa;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item span {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.hot-searches {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 8px 0;
}

.hot-header {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  background: #f5f7fa;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px;
}

.hot-tags .el-tag {
  cursor: pointer;
}
</style>