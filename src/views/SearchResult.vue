<template>
  <div class="search-result-page">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="container">
        <el-row :gutter="20">
          <el-col :span="24">
            <SearchBar v-model="searchQuery" @search="performSearch" />
            <div class="search-info">
              <span v-if="searchQuery">搜索结果 for "{{ searchQuery }}"</span>
              <span v-if="isLoading" class="loading-text">搜索中...</span>
              <span v-else-if="error" class="error-text">{{ error }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 搜索结果内容 -->
    <div class="container main-content">
      <!-- 搜索筛选器 -->
      <el-row :gutter="20" class="filter-row">
        <el-col :span="24">
          <!-- 搜索筛选器 -->
          <div class="advanced-filter">
            <el-collapse v-model="activeFilters" class="filter-collapse">
              <el-collapse-item title="高级筛选" name="advanced">
                <el-form :inline="true" :model="filterForm" class="filter-form">
                  <!-- 游戏分类 -->
                  <el-form-item label="游戏分类">
                    <el-select v-model="filterForm.category" placeholder="选择分类" clearable>
                      <el-option label="全部" value="" />
                      <el-option v-for="category in gameCategories" :key="category" :label="category" :value="category" />
                    </el-select>
                  </el-form-item>
                  
                  <!-- 攻略难度 -->
                  <el-form-item label="攻略难度">
                    <el-select v-model="filterForm.difficulty" placeholder="选择难度" clearable>
                      <el-option label="全部" value="" />
                      <el-option label="简单" value="easy" />
                      <el-option label="中等" value="medium" />
                      <el-option label="困难" value="hard" />
                    </el-select>
                  </el-form-item>
                  
                  <!-- 排序方式 -->
                  <el-form-item label="排序方式">
                    <el-select v-model="filterForm.sort_by" placeholder="排序方式">
                      <el-option label="相关度" value="relevance" />
                      <el-option label="最新发布" value="created_at" />
                      <el-option label="浏览量" value="views" />
                    </el-select>
                  </el-form-item>
                  
                  <!-- 操作按钮 -->
                  <el-form-item>
                    <el-button type="primary" @click="applyFilters">应用筛选</el-button>
                    <el-button @click="resetFilters">重置</el-button>
                  </el-form-item>
                </el-form>
              </el-collapse-item>
            </el-collapse>
          </div>
          
          <!-- 结果类型标签 -->
          <div class="filter-tabs">
            <el-tabs v-model="activeTab" @tab-click="handleTabChange" size="small">
              <el-tab-pane label="全部" name="all">
                <template #label>
                  全部 ({{ totalResults }})
                </template>
              </el-tab-pane>
              <el-tab-pane label="游戏" name="games">
                <template #label>
                  游戏 ({{ results.total_games || 0 }})
                </template>
              </el-tab-pane>
              <el-tab-pane label="攻略" name="strategies">
                <template #label>
                  攻略 ({{ results.total_strategies || 0 }})
                </template>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>
      </el-row>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-skeleton animated :rows="10" />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-empty description="搜索失败，请稍后重试" />
        <el-button type="primary" @click="performSearch">重新搜索</el-button>
      </div>

      <!-- 空结果状态 -->
      <div v-else-if="!isLoading && totalResults === 0 && searchQuery" class="empty-container">
        <el-empty description="没有找到相关结果" />
        <p class="empty-hint">请尝试使用其他关键词或减少筛选条件</p>
      </div>

      <!-- 搜索结果 -->
      <template v-else-if="!isLoading && searchQuery">
        <!-- 全部结果 -->
        <div v-if="activeTab === 'all'">
          <!-- 游戏结果 -->
          <div v-if="results.games && results.games.length > 0" class="result-section">
            <h3 class="section-title">游戏结果 ({{ results.games.length }})</h3>
            <el-row :gutter="20">
              <el-col v-for="game in results.games" :key="game.id" :xs="24" :sm="12" :md="8" :lg="6">
                <GameCard :game="game" />
              </el-col>
            </el-row>
          </div>

          <!-- 攻略结果 -->
          <div v-if="results.strategies && results.strategies.length > 0" class="result-section">
            <h3 class="section-title">攻略结果 ({{ results.strategies.length }})</h3>
            <el-row :gutter="20">
              <el-col v-for="strategy in results.strategies" :key="strategy.id" :span="24">
                <StrategyCard :strategy="strategy" />
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 游戏结果 -->
        <div v-else-if="activeTab === 'games'">
          <el-row :gutter="20">
            <el-col v-for="game in results.games" :key="game.id" :xs="24" :sm="12" :md="8" :lg="6">
              <GameCard :game="game" />
            </el-col>
          </el-row>
        </div>

        <!-- 攻略结果 -->
        <div v-else-if="activeTab === 'strategies'">
          <el-row :gutter="20">
            <el-col v-for="strategy in results.strategies" :key="strategy.id" :span="24">
              <StrategyCard :strategy="strategy" />
            </el-col>
          </el-row>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import SearchBar from '@/components/SearchBar.vue';
import GameCard from '@/components/GameCard.vue';
import StrategyCard from '@/components/StrategyCard.vue';
import { useGameStore } from '@/stores/game';

const gameStore = useGameStore();

const route = useRoute();
const router = useRouter();
const searchQuery = ref('');
const isLoading = ref(false);
const error = ref('');
const results = ref({ games: [], strategies: [], total_games: 0, total_strategies: 0 });
const activeTab = ref('all');
const activeFilters = ref(['advanced']);
const filterForm = ref({
  category: '',
  difficulty: '',
  sort_by: 'relevance'
});

// 从gameStore获取游戏分类
const gameCategories = computed(() => gameStore.gameCategories);

// 计算总结果数
const totalResults = computed(() => {
  return (results.value.total_games || 0) + (results.value.total_strategies || 0);
});

// 执行搜索
const performSearch = async (query = searchQuery.value) => {
  if (!query.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  isLoading.value = true;
  error.value = '';
  
  try {
    // 构建搜索参数
    const searchParams = {
      q: query,
      ...filterForm.value
    };
    
    // 根据是否有高级筛选条件决定使用哪个搜索方法
    let searchResult;
    if (hasActiveFilters()) {
      searchResult = await gameStore.advancedSearch(searchParams);
    } else {
      searchResult = await gameStore.search(query);
    }
    
    results.value = {
      games: searchResult.games || [],
      strategies: searchResult.strategies || [],
      total_games: searchResult.games?.length || 0,
      total_strategies: searchResult.strategies?.length || 0
    };
  } catch (err) {
    console.error('搜索失败:', err);
    error.value = '搜索失败，请稍后重试';
    ElMessage.error('搜索失败');
  } finally {
    isLoading.value = false;
  }
};

// 检查是否有激活的筛选条件
const hasActiveFilters = () => {
  return filterForm.value.category !== '' || 
         filterForm.value.difficulty !== '' ||
         filterForm.value.sort_by !== 'relevance';
};

// 应用筛选条件
const applyFilters = () => {
  performSearch();
};

// 重置筛选条件
const resetFilters = () => {
  filterForm.value = {
    category: '',
    difficulty: '',
    sort_by: 'relevance'
  };
  performSearch();
};

// 处理标签切换
const handleTabChange = (tab) => {
  activeTab.value = tab.paneName;
};

// 监听路由参数变化
onMounted(async () => {
  // 先获取游戏分类数据
  if (gameStore.games.length === 0) {
    await gameStore.fetchGames();
  }
  
  // 从路由参数获取搜索关键词
  const query = route.query.q;
  if (query) {
    searchQuery.value = query;
    performSearch(query);
  }
});
</script>

<style scoped>
.search-result-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.search-header {
  background-color: #fff;
  padding: 30px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-info {
  margin-top: 15px;
  font-size: 14px;
  color: #606266;
}

.loading-text {
  color: #409eff;
}

.error-text {
  color: #f56c6c;
}

/* 高级筛选样式 */
.advanced-filter {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 6px;
  padding: 10px;
}

.filter-collapse {
  background: transparent;
  border: none;
}

.filter-form {
  margin-top: 15px;
}

.filter-form .el-form-item {
  margin-right: 20px;
  margin-bottom: 15px;
}

.filter-form .el-form-item__label {
  font-weight: 500;
}

/* 结果区块样式 */
.result-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.result-section:first-child {
  border-top: none;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    width: 100%;
    margin-right: 0;
  }
  
  .advanced-filter {
    padding: 10px 5px;
  }
}

.main-content {
  padding: 30px 0;
}

.filter-row {
  margin-bottom: 30px;
}

.filter-tabs {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}

.loading-container,
.error-container,
.empty-container {
  background-color: #fff;
  padding: 40px;
  border-radius: 4px;
  text-align: center;
}

.empty-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-hint {
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

.result-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}
</style>