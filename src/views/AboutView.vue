<template>
  <div class="about-view">
    <NavBar title="关于" backText="返回" :shadow="false" />
    
    <div class="fixed-top-section">
      <div class="top-container">
        <!-- 将应用标题移到与返回按钮同行 -->
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
          <!-- 统计卡片滑动容器 -->
          <div class="stats-slider-section">
            <!-- 滑动指示器 -->
            <div class="slider-indicators">
              <div
                v-for="index in 4"
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
                <!-- 版本更新信息卡片（第一张） -->
                <div class="stat-card-wrapper">
                  <div class="stat-card version-card">
                    <div class="stat-header">
                      <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <h4 class="stat-title">版本更新记录</h4>
                    </div>
                    <div class="version-content">
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
                
                <!-- 服务器基本信息卡片（第二张） -->
                <div class="stat-card-wrapper">
                  <div class="stat-card server-card">
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
                    
                    <div class="server-stats-content">
                      <div v-if="fundCacheStats.loading" class="loading-indicator">
                        <div class="loading-spinner"></div>
                        <span>正在加载服务器信息...</span>
                      </div>
                      <div v-else-if="fundCacheStats.error" class="error-message">
                        {{ fundCacheStats.error }}
                      </div>
                      <div v-else class="server-stats">
                        <!-- 缓存基金数量和累计登录人次分为两行 -->
                        <div class="stat-row">
                          <div class="stat-item-full">
                            <span class="stat-label">缓存基金数量:</span>
                            <span class="stat-value highlight-1">{{ fundCacheStats.totalCount || '0' }}</span>
                          </div>
                        </div>
                        <div class="stat-row">
                          <div class="stat-item-full">
                            <span class="stat-label">累计登录人次:</span>
                            <span class="stat-value highlight-2">{{ userLoginStats.totalLogins || 0 }}</span>
                          </div>
                        </div>
                        <!-- 最后更新时间和已运行时间 -->
                        <div class="stat-row">
                          <div class="stat-item-full">
                            <span class="stat-label">最后更新时间:</span>
                            <span class="stat-value stat-value-right">{{ fundCacheStats.lastUpdated ? formatDate(fundCacheStats.lastUpdated) : '未知' }}</span>
                          </div>
                        </div>
                        <div class="stat-row">
                          <div class="stat-item-full">
                            <span class="stat-label">已运行时间:</span>
                            <span class="stat-value stat-value-right">{{ uptime }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 登录地域分布卡片（第三张） -->
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
                        <div v-if="displayedLocations.length > 0" class="location-section">
                          <div class="location-list-content">
                            <div v-for="(location, index) in displayedLocations" :key="index" class="location-item-detail">
                              <div class="location-info">
                                <span class="location-name">
                                  {{ location.name }}
                                </span>
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
                        </div>
                        <div v-else class="empty-message">
                          暂无登录地域数据
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 登录时段统计卡片（第四张） -->
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
                
                <!-- 第五个卡片 - 克隆第一个卡片用于无缝循环 -->
                <div class="stat-card-wrapper">
                  <div class="stat-card version-card">
                    <div class="stat-header">
                      <div class="stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <h4 class="stat-title">版本更新记录</h4>
                    </div>
                    <div class="version-content">
                      <div class="auto-scroll-container">
                        <div
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
          </div>
          
          <!-- 分隔线 -->
          <div class="divider decorative"></div>
          
          <!-- 应用信息和二维码 -->
          <div class="app-info-section">
            <div class="app-info">
              <div class="app-meta">
                <p class="app-version">Version: {{ currentVersion }}</p>
                <p class="app-author">©{{ authorInfo }}</p>
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
import {
  versionConfig,
  getSortedUpdateLogs,
  getCurrentVersion,
  getAuthor,
  getYear
} from '../Version'

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

// 使用版本配置文件中的更新日志数据
const updateLogs = computed(() => {
  const sortedLogs = getSortedUpdateLogs()
  // 转换为组件需要的格式
  return sortedLogs.map((log, index) => ({
    id: (index + 1).toString(),
    version: log.displayName,
    description: log.description
  }))
})

const scrollLogs = computed(() => [...updateLogs.value, ...updateLogs.value])

const scrollContentRef = ref<HTMLElement | null>(null)
const scrollOffset = ref(0)
const scrollSpeed = 35
let singleSetHeight = 0
let animationId: number | null = null
let lastTimestamp: number | null = null
let isPaused = false

// 从版本配置文件获取信息
const currentVersion = ref(getCurrentVersion())
const authorInfo = ref(`${getYear()} ${getAuthor()}`)

// 服务器启动时间
const serverStartTime = new Date('2025-12-18T18:00:00')
const uptime = ref('')

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

// 计算显示的地域数据（只显示有数据的，最多5个）
const displayedLocations = computed(() => {
  if (!userLoginStats.value.locations || userLoginStats.value.locations.length === 0) {
    return []
  }
  // 按登录次数降序排序，取前5个有数据的
  const filtered = userLoginStats.value.locations.filter(location => location.count > 0)
  const sorted = filtered
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
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
  const colors = ['#3498DB', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6']
  return colors[index % colors.length]
}

// 计算地域百分比
const getLocationPercentage = (locationCount: number, totalCount: number) => {
  if (!totalCount) return 0
  return Math.round((locationCount / totalCount) * 100)
}

// 格式化运行时间，如果数据是0则不显示
const formatUptime = (diff: number) => {
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  // 计算年、月（按30天计算一个月）
  const years = Math.floor(days / 365)
  const remainingDays = days % 365
  const months = Math.floor(remainingDays / 30)
  const finalDays = remainingDays % 30
  
  const remainingHours = hours % 24
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60
  
  const parts = []
  
  if (years > 0) {
    parts.push(`${years}年`)
  }
  if (months > 0 || years > 0) {
    parts.push(`${months}月`)
  }
  if (finalDays > 0 || months > 0 || years > 0) {
    parts.push(`${finalDays}天`)
  }
  if (remainingHours > 0 || finalDays > 0 || months > 0 || years > 0) {
    parts.push(`${remainingHours}时`)
  }
  if (remainingMinutes > 0 || remainingHours > 0 || finalDays > 0 || months > 0 || years > 0) {
    parts.push(`${remainingMinutes}分`)
  }
  parts.push(`${remainingSeconds}秒`)
  
  return parts.join('')
}

// 更新运行时间
const updateUptime = () => {
  const now = new Date()
  const diff = now.getTime() - serverStartTime.getTime()
  uptime.value = formatUptime(diff)
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

// 滑动控制 - 实现无缝循环（现在是4张卡片）
const nextSlide = () => {
  currentSlide.value++
  
  // 如果滑动到第五个卡片（克隆的第一个卡片），立即无动画跳转到第一个卡片
  if (currentSlide.value === 4) {
    setTimeout(() => {
      // 禁用过渡效果，瞬间跳转回第一个卡片
      isDragging.value = true // 临时禁用过渡
      currentSlide.value = 0
      
      // 在下一次事件循环中恢复过渡效果
      setTimeout(() => {
        isDragging.value = false
      }, 50) // 等待300ms让滑动动画完成
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
      currentSlide.value = (currentSlide.value - 1 + 4) % 4
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
      currentSlide.value = (currentSlide.value - 1 + 4) % 4
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
  
  for (let i = 0; i < updateLogs.value.length; i++) {
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
  margin-top: -8px;
}

.top-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 5px;
}

.app-title-container {
  text-align: center;
  padding: 8px 0 2px;
  position: relative;
  z-index: 1;
}

.app-name {
  font-size: 26px;
  font-weight: bold;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: inline-block;
  line-height: 1.2;
  padding: 4px 0;
}

.app-info-section {
  margin-top: 12px;
}

.app-info {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 15px;
  width: 100%;
}

.app-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.app-version {
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
  font-weight: 500;
}

.app-author, .app-github {
  font-size: 11px;
  color: #666;
  opacity: 0.7;
  margin-bottom: 2px;
}

.app-support {
  font-size: 11px;
  color: #FF6B6B;
  font-style: italic;
  margin-top: 4px;
}

:root.dark .app-version,
:root.dark .app-author,
:root.dark .app-github {
  color: #9ca3af;
}

:root.dark .app-support {
  color: #FF9E9E;
}

.wxpay-qr {
  width: auto;
  height: 80px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  object-fit: cover;
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

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 统计卡片滑动样式 */
.stats-slider-section {
  position: relative;
  margin-bottom: 15px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 5px;
}

.slider-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.slider-dot {
  width: 6px;
  height: 6px;
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
  max-width: 450px;
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

/* --- 核心修改：统一所有卡片高度为290px，但限制字体大小 --- */
.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 16px 18px;
  height: 290px;  /* 统一所有卡片高度为290px */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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

/* 统一版本和服务器卡片高度 */
.version-card, .server-card {
  height: 290px; /* 与其他卡片保持一致 */
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px; /* 合理间距 */
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

:root.dark .stat-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.stat-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 184, 166, 0.1);
  color: #14B8A6;
}

.stat-icon svg {
  width: 18px;
  height: 18px;
}

/* 限制标题字体大小 */
.stat-title {
  font-size: 14px; /* 保持较小字体 */
  font-weight: 600;
  color: #333;
  margin: 0;
}

:root.dark .stat-title {
  color: #e5e7eb;
}

/* 版本卡片样式 */
.version-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：防止内容溢出 */
}

/* --- 修改：滚动区域自动适配290px高度 --- */
.auto-scroll-container {
  position: relative;
  background: rgba(245, 247, 250, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
  height: 100%; /* 改为100%自动适配父容器 */
  overflow: hidden;
  width: 100%;
  flex: 1; /* 充满剩余空间 */
  min-height: 0; /* 重要：防止内容溢出 */
}

:root.dark .auto-scroll-container {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.scroll-content {
  will-change: transform;
  padding: 8px; /* 合理内边距 */
}

.log-item {
  padding: 6px 0; /* 合理间距 */
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
  margin-bottom: 4px; /* 标题和描述的间距 */
}

/* 限制版本字体大小 */
.log-version {
  font-size: 11px; /* 保持较小字体 */
  font-weight: 700;
  color: #14B8A6;
  line-height: 1.2;
}

:root.dark .log-version {
  color: #2DD4BF;
}

/* 限制描述字体大小 */
.log-description {
  font-size: 10px; /* 保持较小字体 */
  color: #666;
  line-height: 1.3; /* 合理行高 */
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
  height: 12px; /* 合理遮罩高度 */
  pointer-events: none;
  z-index: 2;
}

.top-mask {
  top: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  border-radius: 10px 10px 0 0;
}

.bottom-mask {
  bottom: 0;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  border-radius: 0 0 10px 10px;
}

:root.dark .top-mask {
  background: linear-gradient(to bottom, rgba(45, 45, 65, 0.9), rgba(45, 45, 65, 0));
}

:root.dark .bottom-mask {
  background: linear-gradient(to top, rgba(45, 45, 65, 0.9), rgba(45, 45, 65, 0));
}

/* 服务器卡片样式 - 从上到下的正常排列 */
.server-stats-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.server-stats {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px; /* 合理间距 */
  min-height: 0;
  padding-top: 6px; /* 合理顶部内边距 */
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0; /* 合理内边距 */
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

:root.dark .stat-row {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-item-full {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 限制统计标签字体大小 */
.stat-label {
  font-size: 12px; /* 保持较小字体 */
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

:root.dark .stat-label {
  color: #9ca3af;
}

/* 限制统计值字体大小 */
.stat-value {
  font-size: 12px; /* 保持较小字体 */
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

:root.dark .stat-value {
  color: #e5e7eb;
}

/* 高亮样式 */
.highlight-1 {
  color: #3498DB; /* 缓存基金数量颜色 */
  font-weight: 700;
}

:root.dark .highlight-1 {
  color: #3B82F6;
}

.highlight-2 {
  color: #2ECC71; /* 累计登录人次颜色 */
  font-weight: 700;
}

:root.dark .highlight-2 {
  color: #10B981;
}

.stat-value-right {
  text-align: right;
  flex: 1;
  margin-left: 8px;
}

/* 通用内容区域 */
.stat-content {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 合理间距 */
  flex: 1;
  min-height: 0;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px; /* 合理内边距 */
  color: #666;
  flex: 1;
  min-height: 50px; /* 合理最小高度 */
}

:root.dark .loading-indicator {
  color: #9ca3af;
}

.loading-spinner {
  width: 16px; /* 合理大小 */
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #14B8A6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 10px; /* 合理内边距 */
  color: #e74c3c;
  text-align: center;
  font-size: 12px; /* 保持较小字体 */
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

:root.dark .error-message {
  color: #ef5350;
}

.empty-message {
  padding: 10px; /* 合理内边距 */
  color: #666;
  text-align: center;
  font-size: 12px; /* 保持较小字体 */
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

:root.dark .empty-message {
  color: #9ca3af;
}

.location-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 地域分布内容区域 - 关键：使用较小字体和紧凑布局 */
.location-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px; /* 紧凑间距 */
  overflow-y: auto;
  padding-right: 4px;
  min-height: 0;
}

.location-item-detail {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 紧凑间距 */
  padding: 4px 0; /* 紧凑内边距 */
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

/* 限制地域名称字体大小 */
.location-name {
  font-size: 11px; /* 保持较小字体 */
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

/* 限制地域次数字体大小 */
.location-count {
  font-size: 11px; /* 保持较小字体 */
  color: #14B8A6;
  font-weight: 600;
  min-width: 45px; /* 合理最小宽度 */
  text-align: right;
}

.location-bar {
  height: 4px; /* 合理高度 */
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

:root.dark .location-bar {
  background: rgba(255, 255, 255, 0.1);
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* 时间段样式 - 关键：使用较小字体和紧凑布局 */
.time-periods {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px; /* 紧凑间距 */
  min-height: 0;
}

.time-period {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 紧凑间距 */
}

.period-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 限制时间段名称字体大小 */
.period-name {
  font-size: 11px; /* 保持较小字体 */
  color: #333;
  font-weight: 500;
}

:root.dark .period-name {
  color: #e5e7eb;
}

/* 限制时间段统计字体大小 */
.period-count {
  font-size: 11px; /* 保持较小字体 */
  color: #666;
  font-weight: 500;
}

:root.dark .period-count {
  color: #9ca3af;
}

.period-bar {
  height: 4px; /* 合理高度 */
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

:root.dark .period-bar {
  background: rgba(255, 255, 255, 0.1);
}

.divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 12px 0; /* 合理外边距 */
  width: 100%;
}

:root.dark .divider {
  background: rgba(255, 255, 255, 0.1);
}

.divider.decorative {
  height: 1px;
  background: linear-gradient(90deg, transparent, #14B8A6, transparent);
  margin: 12px 0; /* 合理外边距 */
  opacity: 0.4;
  width: 100%;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .top-container {
    padding: 0 12px 3px;
  }
  
  .app-name {
    font-size: 22px;
  }
  
  .wxpay-qr {
    height: 75px;
  }
  
  .stat-card {
    height: 260px; /* 响应式调整为260px */
    padding: 14px 16px;
  }
  
  .version-card,
  .server-card {
    height: 260px; /* 响应式中也保持统一 */
  }
  
  .stat-header {
    margin-bottom: 10px;
  }
  
  /* 移动端保持小字体 */
  .stat-title {
    font-size: 13px;
  }
  
  .log-version {
    font-size: 10px;
  }
  
  .log-description {
    font-size: 9px;
    line-height: 1.3;
  }
  
  .stat-label,
  .stat-value,
  .location-name,
  .location-count,
  .period-name,
  .period-count {
    font-size: 11px;
  }
  
  .server-stats {
    gap: 8px;
  }
  
  .location-list-content,
  .time-periods {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .app-name {
    font-size: 20px;
  }
  
  .wxpay-qr {
    height: 70px;
  }
  
  .content-wrapper {
    padding: 0 12px 20px;
  }
  
  .stat-card {
    height: 240px; /* 响应式调整为240px */
    padding: 12px 14px;
  }
  
  .version-card,
  .server-card {
    height: 240px; /* 响应式中也保持统一 */
  }
  
  .stat-header {
    margin-bottom: 8px;
  }
  
  .stat-title {
    font-size: 12px;
  }
  
  .log-version {
    font-size: 9px;
  }
  
  .log-description {
    font-size: 8px;
    line-height: 1.2;
  }
  
  .stat-label,
  .stat-value,
  .location-name,
  .location-count,
  .period-name,
  .period-count {
    font-size: 10px;
  }
  
  .server-stats {
    gap: 6px;
  }
  
  .location-list-content,
  .time-periods {
    gap: 5px;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .stat-card {
    height: 200px; /* 横屏时调整为200px */
  }
  
  .version-card,
  .server-card {
    height: 200px; /* 横屏时也保持统一 */
  }
  
  .stat-header {
    margin-bottom: 6px;
  }
  
  .server-stats {
    gap: 5px;
  }
  
  .location-list-content,
  .time-periods {
    gap: 4px;
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
  
  .stats-slider-container {
    touch-action: pan-y;
  }
}

.about-view * {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  backface-visibility: hidden;
}
</style>
