<template>
  <div class="game-summary-card">
    <div class="card-header">
      <div class="header-left">
        <el-icon class="ai-icon"><ChatDotRound /></el-icon>
        <h3>AI 游戏摘要</h3>
      </div>
      <el-button 
        type="primary" 
        size="small" 
        :loading="generating"
        @click="generateSummary"
      >
        {{ generating ? '生成中...' : '重新生成' }}
      </el-button>
    </div>

    <div v-if="loading" class="loading-content">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="summary" class="summary-content">
      <!-- 游戏概述 -->
      <div class="summary-section">
        <h4><el-icon><InfoFilled /></el-icon>游戏概述</h4>
        <p>{{ summary.overview }}</p>
      </div>

      <!-- 核心特色 -->
      <div class="summary-section">
        <h4><el-icon><Star /></el-icon>核心特色</h4>
        <ul class="feature-list">
          <li v-for="feature in summary.features" :key="feature">{{ feature }}</li>
        </ul>
      </div>

      <!-- 难度评估 -->
      <div class="summary-section">
        <h4><el-icon><TrendCharts /></el-icon>难度评估</h4>
        <div class="difficulty-grid">
          <div class="difficulty-item">
            <span class="label">操作难度</span>
            <el-rate 
              v-model="summary.difficulty.operation" 
              disabled 
              show-score 
              text-color="#ff9900"
            />
          </div>
          <div class="difficulty-item">
            <span class="label">理解难度</span>
            <el-rate 
              v-model="summary.difficulty.understanding" 
              disabled 
              show-score 
              text-color="#ff9900"
            />
          </div>
          <div class="difficulty-item">
            <span class="label">时间投入</span>
            <el-rate 
              v-model="summary.difficulty.timeInvestment" 
              disabled 
              show-score 
              text-color="#ff9900"
            />
          </div>
        </div>
      </div>

      <!-- 推荐指数 -->
      <div class="summary-section">
        <h4><el-icon><Trophy /></el-icon>推荐指数</h4>
        <div class="recommendation">
          <el-rate 
            v-model="summary.recommendation.score" 
            disabled 
            show-score 
            text-color="#ff9900"
            size="large"
          />
          <p class="recommendation-text">{{ summary.recommendation.reason }}</p>
        </div>
      </div>

      <!-- 相关标签 -->
      <div class="summary-section">
        <h4><el-icon><Collection /></el-icon>相关标签</h4>
        <div class="tags">
          <el-tag 
            v-for="tag in summary.tags" 
            :key="tag" 
            :type="getTagType(tag)"
            size="small"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>

    <div v-else class="empty-content">
      <el-empty description="暂无AI摘要">
        <el-button type="primary" @click="generateSummary">生成摘要</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  ChatDotRound, 
  InfoFilled, 
  Star, 
  TrendCharts, 
  Trophy, 
  Collection 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  gameId: {
    type: [String, Number],
    required: true
  },
  gameInfo: {
    type: Object,
    required: true
  }
})

// 响应式数据
const loading = ref(false)
const generating = ref(false)
const summary = ref(null)

// 方法
const generateSummary = async () => {
  generating.value = true
  try {
    // 模拟AI生成摘要的过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 根据游戏信息生成摘要
    summary.value = await generateGameSummary(props.gameInfo)
    
    ElMessage.success('AI摘要生成成功')
  } catch (error) {
    console.error('生成摘要失败:', error)
    ElMessage.error('生成摘要失败，请稍后重试')
  } finally {
    generating.value = false
  }
}

const generateGameSummary = async (gameInfo) => {
  // 模拟AI分析游戏信息并生成摘要
  const summaryTemplates = {
    'RPG': {
      overview: `${gameInfo.name}是一款${gameInfo.category}游戏，以其丰富的角色系统和深度的剧情体验著称。游戏提供了广阔的世界探索和多样化的角色发展路径。`,
      features: ['丰富的角色系统', '深度剧情体验', '开放世界探索', '多样化技能树'],
      difficulty: { operation: 3, understanding: 4, timeInvestment: 5 },
      recommendation: { 
        score: 4, 
        reason: '适合喜欢深度游戏体验和角色扮演的玩家，需要投入较多时间。' 
      },
      tags: ['角色扮演', '开放世界', '剧情丰富', '策略性']
    },
    'Action': {
      overview: `${gameInfo.name}是一款动作游戏，注重快节奏的战斗体验和精准的操作技巧。游戏提供了流畅的战斗系统和挑战性的关卡设计。`,
      features: ['流畅战斗系统', '精准操作要求', '挑战性关卡', '华丽技能效果'],
      difficulty: { operation: 4, understanding: 2, timeInvestment: 3 },
      recommendation: { 
        score: 4, 
        reason: '适合喜欢快节奏战斗和操作挑战的玩家。' 
      },
      tags: ['动作', '快节奏', '操作性', '战斗']
    },
    'Adventure': {
      overview: `${gameInfo.name}是一款冒险游戏，以探索未知世界和解决谜题为核心玩法。游戏营造了沉浸式的冒险氛围。`,
      features: ['探索导向', '谜题解决', '沉浸式体验', '精美场景'],
      difficulty: { operation: 2, understanding: 3, timeInvestment: 4 },
      recommendation: { 
        score: 4, 
        reason: '适合喜欢探索和解谜的休闲玩家。' 
      },
      tags: ['冒险', '探索', '解谜', '休闲']
    }
  }

  // 根据游戏类别选择模板，如果没有匹配的则使用默认模板
  const template = summaryTemplates[gameInfo.category] || summaryTemplates['Adventure']
  
  return {
    ...template,
    overview: template.overview.replace(gameInfo.name, gameInfo.name)
  }
}

const getTagType = (tag) => {
  const tagTypes = {
    '角色扮演': 'primary',
    '开放世界': 'success',
    '剧情丰富': 'info',
    '策略性': 'warning',
    '动作': 'danger',
    '快节奏': 'primary',
    '操作性': 'warning',
    '战斗': 'danger',
    '冒险': 'success',
    '探索': 'info',
    '解谜': 'primary',
    '休闲': 'success'
  }
  return tagTypes[tag] || ''
}

// 生命周期
onMounted(() => {
  // 自动生成摘要
  generateSummary()
})
</script>

<style scoped>
.game-summary-card {
  background: linear-gradient(135deg, white 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
}

.game-summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A, #E6A23C, #F56C6C);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-icon {
  font-size: 24px;
  color: #409eff;
}

.card-header h3 {
  margin: 0;
  color: #303133;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(45deg, #303133, #606266);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-header .el-button {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card-header .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.5s ease;
}

.card-header .el-button:hover::before {
  left: 100%;
}

.loading-content {
  padding: 20px 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.summary-section h4 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 700;
  position: relative;
  padding-left: 8px;
}

.summary-section h4::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, #409EFF, #67C23A);
  border-radius: 2px;
}

.summary-section p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.feature-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.feature-list li {
  margin-bottom: 8px;
  line-height: 1.6;
  position: relative;
  padding-left: 12px;
}

.feature-list li::before {
  content: '✦';
  position: absolute;
  left: 0;
  color: #409EFF;
  font-size: 12px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.difficulty-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.difficulty-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

.difficulty-item .label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.recommendation {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  border-radius: 12px;
  padding: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.recommendation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.recommendation-text {
  color: white;
  font-style: italic;
  font-size: 16px;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tags .el-tag {
  transition: all 0.3s ease;
  border: none;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
}

.tags .el-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.empty-content {
  text-align: center;
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-summary-card {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .difficulty-grid {
    grid-template-columns: 1fr;
  }
}
</style>