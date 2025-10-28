<template>
  <el-card class="strategy-card" @click="navigateToDetail">
    <div class="card-header">
      <div class="header-left">
        <h3 class="strategy-title">{{ strategy.title }}</h3>
        <div class="game-info">
          <el-tag size="small" effect="plain">{{ strategy.game_name || '未知游戏' }}</el-tag>
          <el-tag v-if="strategy.difficulty" size="small" effect="plain" class="difficulty-tag">
            {{ getDifficultyText(strategy.difficulty) }}
          </el-tag>
        </div>
      </div>
      <div class="views-count">
        <el-icon class="view-icon"><View /></el-icon>
        <span>{{ formatNumber(strategy.views || 0) }}</span>
      </div>
    </div>
    
    <div class="content-preview">
      <p>{{ truncateContent(strategy.content || '') }}</p>
    </div>
    
    <div class="card-footer">
      <div class="author-info">
        <span class="author">{{ strategy.author || '匿名作者' }}</span>
        <span v-if="strategy.created_at" class="date">{{ formatDate(strategy.created_at) }}</span>
      </div>
      <div class="tags-container">
        <el-tag
          v-for="(tag, index) in displayTags"
          :key="index"
          size="small"
          class="strategy-tag"
        >
          {{ tag }}
        </el-tag>
        <el-tag
          v-if="hasMoreTags"
          size="small"
          type="info"
          plain
        >
          +{{ strategy.tags.length - 3 }}
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { useRouter } from 'vue-router';
import { View } from '@element-plus/icons-vue';

const props = defineProps({
  strategy: {
    type: Object,
    required: true
  }
});

const router = useRouter();

// 计算要显示的标签（最多3个）
const displayTags = computed(() => {
  const tags = props.strategy.tags || [];
  return tags.slice(0, 3);
});

// 是否有更多标签
const hasMoreTags = computed(() => {
  return (props.strategy.tags || []).length > 3;
});

// 导航到攻略详情页
const navigateToDetail = () => {
  router.push(`/strategy/${props.strategy.id}`);
};

// 获取难度文本
const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难',
    'expert': '专家'
  };
  return difficultyMap[difficulty] || difficulty;
};

// 截断内容预览
const truncateContent = (content) => {
  if (!content) return '';
  // 移除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
};

// 格式化数字（千分位）
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
</script>

<style scoped>
.strategy-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.strategy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.header-left {
  flex: 1;
  margin-right: 20px;
}

.strategy-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.views-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #909399;
  white-space: nowrap;
}

.view-icon {
  font-size: 14px;
}

.content-preview {
  margin-bottom: 12px;
}

.content-preview p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.author {
  font-weight: 500;
}

.tags-container {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.strategy-tag {
  font-size: 12px;
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #d9ecff;
}

.difficulty-tag {
  background-color: #f5f7fa;
  color: #606266;
}

@media (max-width: 768px) {
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .views-count {
    margin-top: 8px;
  }
}
</style>