<template>
  <div class="about-view">
    <!-- 移除顶部导航栏 -->
    
    <!-- 内容区域 -->
    <div class="content-wrapper">
      <div class="content-scroll">
        <!-- 添加返回按钮在顶部 -->
        <div class="top-actions">
          <button class="back-button-pill" @click="goBack">
            <span class="back-icon">←</span>
            返回
          </button>
        </div>
        
        <div class="app-info">
          <h2 class="app-name">一基暴富</h2>
          <p class="app-version">Version: 2.3.9</p>
          <p class="app-author">By: rizona.cn@gmail.com</p>
        </div>

        <div class="divider"></div>

        <div class="update-log-section">
          <h3 class="section-title">更新日志</h3>
          <div class="log-carousel-wrapper">
            <div class="log-carousel" :style="{ transform: `translateY(-${currentLogIndex * 100}%)` }">
              <div 
                v-for="(log, index) in updateLogs" 
                :key="log.id"
                class="log-item"
                :class="{ active: index === currentLogIndex }"
              >
                <h4 class="log-version">{{ log.version }}</h4>
                <p class="log-description">{{ log.description }}</p>
              </div>
            </div>
            
            <div class="carousel-indicators">
              <button
                v-for="(log, index) in updateLogs"
                :key="log.id"
                :class="{ active: index === currentLogIndex }"
                @click="goToLog(index)"
              ></button>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="features-section">
          <h3 class="section-title">功能介绍</h3>
          <p class="features-intro">跟踪管理多客户基金持仓，提供最新净值查询、收益统计等功能。</p>
          
          <p class="features-subtitle">主要包括：</p>
          
          <div class="features-list">
            <div class="feature-item">
              <span class="bullet-point" style="color: #3498DB;">●</span>
              <span class="feature-text">数据自动化：自动更新净值数据。</span>
            </div>
            <div class="feature-item">
              <span class="bullet-point" style="color: #2ECC71;">●</span>
              <span class="feature-text">数据持久化：本地保存客户数据。</span>
            </div>
            <div class="feature-item">
              <span class="bullet-point" style="color: #E74C3C;">●</span>
              <span class="feature-text">客户多重管理：分组查看管理持仓。</span>
            </div>
            <div class="feature-item">
              <span class="bullet-point" style="color: #F39C12;">●</span>
              <span class="feature-text">报告一键生成：模板总结持仓收益。</span>
            </div>
          </div>
        </div>
        
        <!-- 底部装饰性分隔线 -->
        <div class="divider decorative"></div>
      </div>
    </div>

    <!-- 药丸状按钮 -->
    <div class="action-footer">
      <button class="pill-button" @click="goBack">
        <span class="button-text">朕知道了</span>
        <span class="button-sparkle">✨</span>
        <span class="button-glow"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface UpdateLog {
  id: string
  version: string
  description: string
}

const updateLogs: UpdateLog[] = [
  { id: '1', version: 'Version 1.0.0', description: 'MMP项目构建。' },
  { id: '2', version: 'Version 2.0.0', description: '项目重构CFMS。\n重做UI界面。' },
  { id: '3', version: 'Version 2.1.0', description: '编辑持仓页面完善客户号显示搜索。' },
  { id: '4', version: 'Version 2.2.0', description: '增加自定义导航栏。\n添加iOS15版本兼容。' },
  { id: '5', version: 'Version 2.3.0', description: '后端构建。\n新增用户分层、云端备份、生物登录模块。' },
  { id: '6', version: 'Version X.', description: 'To be continued...' }
]

const currentLogIndex = ref(0)
let carouselInterval: number | null = null

const startCarousel = () => {
  carouselInterval = window.setInterval(() => {
    currentLogIndex.value = (currentLogIndex.value + 1) % updateLogs.length
  }, 3000)
}

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

const goToLog = (index: number) => {
  currentLogIndex.value = index
  stopCarousel()
  setTimeout(startCarousel, 5000)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  stopCarousel()
})
</script>

<style scoped>
.about-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  position: relative;
}

.top-actions {
  padding: 16px 16px 0;
  margin-bottom: 8px;
}

.back-button-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button-pill:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateX(-2px);
}

.back-icon {
  font-size: 16px;
  line-height: 1;
}

.content-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 0 16px;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 100px; /* 为底部按钮留出空间 */
}

.app-info {
  margin-bottom: 24px;
  text-align: center;
  padding-top: 8px;
}

.app-name {
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-version {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 4px;
  font-weight: 500;
}

.app-author {
  font-size: 14px;
  color: var(--text-secondary);
  opacity: 0.8;
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 24px 0;
}

.divider.decorative {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  margin: 32px 0;
  opacity: 0.5;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
}

.log-carousel-wrapper {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  height: 180px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.log-carousel {
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.log-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.log-version {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.log-description {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-line;
  max-width: 80%;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.carousel-indicators button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-indicators button.active {
  background: var(--accent-color);
  transform: scale(1.3);
  box-shadow: 0 0 8px rgba(var(--accent-color-rgb), 0.5);
}

.features-section {
  margin-top: 24px;
}

.features-intro {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
  text-align: center;
}

.features-subtitle {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.bullet-point {
  font-size: 20px;
  line-height: 1;
  margin-top: 2px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.feature-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.4;
  flex: 1;
}

.action-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 16px;
  background: linear-gradient(transparent, var(--bg-primary) 70%);
  z-index: 10;
  display: flex;
  justify-content: center;
}

.pill-button {
  position: relative;
  width: 100%;
  max-width: 320px;
  padding: 16px 32px;
  background: linear-gradient(135deg, var(--accent-color), #667eea);
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(var(--accent-color-rgb), 0.3);
}

.pill-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 48px rgba(var(--accent-color-rgb), 0.4);
}

.pill-button:active {
  transform: translateY(-1px) scale(0.98);
}

.button-text {
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.button-sparkle {
  position: relative;
  z-index: 2;
  font-size: 16px;
  animation: sparkle 2s infinite;
}

.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.3), transparent 70%);
  border-radius: 999px;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pill-button:hover .button-glow {
  opacity: 1;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 滚动条样式 */
.content-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

@media (max-width: 768px) {
  .app-name {
    font-size: 32px;
  }
  
  .log-carousel-wrapper {
    height: 160px;
    padding: 16px;
  }
  
  .log-version {
    font-size: 16px;
  }
  
  .log-description {
    font-size: 14px;
  }
  
  .pill-button {
    max-width: 280px;
    padding: 14px 28px;
    font-size: 16px;
  }
  
  .action-footer {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .app-name {
    font-size: 28px;
  }
  
  .features-list {
    gap: 8px;
  }
  
  .feature-item {
    padding: 12px;
  }
  
  .pill-button {
    max-width: 240px;
    padding: 12px 24px;
    font-size: 16px;
  }
}
</style>