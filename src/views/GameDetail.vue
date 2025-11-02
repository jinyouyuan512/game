<template>
  <div class="game-detail" 
       v-loading="loading"
       :class="{
         'platform-pc': currentPlatform === 'pc',
         'platform-mobile': currentPlatform === 'mobile',
         'platform-console': currentPlatform === 'console',
         'orientation-landscape': currentOrientation === 'landscape',
         'orientation-portrait': currentOrientation === 'portrait',
         'interaction-touch': interactionMode === 'touch',
         'interaction-pointer': interactionMode === 'pointer'
       }">
    <div v-if="game" class="game-container orientation-responsive">
      <!-- 游戏头部信息 -->
      <div class="game-header">
        <div class="container">
          <div class="header-content orientation-responsive">
            <div class="breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/games' }">游戏中心</el-breadcrumb-item>
                <el-breadcrumb-item>{{ game.name }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            
            <div class="game-info-section">
              <div class="game-cover">
                <img
                  :src="game.cover_image_url || '/game-placeholder.svg'"
                  :alt="game.name"
                  @error="handleImageError"
                />
              </div>
              
              <div class="game-details">
                <h1 class="game-title">{{ game.name }}</h1>
                <p class="game-description">{{ game.description }}</p>
                
                <div class="game-meta">
                  <div class="meta-item">
                    <span class="label">分类：</span>
                    <el-tag type="primary">{{ game.category }}</el-tag>
                  </div>
                  <div class="meta-item">
                    <span class="label">开发商：</span>
                    <span class="value">{{ game.developer }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="label">发行商：</span>
                    <span class="value">{{ game.publisher }}</span>
                  </div>
                  <div class="meta-item" v-if="game.release_date">
                    <span class="label">发布日期：</span>
                    <span class="value">{{ formatDate(game.release_date) }}</span>
                  </div>
                </div>
                
                <div class="game-actions">
      <router-link to="/add-strategy" class="add-strategy-btn">
        <el-button type="primary" plain size="large">
          <el-icon><EditPen /></el-icon>
          提交攻略
        </el-button>
      </router-link>
      <el-button type="primary" size="large" @click="scrollToStrategies">
        <el-icon><Document /></el-icon>
        查看攻略
      </el-button>
      <el-button size="large" @click="shareGame">
        <el-icon><Share /></el-icon>
        分享游戏
      </el-button>
    </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI 游戏摘要 -->
      <div class="summary-section">
        <div class="container">
          <GameSummaryCard 
            :game-id="game.id" 
            :game-info="game" 
          />
        </div>
      </div>

      <!-- 游戏攻略列表 -->
      <div class="strategies-section" ref="strategiesSection">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Document /></el-icon>
              相关攻略
            </h2>
            <div class="section-actions">
              <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
                <el-option label="最新发布" value="created_at" />
                <el-option label="最多浏览" value="views" />
                <el-option label="难度排序" value="difficulty" />
              </el-select>
            </div>
          </div>

          <div v-if="strategiesLoading" class="strategies-loading">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else-if="strategies.length === 0" class="no-strategies">
            <el-empty description="暂无相关攻略">
              <el-button type="primary" @click="$router.push('/games')">
                浏览其他游戏
              </el-button>
            </el-empty>
          </div>

          <div v-else class="strategies-grid">
            <div
              v-for="strategy in strategies"
              :key="strategy.id"
              class="strategy-card"
              @click="goToStrategy(strategy.id)"
            >
              <div class="strategy-header">
                <h3 class="strategy-title">{{ strategy.title }}</h3>
                <el-tag 
                  :type="getDifficultyType(strategy.difficulty)" 
                  size="small"
                >
                  {{ getDifficultyText(strategy.difficulty) }}
                </el-tag>
              </div>
              
              <p class="strategy-summary">{{ strategy.summary || strategy.content.substring(0, 150) + '...' }}</p>
              
              <div class="strategy-footer">
                <div class="strategy-meta">
                  <span class="author">作者: {{ strategy.author }}</span>
                  <span class="date">{{ formatDate(strategy.created_at) }}</span>
                </div>
                <div class="strategy-stats">
                  <span class="views">
                    <el-icon><View /></el-icon>
                    {{ strategy.views || Math.floor(Math.random() * 5000) + 100 }}
                  </span>
                </div>
              </div>
              
              <!-- 攻略标签 -->
              <div v-if="strategy.strategy_tags && strategy.strategy_tags.length > 0" class="strategy-tags">
                <el-tag
                  v-for="tagRelation in strategy.strategy_tags.slice(0, 3)"
                  :key="tagRelation.tags.id"
                  size="small"
                  type="info"
                >
                  {{ tagRelation.tags.name }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="totalStrategies > pageSize" class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="totalStrategies"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>

      <!-- 相关游戏推荐 -->
      <div class="related-games-section">
        <div class="container">
          <h2 class="section-title">
            <el-icon><Grid /></el-icon>
            相关游戏推荐
          </h2>
          
          <div v-if="relatedGamesLoading" class="related-loading">
            <el-skeleton :rows="3" animated />
          </div>
          
          <div v-else class="related-games-grid">
            <div
              v-for="relatedGame in relatedGames"
              :key="relatedGame.id"
              class="related-game-card"
              @click="goToGame(relatedGame.id)"
            >
              <div class="game-cover">
                <img
                  :src="relatedGame.cover_image_url || '/game-placeholder.svg'"
                  :alt="relatedGame.name"
                  @error="handleImageError"
                />
              </div>
              <div class="game-info">
                <h4 class="game-name">{{ relatedGame.name }}</h4>
                <p class="game-category">{{ relatedGame.category }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏不存在 -->
    <div v-else-if="!loading" class="game-not-found">
      <div class="container">
        <el-result
          icon="warning"
          title="游戏不存在"
          sub-title="抱歉，您访问的游戏不存在或已被删除"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/games')">
              返回游戏中心
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { EditPen } from '@element-plus/icons-vue'
import { apiClient } from '../lib/api'
import { ElMessage } from 'element-plus'
import GameSummaryCard from '../components/GameSummaryCard.vue'
import { 
  Document, 
  Share, 
  View, 
  Grid 
} from '@element-plus/icons-vue'
import deviceDetectionService from '../services/DeviceDetectionService'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

// 响应式数据
const loading = ref(true)
const strategiesLoading = ref(false)
const relatedGamesLoading = ref(false)
const game = ref(null)
const strategies = ref([])
const relatedGames = ref([])
const sortBy = ref('created_at')
const currentPage = ref(1)
const pageSize = ref(10)
const totalStrategies = ref(0)
const strategiesSection = ref(null)

// 设备信息响应式状态
const currentPlatform = ref(deviceDetectionService.getCurrentPlatform())
const currentOrientation = ref(deviceDetectionService.getCurrentOrientation())
const interactionMode = ref(deviceDetectionService.getInteractionMode())

// 监听设备变化
watch(() => deviceDetectionService.getCurrentPlatform(), (newPlatform) => {
  currentPlatform.value = newPlatform
  console.log('游戏详情页平台变化:', newPlatform)
})

watch(() => deviceDetectionService.getCurrentOrientation(), (newOrientation) => {
  currentOrientation.value = newOrientation
  console.log('游戏详情页方向变化:', newOrientation)
})

watch(() => deviceDetectionService.getInteractionMode(), (newMode) => {
  interactionMode.value = newMode
  console.log('游戏详情页交互模式变化:', newMode)
})

// 计算属性
const gameId = computed(() => route.params.id)

// 方法
const fetchGameDetail = async () => {
  try {
    const response = await apiClient.get(`/api/games/${gameId.value}`)
    
    // 正确处理API响应 - 直接使用response，因为apiClient已经返回了解析后的数据
    if (response && response.id) {  // 检查是否是有效的游戏对象
      game.value = response
      console.log('成功获取游戏详情:', game.value.name)
    } else {
      console.error('API返回的数据无效或为空')
      // 不使用模拟数据，显示错误信息
      ElMessage.error('获取游戏详情失败，数据格式错误')
    }
  } catch (error) {
    console.error('获取游戏详情失败:', error)
    ElMessage.error('获取游戏详情失败，请稍后重试')
    // 不使用模拟数据
  }
}

// 模拟游戏数据
const getMockGameData = () => {
  return {
    id: parseInt(gameId.value) || 1,
    name: "星际战争：未知边界",
    description: "《星际战争：未知边界》是一款史诗级太空策略游戏，玩家将指挥自己的星际舰队探索广阔的宇宙，与其他文明交流、贸易或征服，建立自己的星际帝国。",
    category: "策略游戏",
    developer: "银河游戏工作室",
    publisher: "星际娱乐",
    release_date: "2023-11-15",
    cover_image_url: "/game-placeholder.svg",
    platform: ["PC", "PlayStation 5", "Xbox Series X"],
    price: 198,
    rating: 4.8,
    system_requirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-8400 / AMD Ryzen 5 2600",
        memory: "8 GB RAM",
        graphics: "NVIDIA GeForce GTX 1060 6GB / AMD RX 580",
        storage: "50 GB 可用空间"
      },
      recommended: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i7-9700K / AMD Ryzen 7 3700X",
        memory: "16 GB RAM",
        graphics: "NVIDIA GeForce RTX 2070 Super / AMD RX 5700 XT",
        storage: "50 GB SSD"
      }
    }
  }
}

const fetchStrategies = async () => {
  strategiesLoading.value = true
  try {
    const response = await apiClient.get(`/api/strategies?game_id=${gameId.value}&status=published&sort=${sortBy.value}&page=${currentPage.value}&limit=${pageSize.value}`)
    
    // 根据服务器返回的数据格式正确处理
    if (response && Array.isArray(response)) {
      // 如果直接返回的是攻略数组
      strategies.value = response
      totalStrategies.value = response.length
    } else if (response && response.data && response.data.strategies) {
      // 如果返回的是包含strategies数组的对象
      strategies.value = response.data.strategies
      totalStrategies.value = response.data.total || response.data.strategies.length
    } else {
      console.log('该游戏暂无攻略或返回数据格式不同')
      strategies.value = []
      totalStrategies.value = 0
    }
    
    console.log(`成功获取${strategies.value.length}条攻略`)
  } catch (error) {
    console.error('获取攻略列表失败:', error)
    ElMessage.error('获取攻略列表失败，请稍后重试')
    strategies.value = []
    totalStrategies.value = 0
  } finally {
    strategiesLoading.value = false
  }
}

// 模拟攻略数据
const getMockStrategies = () => {
  const gameName = game.value?.name || "星际战争：未知边界"
  return [
    {
      id: 1,
      title: "新手入门指南：如何快速建立你的星际帝国",
      summary: "本攻略将帮助新玩家快速上手，从基础操作到资源管理，全方位介绍游戏的核心玩法。",
      content: "# 新手入门指南\n\n## 基础操作\n...",
      game_id: parseInt(gameId.value) || 1,
      game_name: gameName,
      author: "银河指挥官",
      difficulty: "easy",
      created_at: "2023-11-20T08:30:00Z",
      views: 1562,
      strategy_tags: [
        { tags: { id: 1, name: "新手攻略" } },
        { tags: { id: 2, name: "基础操作" } }
      ]
    },
    {
      id: 2,
      title: "高级战斗策略：舰队配置与战术分析",
      summary: "深入探讨游戏中的舰队配置策略，不同战斗场景下的最佳战术选择，助你在星际战争中取得胜利。",
      content: "# 高级战斗策略\n\n## 舰队配置原则\n...",
      game_id: parseInt(gameId.value) || 1,
      game_name: gameName,
      author: "战术大师",
      difficulty: "hard",
      created_at: "2023-11-25T14:20:00Z",
      views: 987,
      strategy_tags: [
        { tags: { id: 3, name: "战斗策略" } },
        { tags: { id: 4, name: "舰队配置" } }
      ]
    },
    {
      id: 3,
      title: "资源最大化利用：经济发展最佳路线",
      summary: "详细介绍游戏中各种资源的获取和管理方法，以及如何平衡发展，实现经济的可持续增长。",
      content: "# 资源最大化利用\n\n## 基础资源收集\n...",
      game_id: parseInt(gameId.value) || 1,
      game_name: gameName,
      author: "经济专家",
      difficulty: "medium",
      created_at: "2023-11-30T10:45:00Z",
      views: 843,
      strategy_tags: [
        { tags: { id: 5, name: "资源管理" } },
        { tags: { id: 6, name: "经济发展" } }
      ]
    }
  ]
}

const fetchRelatedGames = async () => {
  if (!game.value) return
  
  relatedGamesLoading.value = true
  try {
    const response = await apiClient.get(`/api/games?category=${game.value.category}&limit=6`)
    
    // 根据服务器返回的数据格式正确处理
    let gamesToFilter = []
    if (Array.isArray(response)) {
      // 如果直接返回的是游戏数组
      gamesToFilter = response
    } else if (response && response.data && Array.isArray(response.data)) {
      // 如果返回的是包含data数组的对象
      gamesToFilter = response.data
    }
    
    // 过滤掉当前游戏
    const filteredGames = gamesToFilter.filter(g => g.id !== game.value.id)
    
    relatedGames.value = filteredGames
    console.log(`成功获取${relatedGames.value.length}个相关游戏`)
  } catch (error) {
    console.error('获取相关游戏失败:', error)
    ElMessage.error('获取相关游戏失败，请稍后重试')
    relatedGames.value = []
  } finally {
    relatedGamesLoading.value = false
  }
}

// 模拟相关游戏数据
const getMockRelatedGames = () => {
  const category = game.value?.category || "策略游戏"
  return [
    {
      id: 101,
      name: "银河帝国：终极联盟",
      description: "一款深度太空策略游戏，玩家需要建立和管理自己的太空帝国。",
      category: category,
      cover_image_url: "/game-placeholder.svg",
      rating: 4.6,
      price: 179
    },
    {
      id: 102,
      name: "星际殖民：新纪元",
      description: "探索宇宙未知区域，建立殖民地，与外星文明交流或对抗。",
      category: category,
      cover_image_url: "/game-placeholder.svg",
      rating: 4.5,
      price: 158
    },
    {
      id: 103,
      name: "太空战争：无尽冲突",
      description: "快节奏太空战斗游戏，指挥舰队进行激烈的星际对战。",
      category: "即时战略",
      cover_image_url: "/game-placeholder.svg",
      rating: 4.7,
      price: 199
    }
  ]
}

const handleImageError = (event) => {
  event.target.src = '/game-placeholder.svg'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getDifficultyType = (difficulty) => {
  const types = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty] || '未知'
}

const scrollToStrategies = () => {
  if (strategiesSection.value) {
    strategiesSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const shareGame = () => {
  if (navigator.share) {
    navigator.share({
      title: game.value.name,
      text: game.value.description,
      url: window.location.href
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href)
    ElMessage.success('链接已复制到剪贴板')
  }
}

const goToStrategy = (strategyId) => {
  router.push(`/strategies/${strategyId}`)
}

const goToGame = (gameId) => {
  router.push(`/games/${gameId}`)
}

const handleSort = () => {
  currentPage.value = 1
  fetchStrategies()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchStrategies()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchStrategies()
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await fetchGameDetail()
    if (game.value) {
      await Promise.all([
        fetchStrategies(),
        fetchRelatedGames()
      ])
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.game-detail {
  min-height: 100vh;
  background: var(--bg-color-page);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 游戏头部 */
.game-header {
  background: linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%);
  padding: 60px 0 40px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--box-shadow);
}

.game-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  z-index: 0;
}

.breadcrumb {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.game-info-section {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.game-cover {
  width: 350px;
  height: 350px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.game-cover:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
}

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.game-cover:hover img {
  transform: scale(1.08);
}

.game-details {
  flex: 1;
  color: white;
}

.game-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 24px 0;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(90deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: textGlow 3s ease-in-out infinite alternate;
}

@keyframes textGlow {
  from {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  to {
    text-shadow: 2px 2px 8px rgba(0, 123, 255, 0.5), 2px 2px 16px rgba(0, 123, 255, 0.3);
  }
}

.game-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
  margin: 0 0 24px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.game-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.meta-item .label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  min-width: 80px;
}

.meta-item .value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.game-actions {
  display: flex;
  gap: 16px;
}

.game-actions .el-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.game-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.game-actions .el-button:active {
  transform: translateY(0);
}

.game-actions .el-button--primary {
  background: linear-gradient(45deg, #007bff, #0056b3);
}

.game-actions .el-button--primary:hover {
  background: linear-gradient(45deg, #0056b3, #003d7a);
}

/* 摘要区域 */
.summary-section {
  padding: 40px 0;
}

/* 攻略列表 */
.strategies-section {
  padding: 40px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 16px;
}

.strategies-loading {
  padding: 40px 0;
}

.no-strategies {
  text-align: center;
  padding: 60px 0;
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.strategy-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  border: 1px solid #eaeaea;
}

.strategy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, #007bff, transparent);
  transition: left 0.5s ease;
}

.strategy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.strategy-card:hover::before {
  left: 100%;
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.strategy-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  margin-right: 12px;
}

.strategy-summary {
  color: #606266;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.strategy-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.strategy-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #909399;
}

.strategy-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #909399;
}

.strategy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* 相关游戏 */
.related-games-section {
  padding: 40px 0;
  background: white;
}

.related-loading {
  padding: 40px 0;
}

.related-games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.related-game-card {
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border: 1px solid #e1e4e8;
}

.related-game-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.related-game-card:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.related-game-card:hover::after {
  opacity: 1;
}

.related-game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.related-game-card .game-cover {
  width: 100%;
  height: 120px;
  border-radius: 0;
  box-shadow: none;
}

.related-game-card .game-info {
  padding: 16px;
}

.related-game-card .game-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.related-game-card .game-category {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.game-not-found {
  padding: 60px 0;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .container {
    max-width: 960px;
    padding: 0 30px;
  }
  
  .strategies-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }
  
  .related-games-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
  }
  
  .game-info-section {
    gap: 40px;
  }
  
  .game-cover {
    width: 300px;
    height: 300px;
  }
}

@media (max-width: 992px) {
  .game-header {
    padding: 40px 0 30px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .game-title {
    font-size: 2.5rem;
    background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .game-info-section {
    gap: 30px;
  }
  
  .game-cover {
    width: 280px;
    height: 280px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  .strategies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .related-games-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
  
  /* 优化平板设备上的交互体验 */
  .strategy-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .related-game-card:hover {
    transform: translateY(-2px) scale(1.01);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .game-header {
    padding: 30px 0 20px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .game-header::before {
    background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  }
  
  .game-info-section {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .game-cover {
    width: 100%;
    height: 300px;
    max-width: 300px;
    margin: 0 auto;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
    transition: all 0.3s ease;
    border-width: 1px;
  }
  
  .game-cover:active {
    transform: scale(0.98);
  }
  
  .game-title {
    font-size: 2rem;
    margin-bottom: 15px;
    background: linear-gradient(90deg, #ffffff, #e0e0e0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .game-description {
    font-size: 1rem;
    margin-bottom: 20px;
    line-height: 1.6;
    text-align: left;
  }
  
  .game-meta {
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .meta-item {
    flex-direction: column;
    align-items: center;
    gap: 5px;
    text-align: center;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .game-actions {
    justify-content: center;
    flex-direction: column;
    gap: 12px;
  }
  
  .game-actions .el-button {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    padding: 12px 20px;
    font-size: 16px;
    transition: all 0.2s ease;
  }
  
  .game-actions .el-button:active {
    transform: scale(0.95);
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    text-align: left;
  }
  
  .section-title {
    font-size: 1.5rem;
    position: relative;
  }
  
  .section-title::after {
    bottom: -8px;
    height: 3px;
    width: 60px;
  }
  
  .strategies-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .strategy-card {
    margin: 0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    border-width: 1px;
  }
  
  .strategy-card:active {
    transform: scale(0.98);
  }
  
  .strategy-header {
    padding: 15px;
  }
  
  .strategy-title {
    font-size: 1.1rem;
  }
  
  .strategy-content {
    padding: 15px;
  }
  
  .strategy-excerpt {
    font-size: 0.9rem;
    -webkit-line-clamp: 3;
    line-height: 1.5;
  }
  
  .strategy-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .related-games-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .related-game-card {
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.3s ease;
    border-width: 1px;
  }
  
  .related-game-card:active {
    transform: scale(0.95);
  }
  
  .related-game-card .game-cover {
    height: 100px;
    object-fit: cover;
  }
  
  .related-game-card .game-info {
    padding: 12px;
  }
  
  .related-game-card .game-name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  
  .related-game-card .game-category {
    font-size: 12px;
  }
  
  /* 触摸设备优化 */
  * {
    -webkit-tap-highlight-color: transparent;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 12px;
  }
  
  .game-header {
    padding: 20px 0 15px;
  }
  
  .breadcrumb {
    margin-bottom: 15px;
  }
  
  .game-cover {
    height: 250px;
    max-width: 250px;
  }
  
  .game-title {
    font-size: 1.8rem;
  }
  
  .game-description {
    font-size: 0.9rem;
  }
  
  .meta-item .label {
    font-size: 13px;
  }
  
  .meta-item .value {
    font-size: 13px;
  }
  
  .game-actions .el-button {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .summary-section,
  .strategies-section,
  .related-games-section {
    padding: 25px 0;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .strategy-card {
    margin: 0;
  }
  
  .strategy-header {
    padding: 12px;
  }
  
  .strategy-title {
    font-size: 1rem;
  }
  
  .strategy-content {
    padding: 12px;
  }
  
  .strategy-excerpt {
    font-size: 0.85rem;
  }
  
  .strategy-footer {
    padding: 12px;
  }
  
  .related-games-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .related-game-card .game-cover {
    height: 80px;
  }
  
  .related-game-card .game-info {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 1.6rem;
  }
  
  .game-cover {
    height: 220px;
    max-width: 220px;
  }
  
  .game-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .game-actions .el-button {
    width: 100%;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .game-header {
    padding: 15px 0 10px;
  }
  
  .game-info-section {
    gap: 20px;
  }
  
  .game-cover {
    width: 200px;
    height: 200px;
  }
  
  .summary-section,
.strategies-section,
.related-games-section {
  padding: 40px 0;
  position: relative;
  animation: slideUp 0.8s ease-out;
  animation-fill-mode: both;
}

.summary-section {
  animation-delay: 0.2s;
}

.strategies-section {
  animation-delay: 0.4s;
}

.related-games-section {
  animation-delay: 0.6s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
}

/* 高分辨率屏幕优化 */
@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
  
  .strategies-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 35px;
  }
  
  .related-games-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 25px;
  }
}

/* 平板横屏优化 */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .game-info-section {
    flex-direction: row;
    gap: 30px;
  }
  
  .game-cover {
    width: 250px;
    height: 250px;
  }
  
  .strategies-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }
  
  .related-games-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

/* 平台特定样式优化 */
/* PC平台优化 */
.platform-pc .game-header {
  padding: 80px 0 40px;
}

.platform-pc .game-info-section {
  display: flex;
  gap: 40px;
}

.platform-pc .game-cover {
  width: 300px;
  height: 300px;
}

/* 主机平台优化 */
.platform-console .game-header {
  padding: 40px 0 30px;
}

.platform-console .game-info-section {
  display: flex;
  gap: 30px;
}

.platform-console .game-cover {
  width: 280px;
  height: 280px;
}

.platform-console .game-actions .el-button {
  padding: 15px 30px;
  font-size: 18px;
}

/* 移动平台优化 */
.platform-mobile .game-header {
  padding: 20px 0;
}

.platform-mobile .header-content {
  flex-direction: column;
  gap: 20px;
}

.platform-mobile .game-info-section {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.platform-mobile .game-cover {
  width: 220px;
  height: 220px;
  margin: 0 auto;
}

.platform-mobile .game-title {
  font-size: 28px;
  text-align: center;
}

.platform-mobile .game-actions {
  flex-direction: column;
  width: 100%;
  gap: 15px;
}

/* 方向响应式样式 */
.orientation-landscape .strategies-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.orientation-portrait .strategies-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

/* 交互模式适配 */
.interaction-touch .strategy-card .el-button,
.interaction-touch .game-actions .el-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-size: 16px;
}

.interaction-pointer .strategy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.interaction-pointer .game-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* 打印样式 */
@media print {
  .game-actions,
  .section-actions,
  .strategy-footer,
  .pagination {
    display: none;
  }
  
  .game-header {
    background: none;
    color: black;
  }
  
  .strategy-card {
    border: 1px solid #ccc;
    break-inside: avoid;
    margin-bottom: 20px;
  }
  
  .strategies-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .related-games-section {
    display: none;
  }
}
</style>
