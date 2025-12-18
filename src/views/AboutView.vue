<template>
  <div class="about-view">
    <NavBar title="关于" backText="返回" :shadow="false" />
    
    <div class="fixed-top-section">
      <div class="top-container">
        <div class="app-title-container">
          <h2 class="app-name">CFMS · 一基暴富</h2>
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
          <!-- 更新日志 -->
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
          
          <!-- 统计卡片滑动容器 -->
          <div class="stats-slider-section">
            <!-- 滑动指示器 -->
            <div class="slider-indicators">
              <div
                v-for="index in 3"
                :key="index"
                class="slider-dot"
                :class="{ active: currentSlide === index - 1 }"
                @click="goToSlide(index - 1)"
              ></div>
            </div>
            
            <!-- 滑动容器 -->
            <div
              class="stats-slider-container"
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
              @mousedown="onMouseDown"
              @mousemove="onMouseMove"
              @mouseup="onMouseUp"
              @mouseleave="onMouseLeave"
            >
              <div
                class="stats-slider-track"
                :style="{
                  transform: `translateX(calc(-${currentSlide * 100}%))`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease'
                }"
              >
                <!-- 服务器基本信息卡片 -->
                <div class="stat-card-wrapper">
                  <div class="stat-card">
                    <div class="stat-header">
                      <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" stroke-width="2"/>
                          <polyline points="3.29 7 12 12 20.71 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <line x1="12" y1="22" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <h4 class="stat-title">服务器基本信息</h4>
                    </div>
                    <div class="stat-content">
                      <div v-if="fundCacheStats.loading" class="loading-indicator">
                        <div class="loading-spinner"></div>
                        <span>正在加载服务器信息...</span>
                      </div>
                      <div v-else-if="fundCacheStats.error" class="error-message">
                        {{ fundCacheStats.error }}
                      </div>
                      <div v-else>
                        <div class="stat-item">
                          <span class="stat-label">缓存基金数量:</span>
                          <span class="stat-value stat-value-right">{{ fundCacheStats.totalCount || '0' }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">最后更新时间:</span>
                          <span class="stat-value stat-value-right">{{ fundCacheStats.lastUpdated ? formatDate(fundCacheStats.lastUpdated) : '未知' }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">已运行时间:</span>
                          <span class="stat-value stat-value-right">{{ uptime }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">累计登录人次:</span>
                          <span class="stat-value stat-value-right">{{ userLoginStats.totalLogins || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 登录地域分布卡片 -->
                <div class="stat-card-wrapper">
                  <div class="stat-card">
                    <div class="stat-header">
                      <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="2"/>
                          <path d="M4.93 4.93l14.14 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </div>
                      <h4 class="stat-title">登录地域分布</h4>
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
                        <div v-if="userLoginStats.locations && userLoginStats.locations.length > 0" class="location-section">
                          <div class="location-list-content">
                            <div v-for="(location, index) in displayedLocations" :key="index" class="location-item-detail">
                              <div class="location-info">
                                <span class="location-name">{{ location.name }}</span>
                                <span class="location-count">{{ location.count }}次</span>
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
                          <div v-if="userLoginStats.locations.length === 0" class="empty-message">
                            暂无登录地域数据
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 登录时段统计卡片 -->
                <div class="stat-card-wrapper">
                  <div class="stat-card">
                    <div class="stat-header">
                      <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                          <div class="time-period" v-for="(period, index) in displayedPeriods" :key="index">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 第四个卡片 - 克隆第一个卡片用于无缝循环 -->
                <div class="stat-card-wrapper">
                  <div class="stat-card">
                    <div class="stat-header">
                      <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" stroke-width="2"/>
                          <polyline points="3.29 7 12 12 20.71 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <line x1="12" y1="22" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <h4 class="stat-title">服务器基本信息</h4>
                    </div>
                    <div class="stat-content">
                      <div v-if="fundCacheStats.loading" class="loading-indicator">
                        <div class="loading-spinner"></div>
                        <span>正在加载服务器信息...</span>
                      </div>
                      <div v-else-if="fundCacheStats.error" class="error-message">
                        {{ fundCacheStats.error }}
                      </div>
                      <div v-else>
                        <div class="stat-item">
                          <span class="stat-label">缓存基金数量:</span>
                          <span class="stat-value stat-value-right">{{ fundCacheStats.totalCount || '0' }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">最后更新时间:</span>
                          <span class="stat-value stat-value-right">{{ fundCacheStats.lastUpdated ? formatDate(fundCacheStats.lastUpdated) : '未知' }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">已运行时间:</span>
                          <span class="stat-value stat-value-right">{{ uptime }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">累计登录人次:</span>
                          <span class="stat-value stat-value-right">{{ userLoginStats.totalLogins || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分隔线 -->
          <div class="divider decorative"></div>
          
          <!-- 应用信息和二维码 -->
          <div class="app-info-section">
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

interface LocationStat {
  name: string
  count: number
  userCount: number
}

interface PeriodStat {
  name: string
  count: number
  uniqueUsers?: number
  percentage: number
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

// 服务器启动时间
const serverStartTime = new Date('2025-12-18T18:00:00')
const uptime = ref('00天00时00分00秒')

// 滑动状态
const currentSlide = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const dragThreshold = 50

// 自动滚动定时器
let autoSlideTimer: ReturnType<typeof setInterval> | null = null
const autoSlideInterval = 5000

// 运行时间定时器
let uptimeTimer: ReturnType<typeof setInterval> | null = null

// 服务器信息统计
const fundCacheStats = ref({
  totalCount: 0,
  lastUpdated: '',
  loading: false,
  error: ''
})

// 用户登录统计
const userLoginStats = ref({
  totalLogins: 0,
  locations: [] as Array<LocationStat>,
  loading: false,
  error: ''
})

// 登录时段统计
const loginTimeStats = ref({
  periods: [] as Array<PeriodStat>,
  loading: false,
  error: ''
})

// 计算显示的地域数据（固定显示6个）
const displayedLocations = computed(() => {
  if (!userLoginStats.value.locations || userLoginStats.value.locations.length === 0) {
    // 如果没有数据，返回6个空的占位项，包含userCount属性
    return Array(6).fill(null).map((_, index) => ({
      name: `地区${index + 1}`,
      count: 0,
      userCount: 0
    }))
  }
  // 按登录次数降序排序，取前6个
  const sorted = [...userLoginStats.value.locations]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
  
  // 如果不足6个，用空数据补齐，包含userCount属性
  while (sorted.length < 6) {
    sorted.push({
      name: `地区${sorted.length + 1}`,
      count: 0,
      userCount: 0
    })
  }
  
  return sorted
})

// 计算显示的时段数据（固定显示6个时辰分组）
const displayedPeriods = computed(() => {
  if (!loginTimeStats.value.periods || loginTimeStats.value.periods.length === 0) {
    // 如果没有数据，返回6个古代时辰分组
    const defaultPeriods = [
      { name: '子丑(23:00-03:00)', count: 0, percentage: 0 },
      { name: '寅卯(03:00-07:00)', count: 0, percentage: 0 },
      { name: '辰巳(07:00-11:00)', count: 0, percentage: 0 },
      { name: '午未(11:00-15:00)', count: 0, percentage: 0 },
      { name: '申酉(15:00-19:00)', count: 0, percentage: 0 },
      { name: '戌亥(19:00-23:00)', count: 0, percentage: 0 }
    ]
    return defaultPeriods
  }
  
  // 确保返回6个时间段
  const periods = [...loginTimeStats.value.periods]
  
  // 如果不足6个，用空数据补齐
  const allPeriodNames = [
    '子丑(23:00-03:00)',
    '寅卯(03:00-07:00)',
    '辰巳(07:00-11:00)',
    '午未(11:00-15:00)',
    '申酉(15:00-19:00)',
    '戌亥(19:00-23:00)'
  ]
  
  // 创建映射以确保顺序正确
  const periodMap = new Map()
  periods.forEach(p => periodMap.set(p.name, p))
  
  const result = allPeriodNames.map(name => {
    if (periodMap.has(name)) {
      return periodMap.get(name)
    }
    return { name, count: 0, percentage: 0 }
  })
  
  return result
})

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
  const colors = ['#3498DB', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C']
  return colors[index % colors.length]
}

// 获取地域颜色
const getLocationColor = (index: number) => {
  const colors = ['#3498DB', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C']
  return colors[index % colors.length]
}

// 计算地域百分比
const getLocationPercentage = (locationCount: number, totalCount: number) => {
  if (!totalCount) return 0
  return Math.round((locationCount / totalCount) * 100)
}

// 更新运行时间
const updateUptime = () => {
  const now = new Date()
  const diff = now.getTime() - serverStartTime.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  const remainingHours = hours % 24
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60
  
  uptime.value = `${days.toString().padStart(2, '0')}天${remainingHours.toString().padStart(2, '0')}时${remainingMinutes.toString().padStart(2, '0')}分${remainingSeconds.toString().padStart(2, '0')}秒`
}

// 获取服务器信息统计
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
    fundCacheStats.value.error = '获取服务器信息失败'
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
        // 获取时间段数据
        let periods = data.periods || []
        
        // 如果没有数据，创建默认的6个时辰分组
        if (periods.length === 0) {
          const timeSlots = [
            '子丑(23:00-03:00)',
            '寅卯(03:00-07:00)',
            '辰巳(07:00-11:00)',
            '午未(11:00-15:00)',
            '申酉(15:00-19:00)',
            '戌亥(19:00-23:00)'
          ]
          periods = timeSlots.map(name => ({
            name,
            count: 0,
            percentage: 0
          }))
        }
        
        // 确保只有6个时间段
        periods = periods.slice(0, 6)
        
        // 计算每个时间段的百分比
        const totalCount = periods.reduce((sum: number, period: PeriodStat) => sum + period.count, 0)
        
        if (totalCount > 0) {
          periods = periods.map((period: PeriodStat) => ({
            ...period,
            percentage: Math.round((period.count / totalCount) * 100)
          }))
        }
        
        loginTimeStats.value = {
          periods,
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

// 启动定时刷新
const startAutoRefresh = () => {
  // 每15分钟刷新一次
  setInterval(() => {
    fetchFundCacheStats()
  }, 15 * 60 * 1000)
}

// 滑动控制 - 实现无缝循环
const nextSlide = () => {
  currentSlide.value++
  
  // 如果滑动到第四个卡片（克隆的第一个卡片），立即无动画跳转到第一个卡片
  if (currentSlide.value === 3) {
    setTimeout(() => {
      // 禁用过渡效果，瞬间跳转回第一个卡片
      isDragging.value = true // 临时禁用过渡
      currentSlide.value = 0
      
      // 在下一次事件循环中恢复过渡效果
      setTimeout(() => {
        isDragging.value = false
      }, 50)
    }, 300) // 等待300ms让滑动动画完成
  }
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

// 启动自动轮播
const startAutoSlide = () => {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer)
  }
  
  autoSlideTimer = setInterval(() => {
    if (!isDragging.value) {
      nextSlide()
    }
  }, autoSlideInterval)
}

// 停止自动轮播
const stopAutoSlide = () => {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer)
    autoSlideTimer = null
  }
}

// 重置自动轮播
const resetAutoSlide = () => {
  stopAutoSlide()
  setTimeout(() => {
    startAutoSlide()
  }, 2000)
}

// 触摸事件处理
const onTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  startX.value = e.touches[0].clientX
  currentX.value = startX.value
  stopAutoSlide()
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()
  currentX.value = e.touches[0].clientX
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  
  const diff = startX.value - currentX.value
  
  if (Math.abs(diff) > dragThreshold) {
    if (diff > 0) {
      // 向右滑动，切换到下一张
      nextSlide()
    } else {
      // 向左滑动，切换到上一张
      currentSlide.value = (currentSlide.value - 1 + 3) % 3
    }
  }
  
  isDragging.value = false
  resetAutoSlide()
}

// 鼠标事件处理
const onMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  startX.value = e.clientX
  currentX.value = startX.value
  stopAutoSlide()
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  currentX.value = e.clientX
}

const onMouseUp = () => {
  if (!isDragging.value) return
  
  const diff = startX.value - currentX.value
  
  if (Math.abs(diff) > dragThreshold) {
    if (diff > 0) {
      // 向右滑动，切换到下一张
      nextSlide()
    } else {
      // 向左滑动，切换到上一张
      currentSlide.value = (currentSlide.value - 1 + 3) % 3
    }
  }
  
  isDragging.value = false
  resetAutoSlide()
}

const onMouseLeave = () => {
  if (isDragging.value) {
    isDragging.value = false
    resetAutoSlide()
  }
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
  
  // 初始化运行时间
  updateUptime()
  
  // 启动运行时间定时器（每秒更新）
  uptimeTimer = setInterval(updateUptime, 1000)
  
  // 初始化统计数据
  initStats()
  
  // 启动自动刷新
  startAutoRefresh()
  
  // 启动自动轮播
  startAutoSlide()
})

onUnmounted(() => {
  // 清除动画
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  // 清除运行时间定时器
  if (uptimeTimer) {
    clearInterval(uptimeTimer)
    uptimeTimer = null
  }
  
  // 清除自动轮播定时器
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer)
    autoSlideTimer = null
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
  margin-bottom: 8px;
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

.app-info-section {
  margin-top: 16px;
}

.app-info {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 8px;
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
  padding: 4px 0 8px;
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
  padding: 0 16px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.update-log-section {
  margin-bottom: 16px;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 统计卡片滑动样式 */
.stats-slider-section {
  position: relative;
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.slider-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

:root.dark .slider-dot {
  background-color: rgba(255, 255, 255, 0.2);
}

.slider-dot.active {
  background-color: #14B8A6;
  transform: scale(1.2);
}

:root.dark .slider-dot.active {
  background-color: #2DD4BF;
}

.stats-slider-container {
  overflow: hidden;
  border-radius: 16px;
  cursor: grab;
  touch-action: pan-y;
  width: 100%;
  max-width: 500px;
}

.stats-slider-container:active {
  cursor: grabbing;
}

.stats-slider-track {
  display: flex;
  will-change: transform;
  width: 100%;
}

.stat-card-wrapper {
  flex: 0 0 100%;
  min-width: 0;
  padding: 0 10px;
  box-sizing: border-box;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 16px;
  min-height: 280px;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 184, 166, 0.1);
  color: #14B8A6;
}

.stat-title {
  font-size: 16px;
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
  height: calc(100% - 68px);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 28px;
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
  white-space: nowrap;
}

:root.dark .stat-label {
  color: #9ca3af;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

:root.dark .stat-value {
  color: #e5e7eb;
}

.stat-value-right {
  text-align: right;
  flex: 1;
  margin-left: 8px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  color: #666;
  height: 100%;
  min-height: 200px;
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
  padding: 16px;
  color: #e74c3c;
  text-align: center;
  font-size: 14px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

:root.dark .error-message {
  color: #ef5350;
}

.empty-message {
  padding: 16px;
  color: #666;
  text-align: center;
  font-size: 14px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

:root.dark .empty-message {
  color: #9ca3af;
}

.location-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
}

.location-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
}

.location-item-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:root.dark .location-name {
  color: #e5e7eb;
}

.location-count {
  font-size: 13px;
  color: #14B8A6;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
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
  font-size: 13px;
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

.auto-scroll-container {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 160px;
  overflow: hidden;
  width: 100%;
  max-width: 500px;
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
  padding: 14px;
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
  margin-bottom: 6px;
}

.log-version {
  font-size: 15px;
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
  font-size: 13px;
  color: #666;
  line-height: 1.4;
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
  height: 30px;
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
  margin: 16px 0;
  width: 100%;
}

:root.dark .divider {
  background: rgba(255, 255, 255, 0.1);
}

.divider.decorative {
  height: 2px;
  background: linear-gradient(90deg, transparent, #14B8A6, transparent);
  margin: 20px 0;
  opacity: 0.5;
  width: 100%;
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
  
  .stat-card-wrapper {
    padding: 0 8px;
  }
  
  .stat-card {
    min-height: 260px;
    padding: 14px;
  }
  
  .auto-scroll-container {
    height: 140px;
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
  
  .scroll-mask {
    height: 25px;
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
    padding: 0 12px 40px;
  }
  
  .stat-card {
    min-height: 240px;
    padding: 12px;
  }
  
  .stat-header {
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 10px;
  }
  
  .stat-icon {
    width: 30px;
    height: 30px;
  }
  
  .stat-title {
    font-size: 14px;
  }
  
  .stat-label {
    font-size: 13px;
  }
  
  .stat-value {
    font-size: 13px;
  }
  
  .auto-scroll-container {
    height: 120px;
  }
  
  .log-item {
    padding: 10px;
  }
  
  .log-version {
    font-size: 13px;
  }
  
  .log-description {
    font-size: 11px;
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
  
  .stat-card {
    min-height: 220px;
  }
  
  .auto-scroll-container {
    height: 110px;
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
    padding: 0 16px 40px;
  }
  
  .stat-card {
    min-height: 200px;
    padding: 10px;
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
  
  .stats-slider-container {
    touch-action: pan-y;
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
    max-height: 180px;
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
  
  .stats-slider-section {
    display: none !important;
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
  padding-bottom: 60px;
}
</style>
