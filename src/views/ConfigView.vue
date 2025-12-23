<!-- ConfigView.vue -->
<template>
  <div class="config-view">
    <div class="fixed-top-section">
      <div class="user-info-container">
        <div class="user-card-wrapper">
          <div
            class="user-info-card"
            :style="{
              background: getUserColors().cardBg,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)'
            }"
          >
            <!-- 新颖设计：六边形用户身份徽章 + 渐变光环 -->
            <div class="user-badge-container">
              <div
                class="user-badge"
                :class="{
                  'badge-vip': authStore.userType === 'vip',
                  'badge-subscribed': authStore.userType === 'subscribed',
                  'badge-free': authStore.userType === 'free'
                }"
              >
                <!-- 光环动画效果 -->
                <div class="badge-halo" :style="{ animation: showBadgeAnimation ? 'haloPulse 2s ease-in-out infinite' : 'none' }"></div>
                
                <!-- 徽章边框 -->
                <div class="badge-border"></div>
                
                <!-- 徽章内容 -->
                <div class="badge-content">
                  <div class="badge-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                
                <!-- 徽章文字标签（悬浮显示） -->
                <div class="badge-label">
                  {{ getUserTypeShort() }}
                </div>
              </div>
            </div>
            
            <div class="user-content">
              <div class="user-header-row">
                <div class="avatar-section">
                  <div
                    class="avatar-icon"
                    :style="{ color: getUserColors().iconColor }"
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                      <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="user-details">
                    <h3
                      class="user-name"
                      :style="{ color: getUserColors().textColor }"
                    >
                      {{ displayName }}
                    </h3>
                    <p class="user-id" v-if="authStore.currentUser?.email">{{ authStore.currentUser.email }}</p>
                  </div>
                </div>
              </div>
              
              <!-- 重新布局的用户信息底部 -->
              <div class="user-info-footer-new">
                <!-- 左侧：升级按钮 -->
                <div class="footer-left">
                  <button
                    class="upgrade-btn"
                    @click="handleUpgrade"
                    v-if="authStore.userType !== 'vip'"
                    :style="{
                      backgroundColor: getUserColors().textColor + '1A',
                      color: getUserColors().textColor
                    }"
                  >
                    升级
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <!-- 中部：只有体验用户显示到期信息 -->
                <div class="footer-center" v-if="authStore.userType === 'subscribed' && subscriptionEndDate">
                  <div class="subscription-info">
                    <div class="subscription-item">
                      <span class="subscription-label">到期日:</span>
                      <span class="subscription-value">{{ subscriptionEndDate.date }}</span>
                    </div>
                    <div class="subscription-item">
                      <span class="subscription-label">状态:</span>
                      <span class="subscription-status" :class="{ 'expired': subscriptionEndDate.isExpired }">
                        {{ subscriptionEndDate.isExpired ? '已过期' : `剩余${subscriptionEndDate.daysLeft}天` }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- 右侧：退出按钮 -->
                <div class="footer-right">
                  <button
                    class="logout-btn"
                    @click="handleLogout"
                    :style="{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    }"
                  >
                    退出
                  </button>
                </div>
              </div>
            </div>
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
      <div class="config-content-wrapper">
        <div class="config-content">
          <div class="functions-section">
            <div class="function-grid">
              
              <div
                class="function-card cloud-sync-card"
                :class="{ 'disabled': authStore.userType === 'free' }"
                @click="handleCloudSync"
              >
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <transition name="icon-fade" mode="out-in">
                        <svg v-if="authStore.userType === 'free'" key="cloud-locked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 10C19.5304 10 20.0391 10.2107 20.4142 10.5858C20.7893 10.9609 21 11.4696 21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H13C12.4696 21 11.9609 20.7893 11.5858 20.4142C11.2107 20.0391 11 19.5304 11 19V12C11 11.4696 11.2107 10.9609 11.5858 10.5858C11.9609 10.2107 12.4696 10 13 10H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M13 10V7C13 5.34315 14.3431 4 16 4C17.6569 4 19 5.34315 19 7V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M8 17H6C5.20435 17 4.44129 16.6839 3.87868 16.1213C3.31607 15.5587 3 14.7956 3 14C3 13.2044 3.31607 12.4413 3.87868 11.8787C4.44129 11.3161 5.20435 11 6 11C6.06 11 6.12 11.01 6.18 11.01C6.27318 9.53982 6.94165 8.16912 8.04683 7.17849C9.15201 6.18787 10.6094 5.65345 12.115 5.68652C13.6206 5.7196 15.0592 6.31761 16.127 7.355" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg v-else key="cloud-vip" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 16V8M9 11L12 8L15 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </transition>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">
                        云端同步
                        <span v-if="authStore.userType === 'free'" class="vip-badge">VIP</span>
                      </h4>
                    </div>
                  </div>
                  <p class="card-subtitle-corner">数据上传/下载</p>
                </div>
              </div>
              
              <div class="function-card manage-holdings-card" @click="handleFeature('ManageHoldings')">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">管理持仓</h4>
                    </div>
                  </div>
                  <p class="card-subtitle-corner">用户数据编辑</p>
                </div>
              </div>
              
              <div class="function-card privacy-card">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <transition name="icon-fade" mode="out-in">
                        <svg v-if="dataStore.isPrivacyMode" key="locked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                           <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg v-else key="unlocked" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                          <path d="M7 11V7a5 5 0 019.9-1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </transition>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">隐私模式</h4>
                    </div>
                  </div>
                  <div class="privacy-toggle">
                    <div class="privacy-options">
                      <button
                        class="privacy-option"
                        :class="{ 'active': dataStore.isPrivacyMode === true }"
                        @click="togglePrivacyMode(true)"
                      >
                        开启
                      </button>
                      <button
                        class="privacy-option"
                        :class="{ 'active': dataStore.isPrivacyMode === false }"
                        @click="togglePrivacyMode(false)"
                      >
                        关闭
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="function-card theme-card">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <transition name="icon-fade" mode="out-in">
                        <svg v-if="selectedTheme === 'system'" key="system" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 16v4" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <svg v-else-if="selectedTheme === 'light'" key="light" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <svg v-else key="dark" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </transition>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">主题设置</h4>
                    </div>
                  </div>
                  <div class="theme-toggle">
                    <div class="theme-options">
                      <button
                        v-for="mode in themeModes"
                        :key="mode.value"
                        class="theme-option"
                        :class="{ 'active': selectedTheme === mode.value }"
                        @click="handleThemeChange(mode.value as any)"
                      >
                        {{ mode.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="function-card log-card" @click="handleFeature('APILog')">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">日志查询</h4>
                    </div>
                  </div>
                   <p class="card-subtitle-corner">记录系统与操作</p>
                </div>
              </div>

               <div class="function-card about-card" @click="handleFeature('About')">
                <div class="card-content">
                  <div class="card-header">
                    <div class="card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="8" r="1" fill="currentColor"/>
                      </svg>
                    </div>
                    <div class="card-title-wrapper">
                      <h4 class="card-title">关于 CFMS</h4>
                    </div>
                  </div>
                  <p class="card-subtitle-corner">版本及说明</p>
                </div>
              </div>

            </div>
          </div>

          <div class="footer-section">
            <div class="footer-text">
              <span class="gradient-text">Happiness around the corner.</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import ToastMessage from '../components/common/ToastMessage.vue'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

// 徽章动画控制
const showBadgeAnimation = ref(true)

const getUserTypeShort = () => {
  switch (authStore.userType) {
    case 'vip': return 'VIP'
    case 'subscribed': return '体验'
    case 'free': return '基础'
    default: return '用户'
  }
}

const privacyKey = ref(0)
const refreshKey = ref(0)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

let isPrivacyInitialized = false

const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
  
  dataStore.safeAddLog(`系统提示: ${message}`, type, false)
}

const subscriptionEndDate = computed(() => {
  if (authStore.currentUser?.subscription_end) {
    const endDate = new Date(authStore.currentUser.subscription_end)
    const now = new Date()
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft > 0) {
      return {
        date: endDate.toLocaleDateString('zh-CN').replace(/\//g, '/'),
        daysLeft: daysLeft,
        isExpired: false
      }
    } else {
      return {
        date: endDate.toLocaleDateString('zh-CN').replace(/\//g, '/'),
        daysLeft: 0,
        isExpired: true
      }
    }
  }
  return null
})

const userTypeDisplay = computed(() => {
  switch (authStore.userType) {
    case 'vip': return 'VIP用户'
    case 'subscribed':
      if (subscriptionEndDate.value?.isExpired) {
        return '体验用户(已过期)'
      } else {
        return '体验用户'
      }
    case 'free':
    default: return '基础用户'
  }
})

watch(() => dataStore.isPrivacyMode, (newValue, oldValue) => {
  if (isPrivacyInitialized && oldValue !== newValue) {
    showNotification(`隐私模式已${newValue ? '开启' : '关闭'}`, 'info')
  }
  
  const event = new CustomEvent('privacy-mode-changed-global', {
    detail: {
      enabled: newValue,
      oldValue: oldValue,
      timestamp: Date.now(),
      source: 'ConfigView'
    },
    bubbles: true,
    composed: true
  })
  
  window.dispatchEvent(event)
  
  const legacyEvent = new CustomEvent('privacy-mode-changed', {
    detail: {
      enabled: newValue,
      oldValue: oldValue
    },
    bubbles: true,
    composed: true
  })
  
  window.dispatchEvent(legacyEvent)
  
  nextTick(() => {
    window.dispatchEvent(new CustomEvent('force-privacy-sync'))
  })
})

// 修复主题同步问题 - 监听主题变化
watch(() => dataStore.userPreferences.themeMode, (newTheme) => {
  selectedTheme.value = newTheme
  // 强制更新主题到body
  applyThemeToBody(newTheme)
})

const displayName = computed(() => {
  return authStore.displayName || '用户'
})

const getUserColors = () => {
  switch (authStore.userType) {
    case 'vip':
      return {
        cardBg: 'linear-gradient(135deg, rgba(255, 253, 231, 0.95) 0%, rgba(255, 248, 200, 0.95) 100%)',
        textColor: '#B8860B',
        iconColor: '#B8860B'
      }
    case 'subscribed':
      return {
        cardBg: 'linear-gradient(135deg, rgba(245, 245, 245, 0.95) 0%, rgba(235, 235, 235, 0.95) 100%)',
        textColor: '#606060',
        iconColor: '#606060'
      }
    case 'free':
    default:
      return {
        cardBg: 'linear-gradient(135deg, rgba(240, 248, 255, 0.95) 0%, rgba(225, 240, 255, 0.95) 100%)',
        textColor: '#007bff',
        iconColor: '#007bff'
      }
  }
}

const themeModes = [
  { name: '系统', value: 'system', icon: 'system', color: '#6b7280' },
  { name: '浅色', value: 'light', icon: 'light', color: '#f59e0b' },
  { name: '深色', value: 'dark', icon: 'dark', color: '#3b82f6' }
]

const selectedTheme = ref(dataStore.userPreferences.themeMode || 'system')

let isThemeChanging = false

// 应用主题到body元素的函数
const applyThemeToBody = (themeMode: string) => {
  const body = document.body
  const root = document.documentElement
  
  // 移除现有的主题类
  body.classList.remove('dark', 'light')
  root.classList.remove('dark')
  
  if (themeMode === 'system') {
    // 系统主题：跟随系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.classList.add('dark')
      root.classList.add('dark')
    } else {
      body.classList.add('light')
    }
  } else if (themeMode === 'dark') {
    body.classList.add('dark')
    root.classList.add('dark')
  } else {
    body.classList.add('light')
  }
  
  // 存储当前主题到localStorage
  localStorage.setItem('user-theme', themeMode)
  
  // 触发全局主题变化事件
  window.dispatchEvent(new CustomEvent('theme-changed', {
    detail: { theme: themeMode }
  }))
}

const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
  if (isThemeChanging) {
    console.warn('主题切换正在进行中，跳过本次调用')
    return
  }
  
  const oldMode = dataStore.userPreferences.themeMode
  if (oldMode === mode) return
  
  isThemeChanging = true
  
  try {
    selectedTheme.value = mode
    
    // 更新数据存储
    dataStore.updateThemeMode(mode)
    
    // 应用主题到页面
    applyThemeToBody(mode)
    
    const modeName = mode === 'system' ? '系统' : mode === 'light' ? '浅色' : '深色'
    showNotification(`主题已切换为: ${modeName}`, 'success')
    
  } finally {
    setTimeout(() => {
      isThemeChanging = false
    }, 300)
  }
}

const handleCloudSync = () => {
  if (authStore.userType === 'free') {
    showNotification('该功能需要升级到体验用户或VIP用户', 'warning')
  } else {
    router.push('/cloud-sync')
    dataStore.safeAddLog('用户访问云端同步页面', 'info', false)
  }
}

const handleFeature = (featureName: string) => {
  switch (featureName) {
    case 'About':
      router.push('/about')
      break
    case 'ManageHoldings':
      router.push('/holdings/manage')
      break
    case 'APILog':
      router.push('/logs')
      break
    default:
      showNotification(`功能 ${featureName} 正在开发中...`, 'info')
  }
  dataStore.safeAddLog(`用户操作: 点击${featureName}功能`, 'info', false)
}

const handleUpgrade = () => {
  router.push('/activation')
  dataStore.safeAddLog('用户点击升级按钮，跳转到激活页面', 'info', false)
}

const handleLogout = async () => {
  try {
    dataStore.safeAddLog('用户执行退出登录操作', 'info', false)
    showNotification('您已成功退出登录', 'success')
    setTimeout(() => {
      authStore.logout()
      dataStore.safeAddLog('用户已成功退出登录', 'success', false)
    }, 800)
  } catch (error) {
    console.error('退出登录失败:', error)
    dataStore.safeAddLog('退出登录失败: ' + (error as Error).message, 'error', false)
    showNotification('退出登录失败，请重试', 'error')
  }
}

const togglePrivacyMode = (value: boolean) => {
  if (dataStore.isPrivacyMode === value) return
  const newValue = value
  dataStore.updateUserPreferences({ isPrivacyMode: newValue })
  localStorage.setItem('privacy_mode', newValue.toString())
  dataStore.safeAddLog(`隐私模式已${newValue ? '开启' : '关闭'}`, 'info', false)
  
  const event = new CustomEvent('privacy-mode-changed-global', {
    detail: {
      enabled: newValue,
      timestamp: Date.now(),
      source: 'toggle-switch'
    },
    bubbles: true,
    composed: true
  })
  window.dispatchEvent(event)
}

onMounted(() => {
  // 每次进入页面时重置动画
  showBadgeAnimation.value = true
  
  dataStore.loadData()
  selectedTheme.value = dataStore.userPreferences.themeMode
  
  // 初始化应用主题
  applyThemeToBody(selectedTheme.value)
  
  // 监听系统主题变化（仅系统主题模式）
  if (selectedTheme.value === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      if (selectedTheme.value === 'system') {
        applyThemeToBody('system')
      }
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    // 清理函数
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    })
  }
  
  const disableZoom = () => {
    let metaViewport = document.querySelector('meta[name="viewport"]')
    if (!metaViewport) {
      metaViewport = document.createElement('meta')
      metaViewport.setAttribute('name', 'viewport')
      document.head.appendChild(metaViewport)
    }
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    
    let lastTouchEnd = 0
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
        event.preventDefault()
      }
    }, { passive: false })
    
    document.addEventListener('touchend', (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, false)
    
    document.addEventListener('gesturestart', (event) => {
      event.preventDefault()
    })
    
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey === true || event.metaKey === true) &&
          (event.keyCode === 107 || event.keyCode === 109 || event.keyCode === 187 || event.keyCode === 189)) {
        event.preventDefault()
      }
    })
  }
  
  disableZoom()
  
  nextTick(() => {
    const savedPrivacyMode = localStorage.getItem('privacy_mode')
    if (savedPrivacyMode !== null) {
      const isPrivacyEnabled = savedPrivacyMode === 'true'
      dataStore.updateUserPreferences({ isPrivacyMode: isPrivacyEnabled })
      dataStore.isPrivacyMode = isPrivacyEnabled
    } else {
      dataStore.updateUserPreferences({ isPrivacyMode: true })
      dataStore.isPrivacyMode = true
      localStorage.setItem('privacy_mode', 'true')
    }
    setTimeout(() => {
      isPrivacyInitialized = true
    }, 100)
  })
  
  dataStore.safeAddLog('用户访问配置页面', 'info', false)
  window.addEventListener('force-privacy-sync', handleForcePrivacySync)
})

