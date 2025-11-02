<template>
  <div class="create-post-container">
    <div class="create-post-header">
      <h1>发布帖子</h1>
      <el-button @click="goBack" type="text">取消</el-button>
    </div>
    
    <div class="create-post-form">
      <el-form :model="postForm" :rules="rules" ref="postFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="postForm.title"
            placeholder="请输入帖子标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="postForm.category" placeholder="请选择帖子分类">
            <el-option label="讨论" value="discussion" />
            <el-option label="分享" value="share" />
            <el-option label="求助" value="help" />
            <el-option label="新闻" value="news" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入帖子内容"
            maxlength="5000"
            show-word-limit
            resize="none"
          />
          <div class="editor-tips">
            支持使用 Markdown 语法
          </div>
        </el-form-item>
        
        <el-form-item label="添加图片">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            list-type="picture-card"
            :multiple="true"
            :limit="9"
            :on-change="handleFileChange"
            :on-preview="handleFilePreview"
            :on-remove="handleFileRemove"
            :auto-upload="false"
          >
            <el-icon><Plus /></el-icon>
            <template #file="{ file }">
              <div>
                <img :src="file.url" class="el-upload-list__item-thumbnail" />
                <span class="el-upload-list__item-actions">
                  <span class="el-upload-list__item-preview" @click.stop="handleFilePreview(file)">
                    <el-icon><ZoomIn /></el-icon>
                  </span>
                  <span class="el-upload-list__item-delete" @click.stop="handleFileRemove(file)">
                    <el-icon><Delete /></el-icon>
                  </span>
                </span>
              </div>
            </template>
          </el-upload>
          <div class="upload-tips">
            最多上传9张图片，单张图片不超过5MB
          </div>
        </el-form-item>
        
        <el-form-item>
          <div class="form-actions">
            <el-button @click="saveDraft" type="default">保存草稿</el-button>
            <el-button @click="submitPost" type="primary" :loading="submitting">发布帖子</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const postFormRef = ref(null)
const submitting = ref(false)
const fileList = ref([])

// 表单数据
const postForm = reactive({
  title: '',
  category: '',
  content: ''
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择帖子分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ]
}

// 方法
const handleFileChange = (file, fileList) => {
  // 模拟文件上传
  if (file.raw) {
    const reader = new FileReader()
    reader.readAsDataURL(file.raw)
    reader.onload = (e) => {
      file.url = e.target.result
    }
  }
  return false
}

const handleFilePreview = (file) => {
  ElMessageBox.alert(
    `<img src="${file.url}" style="max-width: 100%; max-height: 400px;">`,
    '预览图片',
    {
      dangerouslyUseHTMLString: true
    }
  )
}

const handleFileRemove = (file, fileList) => {
  ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = fileList.findIndex(item => item.uid === file.uid)
    if (index > -1) {
      fileList.splice(index, 1)
    }
  }).catch(() => {
    // 取消删除
  })
  return false
}

const validateForm = () => {
  return new Promise((resolve) => {
    postFormRef.value.validate((valid) => {
      resolve(valid)
    })
  })
}

const submitPost = async () => {
  const isValid = await validateForm()
  if (!isValid) return
  
  submitting.value = true
  
  try {
    // 模拟提交到服务器
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('提交的帖子数据:', {
      ...postForm,
      images: fileList.value.map(file => file.url)
    })
    
    ElMessage.success('帖子发布成功')
    router.push('/community')
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const saveDraft = async () => {
  // 保存草稿不需要完整验证，但需要验证必填项
  const basicValid = postForm.title && postForm.content
  
  if (!basicValid) {
    ElMessage.warning('请至少填写标题和内容才能保存草稿')
    return
  }
  
  try {
    // 模拟保存草稿
    await new Promise(resolve => setTimeout(resolve, 800))
    
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存草稿失败')
  }
}

const goBack = () => {
  // 检查是否有未保存的内容
  if (postForm.title || postForm.content || fileList.value.length > 0) {
    ElMessageBox.confirm('当前有未保存的内容，确定要离开吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.back()
    }).catch(() => {
      // 取消离开
    })
  } else {
    router.back()
  }
}
</script>

<style scoped>
.create-post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.create-post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.create-post-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.create-post-form {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-tips,
.upload-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

/* 调整上传组件样式 */
.el-upload-list__item {
  width: 100px;
  height: 100px;
}

.el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

.el-upload--picture-card .el-icon-plus {
  font-size: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .create-post-container {
    padding: 10px;
  }
  
  .create-post-form {
    padding: 16px;
  }
  
  .el-upload-list__item,
  .el-upload--picture-card {
    width: 80px;
    height: 80px;
    line-height: 80px;
  }
}
</style>