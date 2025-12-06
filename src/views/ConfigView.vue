<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import CustomCard from '@/components/common/CustomCard.vue'
import ToastMessage from '@/components/common/ToastMessage.vue'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

// 主题键，用于强制重新渲染
const themeKey = ref(0)
// 隐私模式键，用于强制重新渲染相关组件
const privacyKey = ref(0)

// Toast状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 显示Toast消息
const showNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
  
  // 记录到API日志
  dataStore.addLog(`系统提示: ${message}`, type)
}

// 监听隐私模式变化 - 增强事件广播
watch(() => dataStore.isPrivacyMode, (newValue, oldValue) => {
  console.log(`隐私模式变化: ${oldValue} -> ${newValue}`)
  
  // 强制更新隐私模式键，触发相关组件重新渲染
  privacyKey.value = Date.now()
  
  // 广播全局隐私模式变化事件
  const event = new CustomEvent('privacy-mode-changed-global', { 
    detail: { 
      enabled: newValue,
      oldValue: oldValue,
      timestamp: Date.now(),
      source: 'ConfigView'
    }
  })
  window.dispatchEvent(event)
  
  // 同时发送原事件保持兼容性
  const legacyEvent = new CustomEvent('privacy-mode-changed', { 
    detail: { 
      enabled: newValue,
      oldValue: oldValue
    }
  })
  window.dispatchEvent(legacyEvent)
  
  nextTick(() => {
    showNotification(`隐私模式已${newValue ? '开启' : '关闭'}`, 'info')
  })
})

// 获取显示名称
const displayName = computed(() => {
  return authStore.displayName || '用户'
})

// 根据等级计算绶带文本
const userTypeDisplay = computed(() => {
  switch (authStore.userType) {
    case 'vip': return '尊享用户'
    case 'subscribed': return '体验用户'
    case 'free': 
    default: return '基础用户'
  }
})

// 用户卡片和用户名动态样式
const userCardStyles = computed(() => {
  switch (authStore.userType) {
    case 'vip':
      return {
        cardBg: 'linear-gradient(135deg, rgba(255, 223, 0, 0.1), rgba(255, 165, 0, 0.15))',
        nameGradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FFCC33)',
        ribbonBg: 'linear-gradient(90deg, #ffd700, #ff8c00)',
        ribbonColor: '#5d3d00',
        borderColor: 'rgba(255, 192, 0, 0.5)',
      }
    case 'subscribed':
      return {
        cardBg: 'linear-gradient(135deg, rgba(240, 240, 240, 0.1), rgba(200, 200, 200, 0.15))',
        nameGradient: 'linear-gradient(135deg, #a0a0a0, #c0c0c0, #f0f0f0)',
        ribbonBg: '#e0e0e0',
        ribbonColor: '#424242',
        borderColor: 'rgba(200, 200, 200, 0.5)',
      }
    case 'free':
    default:
      return {
        cardBg: 'var(--bg-card)',
        nameGradient: 'var(--text-primary)',
        ribbonBg: '#bbb',
        ribbonColor: '#555',
        borderColor: 'var(--border-color)',
      }
  }
})

const themeModes = [
  { name: '浅色', value: 'light' },
  { name: '深色', value: 'dark' },
  { name: '系统', value: 'system' }
]

// 从localStorage获取初始主题，如果不存在则检查系统偏好
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('themeMode')
    if (savedTheme) return savedTheme
    
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }
  return 'light'
}

const selectedTheme = ref(getInitialTheme()) 

const fundAPIs = [
  { name: '天天基金', value: 'eastmoney' },
  { name: '同花顺', value: 'ths' },
  { name: '腾讯财经', value: 'tencent' },
  { name: '蚂蚁基金', value: 'fund123' }
]
const selectedAPI = ref(dataStore.userPreferences.selectedFundAPI || 'eastmoney')

