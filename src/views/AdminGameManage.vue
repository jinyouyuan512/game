<template>
  <div class="admin-game-manage">
    <div class="page-header">
      <h2>游戏管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加游戏
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="8">
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
        </el-col>
        <el-col :span="6">
          <el-select v-model="categoryFilter" placeholder="选择分类" clearable @change="handleFilter">
            <el-option label="全部分类" value="" />
            <el-option label="RPG" value="RPG" />
            <el-option label="动作" value="动作" />
            <el-option label="冒险" value="冒险" />
            <el-option label="射击" value="射击" />
            <el-option label="策略" value="策略" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="选择状态" clearable @change="handleFilter">
            <el-option label="全部状态" value="" />
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 游戏列表 -->
    <el-table
      :data="filteredGames"
      v-loading="loading"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="游戏名称" min-width="150" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="developer" label="开发商" width="120" />
      <el-table-column prop="publisher" label="发行商" width="120" />
      <el-table-column prop="release_date" label="发布日期" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : 'warning'">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="editGame(row)">编辑</el-button>
          <el-button size="small" type="warning" @click="toggleStatus(row)">
            {{ row.status === 'published' ? '下架' : '发布' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteGame(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
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
      v-model="showAddDialog"
      :title="editingGame ? '编辑游戏' : '添加游戏'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="gameFormRef"
        :model="gameForm"
        :rules="gameRules"
        label-width="100px"
      >
        <el-form-item label="游戏名称" prop="name">
          <el-input v-model="gameForm.name" placeholder="请输入游戏名称" />
        </el-form-item>
        <el-form-item label="游戏描述" prop="description">
          <el-input
            v-model="gameForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入游戏描述"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="gameForm.category" placeholder="选择分类">
            <el-option label="RPG" value="RPG" />
            <el-option label="动作" value="动作" />
            <el-option label="冒险" value="冒险" />
            <el-option label="射击" value="射击" />
            <el-option label="策略" value="策略" />
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
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="游戏图片" prop="image_url">
          <el-input v-model="gameForm.image_url" placeholder="请输入图片URL" />
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
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveGame" :loading="saving">
            {{ editingGame ? '更新' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { useAdminStore } from '../stores/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const gameStore = useGameStore()
const adminStore = useAdminStore()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const showAddDialog = ref(false)
const editingGame = ref(null)
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 表单数据
const gameFormRef = ref()
const gameForm = reactive({
  name: '',
  description: '',
  category: '',
  developer: '',
  publisher: '',
  release_date: '',
  image_url: '',
  status: 'draft'
})

// 表单验证规则
const gameRules = {
  name: [
    { required: true, message: '请输入游戏名称', trigger: 'blur' },
    { min: 2, max: 50, message: '游戏名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入游戏描述', trigger: 'blur' },
    { min: 10, max: 500, message: '游戏描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择游戏分类', trigger: 'change' }
  ],
  developer: [
    { required: true, message: '请输入开发商', trigger: 'blur' }
  ],
  publisher: [
    { required: true, message: '请输入发行商', trigger: 'blur' }
  ],
  release_date: [
    { required: true, message: '请选择发布日期', trigger: 'change' }
  ]
}

// 计算属性
const filteredGames = computed(() => {
  let games = gameStore.games || []
  
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
const loadGames = async () => {
  loading.value = true
  try {
    await gameStore.fetchGames()
  } catch (error) {
    ElMessage.error('加载游戏列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const editGame = (game) => {
  editingGame.value = game
  Object.assign(gameForm, game)
  showAddDialog.value = true
}

const toggleStatus = async (game) => {
  try {
    const newStatus = game.status === 'published' ? 'draft' : 'published'
    const action = newStatus === 'published' ? '发布' : '下架'
    
    await ElMessageBox.confirm(
      `确定要${action}游戏 "${game.name}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await gameStore.updateGame(game.id, { status: newStatus })
    ElMessage.success(`${action}成功`)
    await loadGames()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const deleteGame = async (game) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除游戏 "${game.name}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await gameStore.deleteGame(game.id)
    ElMessage.success('删除成功')
    await loadGames()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const saveGame = async () => {
  if (!gameFormRef.value) return
  
  try {
    const valid = await gameFormRef.value.validate()
    if (!valid) return
    
    saving.value = true
    
    if (editingGame.value) {
      // 更新游戏
      await gameStore.updateGame(editingGame.value.id, gameForm)
      ElMessage.success('更新成功')
    } else {
      // 添加游戏
      await gameStore.addGame(gameForm)
      ElMessage.success('添加成功')
    }
    
    showAddDialog.value = false
    await loadGames()
  } catch (error) {
    ElMessage.error(editingGame.value ? '更新失败' : '添加失败')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  editingGame.value = null
  Object.assign(gameForm, {
    name: '',
    description: '',
    category: '',
    developer: '',
    publisher: '',
    release_date: '',
    image_url: '',
    status: 'draft'
  })
  if (gameFormRef.value) {
    gameFormRef.value.clearValidate()
  }
}

// 生命周期
onMounted(() => {
  loadGames()
})
</script>

<style scoped>
.admin-game-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>