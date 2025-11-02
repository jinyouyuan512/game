<template>
  <div class="admin-settings">
    <div class="page-header">
      <h2>系统设置</h2>
      <div class="header-actions">
        <el-button type="primary" @click="saveSettings" :loading="saving">
          <el-icon><Download /></el-icon>
          保存设置
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="basic">
        <el-form ref="basicFormRef" :model="settings" label-width="150px" class="settings-form">
          <el-form-item label="网站名称" prop="siteName">
            <el-input v-model="settings.siteName" placeholder="请输入网站名称" />
          </el-form-item>
          <el-form-item label="网站描述" prop="siteDescription">
            <el-input
              v-model="settings.siteDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入网站描述"
            />
          </el-form-item>
          <el-form-item label="网站关键词">
            <el-input
              v-model="settings.siteKeywords"
              placeholder="请输入网站关键词，多个用逗号分隔"
            />
          </el-form-item>
          <el-form-item label="备案号">
            <el-input v-model="settings.ICPNumber" placeholder="请输入备案号" />
          </el-form-item>
          <el-form-item label="版权信息">
            <el-input v-model="settings.copyright" placeholder="请输入版权信息" />
          </el-form-item>
          <el-form-item label="开启注册">
            <el-switch v-model="settings.allowRegistration" />
          </el-form-item>
          <el-form-item label="开启AI功能">
            <el-switch v-model="settings.enableAI" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 安全设置 -->
      <el-tab-pane label="安全设置" name="security">
        <el-form ref="securityFormRef" :model="securitySettings" label-width="150px" class="settings-form">
          <el-form-item label="登录失败次数限制">
            <el-input-number
              v-model="securitySettings.maxLoginAttempts"
              :min="1"
              :max="10"
              :step="1"
              placeholder="请输入登录失败次数限制"
            />
          </el-form-item>
          <el-form-item label="登录锁定时间（分钟）">
            <el-input-number
              v-model="securitySettings.lockoutMinutes"
              :min="5"
              :max="1440"
              :step="5"
              placeholder="请输入锁定时间"
            />
          </el-form-item>
          <el-form-item label="会话超时时间（小时）">
            <el-input-number
              v-model="securitySettings.sessionTimeoutHours"
              :min="1"
              :max="24"
              :step="1"
              placeholder="请输入会话超时时间"
            />
          </el-form-item>
          <el-form-item label="开启验证码登录">
            <el-switch v-model="securitySettings.enableCaptcha" />
          </el-form-item>
          <el-form-item label="开启双因素认证">
            <el-switch v-model="securitySettings.enable2FA" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 缓存管理 -->
      <el-tab-pane label="缓存管理" name="cache">
        <div class="cache-section">
          <div class="cache-stats">
            <div class="cache-item">
              <div class="cache-label">缓存大小</div>
              <div class="cache-value">{{ cacheStats.size }} MB</div>
            </div>
            <div class="cache-item">
              <div class="cache-label">缓存项数</div>
              <div class="cache-value">{{ cacheStats.items }}</div>
            </div>
            <div class="cache-item">
              <div class="cache-label">最后清理时间</div>
              <div class="cache-value">{{ formatDate(cacheStats.lastCleanup) }}</div>
            </div>
          </div>
          
          <div class="cache-actions">
            <el-button type="danger" @click="clearAllCache" :loading="clearingCache">
              <el-icon><DeleteIcon /></el-icon>
              清理全部缓存
            </el-button>
            <el-button @click="clearSpecificCache('game')" :loading="clearingCache">
              <el-icon><DeleteIcon /></el-icon>
              清理游戏缓存
            </el-button>
            <el-button @click="clearSpecificCache('strategy')" :loading="clearingCache">
              <el-icon><DeleteIcon /></el-icon>
              清理攻略缓存
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- 日志管理 -->
      <el-tab-pane label="日志管理" name="logs">
        <div class="logs-section">
          <div class="log-filters">
            <el-select v-model="logType" placeholder="选择日志类型">
              <el-option label="全部日志" value="all" />
              <el-option label="登录日志" value="login" />
              <el-option label="操作日志" value="operation" />
              <el-option label="错误日志" value="error" />
            </el-select>
            <el-date-picker
              v-model="logDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="loadLogs"
            />
            <el-button type="primary" @click="loadLogs">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button type="danger" @click="clearLogs">
              <el-icon><DeleteIcon /></el-icon>
              清空日志
            </el-button>
          </div>
          
          <el-table
            :data="logs"
            v-loading="loadingLogs"
            stripe
            style="width: 100%"
            class="logs-table"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getLogTypeTag(row.type)">
                  {{ getLogTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="操作人" width="120" />
            <el-table-column prop="action" label="操作内容" min-width="300" />
            <el-table-column prop="ip" label="IP地址" width="150" />
            <el-table-column prop="created_at" label="操作时间" width="180" />
          </el-table>
          
          <div class="logs-pagination">
            <el-pagination
              v-model:current-page="logCurrentPage"
              v-model:page-size="logPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="totalLogs"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleLogSizeChange"
              @current-change="handleLogCurrentChange"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Search } from '@element-plus/icons-vue'
import { Delete as DeleteIcon } from '@element-plus/icons-vue'

// 状态管理
const activeTab = ref('basic')
const saving = ref(false)
const clearingCache = ref(false)
const loadingLogs = ref(false)
const logCurrentPage = ref(1)
const logPageSize = ref(10)
const logType = ref('all')
const logDateRange = ref([])

// 基本设置
const settings = reactive({
  siteName: 'AI游戏攻略平台',
  siteDescription: '专业的游戏攻略分享与AI问答平台',
  siteKeywords: '游戏攻略,AI问答,游戏社区,游戏教程',
  ICPNumber: '京ICP备XXXXXXXX号-X',
  copyright: '© 2024 AI游戏攻略平台 版权所有',
  allowRegistration: true,
  enableAI: true
})

// 安全设置
const securitySettings = reactive({
  maxLoginAttempts: 5,
  lockoutMinutes: 30,
  sessionTimeoutHours: 24,
  enableCaptcha: true,
  enable2FA: false
})

// 缓存统计
const cacheStats = ref({
  size: 128.5,
  items: 1532,
  lastCleanup: '2024-01-15 10:30:00'
})

// 日志数据
const logs = ref([])
const totalLogs = ref(0)

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 获取日志类型标签
const getLogTypeTag = (type) => {
  switch (type) {
    case 'login': return 'info'
    case 'operation': return 'success'
    case 'error': return 'danger'
    default: return 'default'
  }
}

// 获取日志类型标签
const getLogTypeLabel = (type) => {
  switch (type) {
    case 'login': return '登录'
    case 'operation': return '操作'
    case 'error': return '错误'
    default: return type
  }
}

// 保存设置
const saveSettings = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 清理全部缓存
const clearAllCache = async () => {
  ElMessage.confirm(
    '确定要清理全部缓存吗？这可能会影响系统性能一段时间。',
    '清理缓存确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    clearingCache.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      cacheStats.value = {
        size: 0,
        items: 0,
        lastCleanup: new Date().toLocaleString('zh-CN')
      }
      
      ElMessage.success('缓存清理成功')
    } catch (error) {
      console.error('清理缓存失败:', error)
      ElMessage.error('清理缓存失败')
    } finally {
      clearingCache.value = false
    }
  }).catch(() => {
    // 取消清理
  })
}

