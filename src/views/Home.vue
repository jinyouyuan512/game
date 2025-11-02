<template>
  <div class="home" 
       :class="{
         'platform-pc': currentPlatform === 'pc',
         'platform-mobile': currentPlatform === 'mobile',
         'platform-console': currentPlatform === 'console',
         'orientation-landscape': currentOrientation === 'landscape',
         'orientation-portrait': currentOrientation === 'portrait',
         'interaction-touch': interactionMode === 'touch',
         'interaction-pointer': interactionMode === 'pointer'
       }">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">智囊团</span>
          <br>
          AI 游戏攻略辅助平台
        </h1>
        <p class="hero-subtitle">
          结合人工智能的游戏攻略平台，为您提供精准、即时的游戏问题解答
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="scrollToGames">
            <el-icon><GamePad /></el-icon>
            浏览游戏
          </el-button>
          <el-button size="large" @click="handleTestApiConnection" type="warning">
            <el-icon><Connection /></el-icon>
            测试API连接
          </el-button>
          <el-button size="large" @click="goToAdminLogin" type="info">
            <el-icon><Setting /></el-icon>
            管理员登录
          </el-button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-cards">
          <div class="card card-1">
            <el-icon><Trophy /></el-icon>
            <span>精准攻略</span>
          </div>
          <div class="card card-2">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI问答</span>
          </div>
          <div class="card card-3">
            <el-icon><Lightning /></el-icon>
            <span>即时解答</span>
          </div>
        </div>
      </div>
    </section>



    <!-- 游戏列表 -->
    <section class="games-section" ref="gamesSection">
      <div class="container">
        <h2 class="section-title">热门游戏</h2>
        <div class="games-grid" v-loading="gameStore.loading">
          <div
            v-for="game in gameStore.games"
            :key="game.id"
            class="game-card"
            @click="goToGame(game.id)"
          >
            <div class="game-cover">
              <img
                :src="game.cover_image_url || '/game-placeholder.svg'"
                :alt="game.name"
                @error="handleImageError"
              />
              <div class="game-overlay">
                <el-button type="primary" round>
                  <el-icon><View /></el-icon>
                  查看攻略
                </el-button>
              </div>
            </div>
            <div class="game-info">
              <h3 class="game-title">{{ game.name }}</h3>
              <p class="game-description">{{ game.description }}</p>
              <div class="game-meta">
                <el-tag v-if="game.category" type="info" size="small">
                  {{ game.category }}
                </el-tag>
                <span class="game-developer">{{ game.developer }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新攻略 -->
    <section class="strategies-section">
      <div class="container">
        <h2 class="section-title">最新攻略</h2>
        <div class="strategies-grid" v-loading="gameStore.loading">
          <div
            v-for="strategy in latestStrategies"
            :key="strategy.id"
            class="strategy-card"
            @click="goToStrategy(strategy.id)"
          >
            <div class="strategy-header">
              <h3 class="strategy-title">{{ strategy.title }}</h3>
              <div class="strategy-game">{{ strategy.games?.name }}</div>
            </div>
            <div class="strategy-summary" v-if="strategy.summary">
              {{ strategy.summary }}
            </div>
            <div class="strategy-meta">
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ strategy.view_count || 0 }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDate(strategy.created_at) }}</span>
              </div>
              <div class="meta-item" v-if="strategy.difficulty_level">
                <el-icon><Star /></el-icon>
                <span>难度 {{ strategy.difficulty_level }}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 社区与好友功能 -->
    <section class="social-section">
      <div class="container">
        <h2 class="section-title">社区与社交</h2>
        <div class="social-grid">
          <div class="social-card community-card" @click="router.push('/community')">
            <div class="social-icon">
              <el-icon size="48"><ChatDotRound /></el-icon>
            </div>
            <h3>游戏社区</h3>
            <p>加入我们的游戏社区，分享经验、讨论攻略、结交游戏好友</p>
            <el-button type="primary" size="large">
              <el-icon><ArrowRight /></el-icon>
              进入社区
            </el-button>
          </div>
          <div class="social-card friends-card" @click="router.push('/friends')">
            <div class="social-icon">
              <el-icon size="48"><User /></el-icon>
            </div>
            <h3>好友系统</h3>
            <p>添加游戏好友，组队开黑，一起探索游戏世界</p>
            <el-button type="success" size="large">
              <el-icon><ArrowRight /></el-icon>
              查看好友
            </el-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { testApiConnection as testApi } from '../lib/api'
import deviceDetectionService from '../services/DeviceDetectionService'

