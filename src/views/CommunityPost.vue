<template>
  <div class="community-post-container">
    <div class="post-detail">
      <div class="post-header">
        <div class="user-info">
          <img :src="currentPost.author.avatar || '/default-avatar.svg'" alt="用户头像" class="user-avatar">
          <div class="user-meta">
            <div class="username">{{ currentPost.author.username }}</div>
            <div class="post-time">{{ formatDate(currentPost.created_at) }}</div>
          </div>
          <el-button v-if="showFollowButton" type="primary" size="small">关注</el-button>
        </div>
        <el-tag>{{ currentPost.category }}</el-tag>
      </div>
      
      <div class="post-content">
        <h1 class="post-title">{{ currentPost.title }}</h1>
        <div class="post-body">
          {{ currentPost.content }}
        </div>
      </div>
      
      <div class="post-actions">
        <el-button :icon="likeIcon" @click="toggleLike" type="text" class="action-btn">
          {{ isLiked ? '已点赞' : '点赞' }} ({{ currentPost.like_count }})
        </el-button>
        <el-button icon="ChatDotRound" type="text" class="action-btn">
          评论 ({{ currentPost.comment_count }})
        </el-button>
        <el-button icon="Share" type="text" class="action-btn">
          分享
        </el-button>
      </div>
    </div>
    
    <div class="comments-section">
      <h3>评论 ({{ comments.length }})</h3>
      
      <!-- 评论输入框 -->
      <div class="comment-input-section">
        <img src="/default-avatar.svg" alt="你的头像" class="comment-avatar">
        <div class="comment-input-wrapper">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            resize="none"
          />
          <div class="comment-actions">
            <el-button @click="submitComment" type="primary" :disabled="!newComment.trim()">
              发表评论
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 评论列表 -->
      <div class="comments-list">
        <div class="comment-item" v-for="comment in comments" :key="comment.id">
          <img :src="comment.author.avatar || '/default-avatar.svg'" alt="评论者头像" class="comment-avatar">
          <div class="comment-content">
            <div class="comment-header">
              <div class="comment-username">{{ comment.author.username }}</div>
              <div class="comment-time">{{ formatDate(comment.created_at) }}</div>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-actions">
              <el-button type="text" size="small" @click="toggleCommentLike(comment.id)">
                <el-icon v-if="!comment.is_liked"><Like /></el-icon>
              <el-icon v-else><LikeFilled /></el-icon>
                {{ comment.like_count }}
              </el-button>
              <el-button type="text" size="small" @click="replyComment(comment.id)">回复</el-button>
            </div>
            
            <!-- 回复列表 -->
            <div class="replies" v-if="comment.replies && comment.replies.length > 0">
              <div class="reply-item" v-for="reply in comment.replies" :key="reply.id">
                <div class="reply-content">
                  <span class="reply-username">{{ reply.author.username }}</span>
                  <span class="reply-text">{{ reply.content }}</span>
                </div>
                <div class="reply-actions">
                  <div class="reply-time">{{ formatDate(reply.created_at) }}</div>
                  <el-button type="text" size="small">回复</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 相关推荐 -->
    <div class="related-posts">
      <h3>相关推荐</h3>
      <div class="related-post-item" v-for="post in relatedPosts" :key="post.id" @click="goToPost(post.id)">
        <h4>{{ post.title }}</h4>
        <div class="related-meta">
          <span>{{ post.comment_count }} 评论</span>
          <span>{{ post.like_count }} 点赞</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Like, LikeFilled, ChatDotRound, Share } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const { id } = route.params

// 响应式数据
const currentPost = ref({
  id: parseInt(id),
  title: '',
  content: '',
  category: '',
  created_at: new Date(),
  author: {
    id: 1,
    username: '',
    avatar: ''
  },
  comment_count: 0,
  like_count: 0,
  view_count: 0
})

const comments = ref([])
const relatedPosts = ref([])
const newComment = ref('')
const isLiked = ref(false)
const showFollowButton = ref(true)

// 模拟数据
const mockPostData = {
  1: {
    id: 1,
    title: '《原神》4.5版本新角色解析',
    content: '新版本终于要上线了，这次的新角色看起来很强力，尤其是她的元素爆发效果非常炫酷。经过测试服的数据，她的输出能力在同类型角色中算是顶尖水平。\n\n主要技能亮点：\n1. 元素战技可以提供持续的元素附着\n2. 元素爆发拥有大范围的AOE伤害\n3. 突破材料相对容易获取\n\n建议配队思路：\n- 主C搭配副C可以最大化输出\n- 辅助角色推荐带护盾和治疗\n\n总体来说，这个角色非常值得抽取，特别是对于喜欢打输出的玩家来说。',
    category: '讨论',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    author: {
      id: 1,
      username: '旅行者',
      avatar: '/avatar1.png'
    },
    comment_count: 42,
    like_count: 128,
    view_count: 567
  },
  2: {
    id: 2,
    title: '分享我的《英雄联盟》排位上分心得',
    content: '经过一个赛季的努力，终于打到了大师段位。在这里分享一些我的上分心得...\n\n1. 选择版本强势英雄\n每个版本都有一些特别强势的英雄，选择这些英雄可以让你的上分之路更加顺畅。\n\n2. 专注于一到两个位置\n不要尝试精通所有位置，专注于你最擅长的位置会让你进步更快。\n\n3. 保持良好心态\n游戏中经常会遇到逆风局，保持冷静和团队沟通是翻盘的关键。\n\n4. 学习职业选手的打法\n观看职业比赛和直播可以学习到很多高端技巧和意识。\n\n希望这些心得对大家有所帮助！',
    category: '分享',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000),
    author: {
      id: 2,
      username: '峡谷王者',
      avatar: '/avatar2.png'
    },
    comment_count: 89,
    like_count: 256,
    view_count: 1200
  }
}

