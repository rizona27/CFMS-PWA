<template>
  <div class="about-view">
    <NavBar title="关于" backText="返回" :shadow="false" />
    
    <div class="fixed-top-section">
      <div class="top-container">
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
          <div class="stats-section">
            <!-- 基金缓存统计 -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="3.29 7 12 12 20.71 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="22" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h4 class="stat-title">基金数据缓存</h4>
              </div>
              <div class="stat-content">
                <div class="stat-item">
                  <span class="stat-label">缓存基金数量:</span>
                  <span class="stat-value">{{ fundCacheStats.totalCount || '加载中...' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">最后更新时间:</span>
                  <span class="stat-value">{{ fundCacheStats.lastUpdated ? formatDate(fundCacheStats.lastUpdated) : '加载中...' }}</span>
                </div>
                <div class="stat-refresh-info">
                  <span class="refresh-label">每15分钟自动刷新</span>
                </div>
              </div>
            </div>
            
            <!-- 用户登录统计 -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="2"/>
                    <path d="M4.93 4.93l14.14 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <h4 class="stat-title">用户登录统计</h4>
              </div>
              <div class="stat-content">
                <div v-if="userLoginStats.loading" class="loading-indicator">
                  <div class="loading-spinner"></div>
                  <span>正在加载登录数据...</span>
                </div>
                <div v-else-if="userLoginStats.error" class="error-message">
                  {{ userLoginStats.error }}
                </div>
                <div v-else>
                  <div class="login-summary">
                    <div class="login-item">
                      <span class="login-label">累计登录次数:</span>
                      <span class="login-value">{{ userLoginStats.totalLogins || 0 }} 次</span>
                    </div>
                  </div>
                  
                  <div v-if="userLoginStats.locations && userLoginStats.locations.length > 0" class="location-section">
                    <div class="sub-title">登录地域分布:</div>
                    <div class="location-list-content">
                      <div v-for="(location, index) in userLoginStats.locations" :key="index" class="location-item-detail">
                        <div class="location-info">
                          <span class="location-name">{{ location.name }}</span>
                          <div class="location-stats">
                            <span class="location-count">{{ location.count }}次</span>
                            <span class="location-users">({{ location.userCount }}人)</span>
                          </div>
                        </div>
                        <div class="location-bar">
                          <div
                            class="bar-fill"
                            :style="{
                              width: `${getLocationPercentage(location.count, userLoginStats.totalLogins)}%`,
                              backgroundColor: getLocationColor(index)
                            }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 登录时段统计 -->
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h4 class="stat-title">登录时段统计</h4>
              </div>
              <div class="stat-content">
                <div v-if="loginTimeStats.loading" class="loading-indicator">
                  <div class="loading-spinner"></div>
                  <span>正在分析登录时段...</span>
                </div>
                <div v-else-if="loginTimeStats.error" class="error-message">
                  {{ loginTimeStats.error }}
                </div>
                <div v-else>
                  <div class="time-periods">
                    <div class="time-period" v-for="(period, index) in loginTimeStats.periods" :key="index">
                      <div class="period-info">
                        <span class="period-name">{{ period.name }}</span>
                        <span class="period-count">{{ period.count }}次({{ period.percentage }}%)</span>
                      </div>
                      <div class="period-bar">
                        <div
                          class="bar-fill"
                          :style="{
                            width: `${period.percentage}%`,
                            backgroundColor: getPeriodColor(index)
                          }"
                        ></div>
                      </div>
                      <div class="period-users">
                        <span class="users-count">{{ period.uniqueUsers }}人</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="divider decorative"></div>
          
          <div class="update-log-section">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import NavBar from '@/components/layout/NavBar.vue'
import wxpayQR from '../assets/wxpay.png'

interface UpdateLog {
  id: string
  version: string
  description: string
}

