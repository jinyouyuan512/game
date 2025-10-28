<template>
  <div class="ai-analyzer">
    <div class="analyzer-header">
      <el-icon class="analyzer-icon"><MagicStick /></el-icon>
      <h3>AI 智能分析</h3>
    </div>
    
    <div class="analyzer-content">
      <!-- 摘要生成 -->
      <div class="analysis-section">
        <h4>
          <el-icon><Document /></el-icon>
          攻略摘要
        </h4>
        <div v-if="summary" class="summary-content">
          <p>{{ summary }}</p>
        </div>
        <div v-else class="no-summary">
          <p>暂无摘要，点击下方按钮生成</p>
        </div>
        <el-button 
          type="primary" 
          @click="generateSummary"
          :loading="summaryLoading"
          size="small"
        >
          <el-icon><Refresh /></el-icon>
          {{ summary ? '重新生成' : '生成摘要' }}
        </el-button>
      </div>
      
      <!-- 难度分析 -->
      <div class="analysis-section">
        <h4>
          <el-icon><TrendCharts /></el-icon>
          难度分析
        </h4>
        <div class="difficulty-analysis">
          <div class="difficulty-meter">
            <div class="meter-label">操作难度</div>
            <el-progress 
              :percentage="difficultyAnalysis.operation" 
              :color="getDifficultyColor(difficultyAnalysis.operation)"
              :show-text="false"
            />
            <span class="meter-value">{{ difficultyAnalysis.operation }}%</span>
          </div>
          <div class="difficulty-meter">
            <div class="meter-label">理解难度</div>
            <el-progress 
              :percentage="difficultyAnalysis.understanding" 
              :color="getDifficultyColor(difficultyAnalysis.understanding)"
              :show-text="false"
            />
            <span class="meter-value">{{ difficultyAnalysis.understanding }}%</span>
          </div>
          <div class="difficulty-meter">
            <div class="meter-label">时间投入</div>
            <el-progress 
              :percentage="difficultyAnalysis.timeInvestment" 
              :color="getDifficultyColor(difficultyAnalysis.timeInvestment)"
              :show-text="false"
            />
            <span class="meter-value">{{ difficultyAnalysis.timeInvestment }}%</span>
          </div>
        </div>
      </div>
      
      <!-- 关键要点 -->
      <div class="analysis-section">
        <h4>
          <el-icon><Key /></el-icon>
          关键要点
        </h4>
        <ul class="key-points">
          <li v-for="(point, index) in keyPoints" :key="index">
            <el-icon class="point-icon"><Check /></el-icon>
            {{ point }}
          </li>
        </ul>
      </div>
      
      <!-- 相关建议 -->
      <div class="analysis-section">
        <h4>
          <el-icon><Lightbulb /></el-icon>
          相关建议
        </h4>
        <div class="suggestions">
          <el-tag 
            v-for="suggestion in suggestions" 
            :key="suggestion"
            type="info"
            class="suggestion-tag"
          >
            {{ suggestion }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAIStore } from '../stores/ai'

const props = defineProps({
  strategyContent: {
    type: String,
    required: true
  },
  strategyTitle: {
    type: String,
    required: true
  },
  gameInfo: {
    type: Object,
    default: () => ({})
  }
})

const aiStore = useAIStore()
const summaryLoading = ref(false)
const summary = ref('')

// 难度分析数据
const difficultyAnalysis = ref({
  operation: 65,
  understanding: 45,
  timeInvestment: 80
})

// 关键要点
const keyPoints = ref([
  '掌握基础操作技巧',
  '理解游戏机制原理',
  '合理分配资源',
  '注意时机把握',
  '持续练习提升'
])

// 相关建议
const suggestions = ref([
  '新手友好',
  '需要耐心',
  '建议多练习',
  '可参考视频',
  '社区讨论'
])

const generateSummary = async () => {
  summaryLoading.value = true
  try {
    // 基于攻略内容生成摘要
    const prompt = `请为以下游戏攻略生成一个简洁的摘要：
标题：${props.strategyTitle}
游戏：${props.gameInfo.name || '未知游戏'}
内容：${props.strategyContent.substring(0, 500)}...`
    
    const response = await aiStore.generateAIResponse(prompt)
    summary.value = response
  } catch (error) {
    console.error('生成摘要失败:', error)
    summary.value = '摘要生成失败，请稍后重试'
  } finally {
    summaryLoading.value = false
  }
}

const getDifficultyColor = (percentage) => {
  if (percentage <= 30) return '#67c23a'
  if (percentage <= 60) return '#e6a23c'
  return '#f56c6c'
}

// 根据攻略内容分析难度
const analyzeDifficulty = () => {
  const content = props.strategyContent.toLowerCase()
  
  // 简单的关键词分析
  const complexKeywords = ['高级', '困难', '复杂', '精通', '专业']
  const timeKeywords = ['长期', '持续', '反复', '大量时间']
  const operationKeywords = ['操作', '技巧', '手速', '反应']
  
  let operationScore = 50
  let understandingScore = 50
  let timeScore = 50
  
  complexKeywords.forEach(keyword => {
    if (content.includes(keyword)) understandingScore += 10
  })
  
  timeKeywords.forEach(keyword => {
    if (content.includes(keyword)) timeScore += 15
  })
  
  operationKeywords.forEach(keyword => {
    if (content.includes(keyword)) operationScore += 10
  })
  
  difficultyAnalysis.value = {
    operation: Math.min(operationScore, 100),
    understanding: Math.min(understandingScore, 100),
    timeInvestment: Math.min(timeScore, 100)
  }
}

onMounted(() => {
  analyzeDifficulty()
  // 自动生成摘要
  if (props.strategyContent) {
    generateSummary()
  }
})
</script>

<style scoped>
.ai-analyzer {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
}

.analyzer-header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  color: #00d4ff;
}

.analyzer-icon {
  font-size: 24px;
  margin-right: 10px;
}

.analyzer-header h3 {
  margin: 0;
  font-size: 20px;
}

.analysis-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.analysis-section h4 {
  display: flex;
  align-items: center;
  color: #ffffff;
  margin-bottom: 15px;
  font-size: 16px;
}

.analysis-section h4 .el-icon {
  margin-right: 8px;
  color: #00ffff;
}

.summary-content p {
  color: #e0e0e0;
  line-height: 1.6;
  margin: 0;
}

.no-summary p {
  color: #888;
  font-style: italic;
  margin: 0;
}

.difficulty-analysis {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.difficulty-meter {
  display: flex;
  align-items: center;
  gap: 15px;
}

.meter-label {
  width: 80px;
  color: #ffffff;
  font-size: 14px;
}

.meter-value {
  width: 40px;
  color: #00ffff;
  font-weight: bold;
  text-align: right;
}

.key-points {
  list-style: none;
  padding: 0;
  margin: 0;
}

.key-points li {
  display: flex;
  align-items: center;
  color: #e0e0e0;
  margin-bottom: 10px;
  padding: 8px 0;
}

.point-icon {
  color: #00d4ff;
  margin-right: 10px;
  font-size: 16px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.suggestion-tag {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-button) {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
}

:deep(.el-button:hover) {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
}
</style>