// 清理特定缓存
const clearSpecificCache = async (type) => {
  clearingCache.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 600))
    
    ElMessage.success(`${type === 'game' ? '游戏' : '攻略'}缓存清理成功`)
  } catch (error) {
    console.error('清理缓存失败:', error)
    ElMessage.error('清理缓存失败')
  } finally {
    clearingCache.value = false
  }
}

// 加载日志
const loadLogs = async () => {
  loadingLogs.value = true
  try {
    // 模拟获取日志数据
    const mockLogs = []
    const types = ['login', 'operation', 'error']
    const actions = [
      '登录系统', '退出系统', '添加游戏', '编辑游戏', '删除游戏', 
      '添加攻略', '编辑攻略', '删除攻略', '修改系统设置', '清理缓存'
    ]
    const usernames = ['admin', 'editor1', 'admin2']
    
    for (let i = 1; i <= 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      mockLogs.push({
        id: i,
        type: logType.value === 'all' ? type : logType.value,
        username: usernames[Math.floor(Math.random() * usernames.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toLocaleString('zh-CN')
      })
    }
    
    // 过滤日志类型
    let filteredLogs = mockLogs
    if (logType.value !== 'all') {
      filteredLogs = mockLogs.filter(log => log.type === logType.value)
    }
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    logs.value = filteredLogs
    totalLogs.value = filteredLogs.length
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.error('加载日志失败')
  } finally {
    loadingLogs.value = false
  }
}

// 清空日志
const clearLogs = async () => {
  ElMessage.confirm(
    '确定要清空所有日志吗？此操作不可恢复。',
    '清空日志确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      logs.value = []
      totalLogs.value = 0
      
      ElMessage.success('日志已清空')
    } catch (error) {
      console.error('清空日志失败:', error)
      ElMessage.error('清空日志失败')
    }
  }).catch(() => {
    // 取消清空
  })
}

// 日志分页处理
const handleLogSizeChange = (size) => {
  logPageSize.value = size
  logCurrentPage.value = 1
}

const handleLogCurrentChange = (current) => {
  logCurrentPage.value = current
}

// 初始加载
onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.admin-settings {
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

.settings-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.settings-form {
  padding: 20px;
}

.settings-form .el-form-item {
  margin-bottom: 24px;
}

/* 缓存管理样式 */
.cache-section {
  padding: 20px;
}

.cache-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.cache-item {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.cache-label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.cache-value {
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.cache-actions {
  display: flex;
  gap: 12px;
}

/* 日志管理样式 */
.logs-section {
  padding: 20px;
}

.log-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.log-filters .el-select,
.log-filters .el-date-editor {
  width: 200px;
}

.logs-table {
  margin-bottom: 20px;
}

.logs-pagination {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .log-filters {
    flex-direction: column;
  }
  
  .log-filters .el-select,
  .log-filters .el-date-editor {
    width: 100%;
  }
  
  .cache-stats {
    grid-template-columns: 1fr;
  }
  
  .cache-actions {
    flex-direction: column;
  }
}
</style>