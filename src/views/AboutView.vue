<template>
  <div class="about-view">
    <div class="fixed-top-section">
      <div class="top-container">
        <div class="top-header">
          <button class="back-button-pill" @click="goBack">
            <span class="back-icon">←</span>
            返回
          </button>
        </div>
        
        <div class="app-title-container">
          <h2 class="app-name">CFMS · 一基暴富</h2>
        </div>
        
        <div class="app-info">
          <div class="app-meta">
            <p class="app-version">Version: 3.0.0</p>
            <p class="app-author">©2025 rizona.cn@gmail.com</p>
            <p class="app-github">项目地址:github.com/rizona27/CFMS-PWA</p>
            <p class="app-support">支持的话请我喝一杯吧~</p>
          </div>
          <div class="app-qr-code">
            <a href="javascript:void(0)" @click.prevent class="qr-link">
              <img
                :src="wxpayQR"
                alt="微信支付二维码"
                class="wxpay-qr"
                @contextmenu.prevent
              />
            </a>
          </div>
        </div>

        <div class="stylish-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
              <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" fill-opacity="0.4"/>
            </svg>
          </div>
          <div class="divider-line"></div>
        </div>
      </div>
    </div>
    
    <div class="scrollable-content-section">
      <div class="content-scroll">
        <div class="content-wrapper">
          <div class="update-log-section">
            <h3 class="section-title">更新日志</h3>
            <div class="auto-scroll-container">
              <div
                ref="scrollContentRef"
                class="scroll-content"
                :style="{ transform: `translateY(-${Math.round(scrollOffset)}px)` }"
                @mouseenter="pauseScroll"
                @mouseleave="resumeScroll"
              >
                <div v-for="(log, index) in scrollLogs" :key="index" class="log-item">
                  <div class="log-header">
                    <span class="log-version">{{ log.version }}</span>
                  </div>
                  <div class="log-content">
                    <p class="log-description">{{ log.description }}</p>
                  </div>
                </div>
              </div>
              <div class="scroll-mask top-mask"></div>
              <div class="scroll-mask bottom-mask"></div>
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
                <span class="feature-text">数据持久化：本地/云保存数据。</span>
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
          
          <div class="divider decorative"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// 导入微信支付二维码图片
import wxpayQR from '../assets/wxpay.png'

const router = useRouter()

interface UpdateLog {
  id: string
  version: string
  description: string
}

// 更新日志数据 - 倒序排列，新版本在前，方便编辑
const updateLogs: UpdateLog[] = [
  { id: '3', version: 'Version 3.0.0', description: '在CFMS基础上构建PWA版本。\n支持多端同步。' },
  { id: '2', version: 'Version 2.0.0', description: '项目重构CFMS。\n重做UI界面。' },
  { id: '1', version: 'Version 1.0.0', description: '初代MMP项目构建。' }
]

// 复制两份内容以实现无缝滚动
const scrollLogs = computed(() => [...updateLogs, ...updateLogs])

const scrollContentRef = ref<HTMLElement | null>(null) // DOM 引用
const scrollOffset = ref(0)
const scrollSpeed = 20 // 像素/秒
let singleSetHeight = 0 // 精确计算后赋值
let animationId: number | null = null
let lastTimestamp: number | null = null
let isPaused = false

// 精确计算单组数据的高度
const calculateSingleSetHeight = () => {
  if (!scrollContentRef.value) return 0
  
  // 选取所有日志项
  const logItems = scrollContentRef.value.querySelectorAll('.log-item')
  if (logItems.length === 0) return 0
  
  let totalHeight = 0
  
  // 只计算第一组日志项的高度 (即 updateLogs.length 个)
  for (let i = 0; i < updateLogs.length; i++) {
    const item = logItems[i] as HTMLElement
    // 使用 offsetHeight 获取元素在布局中所占据的精确高度（包括 border 和 padding）
    totalHeight += item.offsetHeight
  }

  // 确保高度大于 0
  return totalHeight > 0 ? totalHeight : 0
}

