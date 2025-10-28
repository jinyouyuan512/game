<template>
  <div class="admin-games">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">游戏管理</h1>
        <p class="page-subtitle">管理平台上的所有游戏信息</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加游戏
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索游戏名称..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="filter-bar">
        <el-select v-model="categoryFilter" placeholder="选择分类" clearable @change="handleFilter">
          <el-option label="全部分类" value="" />
          <el-option label="角色扮演" value="角色扮演" />
          <el-option label="策略游戏" value="策略游戏" />
          <el-option label="动作游戏" value="动作游戏" />
          <el-option label="射击游戏" value="射击游戏" />
          <el-option label="体育游戏" value="体育游戏" />
          <el-option label="竞速游戏" value="竞速游戏" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="选择状态" clearable @change="handleFilter">
          <el-option label="全部状态" value="" />
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
        </el-select>
      </div>
    </div>

    <!-- 游戏列表 -->
    <div class="games-table">
      <el-table
        :data="filteredGames"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: 'rgba(255, 255, 255, 0.05)', color: '#00d4ff' }"
        :row-style="{ background: 'rgba(255, 255, 255, 0.02)' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="游戏封面" width="100">
          <template #default="{ row }">
            <img
              :src="row.cover_image_url || '/game-placeholder.svg'"
              :alt="row.name"
              class="game-cover"
              @error="handleImageError"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="游戏名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="developer" label="开发商" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="攻略数量" width="100">
          <template #default="{ row }">
            <span>{{ getStrategyCount(row.id) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editGame(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteGame(row)">
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
        :total="totalGames"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑游戏对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑游戏' : '添加游戏'"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="gameFormRef"
        :model="gameForm"
        :rules="gameFormRules"
        label-width="100px"
      >
        <el-form-item label="游戏名称" prop="name">
          <el-input v-model="gameForm.name" placeholder="请输入游戏名称" />
        </el-form-item>
        <el-form-item label="游戏分类" prop="category">
          <el-select v-model="gameForm.category" placeholder="请选择游戏分类">
            <el-option label="角色扮演" value="角色扮演" />
            <el-option label="策略游戏" value="策略游戏" />
            <el-option label="动作游戏" value="动作游戏" />
            <el-option label="射击游戏" value="射击游戏" />
            <el-option label="体育游戏" value="体育游戏" />
            <el-option label="竞速游戏" value="竞速游戏" />
          </el-select>
        </el-form-item>
        <el-form-item label="开发商" prop="developer">
          <el-input v-model="gameForm.developer" placeholder="请输入开发商" />
        </el-form-item>
        <el-form-item label="发行商" prop="publisher">
          <el-input v-model="gameForm.publisher" placeholder="请输入发行商" />
        </el-form-item>
        <el-form-item label="发布日期" prop="release_date">
          <el-date-picker
            v-model="gameForm.release_date"
            type="date"
            placeholder="选择发布日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="封面图片" prop="cover_image_url">
          <el-input v-model="gameForm.cover_image_url" placeholder="请输入封面图片URL" />
          <div v-if="gameForm.cover_image_url" class="image-preview">
            <img :src="gameForm.cover_image_url" alt="封面预览" @error="handleImageError" />
          </div>
        </el-form-item>
        <el-form-item label="游戏描述" prop="description">
          <el-input
            v-model="gameForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入游戏描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="gameForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="saveGame" :loading="saving">
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
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const dialogVisible = ref(false)
const isEditing = ref(false)
const gameFormRef = ref()

// 游戏表单
const gameForm = reactive({
  id: null,
  name: '',
  category: '',
  developer: '',
  publisher: '',
  release_date: null,
  cover_image_url: '',
  description: '',
  status: 'draft'
})

// 表单验证规则
const gameFormRules = {
  name: [
    { required: true, message: '请输入游戏名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择游戏分类', trigger: 'change' }
  ],
  developer: [
    { required: true, message: '请输入开发商', trigger: 'blur' }
  ]
}

// 计算属性
const filteredGames = computed(() => {
  let games = gameStore.games

  // 搜索过滤
  if (searchQuery.value) {
    games = games.filter(game =>
      game.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 分类过滤
  if (categoryFilter.value) {
    games = games.filter(game => game.category === categoryFilter.value)
  }

  // 状态过滤
  if (statusFilter.value) {
    games = games.filter(game => game.status === statusFilter.value)
  }

  return games
})

const totalGames = computed(() => filteredGames.value.length)

// 方法
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleImageError = (event) => {
  event.target.src = '/game-placeholder.svg'
}

const getStrategyCount = (gameId) => {
  return gameStore.strategies.filter(strategy => strategy.game_id === gameId).length
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

const editGame = (game) => {
  isEditing.value = true
  Object.assign(gameForm, {
    ...game,
    release_date: game.release_date ? new Date(game.release_date) : null
  })
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(gameForm, {
    id: null,
    name: '',
    category: '',
    developer: '',
    publisher: '',
    release_date: null,
    cover_image_url: '',
    description: '',
    status: 'draft'
  })
  if (gameFormRef.value) {
    gameFormRef.value.clearValidate()
  }
}

const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

const saveGame = async () => {
  if (!gameFormRef.value) return

  try {
    await gameFormRef.value.validate()
    saving.value = true

    const gameData = {
      name: gameForm.name,
      category: gameForm.category,
      developer: gameForm.developer,
      publisher: gameForm.publisher,
      release_date: gameForm.release_date ? gameForm.release_date.toISOString().split('T')[0] : null,
      cover_image_url: gameForm.cover_image_url,
      description: gameForm.description,
      status: gameForm.status
    }

    if (isEditing.value) {
      // 更新游戏
      const { error } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', gameForm.id)

      if (error) throw error

      ElMessage.success('游戏更新成功')
    } else {
      // 添加游戏
      const { error } = await supabase
        .from('games')
        .insert([gameData])

      if (error) throw error

      ElMessage.success('游戏添加成功')
    }

    // 重新加载游戏数据
    await gameStore.fetchGames()
    handleDialogClose()

  } catch (error) {
    console.error('保存游戏失败:', error)
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

const deleteGame = async (game) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除游戏 "${game.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true

    // 检查是否有关联的攻略
    const strategyCount = getStrategyCount(game.id)
    if (strategyCount > 0) {
      ElMessage.warning(`该游戏下还有 ${strategyCount} 篇攻略，请先删除相关攻略`)
      return
    }

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', game.id)

    if (error) throw error

    ElMessage.success('游戏删除成功')
    await gameStore.fetchGames()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除游戏失败:', error)
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
.admin-games {
  padding: 20px;
  background: var(--bg-color-page);
  color: var(--text-color-primary);
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
  color: var(--text-color-secondary);
  font-size: 14px;
}

.search-section {
  background: var(--fill-color);
  border: 1px solid var(--border-color);
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

.games-table {
  background: var(--fill-color);
  border: 1px solid var(--border-color);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.game-cover {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.image-preview {
  margin-top: 10px;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  .admin-games {
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