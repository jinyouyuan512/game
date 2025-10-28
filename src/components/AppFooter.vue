<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- 主要内容区域 -->
      <div class="footer-content">
        <!-- 品牌信息 -->
        <div class="footer-brand">
          <div class="brand-logo">
            <el-icon size="32"><Trophy /></el-icon>
            <h3>游戏攻略站</h3>
          </div>
          <p class="brand-description">
            专业的游戏攻略分享平台，为玩家提供最全面、最实用的游戏攻略和AI智能助手服务。
          </p>
          <div class="social-links">
            <el-tooltip content="关注微博" placement="top">
              <el-button circle :icon="Share" @click="openSocial('weibo')" />
            </el-tooltip>
            <el-tooltip content="加入QQ群" placement="top">
              <el-button circle :icon="ChatDotRound" @click="openSocial('qq')" />
            </el-tooltip>
            <el-tooltip content="关注微信" placement="top">
              <el-button circle :icon="Message" @click="openSocial('wechat')" />
            </el-tooltip>
            <el-tooltip content="GitHub" placement="top">
              <el-button circle :icon="Link" @click="openSocial('github')" />
            </el-tooltip>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="footer-links">
          <div class="link-group">
            <h4>游戏分类</h4>
            <ul>
              <li><a href="/games?category=rpg">角色扮演</a></li>
              <li><a href="/games?category=action">动作游戏</a></li>
              <li><a href="/games?category=strategy">策略游戏</a></li>
              <li><a href="/games?category=simulation">模拟经营</a></li>
              <li><a href="/games?category=sports">体育竞技</a></li>
            </ul>
          </div>

          <div class="link-group">
            <h4>热门攻略</h4>
            <ul>
              <li><a href="/strategies?game=genshin">原神攻略</a></li>
              <li><a href="/strategies?game=honkai">崩坏星穹铁道</a></li>
              <li><a href="/strategies?game=lol">英雄联盟</a></li>
              <li><a href="/strategies?game=minecraft">我的世界</a></li>
              <li><a href="/strategies?game=valorant">无畏契约</a></li>
            </ul>
          </div>

          <div class="link-group">
            <h4>服务支持</h4>
            <ul>
              <li><a href="/help">帮助中心</a></li>
              <li><a href="/feedback">意见反馈</a></li>
              <li><a href="/contact">联系我们</a></li>
              <li><a href="/api">开发者API</a></li>
              <li><a href="/sitemap">网站地图</a></li>
            </ul>
          </div>

          <div class="link-group">
            <h4>关于我们</h4>
            <ul>
              <li><a href="/about">关于平台</a></li>
              <li><a href="/team">团队介绍</a></li>
              <li><a href="/careers">加入我们</a></li>
              <li><a href="/press">媒体报道</a></li>
              <li><a href="/partners">合作伙伴</a></li>
            </ul>
          </div>
        </div>

        <!-- 订阅和统计 -->
        <div class="footer-subscribe">
          <h4>订阅更新</h4>
          <p>订阅我们的邮件列表，获取最新游戏攻略和资讯</p>
          <div class="subscribe-form">
            <el-input
              v-model="email"
              placeholder="输入您的邮箱地址"
              class="subscribe-input"
            >
              <template #append>
                <el-button type="primary" @click="handleSubscribe">
                  订阅
                </el-button>
              </template>
            </el-input>
          </div>
          
          <div class="footer-stats">
            <div class="stat-item">
              <span class="stat-number">{{ formatNumber(stats.totalGames) }}</span>
              <span class="stat-label">游戏收录</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ formatNumber(stats.totalStrategies) }}</span>
              <span class="stat-label">攻略文章</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ formatNumber(stats.totalUsers) }}</span>
              <span class="stat-label">注册用户</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; {{ currentYear }} 游戏攻略站. All rights reserved.</p>
          <div class="legal-links">
            <a href="/privacy">隐私政策</a>
            <span class="separator">|</span>
            <a href="/terms">服务条款</a>
            <span class="separator">|</span>
            <a href="/cookies">Cookie政策</a>
            <span class="separator">|</span>
            <a href="/disclaimer">免责声明</a>
          </div>
        </div>
        
        <div class="footer-info">
          <p>
            <el-icon><Location /></el-icon>
            中国·北京 | 
            <el-icon><Phone /></el-icon>
            400-123-4567 | 
            <el-icon><Message /></el-icon>
            contact@gamestrategyhub.com
          </p>
          <p class="icp-info">
            京ICP备12345678号-1 | 京公网安备11010802012345号
          </p>
        </div>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <el-backtop :right="30" :bottom="30">
      <div class="backtop-button">
        <el-icon><Top /></el-icon>
      </div>
    </el-backtop>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Trophy,
  Share,
  ChatDotRound,
  Message,
  Link,
  Location,
  Phone,
  Top
} from '@element-plus/icons-vue'