const mockComments = [
  {
    id: 1,
    content: '分析得很到位！我也觉得这个新角色会很强。',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
    author: {
      id: 3,
      username: '原神爱好者',
      avatar: '/avatar3.png'
    },
    like_count: 15,
    is_liked: false,
    replies: [
      {
        id: 11,
        content: '是的，我已经准备好了原石！',
        created_at: new Date(Date.now() - 30 * 60 * 1000),
        author: {
          id: 4,
          username: '原石收藏家',
          avatar: '/avatar4.png'
        }
      }
    ]
  },
  {
    id: 2,
    content: '期待新版本的到来！',
    created_at: new Date(Date.now() - 30 * 60 * 1000),
    author: {
      id: 5,
      username: '萌新玩家',
      avatar: '/avatar5.png'
    },
    like_count: 8,
    is_liked: true
  }
]

// 计算属性
const likeIcon = computed(() => isLiked.value ? LikeFilled : Like)

// 方法
const loadPostData = () => {
  // 模拟加载帖子数据
  const post = mockPostData[id] || {
    id: parseInt(id),
    title: '帖子不存在',
    content: '抱歉，您访问的帖子不存在或已被删除。',
    category: '未知',
    created_at: new Date(),
    author: {
      id: 0,
      username: '未知用户',
      avatar: ''
    },
    comment_count: 0,
    like_count: 0,
    view_count: 0
  }
  
  currentPost.value = post
  comments.value = mockComments
  
  // 模拟相关推荐
  relatedPosts.value = Object.values(mockPostData).filter(p => p.id !== parseInt(id))
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  currentPost.value.like_count += isLiked.value ? 1 : -1
  ElMessage.success(isLiked.value ? '点赞成功' : '取消点赞')
}

const toggleCommentLike = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.is_liked = !comment.is_liked
    comment.like_count += comment.is_liked ? 1 : -1
  }
}

const replyComment = (commentId) => {
  ElMessage.info('回复功能开发中')
}

const submitComment = () => {
  if (!newComment.value.trim()) return
  
  const newCommentObj = {
    id: Date.now(),
    content: newComment.value.trim(),
    created_at: new Date(),
    author: {
      id: 100,
      username: '当前用户',
      avatar: '/user-avatar.png'
    },
    like_count: 0,
    is_liked: false
  }
  
  comments.value.unshift(newCommentObj)
  currentPost.value.comment_count += 1
  newComment.value = ''
  ElMessage.success('评论发布成功')
}

const goToPost = (postId) => {
  router.push(`/community/post/${postId}`)
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return new Date(date).toLocaleDateString()
  }
}

// 生命周期
onMounted(() => {
  loadPostData()
})
</script>

<style scoped>
.community-post-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.post-detail,
.comments-section,
.related-posts {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 帖子头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.username {
  font-weight: 500;
  font-size: 16px;
  color: #333;
}

.post-time {
  font-size: 14px;
  color: #909399;
}

/* 帖子内容 */
.post-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
  line-height: 1.4;
}

.post-body {
  color: #606266;
  line-height: 1.8;
  font-size: 16px;
  white-space: pre-line;
}

/* 帖子操作 */
.post-actions {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.action-btn {
  font-size: 14px;
  color: #606266;
}

.action-btn:hover {
  color: #409eff;
}

/* 评论区 */
.comments-section h3,
.related-posts h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.comment-input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-input-wrapper {
  flex: 1;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 评论列表 */
.comment-item {
  display: flex;
  gap: 12px;
  padding: 20px 0;
  border-bottom: 1px solid #f5f7fa;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-username {
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
}

.comment-actions {
  display: flex;
  gap: 20px;
  margin-top: 0;
}

/* 回复 */
.replies {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 2px solid #ebeef5;
}

.reply-item {
  padding: 10px 0;
}

.reply-content {
  display: flex;
  gap: 8px;
  margin-bottom: 5px;
}

.reply-username {
  font-weight: 500;
  color: #333;
}

.reply-text {
  color: #606266;
  flex: 1;
}

.reply-actions {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.reply-time {
  color: #909399;
}

/* 相关推荐 */
.related-post-item {
  padding: 15px 0;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: color 0.3s;
}

.related-post-item:hover h4 {
  color: #409eff;
}

.related-post-item:last-child {
  border-bottom: none;
}

.related-post-item h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
}

.related-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #909399;
}

@media (max-width: 768px) {
  .community-post-container {
    padding: 10px;
  }
  
  .post-detail,
  .comments-section,
  .related-posts {
    padding: 16px;
  }
  
  .post-title {
    font-size: 20px;
  }
}
</style>