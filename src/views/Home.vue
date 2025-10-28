<template>
  <div class="home">
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
          <el-button type="primary" size="large" @click="showAIDemo">
            <el-icon><Robot /></el-icon>
            体验AI助手
          </el-button>
          <el-button size="large" @click="scrollToGames">
            <el-icon><GamePad /></el-icon>
            浏览游戏
          </el-button>
          <el-button size="large" @click="handleTestApiConnection" type="warning">
            <el-icon><Connection /></el-icon>
            测试API连接
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

    <!-- AI功能演示区 -->
    <section class="ai-demo-section">
      <div class="container">
        <h2 class="section-title">AI助手功能演示</h2>
        <div class="demo-grid">
          <div class="demo-card">
            <div class="demo-icon">
              <el-icon><MessageBox /></el-icon>
            </div>
            <h3>智能问答</h3>
            <p>基于攻略内容的精准问答，快速解决游戏中的具体问题</p>
            <div class="demo-example">
              <div class="question">"原神角色培养优先级？"</div>
              <div class="answer">AI会基于攻略内容给出详细的角色培养建议</div>
            </div>
          </div>
          
          <div class="demo-card">
            <div class="demo-icon">
              <el-icon><Document /></el-icon>
            </div>
            <h3>攻略摘要</h3>
            <p>自动生成攻略关键点摘要，快速了解内容要点</p>
            <div class="demo-example">
              <div class="question">长篇攻略自动摘要</div>
              <div class="answer">3-5行关键点总结，节省阅读时间</div>
            </div>
          </div>
          
          <div class="demo-card">
            <div class="demo-icon">
              <el-icon><Search /></el-icon>
            </div>
            <h3>上下文理解</h3>
            <p>支持追问和澄清，保持对话的连贯性</p>
            <div class="demo-example">
              <div class="question">"具体在哪里采集？"</div>
              <div class="answer">AI理解上下文，给出精确的位置信息</div>
            </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { testApiConnection as testApi } from '../lib/api'

const router = useRouter()
const gameStore = useGameStore()
const gamesSection = ref(null)

const latestStrategies = computed(() => {
  return gameStore.strategies.slice(0, 6)
})

const showAIDemo = () => {
  // 触发AI聊天窗口显示
  const event = new CustomEvent('show-ai-chat')
  window.dispatchEvent(event)
}

const scrollToGames = () => {
  gamesSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const goToGame = (gameId) => {
  router.push(`/games/${gameId}`)
}

const goToStrategy = (strategyId) => {
  router.push(`/strategies/${strategyId}`)
}

const handleImageError = (event) => {
  event.target.src = '/game-placeholder.svg'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
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

onMounted(async () => {
  await gameStore.fetchGames()
  // 获取一些最新攻略用于首页展示
  if (gameStore.games.length > 0) {
    await gameStore.fetchStrategiesByGame(gameStore.games[0].id)
  }
})
</script>

<style scoped>
.home {
  background: var(--bg-color-page);
  color: var(--text-color-primary);
}

.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%2300d4ff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  padding: 0 40px;
  z-index: 2;
  position: relative;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(45deg, #00d4ff, #00ffff, #0099cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-color-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.hero-actions .el-button {
  padding: 15px 30px;
  font-size: 16px;
  border-radius: 25px;
  font-weight: bold;
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
}

.floating-cards {
  position: relative;
  width: 300px;
  height: 300px;
}

.card {
  position: absolute;
  background: var(--fill-color-light);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color-light);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--primary-color);
  font-weight: bold;
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 0;
  left: 0;
  animation-delay: 0s;
}

.card-2 {
  top: 50px;
  right: 0;
  animation-delay: 2s;
}

.card-3 {
  bottom: 0;
  left: 50px;
  animation-delay: 4s;
}

.card .el-icon {
  font-size: 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 50px;
  background: linear-gradient(45deg, #00d4ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ai-demo-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
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
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.demo-card:hover {
  transform: translateY(-10px);
  border-color: #00d4ff;
  box-shadow: 0 20px 40px rgba(0, 212, 255, 0.2);
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
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
}

.game-cover {
  position: relative;
  height: 200px;
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover .game-overlay {
  opacity: 1;
}

.game-info {
  padding: 20px;
}

.game-title {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #00d4ff;
}

.game-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 15px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.game-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.game-developer {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.strategy-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.strategy-card:hover {
  transform: translateY(-5px);
  border-color: #00d4ff;
  box-shadow: 0 15px 30px rgba(0, 212, 255, 0.1);
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