// 设备信息响应式状态
const currentPlatform = ref(deviceDetectionService.getCurrentPlatform())
const currentOrientation = ref(deviceDetectionService.getCurrentOrientation())
const interactionMode = ref(deviceDetectionService.getInteractionMode())

// 监听设备变化
watch(() => deviceDetectionService.getCurrentPlatform(), (newPlatform) => {
  currentPlatform.value = newPlatform
  console.log('首页平台变化:', newPlatform)
})

watch(() => deviceDetectionService.getCurrentOrientation(), (newOrientation) => {
  currentOrientation.value = newOrientation
  console.log('首页方向变化:', newOrientation)
})

watch(() => deviceDetectionService.getInteractionMode(), (newMode) => {
  interactionMode.value = newMode
  console.log('首页交互模式变化:', newMode)
})

const router = useRouter()
const gameStore = useGameStore()
const gamesSection = ref(null)

// 计算属性：获取最新攻略
const latestStrategies = computed(() => {
  return gameStore.strategies.slice(0, 6)
})

// 滚动到游戏列表
const scrollToGames = () => {
  gamesSection.value?.scrollIntoView({ behavior: 'smooth' })
}

// 跳转到游戏详情
const goToGame = (gameId) => {
  router.push(`/games/${gameId}`)
}

// 跳转到攻略详情
const goToStrategy = (strategyId) => {
  router.push(`/strategies/${strategyId}`)
}

// 跳转到管理员登录页面
const goToAdminLogin = () => {
  router.push('/admin/login')
}

// 格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 处理图片加载失败
const handleImageError = (event) => {
  event.target.src = '/game-placeholder.svg'
}

// 测试API连接
const handleTestApiConnection = async () => {
  try {
    console.log('开始测试API连接...')
    const data = await testApi()
    console.log('API连接测试成功:', data)
    alert('API连接测试成功！请查看控制台获取详细信息。')
  } catch (error) {
    console.error('API连接测试失败:', error)
    alert(`API连接测试失败: ${error.message}`)
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await gameStore.fetchGames()
  // 获取一些最新攻略用于首页展示
  if (gameStore.games.length > 0) {
    await gameStore.fetchGameStrategies(gameStore.games[0].id)
  } else {
    // 如果没有游戏，获取一些攻略
    await gameStore.fetchStrategies()
  }
})
</script>

<style scoped>
.home {
  background: var(--bg-color-page);
    color: var(--text-color-primary);
}

/* 最新攻略样式 */
.strategies-section {
  padding: 64px 0;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-success-light-9) 100%);
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.strategy-card {
  background: var(--el-bg-color-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.strategy-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.strategy-header {
  margin-bottom: 16px;
}

.strategy-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.strategy-game {
  font-size: 0.875rem;
  color: var(--el-color-primary);
  font-weight: 500;
  background: var(--el-color-primary-light-9);
  padding: 4px 12px;
  border-radius: 16px;
  display: inline-block;
}

.strategy-summary {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.strategy-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 深色主题适配 */
:deep(.dark) .strategies-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

:deep(.dark) .strategy-card {
  background: var(--bg-color-dark-card);
}

:deep(.dark) .strategy-title {
  color: white;
}

:deep(.dark) .strategy-summary {
  color: var(--text-color-light);
}

/* 社区与社交部分样式 */
.social-section {
  padding: 60px 0;
  background: linear-gradient(135deg, var(--bg-color-secondary) 0%, var(--bg-color-page) 100%);
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.social-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.social-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.community-card {
  border-top: 4px solid var(--primary-color);
}

.friends-card {
  border-top: 4px solid var(--success-color);
}

.social-icon {
  margin-bottom: 20px;
  color: var(--primary-color);
}

.community-card .social-icon {
  color: var(--primary-color);
}

.friends-card .social-icon {
  color: var(--success-color);
}

.social-card h3 {
  font-size: 24px;
  margin-bottom: 15px;
  color: var(--text-color-primary);
}

.social-card p {
  font-size: 16px;
  color: var(--text-color-secondary);
  margin-bottom: 25px;
  line-height: 1.6;
}

/* 深色主题适配 */
:deep(.dark) .social-card {
  background: var(--bg-color-dark-card);
  color: white;
}

:deep(.dark) .social-card h3 {
  color: white;
}

/* 平台特定样式优化 */
/* PC平台优化 */
.platform-pc .hero-section {
  min-height: 90vh;
  padding: 60px 0;
}

.platform-pc .hero-content {
  max-width: 700px;
}

.platform-pc .games-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

/* 主机平台优化 */
.platform-console .hero-section {
  min-height: 80vh;
  padding: 40px 0;
}

.platform-console .hero-title {
  font-size: clamp(2rem, 4vw, 3rem);
}

.platform-console .demo-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.platform-console .hero-actions .el-button {
  padding: 15px 30px;
  font-size: 18px;
}

/* 移动平台优化 */
.platform-mobile .hero-section {
  min-height: auto;
  padding: 30px 15px;
  flex-direction: column;
}

.platform-mobile .hero-content {
  max-width: 100%;
  text-align: center;
  padding: 0 15px;
  margin-bottom: 30px;
}

.platform-mobile .hero-title {
  font-size: 2rem;
}

.platform-mobile .hero-actions {
  flex-direction: column;
  gap: 15px;
}

.platform-mobile .hero-actions .el-button {
  width: 100%;
}

.platform-mobile .floating-cards {
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

/* 方向响应式样式 */
.orientation-landscape .hero-section {
  flex-direction: row;
}

.orientation-portrait .hero-section {
  flex-direction: column;
}

.orientation-landscape .demo-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 25px;
}

.orientation-portrait .demo-grid {
  grid-template-columns: 1fr;
  gap: 20px;
}

/* 交互模式适配 */
.interaction-touch .hero-actions .el-button,
.interaction-touch .demo-card .el-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-size: 16px;
}

.interaction-pointer .hero-actions .el-button:hover,
.interaction-pointer .demo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.interaction-pointer .strategy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

:deep(.dark) .social-card p {
  color: var(--text-color-light);
}

.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  overflow: hidden;
  padding: 40px 0;
}

/* 装饰背景元素 */
.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%2300d4ff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
  z-index: 1;
}

/* 新的装饰圆形 */
.hero-section::after {
  content: '';
  position: absolute;
  top: -10%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
  z-index: 1;
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.2;
  }
}

