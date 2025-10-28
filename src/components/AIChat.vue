<template>
  <el-drawer
    v-model="visible"
    title="AI 游戏助手"
    direction="rtl"
    size="400px"
    class="ai-chat-drawer"
  >
    <template #header>
      <div class="chat-header">
        <el-icon class="header-icon"><Robot /></el-icon>
        <span class="header-title">AI 游戏助手</span>
      </div>
    </template>

    <div class="chat-container">
      <!-- 预设问题 -->
      <div v-if="aiStore.currentConversation.length === 0" class="preset-questions">
        <h4>常见问题：</h4>
        <el-button
          v-for="question in presetQuestions"
          :key="question"
          type="info"
          plain
          size="small"
          class="preset-btn"
          @click="askPresetQuestion(question)"
        >
          {{ question }}
        </el-button>
      </div>

      <!-- 对话历史 -->
      <div class="conversation-history" ref="conversationRef">
        <div
          v-for="(message, index) in aiStore.currentConversation"
          :key="index"
          :class="['message', message.type]"
        >
          <div class="message-avatar">
            <el-icon v-if="message.type === 'user'"><User /></el-icon>
            <el-icon v-else><Robot /></el-icon>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="aiStore.loading" class="message ai loading">
          <div class="message-avatar">
            <el-icon><Robot /></el-icon>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <el-input
          v-model="currentQuestion"
          type="textarea"
          :rows="2"
          placeholder="请输入您的游戏问题..."
          @keyup.ctrl.enter="sendMessage"
          :disabled="aiStore.loading"
        />
        <div class="input-actions">
          <el-button
            type="primary"
            @click="sendMessage"
            :loading="aiStore.loading"
            :disabled="!currentQuestion.trim()"
          >
            <el-icon><Send /></el-icon>
            发送
          </el-button>
          <el-button @click="clearConversation" type="info" plain>
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useAIStore } from '../stores/ai'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])

const aiStore = useAIStore()
const currentQuestion = ref('')
const conversationRef = ref(null)

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const presetQuestions = [
  '原神角色培养优先级是什么？',
  '赛博朋克2077有哪些结局？',
  '塞尔达王国之泪建造系统怎么用？',
  '如何提高游戏技巧？'
]

const sendMessage = async () => {
  if (!currentQuestion.value.trim() || aiStore.loading) return
  
  const question = currentQuestion.value.trim()
  currentQuestion.value = ''
  
  await aiStore.askQuestion(question)
  scrollToBottom()
}

const askPresetQuestion = async (question) => {
  currentQuestion.value = question
  await sendMessage()
}

const clearConversation = () => {
  aiStore.clearCurrentConversation()
}

const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (conversationRef.value) {
      conversationRef.value.scrollTop = conversationRef.value.scrollHeight
    }
  })
}

// 监听对话变化，自动滚动到底部
watch(() => aiStore.currentConversation.length, () => {
  scrollToBottom()
})

// 初始化会话
watch(visible, (newVisible) => {
  if (newVisible && !aiStore.sessionId) {
    aiStore.initSession()
  }
})
</script>

<style scoped>
.ai-chat-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #00d4ff;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  margin-bottom: 0;
  padding: 20px;
}

.ai-chat-drawer :deep(.el-drawer__body) {
  background: #0f0f0f;
  padding: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 24px;
  color: #00d4ff;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preset-questions {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preset-questions h4 {
  color: #00d4ff;
  margin-bottom: 15px;
  font-size: 14px;
}

.preset-btn {
  margin: 5px 5px 5px 0;
  border-color: rgba(0, 212, 255, 0.3);
  color: #00d4ff;
}

.preset-btn:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

.conversation-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-height: calc(100vh - 300px);
}

.message {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: linear-gradient(45deg, #00d4ff, #0099cc);
}

.message.ai .message-avatar {
  background: linear-gradient(45deg, #6c5ce7, #a29bfe);
}

.message-avatar .el-icon {
  font-size: 20px;
  color: white;
}

.message-content {
  max-width: 70%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message.user .message-content {
  background: linear-gradient(45deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 204, 0.2));
  border-color: rgba(0, 212, 255, 0.3);
}

.message.ai .message-content {
  background: linear-gradient(45deg, rgba(108, 92, 231, 0.2), rgba(162, 155, 254, 0.2));
  border-color: rgba(108, 92, 231, 0.3);
}

.message-text {
  color: #ffffff;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 5px;
  text-align: right;
}

.message.user .message-time {
  text-align: left;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00d4ff;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.input-area {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.input-area .el-textarea :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #ffffff;
  border-radius: 10px;
  resize: none;
}

.input-area .el-textarea :deep(.el-textarea__inner):focus {
  border-color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.input-actions .el-button {
  border-radius: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}
</style>