const updateLogs: UpdateLog[] = [
  { id: '3', version: 'Version 3.0.0', description: '在CFMS基础上构建PWA版本。\n支持多端同步。' },
  { id: '2', version: 'Version 2.0.0', description: '项目重构CFMS。\n重做UI界面。' },
  { id: '1', version: 'Version 1.0.0', description: '初代MMP项目构建。' }
]

const scrollLogs = computed(() => [...updateLogs, ...updateLogs])

const scrollContentRef = ref<HTMLElement | null>(null)
const scrollOffset = ref(0)
const scrollSpeed = 20
let singleSetHeight = 0
let animationId: number | null = null
let lastTimestamp: number | null = null
let isPaused = false

// 基金缓存统计
const fundCacheStats = ref({
  totalCount: 0,
  lastUpdated: '',
  loading: false,
  error: ''
})

// 用户登录统计
const userLoginStats = ref({
  totalLogins: 0,
  locations: [] as Array<{name: string, count: number, userCount: number}>,
  loading: false,
  error: ''
})

// 登录时段统计
const loginTimeStats = ref({
  periods: [] as Array<{name: string, count: number, uniqueUsers: number, percentage: number}>,
  loading: false,
  error: ''
})

// 定时器引用
let refreshTimer: ReturnType<typeof setTimeout> | null = null

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

// 获取时间段颜色
const getPeriodColor = (index: number) => {
  const colors = ['#3498DB', '#2ECC71', '#F39C12', '#E74C3C']
  return colors[index % colors.length]
}

// 获取地域颜色
const getLocationColor = (index: number) => {
  const colors = ['#3498DB', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E']
  return colors[index % colors.length]
}

// 计算地域百分比
const getLocationPercentage = (locationCount: number, totalCount: number) => {
  if (!totalCount) return 0
  return Math.round((locationCount / totalCount) * 100)
}

// 获取基金缓存统计
const fetchFundCacheStats = async () => {
  fundCacheStats.value.loading = true
  try {
    const baseURL = import.meta.env.PROD
      ? 'https://cfms.crnas.uk/api'
      : '/api'
    
    const response = await fetch(`${baseURL}/stats/fund-cache`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        fundCacheStats.value = {
          totalCount: data.totalCount || 0,
          lastUpdated: data.lastUpdated || '',
          loading: false,
          error: ''
        }
      } else {
        fundCacheStats.value.error = data.error || '获取失败'
        fundCacheStats.value.loading = false
      }
    } else {
      fundCacheStats.value.error = '网络请求失败'
      fundCacheStats.value.loading = false
    }
    
  } catch (error) {
    fundCacheStats.value.error = '获取基金缓存统计失败'
    fundCacheStats.value.loading = false
  }
}

// 获取用户登录统计
const fetchUserLoginStats = async () => {
  userLoginStats.value.loading = true
  try {
    const baseURL = import.meta.env.PROD
      ? 'https://cfms.crnas.uk/api'
      : '/api'
    
    const response = await fetch(`${baseURL}/stats/login-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        userLoginStats.value = {
          totalLogins: data.stats.totalLogins || 0,
          locations: data.stats.locations || [],
          loading: false,
          error: ''
        }
      } else {
        userLoginStats.value.error = data.error || '获取失败'
        userLoginStats.value.loading = false
      }
    } else {
      userLoginStats.value.error = '网络请求失败'
      userLoginStats.value.loading = false
    }
  } catch (error) {
    userLoginStats.value.error = '获取用户登录统计失败'
    userLoginStats.value.loading = false
  }
}

// 获取登录时段统计
const fetchLoginTimeStats = async () => {
  loginTimeStats.value.loading = true
  try {
    const baseURL = import.meta.env.PROD
      ? 'https://cfms.crnas.uk/api'
      : '/api'
    
    const response = await fetch(`${baseURL}/stats/login-time-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        loginTimeStats.value = {
          periods: data.periods || [],
          loading: false,
          error: ''
        }
      } else {
        loginTimeStats.value.error = data.error || '获取失败'
        loginTimeStats.value.loading = false
      }
    } else {
      loginTimeStats.value.error = '网络请求失败'
      loginTimeStats.value.loading = false
    }
  } catch (error) {
    loginTimeStats.value.error = '获取登录时段统计失败'
    loginTimeStats.value.loading = false
  }
}

