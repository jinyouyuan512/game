<template>
  <div class="admin-user-manage">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          添加管理员
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名或邮箱..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="roleFilter" placeholder="选择角色" clearable @change="handleFilter">
            <el-option label="全部角色" value="" />
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="普通管理员" value="admin" />
            <el-option label="编辑" value="editor" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="选择状态" clearable @change="handleFilter">
            <el-option label="全部状态" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 用户列表 -->
    <el-table
      :data="filteredUsers"
      v-loading="loading"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" min-width="150" />
      <el-table-column prop="email" label="邮箱" min-width="200" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)">
            {{ getRoleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '活跃' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column prop="last_login_at" label="最后登录" width="180" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="editUser(row)">编辑</el-button>
          <el-button size="small" type="warning" @click="toggleStatus(row)">
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteUser(row)" :disabled="isCurrentUser(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalUsers"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingUser ? '编辑管理员' : '添加管理员'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="editingUser" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" :prop="editingUser ? '' : 'password'">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            :show-password="true"
          />
          <div v-if="editingUser" class="form-tip">
            不修改密码请留空
          </div>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="选择角色">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="普通管理员" value="admin" />
            <el-option label="编辑" value="editor" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">活跃</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Edit, Delete, Warning } from '@element-plus/icons-vue'
import { useAdminStore } from '../stores/admin'

const adminStore = useAdminStore()

// 状态管理
const loading = ref(false)
const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showAddDialog = ref(false)
const editingUser = ref(null)
const userForm = reactive({
  username: '',
  email: '',
  password: '',
  role: 'admin',
  status: 'active'
})
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }
  
  // 角色过滤
  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value)
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(user => user.status === statusFilter.value)
  }
  
  return result
})

const totalUsers = computed(() => filteredUsers.value.length)

// 获取角色标签类型
const getRoleType = (role) => {
  switch (role) {
    case 'super_admin': return 'primary'
    case 'admin': return 'success'
    case 'editor': return 'info'
    default: return 'default'
  }
}

// 获取角色中文标签
const getRoleLabel = (role) => {
  switch (role) {
    case 'super_admin': return '超级管理员'
    case 'admin': return '普通管理员'
    case 'editor': return '编辑'
    default: return role
  }
}

// 判断是否为当前登录用户
const isCurrentUser = (user) => {
  return user.username === adminStore.currentAdmin.username
}

// 加载用户数据
const loadUsers = async () => {
  loading.value = true
  try {
    // 模拟获取用户数据
    // 在实际应用中，这里应该从后端API获取数据
    const mockUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'super_admin',
        status: 'active',
        created_at: '2024-01-01 00:00:00',
        last_login_at: new Date().toLocaleString()
      },
      {
        id: 2,
        username: 'editor1',
        email: 'editor1@example.com',
        role: 'editor',
        status: 'active',
        created_at: '2024-01-10 10:00:00',
        last_login_at: '2024-01-15 14:30:00'
      },
      {
        id: 3,
        username: 'admin2',
        email: 'admin2@example.com',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-12 12:00:00',
        last_login_at: '2024-01-16 09:15:00'
      }
    ]
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    users.value = mockUsers
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}

// 编辑用户
const editUser = (user) => {
  editingUser.value = { ...user }
  Object.assign(userForm, user)
  showAddDialog.value = true
}

// 切换用户状态
const toggleStatus = async (user) => {
  if (isCurrentUser(user)) {
    ElMessage.warning('不能修改当前登录用户的状态')
    return
  }
  
  try {
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    user.status = newStatus
    ElMessage.success(`用户已${newStatus === 'active' ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('修改用户状态失败:', error)
    ElMessage.error('操作失败')
  }
}

// 删除用户
const deleteUser = (user) => {
  if (isCurrentUser(user)) {
    ElMessage.warning('不能删除当前登录用户')
    return
  }
  
  ElMessage.confirm(
    `确定要删除用户「${user.username}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const index = users.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        users.value.splice(index, 1)
      }
      
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 重置表单
const resetForm = () => {
  editingUser.value = null
  Object.assign(userForm, {
    username: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'active'
  })
}

// 提交表单
const submitForm = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingUser.value) {
      // 更新用户
      const index = users.value.findIndex(u => u.id === editingUser.value.id)
      if (index > -1) {
        const updatedUser = { ...userForm }
        if (!userForm.password) {
          delete updatedUser.password // 不更新密码
        }
        users.value[index] = { ...users.value[index], ...updatedUser }
      }
      ElMessage.success('用户信息已更新')
    } else {
      // 添加用户
      const newUser = {
        ...userForm,
        id: users.value.length + 1,
        created_at: new Date().toLocaleString(),
        last_login_at: null
      }
      users.value.unshift(newUser)
      ElMessage.success('管理员已添加')
    }
    
    showAddDialog.value = false
    resetForm()
  } catch (error) {
    console.error('保存用户信息失败:', error)
    ElMessage.error('操作失败')
  }
}

// 初始加载
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-user-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
</style>