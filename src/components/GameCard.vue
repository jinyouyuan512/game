<template>
  <el-card class="game-card" :body-style="{ padding: '0' }" @click="navigateToDetail">
    <div class="card-content">
      <!-- 游戏封面 -->
      <div class="cover-container">
        <img 
          :src="game.cover_image_url || '/default-game-cover.png'" 
          :alt="game.name"
          class="cover-image"
          @error="handleImageError"
        />
        <div v-if="game.category" class="category-tag">{{ game.category }}</div>
      </div>
      
      <!-- 游戏信息 -->
      <div class="game-info">
        <h3 class="game-name">{{ game.name }}</h3>
        <p class="developer">{{ game.developer }}</p>
        <p class="description">{{ truncateDescription(game.description) }}</p>
        <div class="meta-info">
          <span v-if="game.release_date" class="release-date">
            <el-icon><Calendar /></el-icon>
            {{ formatDate(game.release_date) }}
          </span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { Calendar } from '@element-plus/icons-vue';

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
});

const router = useRouter();

// 导航到游戏详情页
const navigateToDetail = () => {
  router.push(`/game/${props.game.id}`);
};

// 处理图片加载失败
const handleImageError = (event) => {
  event.target.src = '/default-game-cover.png';
};

// 截断描述
const truncateDescription = (description) => {
  if (!description) return '';
  return description.length > 80 ? description.substring(0, 80) + '...' : description;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.game-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cover-container {
  position: relative;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  overflow: hidden;
  background-color: #f0f0f0;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-card:hover .cover-image {
  transform: scale(1.05);
}

.category-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.game-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
  line-height: 1.4;
}

.developer {
  font-size: 13px;
  color: #606266;
  margin: 0 0 8px 0;
}

.description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-info {
  margin-top: auto;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.release-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-icon) {
  font-size: 12px;
}
</style>