// 响应式数据
const email = ref('')
const stats = ref({
  totalGames: 1250,
  totalStrategies: 8900,
  totalUsers: 45600
})

// 计算属性
const currentYear = computed(() => new Date().getFullYear())

// 方法
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const handleSubscribe = () => {
  if (!email.value) {
    ElMessage.warning('请输入邮箱地址')
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    ElMessage.error('请输入有效的邮箱地址')
    return
  }

  // 这里应该调用API进行邮箱订阅
  ElMessage.success('订阅成功！感谢您的关注')
  email.value = ''
}

const openSocial = (platform) => {
  const urls = {
    weibo: 'https://weibo.com/gamestrategyhub',
    qq: 'https://qm.qq.com/cgi-bin/qm/qr?k=example',
    wechat: '#', // 显示二维码弹窗
    github: 'https://github.com/gamestrategyhub'
  }
  
  if (platform === 'wechat') {
    ElMessage.info('微信二维码功能开发中...')
    return
  }
  
  window.open(urls[platform], '_blank')
}

const loadStats = async () => {
  try {
    // 这里应该从API获取实际统计数据
    // const response = await api.getStats()
    // stats.value = response.data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// 生命周期
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 40px;
  padding: 60px 0 40px;
}

/* 品牌信息 */
.footer-brand {
  max-width: 300px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.brand-logo .el-icon {
  color: #00d4ff;
}

.brand-logo h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(45deg, #00d4ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-description {
  color: #b0b0b0;
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 14px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-links .el-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  transition: all 0.3s;
}

.social-links .el-button:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
  transform: translateY(-2px);
}

/* 快速链接 */
.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.link-group h4 {
  color: #00d4ff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
}

.link-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-group li {
  margin-bottom: 8px;
}

.link-group a {
  color: #b0b0b0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.link-group a:hover {
  color: #00d4ff;
}

/* 订阅区域 */
.footer-subscribe h4 {
  color: #00d4ff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.footer-subscribe p {
  color: #b0b0b0;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.subscribe-form {
  margin-bottom: 30px;
}

.subscribe-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.subscribe-input :deep(.el-input__inner) {
  color: #ffffff;
}

.subscribe-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.subscribe-input :deep(.el-input-group__append) {
  background: linear-gradient(45deg, #00d4ff, #0099cc);
  border: none;
}

.footer-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #00d4ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #b0b0b0;
}

/* 底部版权 */
.footer-bottom {
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  padding: 30px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.copyright p {
  margin: 0 0 8px 0;
  color: #b0b0b0;
  font-size: 14px;
}

.legal-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legal-links a {
  color: #b0b0b0;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s;
}

.legal-links a:hover {
  color: #00d4ff;
}

.separator {
  color: #666;
}

.footer-info {
  text-align: right;
}

.footer-info p {
  margin: 0 0 4px 0;
  color: #b0b0b0;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.footer-info .el-icon {
  color: #00d4ff;
  font-size: 14px;
}

.icp-info {
  font-size: 12px !important;
  color: #888 !important;
}

/* 返回顶部按钮 */
.backtop-button {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #00d4ff, #0099cc);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  transition: all 0.3s;
}

.backtop-button:hover {
  background: linear-gradient(45deg, #00ffff, #00d4ff);
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  
  .footer-subscribe {
    grid-column: 1 / -1;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 40px 0 30px;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .footer-info {
    text-align: center;
  }
  
  .footer-info p {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .footer-stats {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 0 16px;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .legal-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* 深色主题适配 */
:global(.dark) .app-footer {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%);
}

:global(.dark) .subscribe-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 212, 255, 0.2);
}

:global(.dark) .social-links .el-button {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 212, 255, 0.2);
}

:global(.dark) .footer-bottom {
  border-top-color: rgba(0, 212, 255, 0.1);
}
</style>