const handleForcePrivacySync = () => {
  const privacyMode = dataStore.isPrivacyMode
  privacyKey.value = Date.now()
}

onUnmounted(() => {
  window.removeEventListener('force-privacy-sync', handleForcePrivacySync)
})
</script>

<style scoped>
.config-view {
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

:root.dark .config-view {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.fixed-top-section {
  position: sticky;
  top: 0;
  z-index: 50;
  background: transparent;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

.scrollable-content-section {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: 4px;
}

.config-content-wrapper,
.user-info-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.config-content {
  padding: 0 0 100px;
}

.user-card-wrapper {
  position: relative;
}

.user-info-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 8px 0 8px;
}

:root.dark .user-info-card {
  background: rgba(30, 30, 46, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stylish-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 0 8px;
  opacity: 0.6;
  background: transparent;
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

.user-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.user-content {
  padding: 16px;
}

.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  margin-right: 12px;
}

.avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid currentColor;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

:root.dark .avatar-icon {
  background: rgba(45, 45, 65, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.user-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

:root.dark .user-name {
  color: #e5e7eb;
}

.user-id {
  font-size: 12px;
  color: #666;
  margin: 0 0 6px 0;
  opacity: 0.8;
  line-height: 1.3;
}

:root.dark .user-id {
  color: #9ca3af;
}

/* 新颖的六边形用户身份徽章设计 */
.user-badge-container {
  position: absolute;
  top: -16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 20;
}

.user-badge {
  position: relative;
  width: 65px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: transform 0.3s ease;
  animation: floatBadge 3s ease-in-out infinite;
}

@keyframes floatBadge {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.user-badge:hover {
  transform: scale(1.05) translateY(-2px);
}

/* 基础用户 - 淡蓝色 */
.badge-free {
  color: #4A90E2;
}

/* 体验用户 - 银灰色 */
.badge-subscribed {
  color: #A0AEC0;
}

/* VIP用户 - 金色 */
.badge-vip {
  color: #D4AF37;
}

.badge-halo {
  position: absolute;
  top: -12px;
  left: -12px;
  right: -12px;
  bottom: -12px;
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(10px);
  z-index: 1;
  animation: haloPulse 2s ease-in-out infinite;
}

.badge-free .badge-halo {
  background: #4A90E2;
}

.badge-subscribed .badge-halo {
  background: #A0AEC0;
}

.badge-vip .badge-halo {
  background: #D4AF37;
}

@keyframes haloPulse {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.2;
  }
}

.badge-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  opacity: 0.9;
  z-index: 1;
}

.badge-free .badge-border {
  background: linear-gradient(135deg, #4A90E2 0%, #87CEEB 100%);
}

.badge-subscribed .badge-border {
  background: linear-gradient(135deg, #A0AEC0 0%, #CBD5E0 100%);
}

.badge-vip .badge-border {
  background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
}

.badge-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: iconGlow 2s ease-in-out infinite;
}

@keyframes iconGlow {
  0%, 100% {
    filter: drop-shadow(0 0 2px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 6px currentColor);
  }
}

.badge-label {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 700;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 4;
}

:root.dark .badge-label {
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
}

.user-badge:hover .badge-label {
  opacity: 1;
}

/* 重新布局的用户信息底部 */
.user-info-footer-new {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  flex-wrap: nowrap;
}

:root.dark .user-info-footer-new {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.footer-left,
.footer-center,
.footer-right {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.footer-left {
  flex: 0 0 auto;
  justify-content: flex-start;
}

.footer-center {
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.footer-right {
  flex: 0 0 auto;
  justify-content: flex-end;
}

/* 订阅信息样式 */
.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: center;
}

.subscription-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  line-height: 1.2;
  justify-content: center;
  white-space: nowrap;
}

.subscription-label {
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

:root.dark .subscription-label {
  color: #9ca3af;
}

.subscription-value {
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

:root.dark .subscription-value {
  color: #e5e7eb;
}

.subscription-status {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  white-space: nowrap;
}

.subscription-status.expired {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 30px;
  -webkit-tap-highlight-color: transparent;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  white-space: nowrap;
}

:root.dark .logout-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
}

.upgrade-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 30px;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}

.upgrade-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upgrade-btn:active {
  transform: translateY(0);
}

.functions-section {
  margin-bottom: 16px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.function-card {
  border-radius: 18px;
  border: none;
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05);
}

:root.dark .function-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

:root.dark .function-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.function-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.function-card.disabled:hover {
  transform: none;
  box-shadow: none;
}

.cloud-sync-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
}

.cloud-sync-card .card-icon svg {
  color: #667eea;
}

.manage-holdings-card {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%);
}

.manage-holdings-card .card-icon svg {
  color: #764ba2;
}

.privacy-card {
  background: linear-gradient(135deg, rgba(245, 87, 108, 0.15) 0%, rgba(79, 172, 254, 0.15) 100%);
}

.privacy-card .card-icon svg {
  color: #f5576c;
}

.theme-card {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(67, 233, 123, 0.15) 100%);
}

.theme-card .card-icon svg {
  color: #4facfe;
}

.log-card {
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(250, 112, 154, 0.15) 100%);
}

.log-card .card-icon svg {
  color: #43e97b;
}

.about-card {
  background: linear-gradient(135deg, rgba(250, 112, 154, 0.15) 0%, rgba(254, 209, 64, 0.15) 100%);
}

.about-card .card-icon svg {
  color: #fa709a;
}

:root.dark .cloud-sync-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
}

:root.dark .manage-holdings-card {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.25) 0%, rgba(245, 87, 108, 0.25) 100%);
}

