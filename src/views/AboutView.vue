<template>
  <div class="about-view">
    <!-- 自定义导航栏 -->
    <div class="custom-navbar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
        返回
      </button>
      <h1 class="page-title">关于 CFMS</h1>
      <div class="nav-spacer"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <div class="content-scroll">
        <div class="app-info">
          <h2 class="app-name">一基暴富</h2>
          <p class="app-version">Version: 2.3.9      By: rizona.cn@gmail.com</p>
        </div>

        <div class="divider"></div>

        <div class="update-log-section">
          <h3 class="section-title">更新日志：</h3>
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
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="action-footer">
      <button class="primary-button" @click="goBack">
        朕知道了
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
  // 重新启动轮播
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
}

.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.back-icon {
  font-size: 18px;
  line-height: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.nav-spacer {
  width: 80px; /* 与返回按钮宽度一致保持居中 */
}

.content-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 20px;
}

.app-info {
  margin-bottom: 24px;
}

.app-name {
  font-size: 32px;
  font-weight: bold;
  color: #FFD700;
  margin-bottom: 8px;
}

.app-version {
  font-size: 14px;
  color: var(--text-secondary);
  opacity: 0.8;
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 24px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.log-carousel-wrapper {
  background: var(--bg-hover);
  border-radius: 12px;
  padding: 16px;
  height: 200px;
  position: relative;
  overflow: hidden;
}

.log-carousel {
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.log-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.log-version {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.log-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-line;
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
  transform: scale(1.2);
}

.features-section {
  margin-top: 24px;
}

.features-intro {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.features-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
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
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.bullet-point {
  font-size: 20px;
  line-height: 1;
  margin-top: 2px;
}

.feature-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
  flex: 1;
}

.action-footer {
  padding: 16px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
}

.primary-button {
  width: 100%;
  padding: 14px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
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
  .content-wrapper {
    padding: 12px;
  }
  
  .app-name {
    font-size: 28px;
  }
  
  .log-carousel-wrapper {
    height: 180px;
  }
}
</style>