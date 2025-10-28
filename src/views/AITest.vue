<template>
  <div class="ai-test-page">
    <div class="container">
      <h1>AI功能测试</h1>
      
      <div class="test-section">
        <h2>AI问答测试</h2>
        <div class="test-form">
          <el-input
            v-model="testQuestion"
            type="textarea"
            :rows="3"
            placeholder="输入测试问题..."
          />
          <el-button 
            type="primary" 
            @click="testAIQuestion"
            :loading="aiStore.loading"
            style="margin-top: 10px;"
          >
            测试AI回答
          </el-button>
        </div>
        
        <div v-if="aiStore.currentConversation.length > 0" class="conversation-display">
          <h3>对话记录：</h3>
          <div 
            v-for="(message, index) in aiStore.currentConversation" 
            :key="index"
            :class="['message', message.type]"
          >
            <strong>{{ message.type === 'user' ? '用户' : 'AI' }}：</strong>
            <div v-html="message.content.replace(/\n/g, '<br>')"></div>
            <small>{{ formatTime(message.timestamp) }}</small>
          </div>
        </div>
      </div>
      
      <div class="test-section">
        <h2>数据库连接测试</h2>
        <el-button @click="testDatabaseConnection" :loading="dbLoading">
          测试数据库连接
        </el-button>
        <div v-if="dbResult" class="db-result">
          <pre>{{ JSON.stringify(dbResult, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="test-section">
        <h2>游戏数据测试</h2>
        <el-button @click="testGameData" :loading="gameLoading">
          获取游戏数据
        </el-button>
        <div v-if="gameData" class="game-result">
          <h4>游戏列表：</h4>
          <ul>
            <li v-for="game in gameData" :key="game.id">
              {{ game.name }} - {{ game.category }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAIStore } from '../stores/ai'
import { useGameStore } from '../stores/game'
import { supabase } from '../lib/supabase'
import { ElMessage } from 'element-plus'

const aiStore = useAIStore()
const gameStore = useGameStore()

const testQuestion = ref('原神角色培养优先级是什么？')
const dbLoading = ref(false)
const dbResult = ref(null)
const gameLoading = ref(false)
const gameData = ref(null)

const testAIQuestion = async () => {
  if (!testQuestion.value.trim()) {
    ElMessage.warning('请输入测试问题')
    return
  }
  
  try {
    await aiStore.askQuestion(testQuestion.value)
    ElMessage.success('AI回答生成成功')
  } catch (error) {
    ElMessage.error('AI回答失败：' + error.message)
  }
}

const testDatabaseConnection = async () => {
  dbLoading.value = true
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .limit(3)
    
    if (error) throw error
    
    dbResult.value = {
      status: 'success',
      message: '数据库连接成功',
      data: data
    }
    ElMessage.success('数据库连接测试成功')
  } catch (error) {
    dbResult.value = {
      status: 'error',
      message: error.message
    }
    ElMessage.error('数据库连接失败：' + error.message)
  } finally {
    dbLoading.value = false
  }
}

const testGameData = async () => {
  gameLoading.value = true
  try {
    await gameStore.fetchGames()
    gameData.value = gameStore.games
    ElMessage.success('游戏数据获取成功')
  } catch (error) {
    ElMessage.error('游戏数据获取失败：' + error.message)
  } finally {
    gameLoading.value = false
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}
</script>

<style scoped>
.ai-test-page {
  background: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
  padding: 40px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  color: #00d4ff;
  text-align: center;
  margin-bottom: 40px;
}

.test-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
}

.test-section h2 {
  color: #00d4ff;
  margin-bottom: 20px;
}

.test-form {
  margin-bottom: 20px;
}

.conversation-display {
  margin-top: 20px;
}

.message {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
}

.message.user {
  background: rgba(0, 212, 255, 0.1);
  border-left: 3px solid #00d4ff;
}

.message.ai {
  background: rgba(0, 255, 255, 0.1);
  border-left: 3px solid #00ffff;
}

.db-result, .game-result {
  margin-top: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
}

.db-result pre {
  color: #00ffff;
  font-size: 12px;
  overflow-x: auto;
}

.game-result ul {
  list-style: none;
  padding: 0;
}

.game-result li {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
}
</style>