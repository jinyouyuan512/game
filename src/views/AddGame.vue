<template>
  <div class="add-game">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">添加新游戏</h1>
        <p class="page-subtitle">请填写游戏的详细信息</p>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <div class="container">
        <el-card class="form-card">
          <el-form
            ref="gameFormRef"
            :model="gameForm"
            :rules="formRules"
            label-width="120px"
            class="game-form"
          >
            <!-- 基本信息 -->
            <h3 class="form-section-title">基本信息</h3>
            
            <el-form-item label="游戏名称" prop="name">
              <el-input
                v-model="gameForm.name"
                placeholder="请输入游戏名称"
                clearable
              />
            </el-form-item>

            <el-form-item label="开发商" prop="developer">
              <el-input
                v-model="gameForm.developer"
                placeholder="请输入开发商名称"
                clearable
              />
            </el-form-item>

            <el-form-item label="游戏分类" prop="category">
              <el-select
                v-model="gameForm.category"
                placeholder="请选择游戏分类"
              >
                <el-option label="RPG" value="RPG" />
                <el-option label="动作" value="Action" />
                <el-option label="策略" value="Strategy" />
                <el-option label="射击" value="Shooter" />
                <el-option label="模拟" value="Simulation" />
                <el-option label="竞技" value="Competitive" />
              </el-select>
            </el-form-item>

            <el-form-item label="发行日期">
              <el-date-picker
                v-model="gameForm.release_date"
                type="date"
                placeholder="选择发行日期"
                style="width: 100%"
              />
            </el-form-item>

            <!-- 详细信息 -->
            <h3 class="form-section-title">详细信息</h3>
            
            <el-form-item label="游戏描述" prop="description">
              <el-input
                v-model="gameForm.description"
                type="textarea"
                :rows="6"
                placeholder="请输入游戏描述"
              />
            </el-form-item>

            <el-form-item label="封面图片URL">
              <el-input
                v-model="gameForm.cover_image_url"
                placeholder="请输入封面图片URL"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <div class="form-actions">
                <el-button type="primary" @click="submitForm" :loading="gameStore.loading">
                  <el-icon><Plus /></el-icon>
                  添加游戏
                </el-button>
                <el-button @click="resetForm">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
                <el-button @click="goBack">
                  <el-icon><ArrowLeft /></el-icon>
                  返回列表
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { ElMessage } from 'element-plus'

const router = useRouter()
const gameStore = useGameStore()
const gameFormRef = ref(null)

// 表单数据
const gameForm = reactive({
  name: '',
  description: '',
  developer: '',
  category: '',
  release_date: '',
  cover_image_url: ''
})

// 自定义验证函数
const validateDescription = (rule, value, callback) => {
  if (value && value.length < 10) {
    callback(new Error('游戏描述至少需要10个字符，以便用户了解游戏内容'))
  } else {
    callback()
  }
}

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入游戏名称', trigger: 'blur' },
    { min: 1, max: 100, message: '游戏名称长度在 1 到 100 个字符', trigger: 'blur' },
    { pattern: /^[^<>"'&]*$/, message: '游戏名称不能包含特殊字符', trigger: 'blur' }
  ],
  developer: [
    { required: true, message: '请输入开发商名称', trigger: 'blur' },
    { min: 1, max: 100, message: '开发商名称长度在 1 到 100 个字符', trigger: 'blur' },
    { pattern: /^[^<>"'&]*$/, message: '开发商名称不能包含特殊字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择游戏分类', trigger: 'change' }
  ],
  description: [
    { min: 0, max: 500, message: '游戏描述最多 500 个字符', trigger: 'blur' },
    { validator: validateDescription, trigger: 'blur' }
  ],
  cover_image_url: [
    { pattern: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i, message: '请输入有效的图片URL', trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = async () => {
  await gameFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await gameStore.createGame({
          ...gameForm,
          release_date: gameForm.release_date ? gameForm.release_date.toISOString().split('T')[0] : null
        })
        ElMessage.success('游戏添加成功！')
        router.push('/games')
      } catch (error) {
        // 根据错误类型显示不同的提示
        if (error.type === 'unauthorized') {
          ElMessage.error('未授权，请先登录')
          router.push('/login')
        } else if (error.type === 'network_error') {
          ElMessage.error('网络连接失败，请检查网络设置')
        } else if (error.statusCode === 400) {
          ElMessage.warning(error.message || '请检查填写的信息')
        } else if (error.statusCode === 409) {
          ElMessage.warning('该游戏可能已存在')
        } else {
          ElMessage.error(error.message || '添加游戏失败，请稍后重试')
        }
        console.error('添加游戏失败:', error)
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  gameFormRef.value.resetFields()
}

// 返回游戏列表
const goBack = () => {
  router.push('/games')
}
</script>

<style scoped>
.add-game {
  background: var(--bg-color-page);
  color: var(--text-color-primary);
  min-height: 100vh;
}

.page-header {
  background: var(--tech-bg-dark);
  padding: 60px 0 40px;
  text-align: center;
  position: relative;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%2300d4ff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 15px;
  background: linear-gradient(45deg, #00d4ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
}

.form-content {
  padding: 40px 0 80px;
}

.form-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.form-section-title {
  font-size: 1.3rem;
  color: var(--primary-color);
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0, 212, 255, 0.2);
}

.game-form {
  padding: 30px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .game-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}
</style>