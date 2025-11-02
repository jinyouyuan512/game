<template>
  <div class="add-strategy">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">提交游戏攻略</h1>
        <p class="page-subtitle">分享您的游戏技巧和心得</p>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <div class="container">
        <el-card class="form-card">
          <el-form
            ref="strategyFormRef"
            :model="strategyForm"
            :rules="formRules"
            label-width="120px"
            class="strategy-form"
          >
            <!-- 基本信息 -->
            <h3 class="form-section-title">攻略基本信息</h3>
            
            <el-form-item label="选择游戏" prop="game_id">
              <el-select
                v-model="strategyForm.game_id"
                placeholder="请选择游戏"
                filterable
                :loading="gameStore.gamesLoading"
              >
                <el-option
                  v-for="game in gameStore.games"
                  :key="game.id"
                  :label="game.name"
                  :value="game.id"
                >
                  <div class="game-option">
                    <img
                      v-if="game.cover_image_url"
                      :src="game.cover_image_url"
                      :alt="game.name"
                      class="game-cover-small"
                    />
                    <span class="game-name">{{ game.name }}</span>
                    <span class="game-developer">{{ game.developer }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="攻略标题" prop="title">
              <el-input
                v-model="strategyForm.title"
                placeholder="请输入攻略标题"
                clearable
              />
            </el-form-item>

            <el-form-item label="攻略类型" prop="type">
          <el-select
            v-model="strategyForm.type"
            placeholder="请选择攻略类型"
          >
            <el-option label="通用攻略" value="general" />
            <el-option label="通关流程" value="walkthrough" />
            <el-option label="隐藏要素" value="secrets" />
            <el-option label="角色培养" value="character" />
            <el-option label="装备推荐" value="equipment" />
            <el-option label="副本攻略" value="dungeon" />
          </el-select>
        </el-form-item>

        <el-form-item label="难度等级" prop="difficulty">
          <el-select
            v-model="strategyForm.difficulty"
            placeholder="请选择攻略难度"
          >
            <el-option label="入门级" value="easy" />
            <el-option label="普通级" value="medium" />
            <el-option label="高级" value="hard" />
            <el-option label="专家级" value="expert" />
          </el-select>
        </el-form-item>

        <!-- 图片上传区域 -->
        <el-form-item label="上传图片">
          <el-upload
            v-model:file-list="imageFiles"
            :on-change="handleImageUpload"
            :auto-upload="false"
            :limit="uploadConfig.image.limit"
            accept="image/jpeg,image/png,image/gif"
            list-type="picture-card"
          >
            <div v-if="imageFiles.length < uploadConfig.image.limit">
              <el-icon><Plus /></el-icon>
              <div class="el-upload__text">上传图片</div>
              <div class="el-upload__tip">最多上传{{ uploadConfig.image.limit }}张图片，每张不超过10MB</div>
            </div>
            <template #file="{ file }">
              <img :src="getObjectUrl(file)" alt="" class="el-upload-list__item-thumbnail">
              <div class="el-upload-list__item-actions">
                <span class="el-upload-list__item-actions-btn">
                  <el-icon><Check /></el-icon>
                </span>
                <span class="el-upload-list__item-actions-btn" @click="removeImage(imageFiles.findIndex(f => f.uid === file.uid))">
                  <el-icon><Delete /></el-icon>
                </span>
              </div>
              <div class="el-upload-list__item-name">{{ file.name }}</div>
              <div class="el-upload-list__item-size">{{ file.size ? formatFileSize(file.size) : '' }}</div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 视频上传区域 -->
        <el-form-item label="上传视频">
          <el-upload
            v-model:file-list="videoFiles"
            :on-change="handleVideoUpload"
            :auto-upload="false"
            :limit="uploadConfig.video.limit"
            accept="video/mp4,video/avi,video/quicktime"
            list-type="text"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon> 上传视频
            </el-button>
            <div class="el-upload__tip">最多上传{{ uploadConfig.video.limit }}个视频，每个不超过50MB</div>
            <template #file="{ file }">
              <div class="el-upload-list__item">
                <el-icon><VideoPlay /></el-icon>
                <span class="el-upload-list__item-name">{{ file.name || '' }}</span>
                <span class="el-upload-list__item-size">{{ file.size ? formatFileSize(file.size) : '' }}</span>
                <span class="el-upload-list__item-actions-btn" @click="removeVideo(videoFiles.findIndex(f => f.uid === file.uid))">
                  <el-icon><Delete /></el-icon>
                </span>
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 攻略内容 -->
        <h3 class="form-section-title">攻略内容</h3>
        
        <el-form-item label="攻略正文" prop="content">
          <el-input
            v-model="strategyForm.content"
            type="textarea"
            :rows="12"
            placeholder="请输入攻略详细内容，支持Markdown语法"
            resize="vertical"
          />
          <div class="tips">
            <el-tag size="small" type="info">提示：</el-tag>
            您可以使用Markdown语法来格式化攻略内容，如标题、列表、加粗等
          </div>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button type="primary" @click="submitForm" :loading="gameStore.strategiesLoading">
              <el-icon><Upload /></el-icon>
              提交攻略
            </el-button>
            <el-button @click="resetForm">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            <el-button @click="goBack">
              <el-icon><ArrowLeft /></el-icon>
              返回
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { ElMessage, ElNotification } from 'element-plus'
import { Upload, Refresh, ArrowLeft, Plus, VideoPlay, Delete, Check } from '@element-plus/icons-vue'

const router = useRouter()
const gameStore = useGameStore()
const strategyFormRef = ref(null)

// 表单数据
const strategyForm = reactive({
  game_id: '',
  title: '',
  content: '',
  difficulty: 'medium',
  type: 'general'
})

// 文件上传相关
const imageFiles = ref([])
const videoFiles = ref([])

// 上传配置
const uploadConfig = {
  image: {
    name: 'images',
    accept: ['image/jpeg', 'image/png', 'image/gif'],
    maxSize: 10 * 1024 * 1024, // 10MB
    limit: 5,
    sizeErrorMsg: '图片大小不能超过10MB',
    typeErrorMsg: '只支持JPG、PNG和GIF格式的图片',
    limitErrorMsg: '最多只能上传5张图片'
  },
  video: {
    name: 'videos',
    accept: ['video/mp4', 'video/avi', 'video/quicktime'],
    maxSize: 50 * 1024 * 1024, // 50MB
    limit: 1,
    sizeErrorMsg: '视频大小不能超过50MB',
    typeErrorMsg: '只支持MP4、AVI和MOV格式的视频',
    limitErrorMsg: '最多只能上传1个视频'
  }
}

// 文件验证函数
const validateFile = (file, type) => {
  const config = uploadConfig[type]
  
  // 检查文件大小
  if (file.size > config.maxSize) {
    ElMessage.error(config.sizeErrorMsg)
    return false
  }
  
  // 检查文件类型
  const fileType = file.type
  if (!config.accept.includes(fileType)) {
    ElMessage.error(config.typeErrorMsg)
    return false
  }
  
  // 检查文件数量限制
  const filesRef = type === 'image' ? imageFiles : videoFiles
  if (filesRef.value.length >= config.limit) {
    ElMessage.error(config.limitErrorMsg)
    return false
  }
  
  return true
}

// 处理图片上传
const handleImageUpload = (file, fileList) => {
  // 验证文件
  if (!validateFile(file, 'image')) {
    return false // 验证失败，不添加到文件列表
  }
  
  // 自动生成预览URL
  if (file.raw && typeof window !== 'undefined' && window.URL) {
    try {
      file.url = URL.createObjectURL(file.raw);
    } catch (error) {
      console.error('创建图片预览失败:', error);
    }
  }
  
  // Element Plus的v-model:file-list会自动添加文件
  return false; // 阻止自动上传
};

// 处理视频上传
const handleVideoUpload = (file, fileList) => {
  // 验证文件
  if (!validateFile(file, 'video')) {
    return false // 验证失败，不添加到文件列表
  }
  
  // Element Plus的v-model:file-list会自动添加文件
  return false; // 阻止自动上传
};

// 删除图片
const removeImage = (index) => {
  const file = imageFiles.value[index];
  // 释放预览URL以避免内存泄漏
  if (file && file.url && file.url.startsWith('blob:') && typeof window !== 'undefined' && window.URL) {
    URL.revokeObjectURL(file.url);
  }
  imageFiles.value.splice(index, 1);
};

// 删除视频
const removeVideo = (index) => {
  videoFiles.value.splice(index, 1);
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 安全地获取图片预览URL
const getObjectUrl = (file) => {
  if (file) {
    // 优先使用Element Plus提供的url属性
    if (file.url) {
      return file.url;
    }
    // 对于本地选择的文件，使用URL.createObjectURL创建预览
    if (file.raw && typeof window !== 'undefined' && window.URL) {
      try {
        return URL.createObjectURL(file.raw);
      } catch (error) {
        console.error('创建预览URL失败:', error);
        return '';
      }
    }
  }
  return '';
};

// 组件卸载时释放ObjectURL
import { onUnmounted } from 'vue';
onUnmounted(() => {
  // 清理所有预览URL以避免内存泄漏
  if (typeof window !== 'undefined' && window.URL) {
    imageFiles.value.forEach(file => {
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
  }
});

// 自定义验证函数
const validateTitle = (rule, value, callback) => {
  if (value && (value.includes('攻略') || value.includes('指南') || value.includes('心得'))) {
    callback()
  } else {
    callback(new Error('攻略标题建议包含"攻略"、"指南"或"心得"等关键词'))
  }
}

// 内容质量验证
const validateContentQuality = (rule, value, callback) => {
  if (value) {
    // 检查内容是否包含足够的信息结构
    const hasStructure = /[\n]{2,}|[\n][^\n]*[。！？]/.test(value)
    // 检查是否有常见的攻略关键词
    const hasKeywords = /(步骤|技巧|方法|建议|注意|要点|推荐|位置|获取|击败)/.test(value)
    
    if (hasStructure && hasKeywords) {
      callback()
    } else {
      callback(new Error('攻略内容需要包含一定的结构和关键信息，请提供更详细的攻略内容'))
    }
  } else {
    callback()
  }
}

// 表单验证规则
const formRules = {
  game_id: [
    { required: true, message: '请选择游戏', trigger: 'change' },
    { type: 'number', message: '请选择有效的游戏', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入攻略标题', trigger: 'blur' },
    { min: 5, max: 100, message: '攻略标题长度在 5 到 100 个字符', trigger: 'blur' },
    { pattern: /^[^<>"'&]*$/, message: '攻略标题不能包含特殊字符', trigger: 'blur' },
    { validator: validateTitle, trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入攻略内容', trigger: 'blur' },
    { min: 50, message: '攻略内容至少 50 个字符', trigger: 'blur' },
    { max: 10000, message: '攻略内容最多 10000 个字符', trigger: 'blur' },
    { validator: validateContentQuality, trigger: 'blur' }
  ],
  difficulty: [
    { type: 'enum', enum: ['easy', 'medium', 'hard', 'expert'], message: '请选择有效的难度等级', trigger: 'change' }
  ],
  type: [
    { type: 'enum', enum: ['general', 'walkthrough', 'secrets', 'character', 'equipment', 'dungeon'], message: '请选择有效的攻略类型', trigger: 'change' }
  ]
}

// 初始化加载游戏列表
onMounted(async () => {
  if (gameStore.games.length === 0) {
    await gameStore.fetchGames()
  }
})

// 提交表单
const submitForm = async () => {
  await strategyFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 创建包含文件的FormData
        const formData = new FormData();
        
        // 添加文本字段
        formData.append('game_id', strategyForm.game_id);
        formData.append('title', strategyForm.title);
        formData.append('content', strategyForm.content);
        formData.append('difficulty', strategyForm.difficulty);
        formData.append('type', strategyForm.type);
        formData.append('user_id', '1'); // 测试环境使用固定用户ID
        
        // 验证文件数量
        if (imageFiles.value.length === 0 && videoFiles.value.length === 0) {
          ElMessage.warning('建议至少上传一张图片或视频来丰富攻略内容');
          // 仍然允许提交，但给用户提示
        }
        
        // 添加图片文件
        imageFiles.value.forEach(file => {
          if (file.raw) {
            formData.append('images', file.raw);
          }
        });
        
        // 添加视频文件
        videoFiles.value.forEach(file => {
          if (file.raw) {
            formData.append('videos', file.raw);
          }
        });
        
        ElMessage.info(`开始上传：${imageFiles.value.length}张图片，${videoFiles.value.length}个视频`);
        
        const result = await gameStore.createStrategy(formData);
        
        // 清理预览URL以避免内存泄漏
        if (typeof window !== 'undefined' && window.URL) {
          imageFiles.value.forEach(file => {
            if (file.url && file.url.startsWith('blob:')) {
              URL.revokeObjectURL(file.url);
            }
          });
        }
        
        ElMessage.success('攻略提交成功！');
        router.push(`/game/${strategyForm.game_id}`);
      } catch (error) {
        // 根据错误类型显示不同的提示
        if (error.type === 'unauthorized') {
          ElMessage.error('未授权，请先登录');
          router.push('/login');
        } else if (error.type === 'network_error') {
          ElMessage.error('网络连接失败，请检查网络设置');
        } else if (error.statusCode === 400) {
          ElMessage.warning(error.message || '请检查填写的信息');
        } else if (error.statusCode === 404) {
          ElMessage.warning('选择的游戏不存在');
        } else if (error.message && error.message.includes('文件大小')) {
          ElMessage.error('文件大小超过限制，请检查上传的文件');
        } else if (error.message && error.message.includes('文件类型')) {
          ElMessage.error('不支持的文件类型，请检查上传的文件');
        } else {
          ElMessage.error(error.message || '提交攻略失败，请稍后重试');
        }
        console.error('提交攻略失败:', error);
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  strategyFormRef.value.resetFields();
  
  // 清理图片预览URL
  if (typeof window !== 'undefined' && window.URL) {
    imageFiles.value.forEach(file => {
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
  }
  
  // 清空文件列表
  imageFiles.value = [];
  videoFiles.value = [];
};

// 返回
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.add-strategy {
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

.strategy-form {
  padding: 30px;
}

.game-option {
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-cover-small {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.game-name {
  font-weight: bold;
  flex: 1;
}

.game-developer {
  font-size: 0.85rem;
  color: #888;
}

.tips {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 0.9rem;
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
  
  .strategy-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
  
  .game-cover-small {
    display: none;
  }
}
</style>