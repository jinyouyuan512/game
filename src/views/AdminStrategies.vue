<template>
  <div class="admin-strategies">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">攻略管理</h1>
        <p class="page-subtitle">管理平台上的所有游戏攻略</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加攻略
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索攻略标题..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="filter-bar">
        <el-select v-model="gameFilter" placeholder="选择游戏" clearable @change="handleFilter">
          <el-option label="全部游戏" value="" />
          <el-option
            v-for="game in gameStore.games"
            :key="game.id"
            :label="game.name"
            :value="game.id"
          />
        </el-select>
        <el-select v-model="difficultyFilter" placeholder="选择难度" clearable @change="handleFilter">
          <el-option label="全部难度" value="" />
          <el-option label="简单" value="简单" />
          <el-option label="中等" value="中等" />
          <el-option label="困难" value="困难" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="选择状态" clearable @change="handleFilter">
          <el-option label="全部状态" value="" />
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
        </el-select>
      </div>
    </div>

    <!-- 攻略列表 -->
    <div class="strategies-table">
      <el-table
        :data="paginatedStrategies"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: 'rgba(255, 255, 255, 0.05)', color: '#00d4ff' }"
        :row-style="{ background: 'rgba(255, 255, 255, 0.02)' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="攻略标题" min-width="200">
          <template #default="{ row }">
            <div class="strategy-title">
              {{ row.title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所属游戏" width="150">
          <template #default="{ row }">
            <el-tag size="small">{{ getGameName(row.game_id) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getDifficultyType(row.difficulty)"
              size="small"
            >
              {{ row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="浏览量" width="100">
          <template #default="{ row }">
            <span>{{ row.view_count || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="150">
          <template #default="{ row }">
            <div class="strategy-tags">
              <el-tag
                v-for="tag in getStrategyTags(row.id)"
                :key="tag.id"
                size="small"
                class="tag-item"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editStrategy(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteStrategy(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalStrategies"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑攻略对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑攻略' : '添加攻略'"
      width="800px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="strategyFormRef"
        :model="strategyForm"
        :rules="strategyFormRules"
        label-width="100px"
      >
        <el-form-item label="攻略标题" prop="title">
          <el-input v-model="strategyForm.title" placeholder="请输入攻略标题" />
        </el-form-item>
        <el-form-item label="所属游戏" prop="game_id">
          <el-select v-model="strategyForm.game_id" placeholder="请选择游戏">
            <el-option
              v-for="game in gameStore.games"
              :key="game.id"
              :label="game.name"
              :value="game.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="难度等级" prop="difficulty">
          <el-select v-model="strategyForm.difficulty" placeholder="请选择难度">
            <el-option label="简单" value="简单" />
            <el-option label="中等" value="中等" />
            <el-option label="困难" value="困难" />
          </el-select>
        </el-form-item>
        <el-form-item label="攻略摘要" prop="summary">
          <el-input
            v-model="strategyForm.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入攻略摘要"
          />
        </el-form-item>
        <el-form-item label="攻略内容" prop="content">
          <el-input
            v-model="strategyForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入攻略内容（支持Markdown格式）"
          />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="strategyForm.tags"
            multiple
            placeholder="请选择标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in gameStore.tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="strategyForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="saveStrategy" :loading="saving">
            {{ isEditing ? '更新' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { supabase } from '../lib/supabase'
import { ElMessage, ElMessageBox } from 'element-plus'

const gameStore = useGameStore()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const gameFilter = ref('')
const difficultyFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const dialogVisible = ref(false)
const isEditing = ref(false)
const strategyFormRef = ref()

// 攻略表单
const strategyForm = reactive({
  id: null,
  title: '',
  game_id: '',
  difficulty: '',
  summary: '',
  content: '',
  tags: [],
  status: 'draft'
})

// 表单验证规则
const strategyFormRules = {
  title: [
    { required: true, message: '请输入攻略标题', trigger: 'blur' }
  ],
  game_id: [
    { required: true, message: '请选择游戏', trigger: 'change' }
  ],
  difficulty: [
    { required: true, message: '请选择难度', trigger: 'change' }
  ],
  summary: [
    { required: true, message: '请输入攻略摘要', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入攻略内容', trigger: 'blur' }
  ]
}

// 计算属性
const filteredStrategies = computed(() => {
  let strategies = gameStore.strategies

  // 搜索过滤
  if (searchQuery.value) {
    strategies = strategies.filter(strategy =>
      strategy.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 游戏过滤
  if (gameFilter.value) {
    strategies = strategies.filter(strategy => strategy.game_id === gameFilter.value)
  }

  // 难度过滤
  if (difficultyFilter.value) {
    strategies = strategies.filter(strategy => strategy.difficulty === difficultyFilter.value)
  }

  // 状态过滤
  if (statusFilter.value) {
    strategies = strategies.filter(strategy => strategy.status === statusFilter.value)
  }

  return strategies
})

const totalStrategies = computed(() => filteredStrategies.value.length)

const paginatedStrategies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStrategies.value.slice(start, end)
})

// 方法
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getGameName = (gameId) => {
  const game = gameStore.games.find(g => g.id === gameId)
  return game ? game.name : '未知游戏'
}

const getDifficultyType = (difficulty) => {
  switch (difficulty) {
    case '简单': return 'success'
    case '中等': return 'warning'
    case '困难': return 'danger'
    default: return 'info'
  }
}

const getStrategyTags = (strategyId) => {
  // 这里应该从strategy_tags表获取关联的标签
  // 暂时返回空数组，实际项目中需要实现关联查询
  return []
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const showAddDialog = () => {
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
}

const editStrategy = (strategy) => {
  isEditing.value = true
  Object.assign(strategyForm, {
    ...strategy,
    tags: [] // 这里应该加载策略的标签
  })
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(strategyForm, {
    id: null,
    title: '',
    game_id: '',
    difficulty: '',
    summary: '',
    content: '',
    tags: [],
    status: 'draft'
  })
  if (strategyFormRef.value) {
    strategyFormRef.value.clearValidate()
  }
}

const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

const saveStrategy = async () => {
  if (!strategyFormRef.value) return

  try {
    await strategyFormRef.value.validate()
    saving.value = true

    const strategyData = {
      title: strategyForm.title,
      game_id: strategyForm.game_id,
      difficulty: strategyForm.difficulty,
      summary: strategyForm.summary,
      content: strategyForm.content,
      status: strategyForm.status
    }

    let strategyId

    if (isEditing.value) {
      // 更新攻略
      const { error } = await supabase
        .from('strategies')
        .update(strategyData)
        .eq('id', strategyForm.id)

      if (error) throw error

      strategyId = strategyForm.id
      ElMessage.success('攻略更新成功')
    } else {
      // 添加攻略
      const { data, error } = await supabase
        .from('strategies')
        .insert([strategyData])
        .select()

      if (error) throw error

      strategyId = data[0].id
      ElMessage.success('攻略添加成功')
    }

    // 处理标签关联
    if (strategyForm.tags.length > 0) {
      // 先删除现有的标签关联
      await supabase
        .from('strategy_tags')
        .delete()
        .eq('strategy_id', strategyId)

      // 添加新的标签关联
      const tagRelations = strategyForm.tags.map(tagId => ({
        strategy_id: strategyId,
        tag_id: tagId
      }))

      const { error: tagError } = await supabase
        .from('strategy_tags')
        .insert(tagRelations)

      if (tagError) {
        console.error('标签关联失败:', tagError)
      }
    }

    // 重新加载攻略数据
    await gameStore.fetchStrategies()
    handleDialogClose()

  } catch (error) {
    console.error('保存攻略失败:', error)
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

const deleteStrategy = async (strategy) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除攻略 "${strategy.title}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true

    // 先删除标签关联
    await supabase
      .from('strategy_tags')
      .delete()
      .eq('strategy_id', strategy.id)

    // 删除攻略
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', strategy.id)

    if (error) throw error

    ElMessage.success('攻略删除成功')
    await gameStore.fetchStrategies()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除攻略失败:', error)
      ElMessage.error('删除失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await gameStore.fetchGames()
    await gameStore.fetchStrategies()
    await gameStore.fetchTags()
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-strategies {
  padding: 20px;
  background: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 8px;
  background: linear-gradient(45deg, #00d4ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.search-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 15px;
}

.search-bar .el-input {
  max-width: 400px;
}

.filter-bar {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-bar .el-select {
  min-width: 150px;
}

.strategies-table {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.strategy-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.strategy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-item {
  margin: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* Element Plus 样式覆盖 */
:deep(.el-table) {
  background: transparent;
  color: #ffffff;
}

:deep(.el-table td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-table th) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-table tr:hover > td) {
  background-color: rgba(0, 212, 255, 0.1) !important;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-input__wrapper:hover) {
  border-color: #00d4ff;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

:deep(.el-input__inner) {
  color: #ffffff;
}

:deep(.el-select .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-textarea__inner) {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

:deep(.el-textarea__inner:hover) {
  border-color: #00d4ff;
}

:deep(.el-textarea__inner:focus) {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

:deep(.el-dialog) {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-dialog__title) {
  color: #00d4ff;
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-pagination) {
  color: #ffffff;
}

:deep(.el-pagination .el-pager li) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #00d4ff;
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: #00d4ff;
  color: #ffffff;
}

@media (max-width: 768px) {
  .admin-strategies {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-bar {
    flex-direction: column;
  }
  
  .filter-bar .el-select {
    width: 100%;
  }
  
  .search-bar .el-input {
    max-width: 100%;
  }
}
</style>