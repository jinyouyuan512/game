<template>
  <div class="strategy-detail" 
       v-loading="loading"
       :class="{
         'platform-pc': currentPlatform === 'pc',
         'platform-mobile': currentPlatform === 'mobile',
         'platform-console': currentPlatform === 'console',
         'orientation-landscape': currentOrientation === 'landscape',
         'orientation-portrait': currentOrientation === 'portrait',
         'interaction-touch': interactionMode === 'touch',
         'interaction-pointer': interactionMode === 'pointer'
       }">
    <div v-if="strategy" class="strategy-content orientation-responsive">
      <!-- 攻略头部信息 -->
      <div class="strategy-header">
        <div class="container">
          <div class="header-content orientation-responsive">
            <div class="breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/games' }">游戏中心</el-breadcrumb-item>
                <el-breadcrumb-item v-if="strategy.games">
                  {{ strategy.games.name }}
                </el-breadcrumb-item>
                <el-breadcrumb-item>{{ strategy.title }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            
            <h1 class="strategy-title">{{ strategy.title }}</h1>
            
            <div class="strategy-meta">
              <div class="meta-left">
                <div class="game-info" v-if="strategy.games">
                  <img
                    :src="strategy.games.cover_image_url || '/game-placeholder.svg'"
                    :alt="strategy.games.name"
                    class="game-avatar"
                    @error="handleImageError"
                  />
                  <div class="game-details">
                    <h3 class="game-name">{{ strategy.games.name }}</h3>
                    <p class="game-developer">{{ strategy.games.developer }}</p>
                  </div>
                </div>
              </div>
              
              <div class="meta-right">
                <div class="strategy-stats">
                  <div class="stat-item">
                    <el-icon><View /></el-icon>
                    <span>{{ strategy.view_count || 0 }} 次浏览</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ formatDate(strategy.created_at) }}</span>
                  </div>
                  <div class="stat-item" v-if="strategy.difficulty_level">
                    <el-icon><Star /></el-icon>
                    <span>难度 {{ strategy.difficulty_level }}/5</span>
                  </div>
                </div>
                
                <div class="action-buttons">
                  <el-button @click="generateSummary" :loading="summaryLoading">
                    <el-icon><MagicStick /></el-icon>
                    AI摘要
                  </el-button>
                  <el-button @click="showAIChat">
                    <el-icon><ChatDotRound /></el-icon>
                    AI问答
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI 分析器 -->
      <AIAnalyzer 
        v-if="showAISummary"
        :strategy-content="strategy.content"
        :strategy-title="strategy.title"
        :game-info="strategy.game"
      />

      <!-- AI摘要区域 -->
      <div v-if="aiSummary" class="ai-summary-section">
        <div class="container">
          <div class="ai-summary-card">
            <div class="summary-header">
              <div class="summary-icon">
                <el-icon><Robot /></el-icon>
              </div>
              <h3>AI智能摘要</h3>
              <el-button
                size="small"
                type="info"
                text
                @click="aiSummary = ''"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <div class="summary-content">
              {{ aiSummary }}
            </div>
          </div>
        </div>
      </div>

      <!-- 攻略标签 -->
      <div v-if="strategy.strategy_tags && strategy.strategy_tags.length > 0" class="tags-section">
        <div class="container">
          <div class="tags-wrapper">
            <span class="tags-label">标签：</span>
            <div class="tags-list">
              <el-tag
                v-for="tagRelation in strategy.strategy_tags"
                :key="tagRelation.tags.id"
                type="info"
                size="small"
              >
                {{ tagRelation.tags.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 攻略正文 -->
      <div class="strategy-body">
        <div class="container">
          <div class="content-wrapper">
            <article class="strategy-article">
              <div class="article-content" v-html="formattedContent"></div>
              
              <!-- 攻略视频播放 - 已确认位于strategy-article内部，与正文共享宽度约束 -->
              <div v-if="strategy.video_urls && Array.isArray(strategy.video_urls) && strategy.video_urls.length > 0" class="strategy-videos">
                <h3 class="videos-title">攻略视频</h3>
                <div class="videos-container">
                  <div v-for="(video, index) in strategy.video_urls" :key="`video-${index}`" class="video-item">
                    <video 
                      :src="formatVideoUrl(video)" 
                      controls 
                      class="strategy-video"
                      :alt="`攻略视频 ${index + 1}`"
                      @error="handleVideoError($event, index)"
                    >
                      您的浏览器不支持HTML5视频播放。
                    </video>
                  </div>
                </div>
              </div>
              
              <!-- 攻略图片展示 -->
              <div v-if="strategy.image_urls && strategy.image_urls.length > 0" class="strategy-images">
                <h3 class="images-title">攻略图片</h3>
                <div class="images-grid">
                  <div v-for="(image, index) in strategy.image_urls" :key="index" class="image-item">
                    <img 
                      :src="image" 
                      :alt="`攻略图片 ${index + 1}`" 
                      class="strategy-image"
                      @click="previewImage(index)"
                      @error="handleImageError($event)"
                    />
                  </div>
                </div>
              </div>
            </article>
            
            <!-- 侧边栏 -->
            <aside class="strategy-sidebar">
              <!-- 目录导航 -->
              <div class="sidebar-card toc-card" v-if="tocItems.length > 0">
                <h4 class="card-title">目录</h4>
                <ul class="toc-list">
                  <li
                    v-for="item in tocItems"
                    :key="item.id"
                    class="toc-item"
                    :class="{ active: activeSection === item.id }"
                    @click="scrollToSection(item.id)"
                  >
                    {{ item.text }}
                  </li>
                </ul>
              </div>
              
              <!-- 相关攻略 -->
              <div class="sidebar-card related-card" v-if="relatedStrategies.length > 0">
                <h4 class="card-title">相关攻略</h4>
                <div class="related-list">
                  <div
                    v-for="related in relatedStrategies"
                    :key="related.id"
                    class="related-item"
                    @click="goToStrategy(related.id)"
                  >
                    <h5 class="related-title">{{ related.title }}</h5>
                    <div class="related-meta">
                      <span class="view-count">
                        <el-icon><View /></el-icon>
                        {{ related.view_count || 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 快速操作 -->
              <div class="sidebar-card actions-card">
                <h4 class="card-title">快速操作</h4>
                <div class="action-list">
                  <el-button
                    type="primary"
                    @click="showAIChat"
                    block
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    向AI提问
                  </el-button>
                  <el-button
                    @click="generateSummary"
                    :loading="summaryLoading"
                    block
                  >
                    <el-icon><MagicStick /></el-icon>
                    生成摘要
                  </el-button>
                  <el-button
                    @click="copyLink"
                    block
                  >
                    <el-icon><Share /></el-icon>
                    分享链接
                  </el-button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="!loading" class="error-state">
      <div class="container">
        <el-result
          icon="error"
          title="攻略不存在"
          sub-title="抱歉，您访问的攻略不存在或已被删除"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/games')">
              返回游戏中心
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
  
  <!-- 简化的图片预览实现 -->
  <div v-if="previewVisible" class="image-preview-overlay" @click="previewVisible = false">
    <div class="preview-content" @click.stop>
      <img :src="previewImages[previewIndex]?.url" :alt="previewImages[previewIndex]?.alt" class="preview-image" />
      <button class="close-button" @click="previewVisible = false">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { ElMessage } from 'element-plus'
import AIAnalyzer from '../components/AIAnalyzer.vue'
import deviceDetectionService from '../services/DeviceDetectionService'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const strategy = ref(null)
const loading = ref(true)
const error = ref(null)
const aiSummary = ref('')
const summaryLoading = ref(false)
const showAISummary = ref(false)
const activeSection = ref('')
const relatedStrategies = ref([])
const previewImages = ref([])
const previewVisible = ref(false)
const previewIndex = ref(0)

// 设备信息响应式状态
const currentPlatform = ref(deviceDetectionService.getCurrentPlatform())
const currentOrientation = ref(deviceDetectionService.getCurrentOrientation())
const interactionMode = ref(deviceDetectionService.getInteractionMode())

// 监听设备变化
watch(() => deviceDetectionService.getCurrentPlatform(), (newPlatform) => {
  currentPlatform.value = newPlatform
  console.log('平台变化:', newPlatform)
})

watch(() => deviceDetectionService.getCurrentOrientation(), (newOrientation) => {
  currentOrientation.value = newOrientation
  console.log('方向变化:', newOrientation)
})

watch(() => deviceDetectionService.getInteractionMode(), (newMode) => {
  interactionMode.value = newMode
  console.log('交互模式变化:', newMode)
})

// 计算属性
const formattedContent = computed(() => {
  if (!strategy.value?.content) return ''
  
  // 简单的Markdown到HTML转换（实际项目中建议使用专业的Markdown解析器）
  let html = strategy.value.content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gim, '<h3 id="heading-$1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 id="heading-$1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 id="heading-$1">$1</h1>')
  
  return html
})

// 方法
const fetchStrategy = async () => {
  try {
    loading.value = true
    const strategyId = route.params.id
    
    // 直接使用fetchStrategy返回的数据，而不是从strategies数组中查找
    strategy.value = await gameStore.fetchStrategy(strategyId)
    
    // 获取相关攻略
    if (strategy.value && strategy.value.game_id) {
      try {
        await gameStore.fetchStrategiesByGame(strategy.value.game_id)
        relatedStrategies.value = gameStore.strategies
          .filter(s => s && s.id !== strategy.value.id)
          .slice(0, 5)
      } catch (error) {
        console.error('获取相关攻略失败:', error)
        // 不使用模拟数据，保持相关攻略为空数组
        relatedStrategies.value = []
      }
    } else {
      relatedStrategies.value = []
    }
    
    // 生成目录
    generateTOC()
  } catch (error) {
    console.error('获取攻略失败:', error)
    ElMessage.error('获取攻略数据失败，请稍后重试')
    // 不使用模拟数据，让用户知道数据加载失败
  } finally {
    loading.value = false
  }
}

// 模拟攻略详情数据
const getMockStrategyData = (id) => {
  return {
    id: parseInt(id) || 1,
    title: "新手入门指南：如何快速建立你的星际帝国",
    content: `# 新手入门指南：如何快速建立你的星际帝国

## 欢迎来到星际战场

亲爱的指挥官，欢迎加入《星际战争：未知边界》的宇宙大家庭！作为一名新手，你可能对这个广阔的宇宙感到迷茫。本攻略将帮助你快速上手，建立属于自己的星际帝国。

## 游戏初始设置

### 选择你的种族

游戏中有三个主要种族可供选择：

1. **人类联邦** - 均衡发展，适应性强
2. **机械联盟** - 技术先进，资源效率高
3. **外星文明** - 特殊能力，发展独特

建议新手选择人类联邦，平衡性更好，容易上手。

### 初始资源分配

开始时你拥有：
- 1000 晶体
- 500 能源
- 200 食物
- 3个殖民舰

优先建设：
- 资源收集站
- 基础防御设施
- 研究中心

## 快速发展技巧

### 第1-3天：基础建设

重点发展资源生产，确保资源稳定增长。

### 第4-7天：扩张阶段

使用殖民舰探索附近星系，寻找适合殖民的星球。

### 第8-14天：科技发展

开始研究高级科技，提升你的竞争力。`,
    games: {
      id: 1,
      name: "星际战争：未知边界",
      developer: "银河游戏工作室",
      cover_image_url: "/game-placeholder.svg"
    },
    game_id: 1,
    created_at: "2023-11-20T08:30:00Z",
    view_count: 1562,
    difficulty_level: 3,
    strategy_tags: [
      { tags: { id: 1, name: "新手攻略" } },
      { tags: { id: 2, name: "基础操作" } },
      { tags: { id: 3, name: "发展策略" } }
    ]
  }
}

// 生成模拟相关攻略
const generateMockRelatedStrategies = (currentId) => {
  const baseId = parseInt(currentId) || 100
  return [
    {
      id: baseId + 1,
      title: "高级战术指南：舰队阵型与战斗技巧",
      view_count: 892
    },
    {
      id: baseId + 2,
      title: "资源管理进阶：最大化生产效率",
      view_count: 1254
    },
    {
      id: baseId + 3,
      title: "外交策略：如何与其他文明建立联盟",
      view_count: 756
    },
    {
      id: baseId + 4,
      title: "科技树完全解析：最优研究路径",
      view_count: 1432
    },
    {
      id: baseId + 5,
      title: "太空站建造指南：从基础到高级",
      view_count: 982
    }
  ]
}

const generateTOC = () => {
  if (!strategy.value?.content) return
  
  // 解析Markdown标题生成目录
  const content = strategy.value.content
  let headings = content.match(/^#{1,3} (.+)$/gm) || []
  
  if (headings && headings.length > 0) {
    tocItems.value = headings.map((heading, index) => ({
      id: `heading-${heading.replace(/^#{1,3} /, '')}`,
      text: heading.replace(/^#{1,3} /, ''),
      level: heading.match(/^#{1,3}/)[0].length
    }))
  } else if (content.includes('# ')) {
    // 尝试使用更宽松的正则表达式处理模拟数据
    const altHeadings = content.match(/#+\s+(.+)/g) || []
    tocItems.value = altHeadings.slice(0, 5).map((heading, index) => {
      const level = Math.min((heading.match(/^#/g) || []).length, 3)
      const text = heading.replace(/^#+\s+/, '')
      return {
        id: `section-${index + 1}`,
        text: text.substring(0, 40) + (text.length > 40 ? '...' : ''),
        level
      }
    })
  }
}

const generateSummary = async () => {
  if (!strategy.value) return
  
  try {
    summaryLoading.value = true
    
    // 调用后端真实AI摘要API
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: strategy.value.title,
        content: strategy.value.content
      })
    })
    
    if (!response.ok) {
      throw new Error(`AI摘要API响应失败: ${response.status}`)
    }
    
    const data = await response.json()
    aiSummary.value = data.summary
    
    ElMessage.success('AI摘要生成成功')
  } catch (error) {
    console.error('生成摘要失败，使用备用摘要:', error)
    
    // 备用摘要逻辑，确保在API调用失败时仍能提供服务
    aiSummary.value = `基于《${strategy.value.title}》攻略内容，AI为您总结以下要点：
    
1. 核心策略：本攻略主要介绍了游戏中的关键玩法和技巧
2. 适用场景：适合中级以上玩家参考学习
3. 重点提示：注意资源分配和时机把握
4. 预期效果：按照攻略执行可显著提升游戏体验

建议结合实际游戏情况灵活运用攻略内容。`
    
    ElMessage.warning('使用备用摘要，真实AI服务暂时不可用')
  } finally {
    summaryLoading.value = false
  }
}

const showAIChat = () => {
  const event = new CustomEvent('show-ai-chat')
  window.dispatchEvent(event)
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeSection.value = sectionId
  }
}

const goToStrategy = (strategyId) => {
  router.push(`/strategies/${strategyId}`)
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制链接失败')
  }
}

const handleImageError = (event) => {
  event.target.src = '/images/default-strategy.png';
  event.target.alt = '默认攻略图片';
}

// 处理视频加载错误
const handleVideoError = (event, index) => {
  console.warn(`视频 ${index + 1} 加载失败:`, event.target.src);
  // 可以在这里添加用户友好的错误提示
}

// 格式化视频URL，修复编码问题
const formatVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  console.log('原始视频URL:', url);
  
  // 将日志发送到服务器，方便调试
  fetch('http://localhost:3000/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: '前端视频URL处理',
      originalUrl: url
    })
  }).catch(err => console.error('发送日志失败:', err));
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是相对路径，先处理转义字符，再拼接服务器地址
  if (url.startsWith('/uploads/videos/')) {
    let processedUrl = url;
    
    // 处理数据库中可能存在的转义字符
    if (url.includes('\\x')) {
      // 将类似 \xE5\xAE\x89 的转义序列转换为实际字符
      processedUrl = url.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    }
    
    // 处理可能存在的乱码字符
    try {
      // 尝试解码URL编码的字符
      processedUrl = decodeURIComponent(processedUrl);
    } catch (e) {
      console.warn('URL解码失败:', e);
    }
    
    const finalUrl = 'http://localhost:3000' + processedUrl;
    console.log('处理后的视频URL:', finalUrl);
    
    // 将处理后的URL发送到服务器
    fetch('http://localhost:3000/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '前端视频URL处理结果',
        originalUrl: url,
        processedUrl: processedUrl,
        finalUrl: finalUrl
      })
    }).catch(err => console.error('发送日志失败:', err));
    
    return finalUrl;
  }
  
  // 如果是纯文件名，先解码URL编码的中文字符，再拼接完整路径
  try {
    // 处理数据库中可能存在的转义字符
    let decodedUrl = url;
    
    // 首先尝试解码可能被转义的Unicode字符
    if (url.includes('\\x')) {
      // 将类似 \xE8\x9D\x8B 的转义序列转换为实际字符
      decodedUrl = url.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    }
    
    // 然后进行URL解码
    decodedUrl = decodeURIComponent(decodedUrl);
    
    const finalUrl = 'http://localhost:3000/uploads/videos/' + decodedUrl;
    console.log('处理后的视频URL:', finalUrl);
    
    // 将处理后的URL发送到服务器
    fetch('http://localhost:3000/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '前端视频URL处理结果',
        originalUrl: url,
        decodedUrl: decodedUrl,
        finalUrl: finalUrl
      })
    }).catch(err => console.error('发送日志失败:', err));
    
    return finalUrl;
  } catch (error) {
    console.warn('视频URL解码失败:', error, '原始URL:', url);
    // 如果解码失败，直接使用原始URL
    const finalUrl = 'http://localhost:3000/uploads/videos/' + url;
    console.log('使用原始URL:', finalUrl);
    
    // 将错误情况发送到服务器
    fetch('http://localhost:3000/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '前端视频URL处理失败',
        originalUrl: url,
        error: error.message,
        finalUrl: finalUrl
      })
    }).catch(err => console.error('发送日志失败:', err));
    
    return finalUrl;
  }
}