// 应用主题函数 - 立即生效
const applyTheme = (mode: string) => {
  const previousTheme = selectedTheme.value
  selectedTheme.value = mode
  
  // 立即保存到localStorage
  localStorage.setItem('themeMode', mode)
  
  // 保存到dataStore
  dataStore.updateUserPreferences({ selectedFundAPI: selectedAPI.value })
  
  // 立即应用主题到当前页面
  applyThemeToDocument(mode)
  
  // 改变主题键强制重新渲染
  themeKey.value = Date.now()
  
  // 记录操作日志
  dataStore.addLog(`主题已切换到: ${themeModes.find(m => m.value === mode)?.name || mode}`, 'info')
  
  // 广播主题变化事件
  const themeEvent = new CustomEvent('theme-changed-global', { 
    detail: { 
      theme: mode,
      previousTheme: previousTheme,
      timestamp: Date.now()
    }
  })
  window.dispatchEvent(themeEvent)
  
  // 兼容旧事件
  const legacyThemeEvent = new CustomEvent('theme-changed', { 
    detail: { 
      theme: mode
    }
  })
  window.dispatchEvent(legacyThemeEvent)
  
  // 只有在主题真正改变时才显示通知
  if (previousTheme !== mode) {
    showNotification(`主题已切换到: ${themeModes.find(m => m.value === mode)?.name || mode}`, 'success')
  }
}

// 独立的主题应用函数，确保立即生效
const applyThemeToDocument = (mode: string) => {
  const root = document.documentElement
  const body = document.body
  
  // 移除所有主题类
  root.classList.remove('theme-light', 'theme-dark', 'theme-system')
  body.classList.remove('light-mode', 'dark-mode')
  
  if (mode === 'dark') {
    root.classList.add('theme-dark')
    body.classList.add('dark-mode')
    updateCSSVariables('dark')
  } else if (mode === 'light') {
    root.classList.add('theme-light')
    body.classList.add('light-mode')
    updateCSSVariables('light')
  } else {
    // 系统主题
    root.classList.add('theme-system')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      body.classList.add('dark-mode')
      updateCSSVariables('dark')
    } else {
      body.classList.add('light-mode')
      updateCSSVariables('light')
    }
  }
  
  // 强制重绘当前组件，确保样式立即生效
  nextTick(() => {
    // 强制重绘body以确保主题应用
    void body.offsetHeight
  })
}

// 立即更新CSS变量
const updateCSSVariables = (theme: 'light' | 'dark') => {
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.style.setProperty('--bg-primary', '#000000')
    root.style.setProperty('--bg-card', '#1c1c1e')
    root.style.setProperty('--bg-hover', '#2c2c2e')
    root.style.setProperty('--text-primary', '#ffffff')
    root.style.setProperty('--text-secondary', '#8e8e93')
    root.style.setProperty('--border-color', '#3a3a3c')
    root.style.setProperty('--accent-color', '#3b82f6')
    root.style.setProperty('--accent-color-rgb', '59, 130, 246')
    root.style.setProperty('--glass-bg', 'rgba(30, 30, 30, 0.8)')
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)')
    root.style.setProperty('--glass-button-bg', 'rgba(79, 172, 254, 0.1)')
    root.style.setProperty('--glass-button-border', 'rgba(79, 172, 254, 0.08)')
    root.style.setProperty('--card-shadow', '0 8px 32px rgba(0, 0, 0, 0.4)')
  } else {
    root.style.setProperty('--bg-primary', '#f5f5f7')
    root.style.setProperty('--bg-card', '#ffffff')
    root.style.setProperty('--bg-hover', '#f0f7ff')
    root.style.setProperty('--text-primary', '#333333')
    root.style.setProperty('--text-secondary', '#666666')
    root.style.setProperty('--border-color', '#e5e5e7')
    root.style.setProperty('--accent-color', '#3b82f6')
    root.style.setProperty('--accent-color-rgb', '59, 130, 246')
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)')
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)')
    root.style.setProperty('--glass-button-bg', 'rgba(79, 172, 254, 0.1)')
    root.style.setProperty('--glass-button-border', 'rgba(79, 172, 254, 0.05)')
    root.style.setProperty('--card-shadow', '0 8px 32px rgba(0, 0, 0, 0.1), 0 12px 60px rgba(79, 172, 254, 0.2)')
  }
}

