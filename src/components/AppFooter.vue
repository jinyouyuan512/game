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
/* 基础样式和变量 */
:root {
  --footer-primary: #00d4ff;
  --footer-primary-dark: #0099cc;
  --footer-primary-light: #00ffff;
  --footer-bg-start: #1a1a2e;
  --footer-bg-middle: #16213e;
  --footer-bg-end: #0f3460;
  --footer-text-primary: #ffffff;
  --footer-text-secondary: #b0b0b0;
  --footer-text-muted: #888;
  --footer-border: rgba(0, 212, 255, 0.2);
  --footer-border-dark: rgba(0, 212, 255, 0.1);
  --footer-hover-bg: rgba(0, 212, 255, 0.2);
  --footer-button-bg: rgba(255, 255, 255, 0.1);
}

.app-footer {
  background: linear-gradient(135deg, var(--footer-bg-start) 0%, var(--footer-bg-middle) 50%, var(--footer-bg-end) 100%);
  color: var(--footer-text-primary);
  margin-top: auto;
  position: relative;
  overflow: hidden;
}

/* 装饰元素 */
.app-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--footer-primary), var(--footer-primary-light), var(--footer-primary), var(--footer-primary-dark));
  z-index: 2;
  animation: gradientFlow 8s linear infinite;
  background-size: 200% 100%;
}

/* 装饰圆形 */
.footer-decoration {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle-1 {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
  top: -150px;
  right: -150px;
  animation: float 15s ease-in-out infinite;
}

.decoration-circle-2 {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.05) 0%, transparent 70%);
  bottom: -100px;
  left: -100px;
  animation: float 12s ease-in-out infinite reverse;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 40px;
  padding: 60px 0 40px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
  animation-delay: 0.2s;
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
  position: relative;
  overflow: hidden;
}

.brand-logo .el-icon {
  color: var(--footer-primary);
  font-size: 28px;
  transition: transform 0.3s ease;
}

.brand-logo:hover .el-icon {
  transform: rotate(360deg);
}

.brand-logo h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(45deg, var(--footer-primary), var(--footer-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.brand-logo h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--footer-primary), transparent);
  transition: width 0.3s ease;
}

.brand-logo:hover h3::after {
  width: 100%;
}