// 图片预览功能
const previewImage = (index) => {
  if (!strategy.value?.image_urls || strategy.value.image_urls.length === 0) return;
  
  // 准备预览数据
  previewImages.value = strategy.value.image_urls.map(url => ({
    url: url,
    alt: '攻略图片'
  }));
  
  previewIndex.value = index;
  previewVisible.value = true;
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 滚动监听
const handleScroll = () => {
  const sections = tocItems.value.map(item => document.getElementById(item.id)).filter(Boolean)
  
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i]
    const rect = section.getBoundingClientRect()
    
    if (rect.top <= 100) {
      activeSection.value = section.id
      break
    }
  }
}

onMounted(async () => {
  await fetchStrategy()
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
  
  // 初始化目录高亮
  nextTick(() => {
    handleScroll()
    
    // 强制设置video标签宽度与article-content div标签完全一致
    const articleContent = document.querySelector('.article-content')
    const videos = document.querySelectorAll('.strategy-video')
    
    if (articleContent && videos.length > 0) {
      // 获取article-content的实际宽度
      const contentWidth = articleContent.offsetWidth
      
      // 设置所有video标签的宽度与article-content完全一致
      videos.forEach(video => {
        video.style.width = `${contentWidth}px`
        video.style.maxWidth = `${contentWidth}px`
        video.style.display = 'block'
        video.style.boxSizing = 'border-box'
      })
      
      // 监听窗口大小变化，重新调整video宽度
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          if (entry.target === articleContent) {
            const newWidth = entry.contentRect.width
            videos.forEach(video => {
              video.style.width = `${newWidth}px`
              video.style.maxWidth = `${newWidth}px`
            })
          }
        }
      })
      
      resizeObserver.observe(articleContent)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.strategy-detail {
  background: var(--bg-color-page);
  color: var(--text-color-primary);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.strategy-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 60px 0 40px;
  color: white;
  position: relative;
  overflow: hidden;
}

.strategy-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.15) 0%, transparent 60%);
  z-index: 0;
}