const togglePrivacyMode = (enabled: boolean) => {
  const oldValue = dataStore.isPrivacyMode
  console.log(`切换隐私模式: ${oldValue} -> ${enabled}`)
  
  // 直接更新dataStore，触发watch监听
  dataStore.updateUserPreferences({ isPrivacyMode: enabled })
  
  // 记录操作日志
  dataStore.addLog(`隐私模式已${enabled ? '开启' : '关闭'}`, 'info')
  
  // 强制保存到localStorage
  localStorage.setItem('privacy_mode', enabled.toString())
}

const handleAPIChange = () => {
  const oldAPI = dataStore.userPreferences.selectedFundAPI
  dataStore.updateUserPreferences({ selectedFundAPI: selectedAPI.value })
  
  // 记录操作日志
  dataStore.addLog(`数据接口已从${oldAPI}切换至: ${selectedAPI.value}`, 'info')
  
  showNotification(`数据接口已切换至: ${fundAPIs.find(a => a.value === selectedAPI.value)?.name || selectedAPI.value}`, 'success')
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
    case 'CloudSync':
      if (authStore.userType === 'free') {
        showNotification('该功能需要升级到VIP用户', 'warning')
      } else {
        showNotification('云端同步功能正在开发中...', 'info')
      }
      break
    default:
      showNotification(`功能 ${featureName} 正在开发中...`, 'info')
  }
  
  // 记录操作日志
  dataStore.addLog(`用户操作: 点击${featureName}功能`, 'info')
}

const handleUpgrade = (e: Event) => {
  e.preventDefault()
  showNotification('正在跳转到升级页面...', 'info')
  dataStore.addLog('用户点击升级按钮', 'info')
}

// 退出登录函数
const handleLogout = async () => {
  try {
    dataStore.addLog('用户执行退出登录操作', 'info')
    showNotification('您已成功退出登录', 'success')
    
    setTimeout(() => {
      authStore.logout()
      dataStore.addLog('用户已成功退出登录', 'success')
    }, 800)
    
  } catch (error) {
    console.error('退出登录失败:', error)
    dataStore.addLog('退出登录失败: ' + (error as Error).message, 'error')
    showNotification('退出登录失败，请重试', 'error')
  }
}

onMounted(() => {
  // 初始化应用主题
  applyThemeToDocument(selectedTheme.value)
  
  // 初始化数据
  dataStore.loadData()
  
  // 确保隐私模式状态与dataStore同步
  nextTick(() => {
    if (dataStore.userPreferences.isPrivacyMode !== undefined) {
      dataStore.isPrivacyMode = dataStore.userPreferences.isPrivacyMode
    }
  })
  
  // 监听系统主题变化（仅当选择系统主题时）
  if (selectedTheme.value === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (selectedTheme.value === 'system') {
        dataStore.addLog('系统主题变化，重新应用主题', 'info')
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    })
  }
  
  // 记录访问日志
  dataStore.addLog('用户访问配置页面', 'info')
})
</script>

