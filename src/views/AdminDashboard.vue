<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">仪表板</h1>
      <p class="page-subtitle">系统概览与数据统计</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon games-icon">
          <el-icon><GamePad /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalGames }}</div>
          <div class="stat-label">游戏总数</div>
          <div class="stat-change positive">
            <el-icon><ArrowUp /></el-icon>
            +{{ stats.newGamesThisMonth }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon strategies-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalStrategies }}</div>
          <div class="stat-label">攻略总数</div>
          <div class="stat-change positive">
            <el-icon><ArrowUp /></el-icon>
            +{{ stats.newStrategiesThisMonth }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon views-icon">
          <el-icon><View /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ formatNumber(stats.totalViews) }}</div>
          <div class="stat-label">总浏览量</div>
          <div class="stat-change positive">
            <el-icon><ArrowUp /></el-icon>
            +{{ formatNumber(stats.viewsThisMonth) }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon ai-icon">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalAIQuestions }}</div>
          <div class="stat-label">AI问答次数</div>
          <div class="stat-change positive">
            <el-icon><ArrowUp /></el-icon>
            +{{ stats.aiQuestionsThisMonth }}
          </div>
        </div>
      </div>
    </div>

    <!-- 图表和数据 -->
    <div class="dashboard-content">
      <div class="content-grid">
        <!-- 访问趋势图 -->
        <div class="dashboard-card chart-card">
          <div class="card-header">
            <h3 class="card-title">访问趋势</h3>
            <el-select v-model="chartPeriod" size="small">
              <el-option label="最近7天" value="7d" />
              <el-option label="最近30天" value="30d" />
              <el-option label="最近90天" value="90d" />
            </el-select>
          </div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <el-icon><TrendCharts /></el-icon>
              <p>访问趋势图表</p>
              <small>这里将显示访问量变化趋势</small>
            </div>
          </div>
        </div>

        <!-- 热门游戏 -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3 class="card-title">热门游戏</h3>
            <el-button size="small" text @click="refreshHotGames">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="hot-games-list" v-loading="hotGamesLoading">
            <div
              v-for="(game, index) in hotGames"
              :key="game.id"
              class="hot-game-item"
            >
              <div class="game-rank">{{ index + 1 }}</div>
              <img
                :src="game.cover_image_url || '/game-placeholder.svg'"
                :alt="game.name"
                class="game-avatar"
                @error="handleImageError"
              />
              <div class="game-info">
                <div class="game-name">{{ game.name }}</div>
                <div class="game-stats">
                  {{ game.strategy_count || 0 }} 篇攻略 · {{ formatNumber(game.total_views || 0) }} 浏览
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最新攻略 -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3 class="card-title">最新攻略</h3>
            <el-button size="small" text @click="refreshLatestStrategies">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="latest-strategies-list" v-loading="latestStrategiesLoading">
            <div
              v-for="strategy in latestStrategies"
              :key="strategy.id"
              class="strategy-item"
            >
              <div class="strategy-info">
                <div class="strategy-title">{{ strategy.title }}</div>
                <div class="strategy-meta">
                  <span class="game-name">{{ strategy.games?.name }}</span>
                  <span class="create-time">{{ formatDate(strategy.created_at) }}</span>
                </div>
              </div>
              <div class="strategy-stats">
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ strategy.view_count || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI问答统计 -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3 class="card-title">AI问答统计</h3>
            <el-button size="small" text @click="refreshAIStats">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="ai-stats-content" v-loading="aiStatsLoading">
            <div class="ai-stat-item">
              <div class="stat-label">今日问答</div>
              <div class="stat-value">{{ aiStats.todayQuestions }}</div>
            </div>
            <div class="ai-stat-item">
              <div class="stat-label">平均响应时间</div>
              <div class="stat-value">{{ aiStats.avgResponseTime }}s</div>
            </div>
            <div class="ai-stat-item">
              <div class="stat-label">用户满意度</div>
              <div class="stat-value">{{ aiStats.satisfaction }}%</div>
            </div>
            <div class="ai-stat-item">
              <div class="stat-label">热门问题类型</div>
              <div class="stat-value">{{ aiStats.topQuestionType }}</div>
            </div>
          </div>
        </div>

        <!-- 系统状态 -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3 class="card-title">系统状态</h3>
            <el-tag :type="systemStatus.overall === 'healthy' ? 'success' : 'warning'" size="small">
              {{ systemStatus.overall === 'healthy' ? '正常' : '警告' }}
            </el-tag>
          </div>
          <div class="system-status-content">
            <div class="status-item">
              <div class="status-label">数据库连接</div>
              <el-tag :type="systemStatus.database ? 'success' : 'danger'" size="small">
                {{ systemStatus.database ? '正常' : '异常' }}
              </el-tag>
            </div>
            <div class="status-item">
              <div class="status-label">AI服务</div>
              <el-tag :type="systemStatus.aiService ? 'success' : 'danger'" size="small">
                {{ systemStatus.aiService ? '正常' : '异常' }}
              </el-tag>
            </div>
            <div class="status-item">
              <div class="status-label">存储服务</div>
              <el-tag :type="systemStatus.storage ? 'success' : 'danger'" size="small">
                {{ systemStatus.storage ? '正常' : '异常' }}
              </el-tag>
            </div>
            <div class="status-item">
              <div class="status-label">CDN服务</div>
              <el-tag :type="systemStatus.cdn ? 'success' : 'danger'" size="small">
                {{ systemStatus.cdn ? '正常' : '异常' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3 class="card-title">快速操作</h3>
          </div>
          <div class="quick-actions">
            <el-button type="primary" @click="goToGamesManagement">
              <el-icon><Plus /></el-icon>
              添加游戏
            </el-button>
            <el-button type="success" @click="goToStrategiesManagement">
              <el-icon><EditPen /></el-icon>
              创建攻略
            </el-button>
            <el-button @click="exportData">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button @click="viewLogs">
              <el-icon><Document /></el-icon>
              查看日志
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useAdminStore } from '../stores/admin'
import { ElMessage } from 'element-plus'

const router = useRouter()
const gameStore = useGameStore()
const adminStore = useAdminStore()

// 响应式数据
const chartPeriod = ref('30d')
const hotGamesLoading = ref(false)
const latestStrategiesLoading = ref(false)
const aiStatsLoading = ref(false)

// 统计数据
const stats = reactive({
  totalGames: 0,
  totalStrategies: 0,
  totalViews: 0,
  totalAIQuestions: 0,
  newGamesThisMonth: 0,
  newStrategiesThisMonth: 0,
  viewsThisMonth: 0,
  aiQuestionsThisMonth: 0
})

// 热门游戏
const hotGames = ref([])

// 最新攻略
const latestStrategies = ref([])

// AI统计
const aiStats = reactive({
  todayQuestions: 0,
  avgResponseTime: 0,
  satisfaction: 0,
  topQuestionType: ''
})

// 系统状态
const systemStatus = reactive({
  overall: 'healthy',
  database: true,
  aiService: true,
  storage: true,
  cdn: true
})

// 方法
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const handleImageError = (event) => {
  event.target.src = '/game-placeholder.svg'
}

const loadDashboardData = async () => {
  try {
    // 加载游戏数据
    await gameStore.fetchGames()
    
    // 模拟统计数据
    stats.totalGames = gameStore.games.length
    stats.totalStrategies = gameStore.strategies.length
    stats.totalViews = Math.floor(Math.random() * 100000) + 50000
    stats.totalAIQuestions = Math.floor(Math.random() * 10000) + 5000
    stats.newGamesThisMonth = Math.floor(Math.random() * 10) + 1
    stats.newStrategiesThisMonth = Math.floor(Math.random() * 50) + 20
    stats.viewsThisMonth = Math.floor(Math.random() * 20000) + 10000
    stats.aiQuestionsThisMonth = Math.floor(Math.random() * 2000) + 1000

    // 设置热门游戏
    hotGames.value = gameStore.games.slice(0, 5).map(game => ({
      ...game,
      strategy_count: Math.floor(Math.random() * 20) + 1,
      total_views: Math.floor(Math.random() * 10000) + 1000
    }))

    // 设置最新攻略
    latestStrategies.value = gameStore.strategies.slice(0, 5)

    // 设置AI统计
    aiStats.todayQuestions = Math.floor(Math.random() * 200) + 100
    aiStats.avgResponseTime = (Math.random() * 2 + 1).toFixed(1)
    aiStats.satisfaction = Math.floor(Math.random() * 20) + 80
    aiStats.topQuestionType = '角色培养'

  } catch (error) {
    console.error('加载仪表板数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

const refreshHotGames = async () => {
  hotGamesLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  // 重新排序热门游戏
  hotGames.value = [...hotGames.value].sort(() => Math.random() - 0.5)
  hotGamesLoading.value = false
  ElMessage.success('热门游戏数据已刷新')
}

const refreshLatestStrategies = async () => {
  latestStrategiesLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  latestStrategiesLoading.value = false
  ElMessage.success('最新攻略数据已刷新')
}

const refreshAIStats = async () => {
  aiStatsLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  // 更新AI统计数据
  aiStats.todayQuestions = Math.floor(Math.random() * 200) + 100
  aiStats.avgResponseTime = (Math.random() * 2 + 1).toFixed(1)
  aiStats.satisfaction = Math.floor(Math.random() * 20) + 80
  aiStatsLoading.value = false
  ElMessage.success('AI统计数据已刷新')
}

const goToGamesManagement = () => {
  router.push('/admin/games')
}

const goToStrategiesManagement = () => {
  router.push('/admin/strategies')
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const viewLogs = () => {
  ElMessage.info('日志查看功能开发中...')
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  background: var(--bg-color-page);
  color: var(--text-color-primary);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 8px;
  background: linear-gradient(45deg, #00d4ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: var(--text-color-secondary);
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--fill-color);
  border: 1px solid var(--border-color);
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 10px 30px var(--shadow-color);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.games-icon {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
}

.strategies-icon {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
}

.views-icon {
  background: linear-gradient(45deg, #45b7d1, #96c93d);
}

.ai-icon {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-color-primary);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-color-secondary);
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: bold;
}

.stat-change.positive {
  color: #4ade80;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background: var(--fill-color);
  border: 1px solid var(--border-color);
  border-radius: 15px;
  padding: 25px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  color: var(--primary-color);
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.chart-card {
  grid-column: span 2;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.chart-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.chart-placeholder p {
  font-size: 16px;
  margin-bottom: 8px;
}

.chart-placeholder small {
  font-size: 12px;
}

.hot-games-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.hot-game-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.hot-game-item:hover {
  background: rgba(0, 212, 255, 0.1);
}

.game-rank {
  width: 30px;
  height: 30px;
  background: #00d4ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.game-avatar {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.game-info {
  flex: 1;
}

.game-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.game-stats {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.latest-strategies-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.strategy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.strategy-item:hover {
  background: rgba(0, 212, 255, 0.1);
}

.strategy-title {
  font-weight: bold;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.strategy-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.strategy-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.ai-stats-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.ai-stat-item {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.ai-stat-item .stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-bottom: 8px;
}

.ai-stat-item .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00d4ff;
}

.system-status-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.status-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quick-actions .el-button {
  height: 45px;
}

@media (max-width: 1200px) {
  .chart-card {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .ai-stats-content {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>