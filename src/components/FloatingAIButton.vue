<template>
  <div class="floating-ai-button" @click="toggleAIChat">
    <el-button
      type="primary"
      circle
      size="large"
      class="ai-fab"
      :class="{ 'pulse': !hasInteracted }"
    >
      <el-icon size="24"><ChatDotRound /></el-icon>
    </el-button>
    
    <!-- 提示气泡 -->
    <transition name="tooltip-fade">
      <div v-if="showTooltip" class="ai-tooltip">
        <div class="tooltip-content">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI游戏助手</span>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'

const emit = defineEmits(['toggle-ai-chat'])

const showTooltip = ref(false)
const hasInteracted = ref(false)
let tooltipTimer = null

const toggleAIChat = () => {
  hasInteracted.value = true
  hideTooltip()
  emit('toggle-ai-chat')
}

const showTooltipDelayed = () => {
  if (!hasInteracted.value) {
    tooltipTimer = setTimeout(() => {
      showTooltip.value = true
    }, 3000) // 3秒后显示提示
  }
}

const hideTooltip = () => {
  showTooltip.value = false
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
    tooltipTimer = null
  }
}

onMounted(() => {
  // 检查用户是否之前使用过AI助手
  const hasUsedAI = localStorage.getItem('hasUsedAI')
  if (!hasUsedAI) {
    showTooltipDelayed()
  } else {
    hasInteracted.value = true
  }
})

onUnmounted(() => {
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
  }
})
</script>

<style scoped>
.floating-ai-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: var(--z-index-modal, 3000);
}

.ai-fab {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-fab:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.ai-fab:active {
  transform: translateY(-1px) scale(0.98);
}

.ai-fab.pulse {
  animation: pulse 2s infinite;
}

.ai-tooltip {
  position: absolute;
  bottom: 70px;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.tooltip-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip-arrow {
  position: absolute;
  top: 100%;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(0, 0, 0, 0.9);
}

/* 动画效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.8), 0 0 0 10px rgba(102, 126, 234, 0.1);
  }
  100% {
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.3s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-ai-button {
    bottom: 20px;
    right: 20px;
  }
  
  .ai-fab {
    width: 56px;
    height: 56px;
  }
  
  .ai-tooltip {
    bottom: 66px;
    font-size: 13px;
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .floating-ai-button {
    bottom: 16px;
    right: 16px;
  }
  
  .ai-fab {
    width: 52px;
    height: 52px;
  }
  
  .ai-tooltip {
    bottom: 62px;
    font-size: 12px;
    padding: 8px 12px;
  }
}

/* 深色主题适配 */
:global([data-theme="dark"]) .ai-tooltip {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:global([data-theme="dark"]) .tooltip-arrow {
  border-top-color: rgba(255, 255, 255, 0.1);
}
</style>