:root.dark .privacy-card {
  background: linear-gradient(135deg, rgba(245, 87, 108, 0.25) 0%, rgba(79, 172, 254, 0.25) 100%);
}

:root.dark .theme-card {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.25) 0%, rgba(67, 233, 123, 0.25) 100%);
}

:root.dark .log-card {
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.25) 0%, rgba(250, 112, 154, 0.25) 100%);
}

:root.dark .about-card {
  background: linear-gradient(135deg, rgba(250, 112, 154, 0.25) 0%, rgba(254, 209, 64, 0.25) 100%);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.card-title-wrapper {
  flex: 1;
  min-width: 0;
}

.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.5);
}

:root.dark .card-icon {
  background: rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

:root.dark .card-title {
  color: #e5e7eb;
}

.card-subtitle-corner {
  font-size: 10px;
  color: #666;
  margin: 0;
  line-height: 1.3;
  opacity: 0.7;
  position: absolute;
  bottom: 10px;
  right: 12px;
  text-align: right;
  font-weight: 500;
}

:root.dark .card-subtitle-corner {
  color: #9ca3af;
}

.vip-badge {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.privacy-toggle {
  margin-top: auto;
}

.privacy-options {
  display: flex;
  gap: 6px;
}

.privacy-option {
  flex: 1;
  padding: 5px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  border: 1.5px solid #14B8A6;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  color: #14B8A6;
}

.privacy-option.active {
  background: #14B8A6;
  color: white;
  cursor: default;
}

.privacy-option:hover:not(.active) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:root.dark .privacy-option:hover:not(.active) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.theme-toggle {
  margin-top: auto;
}

.theme-options {
  display: flex;
  gap: 6px;
}

.theme-option {
  flex: 1;
  padding: 5px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  border: 1.5px solid #8B5CF6;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  color: #8B5CF6;
}

.theme-option.active {
  background: #8B5CF6;
  color: white;
  cursor: default;
}

.theme-option:hover:not(.active) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:root.dark .theme-option:hover:not(.active) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.footer-section {
  margin-top: 20px;
  text-align: center;
  padding: 0 16px;
}

.footer-text {
  padding: 12px 0;
}

.gradient-text {
  font-size: 14px;
  font-weight: 300;
  font-style: italic;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 4s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .config-content-wrapper {
    padding: 0 12px;
  }
  
  .function-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .user-info-card {
    padding: 0;
    margin: 6px 0 6px;
  }
  
  .user-content {
    padding: 14px;
  }
  
  .user-header-row {
    margin-bottom: 8px;
  }
  
  .avatar-section {
    gap: 10px;
    align-items: flex-start;
  }
  
  .avatar-icon {
    width: 40px;
    height: 40px;
    margin-top: 2px;
  }
  
  .user-name {
    font-size: 16px;
    margin-bottom: 2px;
  }
  
  .user-id {
    font-size: 11px;
    margin-bottom: 4px;
  }
  
  /* 移动端调整徽章位置 */
  .user-badge-container {
    top: -14px;
    right: 14px;
  }
  
  .user-badge {
    width: 55px;
    height: 65px;
  }
  
  .badge-icon svg {
    width: 16px;
    height: 16px;
  }
  
  .badge-label {
    font-size: 8px;
    bottom: -18px;
    padding: 1px 4px;
  }
  
  /* 手机端保持左中右布局 */
  .user-info-footer-new {
    flex-direction: row !important;
    gap: 6px;
    margin-top: 8px;
    padding-top: 8px;
  }
  
  .footer-left,
  .footer-center,
  .footer-right {
    width: auto;
    justify-content: center;
    min-height: 28px;
  }
  
  .footer-left {
    justify-content: flex-start;
  }
  
  .footer-center {
    justify-content: center;
    min-width: 0;
  }
  
  .footer-right {
    justify-content: flex-end;
  }
  
  .upgrade-btn,
  .logout-btn {
    padding: 4px 8px;
    font-size: 11px;
    min-height: 28px;
  }
  
  .subscription-info {
    gap: 2px;
  }
  
  .subscription-item {
    font-size: 10px;
    gap: 3px;
  }
  
  .subscription-status {
    font-size: 10px;
    padding: 1px 4px;
  }
  
  .function-card {
    padding: 12px;
    min-height: 90px;
    border-radius: 16px;
  }
  
  .card-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
  
  .card-title {
    font-size: 13px;
  }
  
  .card-subtitle-corner {
    font-size: 9px;
    bottom: 8px;
    right: 10px;
  }
  
  .privacy-options,
  .theme-options {
    gap: 4px;
  }
  
  .privacy-option,
  .theme-option {
    padding: 4px 5px;
    font-size: 10px;
    min-height: 28px;
  }
  
  .config-content {
    padding: 0 0 80px;
  }
  
  .footer-section {
    margin-top: 16px;
  }
  
  .footer-text {
    padding: 10px 0;
  }
  
  .gradient-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .config-content {
    padding: 0 0 70px;
  }
  
  .user-content {
    padding: 12px;
  }
  
  .avatar-icon {
    width: 36px;
    height: 36px;
  }
  
  .user-name {
    font-size: 15px;
  }
  
  .user-id {
    font-size: 10px;
  }
  
  .user-badge-container {
    top: -12px;
    right: 12px;
  }
  
  .user-badge {
    width: 50px;
    height: 60px;
  }
  
  .badge-icon svg {
    width: 14px;
    height: 14px;
  }
  
  .badge-label {
    font-size: 7px;
    bottom: -16px;
  }
  
  .user-info-footer-new {
    gap: 4px;
  }
  
  .subscription-item {
    font-size: 9px;
  }
  
  .function-card {
    padding: 10px;
    min-height: 85px;
  }
  
  .card-header {
    gap: 8px;
    margin-bottom: 6px;
  }
  
  .privacy-option,
  .theme-option {
    padding: 3px 4px;
    font-size: 9px;
    min-height: 26px;
  }
  
  .footer-section {
    margin-top: 12px;
  }
  
  .footer-text {
    padding: 8px 0;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .scrollable-content-section {
    height: calc(100vh - 50px);
  }
  
  .user-info-card {
    padding: 0;
  }
  
  .user-content {
    padding: 10px;
  }
  
  .user-info-footer-new {
    gap: 6px;
  }
  
  .function-card {
    min-height: 80px;
  }
  
  .config-content {
    padding: 0 0 60px;
  }
  
  .user-badge-container {
    top: -10px;
    right: 10px;
  }
  
  .user-badge {
    width: 45px;
    height: 55px;
  }
  
  .badge-icon svg {
    width: 12px;
    height: 12px;
  }
  
  .badge-label {
    font-size: 6px;
    bottom: -14px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .function-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .privacy-option:active:not(.active),
  .theme-option:active:not(.active) {
    transform: scale(0.95);
  }
  
  .logout-btn:active,
  .upgrade-btn:active {
    transform: scale(0.95);
  }
  
  .user-badge:active {
    transform: scale(0.95) translateY(0);
  }
}

@media (display-mode: standalone) {
  .config-content {
    padding-bottom: calc(100px + env(safe-area-inset-bottom));
  }
}
</style>