.hero-content {
  flex: 1;
  max-width: 600px;
  padding: 0 40px;
  z-index: 2;
  position: relative;
  animation: fadeInLeft 1s ease-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.gradient-text {
  background: linear-gradient(45deg, #00d4ff, #00ffff, #0099cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 5s ease infinite;
  display: inline-block;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--text-color-secondary);
  margin-bottom: 40px;
  line-height: 1.7;
  font-weight: 300;
  max-width: 85%;
}

.hero-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.hero-actions .el-button {
  padding: 15px 30px;
  font-size: 16px;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.hero-actions .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.hero-actions .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.hero-actions .el-button:hover::before {
  left: 100%;
}

.hero-actions .el-button:active {
  transform: translateY(-1px);
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  animation: fadeInRight 1.2s ease-out;
  min-height: 400px;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.floating-cards {
  position: relative;
  width: 350px;
  height: 350px;
  perspective: 1200px;
}

.card {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #00d4ff;
  font-weight: 600;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 120px;
}

.card:hover {
  transform: translate(0, -10px) rotate(0deg) !important;
  box-shadow: 0 15px 40px rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
}

.card-1 {
  top: 0;
  left: 0;
  animation-delay: 0s;
  transform: rotate(-5deg);
}

.card-2 {
  top: 50px;
  right: 0;
  animation-delay: 2s;
  transform: rotate(5deg);
}

.card-3 {
  bottom: 0;
  left: 50px;
  animation-delay: 4s;
  transform: rotate(-3deg);
}

.card .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 60px 20px;
  }
  
  .hero-content {
    padding: 0;
    max-width: 100%;
    margin-bottom: 40px;
  }
  
  .hero-subtitle {
    max-width: 100%;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .floating-cards {
    width: 300px;
    height: 300px;
  }
}

@media (max-width: 768px) {
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .hero-actions .el-button {
    text-align: center;
  }
  
  .floating-cards {
    width: 250px;
    height: 250px;
  }
  
  .card {
    padding: 16px;
    min-width: 100px;
  }
  
  .card .el-icon {
    font-size: 24px;
  }
}

.container {
  max-width: var(--breakpoint-lg, 1200px);
  margin: 0 auto;
  padding: 0 20px;
  transition: max-width 0.3s ease;
}

.section-title {
  font-size: clamp(2rem, 5vw, 2.75rem);
  text-align: center;
  margin-bottom: 50px;
  background: linear-gradient(45deg, #00d4ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 5s ease infinite;
  font-weight: 700;
  letter-spacing: -0.5px;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #00d4ff, #00ffff);
  border-radius: 2px;
  animation: pulseBorder 3s ease-in-out infinite;
}

.ai-demo-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  position: relative;
  overflow: hidden;
}

.ai-demo-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

.ai-demo-section::after {
  content: '';
  position: absolute;
  bottom: -50%;
  left: -50%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 153, 204, 0.2) 0%, transparent 70%);
  animation: pulse 10s ease-in-out infinite reverse;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.demo-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  padding: 35px 30px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
}