// 初始化统计
const initStats = () => {
  fetchFundCacheStats()
  fetchUserLoginStats()
  fetchLoginTimeStats()
}

// 启动定时刷新基金缓存统计
const startAutoRefresh = () => {
  // 先清除已存在的定时器
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }
  
  // 每15分钟刷新一次基金缓存统计
  refreshTimer = setTimeout(() => {
    console.log('自动刷新基金缓存统计...')
    fetchFundCacheStats()
    
    // 重新设置定时器
    startAutoRefresh()
  }, 15 * 60 * 1000) // 15分钟
}

const calculateSingleSetHeight = () => {
  if (!scrollContentRef.value) return 0
  
  const logItems = scrollContentRef.value.querySelectorAll('.log-item')
  if (logItems.length === 0) return 0
  
  let totalHeight = 0
  
  for (let i = 0; i < updateLogs.length; i++) {
    const item = logItems[i] as HTMLElement
    totalHeight += item.offsetHeight
  }

  return totalHeight > 0 ? totalHeight : 0
}

const startScrollAnimation = (timestamp: number) => {
  if (singleSetHeight === 0) {
    animationId = requestAnimationFrame(startScrollAnimation)
    return
  }
  
  if (!lastTimestamp) lastTimestamp = timestamp
  const elapsed = timestamp - lastTimestamp
  
  if (!isPaused) {
    const scrollDelta = (scrollSpeed * elapsed) / 1000
    scrollOffset.value = (scrollOffset.value + scrollDelta) % singleSetHeight
  }
  
  lastTimestamp = timestamp
  animationId = requestAnimationFrame(startScrollAnimation)
}

const pauseScroll = () => {
  isPaused = true
  lastTimestamp = null
}

const resumeScroll = () => {
  isPaused = false
  lastTimestamp = null
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  animationId = requestAnimationFrame(startScrollAnimation)
}

onMounted(async () => {
  await nextTick()
  
  singleSetHeight = calculateSingleSetHeight()
  
  scrollOffset.value = 0
  
  setTimeout(() => {
    if (singleSetHeight > 0) {
      animationId = requestAnimationFrame(startScrollAnimation)
    }
  }, 100)
  
  // 初始化统计数据
  initStats()
  
  // 启动自动刷新
  startAutoRefresh()
})