<template>
  <div class="config-view" :key="`${themeKey}-${privacyKey}`">
    <div class="config-scroll-area">
      <div class="config-content-wrapper">
        <div class="config-content">

          <!-- 用户信息卡片 -->
          <section class="section-container user-section">
            <div class="user-card-wrapper">
              <div class="user-card-compact">
                <div 
                  class="user-ribbon" 
                  :style="{ 
                    'background': userCardStyles.ribbonBg, 
                    'color': userCardStyles.ribbonColor 
                  }"
                >
                  {{ userTypeDisplay }}
                </div>

                <div class="user-info-detail-compact">
                  <div class="avatar-box">
                    <span class="avatar-char">{{ displayName.charAt(0) }}</span>
                  </div>
                  <div class="name-status">
                    <p 
                      class="user-display-name" 
                      :style="{ 
                        'background': authStore.userType !== 'free' ? userCardStyles.nameGradient : 'unset',
                        'font-style': authStore.userType !== 'free' ? 'italic' : 'normal',
                        'color': authStore.userType === 'free' ? 'var(--text-primary)' : 'transparent',
                        '-webkit-background-clip': authStore.userType !== 'free' ? 'text' : 'unset',
                        '-webkit-text-fill-color': authStore.userType !== 'free' ? 'transparent' : 'unset',
                        'background-clip': authStore.userType !== 'free' ? 'text' : 'unset',
                      }"
                    >
                      {{ displayName }}
                    </p>
                    <p class="user-email">{{ authStore.currentUser?.email || '未设置邮箱' }}</p>
                  </div>
                </div>

                <!-- 按钮容器 -->
                <div class="user-card-buttons">
                  <a href="#" class="upgrade-link" @click.prevent="handleUpgrade">升级</a>
                  <button class="action-btn-secondary logout-btn-compact" @click="handleLogout">退出登录</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 功能卡片区域 -->
          <section class="section-container features-section">
            <div class="features-grid">
              <!-- 第一行 -->
              <CustomCard
                title="云端同步"
                description="持仓数据上传与下载"
                icon="☁️"
                :bg-color="authStore.userType !== 'free' ? 'rgba(147, 51, 234, 0.1)' : 'var(--bg-hover)'"
                :fg-color="authStore.userType !== 'free' ? '#9333ea' : 'var(--text-secondary)'"
                @click="handleFeature('CloudSync')"
              >
                <div v-if="authStore.userType === 'free'" class="vip-badge">
                  VIP功能
                </div>
              </CustomCard>
              
              <CustomCard
                title="管理持仓"
                description="新增、编辑或清空持仓数据"
                icon="📁"
                bg-color="rgba(59, 130, 246, 0.1)"
                fg-color="#3b82f6"
                @click="handleFeature('ManageHoldings')"
              />
              
              <!-- 第二行 -->
              <CustomCard
                title="日志查询"
                description="API请求与响应日志"
                icon="📜"
                bg-color="rgba(6, 182, 212, 0.1)"
                fg-color="#06b6d4"
                @click="handleFeature('APILog')"
              />
              
              <CustomCard
                title="数据接口"
                description="切换基金数据源"
                icon="🌐"
                bg-color="rgba(249, 115, 22, 0.1)"
                fg-color="#f97316"
              >
                <template #toggle>
                  <div class="api-selector">
                    <select v-model="selectedAPI" :disabled="authStore.userType === 'free'" @change="handleAPIChange">
                      <option 
                        v-for="api in fundAPIs" 
                        :key="api.value" 
                        :value="api.value"
                        :disabled="api.value !== 'eastmoney' && authStore.userType === 'free'"
                      >
                        {{ api.name }} {{ api.value !== 'eastmoney' && authStore.userType === 'free' ? ' (VIP)' : '' }}
                      </option>
                    </select>
                    <span class="select-arrow">▼</span>
                  </div>
                </template>
              </CustomCard>
              
              <!-- 第三行 -->
              <CustomCard
                title="隐私模式"
                description="用户数据脱敏"
                icon="🔒"
                bg-color="rgba(20, 184, 166, 0.1)"
                fg-color="#14b8a6"
              >
                <template #toggle>
                  <div class="setting-picker">
                    <button 
                      :class="{ active: dataStore.isPrivacyMode }" 
                      @click.stop="togglePrivacyMode(true)"
                    >
                      开启
                    </button>
                    <button 
                      :class="{ active: !dataStore.isPrivacyMode }" 
                      @click.stop="togglePrivacyMode(false)"
                    >
                      关闭
                    </button>
                  </div>
                </template>
              </CustomCard>
              
              <CustomCard
                title="主题模式"
                description="切换界面主题"
                icon="🎨"
                bg-color="rgba(0, 150, 136, 0.1)"
                fg-color="#009688"
              >
                <template #toggle>
                  <div class="setting-picker">
                    <button 
                      v-for="mode in themeModes" 
                      :key="mode.value"
                      :class="{ active: selectedTheme === mode.value }"
                      @click.stop="applyTheme(mode.value)"
                    >
                      {{ mode.name }}
                    </button>
                  </div>
                </template>
              </CustomCard>
            </div>
          </section>

          <!-- 关于卡片 -->
          <section class="section-container about-section">
            <CustomCard
              title="关于 CFMS"
              description="程序版本信息和说明"
              icon="ℹ️"
              bg-color="rgba(100, 116, 139, 0.1)"
              fg-color="#64748b"
              @click="handleFeature('About')"
            />
          </section>

        </div>
      </div>
    </div>

    <!-- 使用ToastMessage组件 -->
    <ToastMessage
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @update:show="showToast = $event"
    />
  </div>