.demo-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #00d4ff, #00ffff);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.demo-card:hover {
  transform: translateY(-12px);
  border-color: #00d4ff;
  box-shadow: 0 25px 50px rgba(0, 212, 255, 0.25);
}

.demo-card:hover::before {
  transform: scaleX(1);
}

.demo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #00d4ff, #0099cc);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.demo-icon .el-icon {
  font-size: 32px;
  color: white;
}

.demo-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #00d4ff;
}

.demo-card p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 1.6;
}

.demo-example {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 15px;
  text-align: left;
}

.question {
  color: #00d4ff;
  font-weight: bold;
  margin-bottom: 8px;
}

.answer {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.games-section, .strategies-section {
  padding: 100px 0;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.game-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 212, 255, 0.25);
  border-color: #00d4ff;
}

.game-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #00d4ff, #00ffff);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.game-card:hover::before {
  transform: scaleX(1);
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
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.8));
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding-bottom: 20px;
}

.game-card:hover .game-overlay {
  opacity: 1;
}

.game-info {
  padding: 25px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), transparent);
}

.game-title {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: #00d4ff;
  font-weight: 600;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.game-card:hover .game-title {
  color: #00ffff;
}

.game-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.95rem;
}

.game-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.game-developer {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.strategy-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 30px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.strategy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #00d4ff, #00ffff);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.strategy-card:hover {
  transform: translateY(-8px);
  border-color: #00d4ff;
  box-shadow: 0 20px 40px rgba(0, 212, 255, 0.2);
}

.strategy-card:hover::before {
  transform: scaleX(1);
}

.strategy-header {
  margin-bottom: 15px;
}

.strategy-title {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #ffffff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.strategy-game {
  color: #00d4ff;
  font-size: 14px;
  font-weight: bold;
}

.strategy-summary {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 15px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.strategy-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.meta-item .el-icon {
  font-size: 16px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
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
  
  .strategies-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .hero-section {
    padding: 60px 20px;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .demo-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }
  
  .games-section, .strategies-section {
    padding: 80px 0;
  }
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
    min-height: auto;
  }
  
  .hero-content {
    max-width: 100%;
    margin-bottom: 40px;
  }
  
  .hero-title {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
  
  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 30px;
  }
  
  .hero-actions {
    justify-content: center;
    flex-direction: column;
    gap: 15px;
  }
  
  .hero-actions .el-button {
    width: 100%;
    max-width: 280px;
  }
  
  .floating-cards {
    width: 200px;
    height: 200px;
    margin: 0 auto;
  }
  
  .card {
    width: 60px;
    height: 60px;
    font-size: 12px;
  }
  
  .card .el-icon {
    font-size: 20px;
  }
  
  .ai-demo-section, .games-section, .strategies-section {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 2rem;
    margin-bottom: 30px;
  }
  
  .demo-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .demo-card {
    padding: 25px 20px;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .strategies-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .game-card, .strategy-card {
    margin: 0 10px;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 15px;
  }
  
  .hero-section {
    padding: 30px 15px;
  }
  
  .hero-title {
    font-size: 2rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
  
  .floating-cards {
    width: 150px;
    height: 150px;
  }
  
  .card {
    width: 50px;
    height: 50px;
    font-size: 10px;
  }
  
  .card .el-icon {
    font-size: 16px;
  }
  
  .ai-demo-section, .games-section, .strategies-section {
    padding: 40px 0;
  }
  
  .section-title {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }
  
  .demo-card {
    padding: 20px 15px;
  }
  
  .demo-card h3 {
    font-size: 1.1rem;
  }
  
  .demo-card p {
    font-size: 0.9rem;
  }
  
  .game-card, .strategy-card {
    margin: 0 5px;
  }
  
  .game-info, .strategy-card {
    padding: 15px;
  }
  
  .game-title, .strategy-title {
    font-size: 1.1rem;
  }
  
  .game-description, .strategy-summary {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .game-cover {
    height: 160px;
  }
  
  .hero-actions .el-button {
    padding: 12px 20px;
    font-size: 14px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .hero-section {
    min-height: auto;
    padding: 30px 20px;
  }
  
  .floating-cards {
    display: none;
  }
  
  .hero-content {
    max-width: 100%;
  }
}

/* 高分辨率屏幕优化 */
@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 35px;
  }
  
  .strategies-grid {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 30px;
  }
}

/* 打印样式 */
@media print {
  .hero-visual,
  .floating-cards,
  .hero-actions {
    display: none;
  }
  
  .hero-section {
    background: none;
    color: black;
  }
  
  .section-title {
    color: black;
  }
}
</style>