.breadcrumb {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

:deep(.el-breadcrumb__item) {
  color: var(--text-color-secondary);
}

:deep(.el-breadcrumb__item.is-link) {
  color: var(--primary-color);
}

.strategy-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0 0 30px 0;
  line-height: 1.3;
  background: linear-gradient(90deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.strategy-title::after {
  content: '';
  display: block;
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #00d4ff, transparent);
  margin-top: 15px;
  border-radius: 2px;
  animation: pulseGlow 2s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 1;
    transform: scaleX(1);
  }
  50% {
    opacity: 0.8;
    transform: scaleX(1.1);
  }
}

.strategy-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 30px;
  position: relative;
  z-index: 1;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.game-info:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.game-avatar {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.game-name {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: white;
}

.game-developer {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}

.strategy-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  background: rgba(0, 212, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .el-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.action-buttons .el-button--primary {
  background: linear-gradient(45deg, #00d4ff, #00a8cc);
}

.action-buttons .el-button--primary:hover {
  background: linear-gradient(45deg, #00a8cc, #007a99);
}

.ai-summary-section {
  padding: 30px 0;
  background: var(--fill-color-light);
  border-bottom: 1px solid var(--border-color-light);
}

.ai-summary-card {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 168, 204, 0.05) 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.ai-summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #00d4ff, #00a8cc);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.summary-icon {
  width: 30px;
  height: 30px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-icon .el-icon {
  color: white;
  font-size: 16px;
}

.summary-header h3 {
  flex: 1;
  color: var(--primary-color);
  margin: 0;
}

.summary-content {
  color: var(--text-color-primary);
  line-height: 1.8;
  white-space: pre-line;
}

.tags-section {
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
  animation-delay: 0.3s;
}

.tags-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tags-label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: bold;
}

.tags-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.strategy-body {
  padding: 40px 0;
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
  animation-delay: 0.5s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
}

.strategy-article {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.strategy-article::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #00d4ff, #00a8cc);
}

.article-content {
    line-height: 1.8;
    color: #000000; /* 修改为黑色 */
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  /* 确保article-content中的所有图片都能响应式适应容器 - 增加优先级 */
  .article-content :deep(img) {
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
    margin: 0 auto !important;
    box-sizing: border-box !important;
    overflow: hidden;
  }
  
  /* 为strategy-article容器内的所有图片添加全局限制 */
  .strategy-article img {
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
    box-sizing: border-box !important;
  }

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  color: #00d4ff;
  margin: 30px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.article-content :deep(h1) {
  font-size: 1.8rem;
}

.article-content :deep(h2) {
  font-size: 1.5rem;
}

.article-content :deep(h3) {
  font-size: 1.3rem;
}

.article-content :deep(strong) {
  color: #00d4ff;
  font-weight: bold;
}

.article-content :deep(em) {
  color: #00ffff;
  font-style: italic;
}

.strategy-sidebar {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.sidebar-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}

.sidebar-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.card-title {
  color: #00d4ff;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: bold;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  position: relative;
  overflow: hidden;
}

.toc-item::before {
  content: '';
  position: absolute;
  left: -100%;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.toc-item:hover::before {
  left: 100%;
}

.toc-item:hover {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}

.toc-item.active {
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  font-weight: bold;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.related-item {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.related-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  transition: left 0.5s ease;
}

.related-item:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
  transform: translateX(5px);
}

.related-item:hover::before {
  left: 100%;
}

.related-item:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

.related-title {
  color: #ffffff;
  margin-bottom: 8px;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-list .el-button {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-weight: 600;
  border: none;
}

.action-list .el-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-list .el-button:active::after {
  width: 300px;
  height: 300px;
}

.action-list .el-button--primary {
  background: linear-gradient(45deg, #00d4ff, #00a8cc);
}

.action-list .el-button--primary:hover {
  background: linear-gradient(45deg, #00a8cc, #007a99);
}

.error-state {
  padding: 100px 0;
}

@media (max-width: 1024px) {
  .container {
    padding: 0 24px;
  }
  
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .strategy-sidebar {
    order: -1;
  }
  
  .sidebar-card {
    display: none;
  }
  
  .actions-card {
    display: block;
  }
  
  .action-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .strategy-header {
    padding: 40px 0 30px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  
  .strategy-title {
    font-size: 2.2rem;
    background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .stat-item {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .action-buttons .el-button {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .strategy-header {
    padding: 30px 0 20px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  
  .strategy-title {
    font-size: 1.8rem;
    background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 15px;
  }
  
  .strategy-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .meta-right {
    align-items: flex-start;
    width: 100%;
  }
  
  .strategy-stats {
    flex-wrap: wrap;
  }
  
  .stat-item {
    font-size: 13px;
    padding: 6px 12px;
    background: rgba(0, 212, 255, 0.05);
    border-radius: 16px;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .action-buttons .el-button {
    flex: 1;
    min-width: 120px;
    padding: 10px 16px;
    font-size: 15px;
    transition: all 0.2s ease;
  }
  
  .action-buttons .el-button:active {
    transform: scale(0.95);
  }
  
  .ai-summary-card {
    padding: 20px;
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  .ai-summary-card:active {
    transform: scale(0.98);
  }
  
  .tags-list {
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .tags-list .el-tag {
    padding: 4px 12px;
    font-size: 13px;
  }
  
  .strategy-article {
    padding: 24px;
    border-radius: 12px;
  }
  
  .sidebar-card {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }
  
  .sidebar-card:active {
    transform: scale(0.98);
  }
  
  .related-item {
    padding: 12px;
    transition: all 0.2s ease;
  }
  
  .related-item:active {
    transform: translateX(3px) scale(0.98);
  }
  
  /* 触摸设备优化 */
  * {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* 优化文本阅读体验 */
  .article-content {
    line-height: 1.7;
    font-size: 16px;
    max-width: 100%;
  }

  /* 统一内容宽度 - 视频和正文共享相同的宽度约束 */
  .strategy-article {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0;
    position: relative;
  }
  
  /* 确保strategy-videos与正文内容宽度完全一致 */
  .strategy-article .strategy-videos {
    width: 100% !important;
    max-width: 100% !important;
    margin: 40px 0 0 0;
    padding: 0 !important;
    box-sizing: border-box !important;
    position: relative;
  }
  
  .article-content :deep(h2) {
    font-size: 1.5rem;
    margin: 25px 0 15px;
  }
  
  .article-content :deep(h3) {
    font-size: 1.3rem;
    margin: 20px 0 12px;
  }
  
  /* 攻略视频样式 - 确保与article-content宽度一致 */
  .strategy-videos {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden;
  }
  
  .videos-title {
    font-size: 20px;
    margin-bottom: 20px;
    color: #00d4ff;
  }
  
  .videos-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }
  
  .video-item {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0, 0, 0, 0.5);
    transition: transform 0.3s ease, border-color 0.3s ease;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }
  
  .video-item:hover {
    transform: translateY(-3px);
    border-color: #00d4ff;
    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
  }
  
  /* 使用全局选择器强制video标签与article-content div宽度完全一致 */
  .strategy-article .article-content,
  .strategy-article .video-item video {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  
  /* 确保video标签没有任何额外的边距或内边距 */
  .strategy-article .video-item {
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
  }
  
  /* 强制video标签本身与article-content宽度一致 */
  .strategy-article video {
    width: 100% !important;
    max-width: 100% !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }
  
  /* 攻略图片样式 */
  .strategy-images {
    margin-top: 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
  }
  
  .images-title {
    font-size: 20px;
    margin-bottom: 20px;
    color: #00d4ff;
  }
  
  .images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    gap: 15px;
    width: 100%;
    max-width: 100%;
  }
  
  /* 确保grid项也能完全响应 */
  .images-grid > * {
    width: 100% !important;
    height: auto !important;
  }
  
  .image-item {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: 100%;
    height: auto;
  }
  
  .image-item:hover {
    transform: translateY(-5px);
    border-color: #00d4ff;
  }
  
  .strategy-image {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    object-fit: contain !important;
    display: block !important;
    margin: 0 auto !important;
    transition: filter 0.3s ease;
    box-sizing: border-box !important;
  }
  
  .image-item:hover .strategy-image {
    filter: brightness(1.1);
  }
  
  /* 平台特定样式优化 */
/* PC平台优化 */
.platform-pc .strategy-body {
  padding: 60px 0;
}

.platform-pc .content-wrapper {
  grid-template-columns: 1fr 320px;
  gap: 50px;
}

.platform-pc .strategy-article {
  padding: 50px;
}

/* 主机平台优化 */
.platform-console .strategy-article {
  padding: 35px;
  background: rgba(0, 0, 0, 0.85);
}

.platform-console .action-buttons .el-button {
  padding: 15px 30px;
  font-size: 18px;
}

/* 移动平台优化 */
.platform-mobile .strategy-article {
  padding: 20px 16px;
  background: transparent;
  border: none;
  box-shadow: none;
}

.platform-mobile .strategy-title {
  font-size: 24px;
  line-height: 1.3;
}

/* 方向响应式样式 */
.orientation-landscape .strategy-meta {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.orientation-portrait .strategy-meta {
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.orientation-landscape .strategy-stats {
  flex-direction: row;
  gap: 15px;
}

.orientation-portrait .strategy-stats {
  flex-wrap: wrap;
  gap: 10px;
}

/* 交互模式适配 */
.interaction-touch .action-buttons .el-button,
.interaction-touch .action-list .el-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-size: 16px;
}

.interaction-pointer .action-buttons .el-button:hover,
.interaction-pointer .action-list .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* 图片预览样式 */
  .image-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  
  .preview-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .preview-image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    right: -40px;
    background-color: #00d4ff;
    color: #000;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .close-button:hover {
    background-color: #fff;
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    .close-button {
      right: 10px;
      top: -40px;
    }
    
    /* 视频响应式设计 */
    .strategy-videos {
      margin-top: 30px;
    }
    
    .videos-title {
      font-size: 18px;
      margin-bottom: 15px;
    }
    
    .video-item {
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    /* 图片响应式调整 */
    .images-title {
      font-size: 18px;
      margin-bottom: 15px;
    }
    
    .images-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }
  }
}
</style>