</template>

<style scoped>
.config-view {
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.config-scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  padding-top: 0;
}

.config-content-wrapper {
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.config-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: calc(80px + 20px);
}

.section-container {
  width: 100%;
}

/* 用户卡片样式 */
.user-card-wrapper {
  position: relative;
  width: 100%;
}

.user-card-compact {
  position: relative;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 150px;
  display: flex;
  flex-direction: column;
}

.user-ribbon {
  position: absolute;
  top: 8px;
  right: -30px;
  width: 100px;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 0;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.user-info-detail-compact {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  margin-bottom: 16px;
}

.avatar-box {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-color), #667eea);
  border-radius: 50%;
  font-weight: 600;
  color: white;
  font-size: 22px;
}

.name-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.user-display-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  display: inline-block;
}

.user-email {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.8;
}

.user-card-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.upgrade-link {
  color: var(--accent-color);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(var(--accent-color-rgb), 0.1);
  transition: all 0.2s ease;
}

.upgrade-link:hover {
  background: rgba(var(--accent-color-rgb), 0.2);
  text-decoration: none;
}

.logout-btn-compact {
  background: var(--bg-hover);
  border: none;
  color: #ef4444;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn-compact:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* 功能卡片网格 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.vip-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #5d3d00;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 设置选择器和API选择器样式 */
.api-selector {
  position: relative;
  width: 100%;
}

.api-selector select {
  width: 100%;
  padding: 8px 10px;
  padding-right: 28px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 13px;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.api-selector select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.2);
}

.api-selector select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
  font-size: 10px;
}

/* 设置卡片特殊样式 */
.setting-picker {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.setting-picker button {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-picker button:hover:not(.active) {
  background: var(--bg-hover);
}

.setting-picker button.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* 关于卡片区域 */
.about-section {
  margin-bottom: 40px;
}

/* 滚动条样式 */
.config-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.config-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.config-scroll-area::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .config-content {
    padding: 16px;
    gap: 20px;
    padding-bottom: calc(60px + 20px);
  }
  
  .features-grid {
    gap: 10px;
  }
  
  .user-card-compact {
    padding: 16px;
    min-height: 130px;
  }
  
  .avatar-box {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  
  .user-display-name {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .config-content {
    gap: 16px;
    padding-bottom: calc(60px + 16px);
  }
  
  .features-grid {
    gap: 8px;
  }
  
  .setting-picker {
    gap: 6px;
  }
  
  .setting-picker button {
    padding: 6px 8px;
    font-size: 12px;
  }
}

/* 使用:deep()替代已弃用的>>>选择器 */
:deep(.custom-card) {
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

:deep(.custom-card-content) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.card-main) {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

:deep(.card-content) {
  flex: 1;
  min-height: 60px;
  display: flex;
  flex-direction: column;
}

:deep(.card-description) {
  flex: 1;
  display: flex;
  align-items: center;
}

:deep(.custom-card .card-toggle) {
  margin-top: auto;
  padding-top: 8px;
}

:deep(.custom-card .card-toggle-content) {
  width: 100%;
}
</style>