// 滚动动画逻辑，使用精确高度进行模运算
const startScrollAnimation = (timestamp: number) => {
  if (singleSetHeight === 0) {
    animationId = requestAnimationFrame(startScrollAnimation)
    return
  }
  
  if (!lastTimestamp) lastTimestamp = timestamp
  const elapsed = timestamp - lastTimestamp
  
  if (!isPaused) {
    const scrollDelta = (scrollSpeed * elapsed) / 1000
    // 使用模运算实现无缝循环
    scrollOffset.value = (scrollOffset.value + scrollDelta) % singleSetHeight
  }
  
  lastTimestamp = timestamp
  animationId = requestAnimationFrame(startScrollAnimation)
}

// 暂停滚动（鼠标悬停时）
const pauseScroll = () => {
  isPaused = true
  lastTimestamp = null
}

// 恢复滚动（鼠标离开时）
const resumeScroll = () => {
  isPaused = false
  lastTimestamp = null
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  animationId = requestAnimationFrame(startScrollAnimation)
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  // 1. 等待DOM渲染完成
  await nextTick()
  
  // 2. 精确计算高度并赋值
  singleSetHeight = calculateSingleSetHeight()
  
  // 3. 设置初始滚动位置
  scrollOffset.value = 0
  
  // 4. 延迟一小段时间开始滚动
  setTimeout(() => {
    // 只有在计算出高度后才开始动画，否则会再次请求下一帧进行计算
    if (singleSetHeight > 0) {
      animationId = requestAnimationFrame(startScrollAnimation)
    }
  }, 100)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
/* 确保样式被正确加载 */
.about-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:root.dark .about-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.fixed-top-section {
  flex-shrink: 0;
  z-index: 100;
  padding-top: env(safe-area-inset-top, 0px);
  /* 顶部区域使用透明背景，让整体渐变连续 */
  background: transparent;
}

.top-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.top-header {
  padding: 12px 0 8px;
}

.back-button-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

:root.dark .back-button-pill {
  background: rgba(45, 45, 65, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}

.back-button-pill:hover {
  background: #14B8A6;
  color: white;
  border-color: #14B8A6;
  transform: translateX(-2px);
}

.back-button-pill:active {
  transform: translateX(0) scale(0.98);
}

.back-icon {
  font-size: 16px;
  line-height: 1;
}

.app-title-container {
  text-align: center;
  margin-bottom: 16px;
}

.app-name {
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: inline-block;
}

.app-info {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 12px;
  width: 100%;
}

.app-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.app-version {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
  font-weight: 500;
}

.app-author {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
  opacity: 0.8;
}

.app-github {
  font-size: 11px;
  color: #666;
  opacity: 0.7;
  line-height: 1.2;
  margin-top: 4px;
  margin-bottom: 2px;
}

.app-support {
  font-size: 12px;
  color: #FF6B6B;
  font-style: italic;
  margin-top: 6px;
  opacity: 0.9;
  font-weight: 500;
}

:root.dark .app-version,
:root.dark .app-author,
:root.dark .app-github {
  color: #9ca3af;
}

:root.dark .app-support {
  color: #FF9E9E;
}

.app-qr-code {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
}

.qr-link {
  display: block;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

/* 计算文字部分高度并设置二维码尺寸 */
.wxpay-qr {
  width: auto;
  height: calc(14px + 12px + 11px + 12px + 4px + 2px + 2px + 6px); /* 根据字体大小和间距计算总高度 */
  max-height: 100px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
  object-fit: cover;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  /* 禁用图片长按菜单 */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  /* 禁止图片缩放 */
  -webkit-user-drag: none;
  user-drag: none;
  pointer-events: auto;
}

:root.dark .wxpay-qr {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.wxpay-qr:hover {
  transform: scale(1.05);
}

.stylish-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0 12px;
  opacity: 0.6;
}

.divider-line {
  height: 1px;
  width: 40px;
  background: linear-gradient(90deg, transparent, currentColor);
}

.divider-line:last-child {
  background: linear-gradient(90deg, currentColor, transparent);
}

.divider-icon {
  color: currentColor;
  display: flex;
  align-items: center;
}

:root.dark .stylish-divider {
  color: rgba(255, 255, 255, 0.3);
}

.stylish-divider {
  color: rgba(0, 0, 0, 0.2);
}

.scrollable-content-section {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: 4px;
  /* 内容区域背景透明，使用整体渐变 */
  background: transparent;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 100px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: left;
}

:root.dark .section-title {
  color: #e5e7eb;
}

/* 自动滚动容器样式 */
.auto-scroll-container {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 200px; /* 固定高度，显示2-3条日志 */
  overflow: hidden;
}

:root.dark .auto-scroll-container {
  background: rgba(45, 45, 65, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-content {
  /* 关键修改：移除 transition，避免重置时的动画 */
  will-change: transform; /* 性能优化 */
}

.log-item {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.log-item:last-child {
  border-bottom: none;
}

:root.dark .log-item {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.log-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.log-version {
  font-size: 16px;
  font-weight: 700;
  color: #14B8A6;
  line-height: 1.2;
}

:root.dark .log-version {
  color: #2DD4BF;
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  white-space: pre-line;
  margin: 0;
}

:root.dark .log-description {
  color: #9ca3af;
}

/* 滚动遮罩 - 上下渐变遮罩，让滚动更自然 */
.scroll-mask {
  position: absolute;
  left: 0;
  right: 0;
  height: 40px;
  pointer-events: none;
  z-index: 2;
}

.top-mask {
  top: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  border-radius: 16px 16px 0 0;
}

.bottom-mask {
  bottom: 0;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  border-radius: 0 0 16px 16px;
}

:root.dark .top-mask {
  background: linear-gradient(to bottom, rgba(45, 45, 65, 0.9), rgba(45, 45, 65, 0));
}

:root.dark .bottom-mask {
  background: linear-gradient(to top, rgba(45, 45, 65, 0.9), rgba(45, 45, 65, 0));
}

.divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 24px 0;
}

:root.dark .divider {
  background: rgba(255, 255, 255, 0.1);
}

.divider.decorative {
  height: 2px;
  background: linear-gradient(90deg, transparent, #14B8A6, transparent);
  margin: 32px 0;
  opacity: 0.5;
}

.features-section {
  margin-top: 24px;
}

.features-intro {
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
  text-align: left;
}

:root.dark .features-intro {
  color: #9ca3af;
}

.features-subtitle {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: left;
}

:root.dark .features-subtitle {
  color: #e5e7eb;
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
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: left;
}

:root.dark .feature-item {
  background: rgba(45, 45, 65, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.1);
}

.bullet-point {
  font-size: 20px;
  line-height: 1;
  margin-top: 2px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  flex-shrink: 0;
}

.feature-text {
  font-size: 15px;
  color: #333;
  line-height: 1.4;
  flex: 1;
  text-align: left;
}

:root.dark .feature-text {
  color: #e5e7eb;
}

/* 滚动条样式 */
.content-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

:root.dark .content-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

/* 移动端样式覆盖 */
@media (max-width: 768px) {
  .top-container {
    padding: 0 12px;
  }
  
  .app-name {
    font-size: 32px;
  }
  
  .app-info {
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 15px;
  }
  
  .app-meta {
    align-items: flex-end;
    text-align: right;
  }
  
  .wxpay-qr {
    height: 90px;
  }
  
  .app-support {
    font-size: 13px;
  }
  
  .auto-scroll-container {
    height: 180px;
  }
  
  .log-item {
    padding: 14px;
  }
  
  .log-version {
    font-size: 15px;
  }
  
  .log-description {
    font-size: 13px;
  }
  
  .scroll-mask {
    height: 30px;
  }
  
  .features-list {
    gap: 8px;
  }
  
  .feature-item {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .app-name {
    font-size: 28px;
  }
  
  .app-info {
    flex-direction: row;
    justify-content: flex-end;
    gap: 12px;
  }
  
  .app-meta {
    max-width: 65%;
    align-items: flex-end;
  }
  
  .app-support {
    font-size: 12px;
    line-height: 1.3;
  }
  
  .wxpay-qr {
    height: 80px;
    /* 在移动端确保二维码可以被长按识别 */
    -webkit-touch-callout: default;
    touch-action: manipulation;
  }
  
  .content-wrapper {
    padding: 0 12px 80px;
  }
  
  .auto-scroll-container {
    height: 160px;
  }
  
  .log-item {
    padding: 12px;
  }
  
  .log-version {
    font-size: 14px;
  }
  
  .log-description {
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .app-info {
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }
  
  .app-meta {
    max-width: 100%;
    align-items: flex-end;
  }
  
  .wxpay-qr {
    height: 70px;
  }
  
  .auto-scroll-container {
    height: 140px;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .scrollable-content-section {
    height: calc(100vh - 140px);
  }
  
  .auto-scroll-container {
    height: 100px;
  }
  
  .content-wrapper {
    padding: 0 16px 60px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .back-button-pill:active {
    transform: scale(0.95);
  }
  
  .feature-item:active {
    transform: scale(0.98);
  }
  
  .wxpay-qr:active {
    transform: scale(0.95);
  }
  
  /* 在移动设备上确保二维码可以被长按识别 */
  .qr-link {
    -webkit-tap-highlight-color: transparent;
  }
  
  .wxpay-qr {
    -webkit-touch-callout: default;
    touch-action: manipulation;
  }
  
  /* 移动端禁用悬停暂停功能 */
  .auto-scroll-container {
    pointer-events: none;
  }
}

/* 添加滚动条样式修复 */
@media (max-width: 768px) {
  .about-view {
    -webkit-overflow-scrolling: touch;
  }
  
  .content-scroll {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* 修复可能溢出导致滚动条的问题 */
  .auto-scroll-container {
    max-height: 200px;
    overflow: hidden;
  }
}

/* 确保所有视图的容器正确处理滚动 */
.summary-view,
.top-performers-view,
.client-view,
.about-view {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100vh;
}

/* 修复移动端可能的溢出问题 */
@media (max-width: 768px) {
  .summary-view .content-area,
  .top-performers-view .content-area,
  .client-view .content-area {
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
    overflow-x: hidden;
  }
}

/* 补充的CSS修复 */
.about-view {
  overflow: hidden;
}

.content-scroll {
  -webkit-overflow-scrolling: touch;
}

/* 二维码图片优化 */
.qr-link {
  display: inline-block;
  line-height: 0;
}

.wxpay-qr {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 修复滚动容器高度计算 */
.auto-scroll-container {
  position: relative;
  min-height: 120px;
}

/* 确保滚动内容可见性 */
.scroll-content {
  position: relative;
  z-index: 1;
}

/* 优化暗色模式对比度 */
:root.dark .log-description,
:root.dark .features-intro {
  color: #b0b7c3;
}

/* 触摸设备优化 */
@media (pointer: coarse) {
  .back-button-pill {
    min-height: 44px;
    min-width: 44px;
  }
  
  .feature-item {
    min-height: 44px;
  }
}

/* 打印样式优化 */
@media print {
  .about-view {
    background: white !important;
    color: black !important;
  }
  
  .back-button-pill,
  .wxpay-qr {
    display: none !important;
  }
  
  .auto-scroll-container {
    height: auto !important;
    overflow: visible !important;
  }
  
  .scroll-content {
    transform: none !important;
  }
}

/* 高性能优化 */
.about-view * {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  backface-visibility: hidden;
}

/* 修复可能的布局问题 */
.fixed-top-section {
  position: relative;
}

.scrollable-content-section {
  position: relative;
  flex: 1;
}

/* 确保内容区域正确显示 */
.content-wrapper {
  min-height: 100%;
  padding-bottom: 80px;
}
</style>