onUnmounted(() => {
  // 清除动画
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  // 清除定时器
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
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
  z-index: 90;
  padding-top: 0;
  background: transparent;
}

.top-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.app-title-container {
  text-align: center;
  margin-bottom: 16px;
  margin-top: 8px;
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

.wxpay-qr {
  width: auto;
  height: calc(14px + 12px + 11px + 12px + 4px + 2px + 2px + 6px);
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
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
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

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

:root.dark .stat-card {
  background: rgba(45, 45, 65, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:root.dark .stat-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 184, 166, 0.1);
  color: #14B8A6;
}

.stat-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

:root.dark .stat-title {
  color: #e5e7eb;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

:root.dark .stat-item {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

:root.dark .stat-label {
  color: #9ca3af;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

:root.dark .stat-value {
  color: #e5e7eb;
}

.stat-refresh-info {
  margin-top: 8px;
  text-align: right;
}

.refresh-label {
  font-size: 11px;
  color: #888;
  font-style: italic;
}

:root.dark .refresh-label {
  color: #9ca3af;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #666;
}

:root.dark .loading-indicator {
  color: #9ca3af;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #14B8A6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 20px;
  color: #e74c3c;
  text-align: center;
  font-size: 14px;
}

:root.dark .error-message {
  color: #ef5350;
}

.login-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.login-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.login-label {
  font-size: 14px;
  color: #666;
}

:root.dark .login-label {
  color: #9ca3af;
}

.login-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.login-value.highlight {
  color: #14B8A6;
}

:root.dark .login-value {
  color: #e5e7eb;
}

:root.dark .login-value.highlight {
  color: #2DD4BF;
}

.location-section {
  margin-top: 12px;
}

.sub-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

:root.dark .sub-title {
  color: #e5e7eb;
}

.location-list-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
}

.location-item-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

:root.dark .location-item-detail {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.location-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  flex: 1;
}

:root.dark .location-name {
  color: #e5e7eb;
}

.location-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-count {
  font-size: 13px;
  color: #14B8A6;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

.location-users {
  font-size: 12px;
  color: #666;
  min-width: 40px;
  text-align: right;
}

:root.dark .location-users {
  color: #9ca3af;
}

.location-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

:root.dark .location-bar {
  background: rgba(255, 255, 255, 0.1);
}

.time-periods {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-period {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.period-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

:root.dark .period-name {
  color: #e5e7eb;
}

.period-count {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

:root.dark .period-count {
  color: #9ca3af;
}

.period-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

:root.dark .period-bar {
  background: rgba(255, 255, 255, 0.1);
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.period-users {
  display: flex;
  justify-content: flex-end;
}

.users-count {
  font-size: 12px;
  color: #666;
}

:root.dark .users-count {
  color: #9ca3af;
}

.update-log-section {
  margin-top: 24px;
}

.auto-scroll-container {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 200px;
  overflow: hidden;
}

:root.dark .auto-scroll-container {
  background: rgba(45, 45, 65, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-content {
  will-change: transform;
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
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
  }
  
  .stat-title {
    font-size: 16px;
  }
  
  .location-list-content {
    max-height: 150px;
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
    -webkit-touch-callout: default;
    touch-action: manipulation;
  }
  
  .content-wrapper {
    padding: 0 12px 80px;
  }
  
  .stat-card {
    padding: 14px;
  }
  
  .stat-header {
    gap: 10px;
    margin-bottom: 12px;
  }
  
  .stat-icon {
    width: 32px;
    height: 32px;
  }
  
  .stat-title {
    font-size: 15px;
  }
  
  .stat-label {
    font-size: 13px;
  }
  
  .stat-value {
    font-size: 14px;
  }
  
  .location-list-content {
    max-height: 130px;
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
  .stat-card:active {
    transform: scale(0.98);
  }
  
  .wxpay-qr:active {
    transform: scale(0.95);
  }
  
  .qr-link {
    -webkit-tap-highlight-color: transparent;
  }
  
  .wxpay-qr {
    -webkit-touch-callout: default;
    touch-action: manipulation;
  }
  
  .auto-scroll-container {
    pointer-events: none;
  }
}

@media (max-width: 768px) {
  .about-view {
    -webkit-overflow-scrolling: touch;
  }
  
  .content-scroll {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .auto-scroll-container {
    max-height: 200px;
    overflow: hidden;
  }
}

.about-view {
  overflow: hidden;
}

.content-scroll {
  -webkit-overflow-scrolling: touch;
}

.qr-link {
  display: inline-block;
  line-height: 0;
}

.wxpay-qr {
  max-width: 100%;
  height: auto;
  display: block;
}

.auto-scroll-container {
  position: relative;
  min-height: 120px;
}

.scroll-content {
  position: relative;
  z-index: 1;
}

@media print {
  .about-view {
    background: white !important;
    color: black !important;
  }
  
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

.about-view * {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  backface-visibility: hidden;
}

.fixed-top-section {
  position: relative;
}

.scrollable-content-section {
  position: relative;
  flex: 1;
}

.content-wrapper {
  min-height: 100%;
  padding-bottom: 80px;
}
</style>
