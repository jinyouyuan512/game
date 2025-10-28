<template>
  <div class="user-favorites">
    <div class="favorites-container">
      <div class="favorites-header">
        <h1 class="page-title">我的收藏</h1>
        <div class="filter-bar">
          <el-select v-model="filterType" placeholder="收藏类型" clearable @change="handleFilterChange">
            <el-option label="全部" value="" />
            <el-option label="游戏" value="game" />
            <el-option label="攻略" value="strategy" />
          </el-select>
        </div>
      </div>

      <div class="favorites-content">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="filteredFavorites.length === 0" class="empty-container">
          <el-empty description="暂无收藏内容" />
        </div>
        
        <div v-else class="favorites-list">
          <div 
            v-for="item in filteredFavorites" 
            :key="item.id" 
            class="favorite-item"
            @click="navigateToItem(item)"
          >
            <div class="item-image">
              <img :src="item.image" :alt="item.title" />
            </div>
            <div class="item-info">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-meta">
                <span class="item-type">{{ getTypeLabel(item.type) }}</span>
                <span class="item-date">{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
            <div class="item-actions">
              <el-button type="danger" size="small" @click.stop="removeFavorite(item)">
                取消收藏
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const filterType = ref('')

// 模拟收藏数据
const favorites = ref([
  {
    id: 1,
    type: 'game',
    title: '原神',
    description: '开放世界冒险游戏',
    image: 'https://picsum.photos/seed/genshin/200/120.jpg',
    createdAt: new Date('2023-10-15')
  },
  {
    id: 2,
    type: 'strategy',
    title: '原神4.3版本深渊攻略',
    description: '详细解析4.3版本深渊12层满星攻略',
    image: 'https://picsum.photos/seed/strategy1/200/120.jpg',
    createdAt: new Date('2023-11-20')
  },
  {
    id: 3,
    type: 'game',
    title: '塞尔达传说：王国之泪',
    description: '开放世界冒险游戏',
    image: 'https://picsum.photos/seed/zelda/200/120.jpg',
    createdAt: new Date('2023-12-05')
  }
])

// 过滤后的收藏列表
const filteredFavorites = computed(() => {
  if (!filterType.value) {
    return favorites.value
  }
  return favorites.value.filter(item => item.type === filterType.value)
})

const getTypeLabel = (type) => {
  const typeMap = {
    game: '游戏',
    strategy: '攻略'
  }
  return typeMap[type] || type
}

const formatDate = (date) => {
  return date.toLocaleDateString()
}

const handleFilterChange = () => {
  // 过滤逻辑已在计算属性中处理
}

const navigateToItem = (item) => {
  if (item.type === 'game') {
    router.push(`/games/${item.id}`)
  } else if (item.type === 'strategy') {
    router.push(`/strategies/${item.id}`)
  }
}

const removeFavorite = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消收藏"${item.title}"吗？`,
      '取消收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API取消收藏
    // await userStore.removeFavorite(item.id)
    
    // 从列表中移除
    const index = favorites.value.findIndex(fav => fav.id === item.id)
    if (index !== -1) {
      favorites.value.splice(index, 1)
    }
    
    ElMessage.success('已取消收藏')
  } catch (error) {
    // 用户取消操作
  }
}

onMounted(async () => {
  if (userStore.isAuthenticated) {
    loading.value = true
    try {
      // 这里应该调用API获取收藏列表
      // const data = await userStore.getFavorites()
      // favorites.value = data
      
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      ElMessage.error('获取收藏列表失败')
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.user-favorites {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.favorites-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.favorites-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.filter-bar {
  width: 150px;
}

.favorites-content {
  padding: 20px;
}

.loading-container, .empty-container {
  padding: 40px 0;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.favorite-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-item:hover {
  box-shadow: var(--el-box-shadow-light);
  transform: translateY(-2px);
}

.item-image {
  width: 200px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.item-description {
  margin: 0 0 12px 0;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.item-type {
  padding: 2px 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 4px;
}

.item-actions {
  display: flex;
  align-items: center;
}
</style>