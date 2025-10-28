<template>
  <div class="admin-strategy-manage">
    <div class="page-header">
      <h2>攻略管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加攻略
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="8">
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
        </el-col>
        <el-col :span="6">
          <el-select v-model="gameFilter" placeholder="选择游戏" clearable @change="handleFilter">
            <el-option label="全部游戏" value="" />
            <el-option
              v-for="game in games"
              :key="game.id"
              :label="game.name"
              :value="game.id"
            />
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

    <!-- 攻略列表 -->
    <el-table
      :data="paginatedStrategies"
      v-loading="loading"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="攻略标题" min-width="200" />
      <el-table-column prop="game_name" label="关联游戏" width="150" />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="difficulty" label="难度" width="100">
        <template #default="{ row }">
          <el-tag :type="getDifficultyType(row.difficulty)">
            {{ getDifficultyText(row.difficulty) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="views" label="浏览量" width="100" />
      <el-table-column prop="created_at" label="创建时间" width="120">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : 'warning'">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="editStrategy(row)">编辑</el-button>
          <el-button size="small" type="warning" @click="toggleStatus(row)">
            {{ row.status === 'published' ? '下架' : '发布' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteStrategy(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
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
      v-model="showAddDialog"
      :title="editingStrategy ? '编辑攻略' : '添加攻略'"
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="strategyFormRef"
        :model="strategyForm"
        :rules="strategyRules"
        label-width="100px"
      >
        <el-form-item label="攻略标题" prop="title">
          <el-input v-model="strategyForm.title" placeholder="请输入攻略标题" />
        </el-form-item>
        <el-form-item label="关联游戏" prop="game_id">
          <el-select v-model="strategyForm.game_id" placeholder="选择游戏">
            <el-option
              v-for="game in games"
              :key="game.id"
              :label="game.name"
              :value="game.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="strategyForm.author" placeholder="请输入作者名称" />
        </el-form-item>
        <el-form-item label="难度等级" prop="difficulty">
          <el-select v-model="strategyForm.difficulty" placeholder="选择难度">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="攻略内容" prop="content">
          <el-input
            v-model="strategyForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入攻略内容"
          />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="strategyForm.tags" placeholder="请输入标签，用逗号分隔" />
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
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveStrategy" :loading="saving">
            {{ editingStrategy ? '更新' : '添加' }}
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
import { Plus, Search } from '@element-plus/icons-vue'

const gameStore = useGameStore()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const showAddDialog = ref(false)
const editingStrategy = ref(null)
const searchQuery = ref('')
const gameFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const strategies = ref([])
const games = ref([])

// 表单数据
const strategyFormRef = ref()
const strategyForm = reactive({
  title: '',
  game_id: '',
  author: '',
  difficulty: 'medium',
  content: '',
  tags: '',
  status: 'draft'
})

// 表单验证规则
const strategyRules = {
  title: [
    { required: true, message: '请输入攻略标题', trigger: 'blur' },
    { min: 5, max: 100, message: '攻略标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  game_id: [
    { required: true, message: '请选择关联游戏', trigger: 'change' }
  ],
  author: [
    { required: true, message: '请输入作者名称', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入攻略内容', trigger: 'blur' },
    { min: 50, message: '攻略内容至少50个字符', trigger: 'blur' }
  ]
}

// 计算属性
const filteredStrategies = computed(() => {
  let filtered = strategies.value || []
  
  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(strategy => 
      strategy.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 游戏过滤
  if (gameFilter.value) {
    filtered = filtered.filter(strategy => strategy.game_id === gameFilter.value)
  }
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(strategy => strategy.status === statusFilter.value)
  }
  
  return filtered
})

const totalStrategies = computed(() => filteredStrategies.value.length)

const paginatedStrategies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStrategies.value.slice(start, end)
})

// 方法
const loadStrategies = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select(`
        *,
        games!inner(name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    strategies.value = data.map(strategy => ({
      ...strategy,
      game_name: strategy.games.name,
      views: Math.floor(Math.random() * 5000) + 100 // 模拟浏览量
    }))
  } catch (error) {
    console.error('加载攻略列表失败:', error)
    ElMessage.error('加载攻略列表失败')
  } finally {
    loading.value = false
  }
}

const loadGames = async () => {
  try {
    await gameStore.fetchGames()
    games.value = gameStore.games
  } catch (error) {
    ElMessage.error('加载游戏列表失败')
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
  gameFilter.value = ''
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

const getDifficultyType = (difficulty) => {
  const types = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty] || '未知'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const editStrategy = (strategy) => {
  editingStrategy.value = strategy
  Object.assign(strategyForm, {
    ...strategy,
    tags: strategy.tags ? strategy.tags.join(', ') : ''
  })
  showAddDialog.value = true
}

const toggleStatus = async (strategy) => {
  try {
    const newStatus = strategy.status === 'published' ? 'draft' : 'published'
    const action = newStatus === 'published' ? '发布' : '下架'
    
    await ElMessageBox.confirm(
      `确定要${action}攻略 "${strategy.title}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const { error } = await supabase
      .from('strategies')
      .update({ status: newStatus })
      .eq('id', strategy.id)
    
    if (error) throw error
    
    ElMessage.success(`${action}成功`)
    await loadStrategies()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const deleteStrategy = async (strategy) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除攻略 "${strategy.title}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', strategy.id)
    
    if (error) throw error
    
    ElMessage.success('删除成功')
    await loadStrategies()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const saveStrategy = async () => {
  if (!strategyFormRef.value) return
  
  try {
    const valid = await strategyFormRef.value.validate()
    if (!valid) return
    
    saving.value = true
    
    const strategyData = {
      ...strategyForm,
      tags: strategyForm.tags ? strategyForm.tags.split(',').map(tag => tag.trim()) : []
    }
    
    if (editingStrategy.value) {
      // 更新攻略
      const { error } = await supabase
        .from('strategies')
        .update(strategyData)
        .eq('id', editingStrategy.value.id)
      
      if (error) throw error
      ElMessage.success('更新成功')
    } else {
      // 添加攻略
      const { error } = await supabase
        .from('strategies')
        .insert([strategyData])
      
      if (error) throw error
      ElMessage.success('添加成功')
    }
    
    showAddDialog.value = false
    await loadStrategies()
  } catch (error) {
    console.error('保存攻略失败:', error)
    ElMessage.error(editingStrategy.value ? '更新失败' : '添加失败')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  editingStrategy.value = null
  Object.assign(strategyForm, {
    title: '',
    game_id: '',
    author: '',
    difficulty: 'medium',
    content: '',
    tags: '',
    status: 'draft'
  })
  if (strategyFormRef.value) {
    strategyFormRef.value.clearValidate()
  }
}

// 生命周期
onMounted(() => {
  loadStrategies()
  loadGames()
})
</script>

<style scoped>
.admin-strategy-manage {
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