.brand-description {
  color: var(--footer-text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 14px;
  transition: color 0.3s ease;
}

.brand-description:hover {
  color: var(--footer-text-primary);
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-links .el-button {
  background: var(--footer-button-bg);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--footer-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.social-links .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.social-links .el-button:hover {
  background: var(--footer-hover-bg);
  border-color: var(--footer-primary);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
}

.social-links .el-button:hover::before {
  left: 100%;
}

/* 快速链接 */
.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.link-group h4 {
  color: var(--footer-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
  position: relative;
  transition: color 0.3s ease;
}

.link-group h4::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background: var(--footer-primary);
  transition: width 0.3s ease;
}

.link-group:hover h4::after {
  width: 100%;
}

.link-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-group li {
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.link-group a {
  color: var(--footer-text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  padding-left: 0;
}

.link-group a::before {
  content: '→';
  position: absolute;
  left: -15px;
  opacity: 0;
  transition: all 0.3s ease;
  color: var(--footer-primary);
}

.link-group a:hover {
  color: var(--footer-primary);
  padding-left: 15px;
  transform: translateX(5px);
}

.link-group a:hover::before {
  left: 0;
  opacity: 1;
}

/* 订阅区域 */
.footer-subscribe h4 {
  color: var(--footer-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  transition: color 0.3s ease;
}

.footer-subscribe p {
  color: var(--footer-text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.subscribe-form {
  margin-bottom: 30px;
  position: relative;
}

.subscribe-input {
  position: relative;
}

.subscribe-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  transition: all 0.3s ease;
  border-radius: 8px;
}

.subscribe-input:focus-within :deep(.el-input__wrapper) {
  border-color: var(--footer-primary);
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

.subscribe-input :deep(.el-input__inner) {
  color: var(--footer-text-primary);
  font-size: 14px;
}

.subscribe-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.subscribe-input :deep(.el-input-group__append) {
  background: linear-gradient(45deg, var(--footer-primary), var(--footer-primary-dark));
  border: none;
  transition: all 0.3s ease;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
}

.subscribe-input :deep(.el-input-group__append):hover {
  background: linear-gradient(45deg, var(--footer-primary-light), var(--footer-primary));
  transform: translateY(-1px);
}

.subscribe-input :deep(.el-input-group__append .el-button) {
  border: none;
  background: transparent;
  color: white;
  height: 100%;
  border-radius: 0 8px 8px 0;
}

.footer-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  flex: 1;
  position: relative;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(0, 212, 255, 0.1);
  transform: translateY(-3px);
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--footer-primary);
  margin-bottom: 4px;
  position: relative;
  animation: countUp 2s ease-out;
}

.stat-label {
  font-size: 12px;
  color: var(--footer-text-secondary);
  transition: color 0.3s ease;
}

.stat-item:hover .stat-label {
  color: var(--footer-text-primary);
}

/* 底部版权 */
.footer-bottom {
  border-top: 1px solid var(--footer-border);
  padding: 30px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
  z-index: 2;
}

.copyright p {
  margin: 0 0 8px 0;
  color: var(--footer-text-secondary);
  font-size: 14px;
  transition: color 0.3s ease;
}

.copyright:hover p {
  color: var(--footer-text-primary);
}

.legal-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.legal-links a {
  color: var(--footer-text-secondary);
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s ease;
  position: relative;
  padding: 2px 0;
}

.legal-links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 1px;
  background: var(--footer-primary);
  transition: width 0.3s ease;
}

.legal-links a:hover {
  color: var(--footer-primary);
}

.legal-links a:hover::after {
  width: 100%;
}

.separator {
  color: #666;
  font-size: 12px;
}

.footer-info {
  text-align: right;
}

.footer-info p {
  margin: 0 0 4px 0;
  color: var(--footer-text-secondary);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  transition: color 0.3s ease;
}

.footer-info p:hover {
  color: var(--footer-text-primary);
}

.footer-info .el-icon {
  color: var(--footer-primary);
  font-size: 14px;
  transition: transform 0.3s ease;
}

.footer-info p:hover .el-icon {
  transform: scale(1.2);
}

.icp-info {
  font-size: 12px !important;
  color: var(--footer-text-muted) !important;
}

/* 返回顶部按钮 */
.backtop-button {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, var(--footer-primary), var(--footer-primary-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.backtop-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

.backtop-button:hover {
  background: linear-gradient(45deg, var(--footer-primary-light), var(--footer-primary));
  transform: scale(1.1) translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .footer-container {
    max-width: 100%;
    padding: 0 30px;
  }
}

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
  
  .decoration-circle-1 {
    width: 250px;
    height: 250px;
    top: -125px;
    right: -125px;
  }
  
  .decoration-circle-2 {
    width: 150px;
    height: 150px;
    bottom: -75px;
    left: -75px;
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
  
  .decoration-circle-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    right: -100px;
  }
  
  .decoration-circle-2 {
    width: 120px;
    height: 120px;
    bottom: -60px;
    left: -60px;
  }
  
  .brand-logo h3 {
    font-size: 18px;
  }
  
  .social-links {
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
  
  .stat-number {
    font-size: 20px;
  }
  
  .backtop-button {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .decoration-circle-1 {
    width: 150px;
    height: 150px;
    top: -75px;
    right: -75px;
  }
  
  .decoration-circle-2 {
    width: 100px;
    height: 100px;
    bottom: -50px;
    left: -50px;
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
  border-top-color: var(--footer-border-dark);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes shine {
  0% {
    left: -50%;
    opacity: 0;
  }
  10%, 90% {
    opacity: 0.4;
  }
  100% {
    left: 150%;
    opacity: 0;
  }
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>