<template>
  <div class="config-view">
    <!-- 自定义导航栏 -->
    <div class="custom-navbar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
        返回
      </button>
      <h1 class="page-title">系统设置</h1>
      <div class="nav-spacer"></div>
    </div>

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
                  {{ authStore.userTypeDisplay }}
                </div>

                <div class="user-info-detail-compact">
                  <div class="avatar-box">
                    <span class="avatar-char">{{ authStore.displayName.charAt(0) }}</span>
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
                      {{ authStore.displayName }}
                    </p>
                  </div>
                </div>

                <!-- 按钮容器 -->
                <div class="user-card-buttons">
                  <a href="#" class="upgrade-link" @click.stop="handleUpgrade">升级</a>
                  <button class="action-btn-secondary logout-btn-compact" @click.stop="handleLogout">退出</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 6个功能卡片统一放在一个section中 -->
          <section class="section-container features-section">
            <div class="features-grid">
              <!-- 第一行 -->
              <div 
                class="feature-card"
                :class="{ 'disabled-card': authStore.userType === 'free' }"
                :style="{
                  background: authStore.userType !== 'free' ? 'rgba(147, 51, 234, 0.1)' : 'var(--bg-hover)',
                  border: authStore.userType !== 'free' ? '1px solid rgba(147, 51, 234, 0.2)' : '1px solid var(--border-color)'
                }"
                @click="handleFeature('CloudSync')"
              >
                <div class="card-inner">
                  <div class="card-header">
                    <span class="card-icon">☁️</span>
                    <div class="text-group">
                      <h3 class="card-title">云端同步</h3>
                      <p class="card-description">持仓数据上传与下载</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                class="feature-card"
                style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2)"
                @click="handleFeature('ManageHoldings')"
              >
                <div class="card-inner">
                  <div class="card-header">
                    <span class="card-icon">📁</span>
                    <div class="text-group">
                      <h3 class="card-title">管理持仓</h3>
                      <p class="card-description">新增、编辑或清空持仓数据</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 第二行 -->
              <div 
                class="feature-card"
                style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2)"
                @click="handleFeature('APILog')"
              >
                <div class="card-inner">
                  <div class="card-header">
                    <span class="card-icon">📜</span>
                    <div class="text-group">
                      <h3 class="card-title">日志查询</h3>
                      <p class="card-description">API请求与响应日志</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                class="feature-card"
                style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.2)"
              >
                <div class="card-inner">
                  <div class="card-header">
                    <span class="card-icon">🌐</span>
                    <div class="text-group">
                      <h3 class="card-title">数据接口</h3>
                      <p class="card-description">切换基金数据源</p>
                    </div>
                  </div>
                  <div class="api-selector">
                    <select v-model="selectedAPI" :disabled="authStore.userType === 'free'">
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
                </div>
              </div>
              
              <!-- 第三行 -->
              <div 
                class="feature-card setting-card"
                style="background: rgba(20, 184, 166, 0.1); border: 1px solid rgba(20, 184, 166, 0.2)"
              >
                <div class="card-inner">
                  <div class="card-header">
                    <span class="card-icon">🔒</span>
                    <div class="text-group">
                      <h3 class="card-title">隐私模式</h3>
                      <p class="card-description">用户数据脱敏</p>
                    </div>
                  </div>
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
                </div>
              </div>
              
              <div 
                class="feature-card setting-card"
                style="background: rgba(0, 150, 136, 0.1); border: 1px solid rgba(0, 150, 136, 0.2)"
              >
                <div class="card-inner">
                  <div class="card-header">
                    <span class="card-icon">🎨</span>
                    <div class="text-group">
                      <h3 class="card-title">主题模式</h3>
                      <p class="card-description">切换界面主题</p>
                    </div>
                  </div>
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
                </div>
              </div>
            </div>
          </section>

          <!-- 关于卡片 -->
          <section class="section-container about-section">
            <div 
              class="feature-card about-card"
              style="background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(100, 116, 139, 0.2)"
              @click="handleFeature('About')"
            >
              <div class="card-inner">
                <div class="card-header">
                  <span class="card-icon">ℹ️</span>
                  <div class="text-group">
                    <h3 class="card-title">关于 CFMS</h3>
                    <p class="card-description">程序版本信息和说明</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>

    <!-- Toast消息 -->
    <div v-if="showLocalToast" class="toast-message" :class="toastType">
      {{ localToastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, UserType } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

// 本地Toast状态
const showLocalToast = ref(false)
const localToastMessage = ref('')
const toastType = ref<'info' | 'success' | 'error' | 'warning'>('info')

// 显示Toast消息
const showToast = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  localToastMessage.value = message
  toastType.value = type
  showLocalToast.value = true
  
  setTimeout(() => {
    showLocalToast.value = false
  }, 3000)
}

// 用户卡片和用户名动态样式
const userCardStyles = computed(() => {
  switch (authStore.userTypeForDisplay.value) {
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

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('themeMode') || 'system'
  }
  return 'system'
}
const selectedTheme = ref(getInitialTheme()) 

const fundAPIs = [
  { name: '天天基金', value: 'eastmoney' },
  { name: '同花顺', value: 'ths' },
  { name: '腾讯财经', value: 'tencent' },
  { name: '蚂蚁基金', value: 'fund123' }
]
const selectedAPI = ref('eastmoney')

const applyTheme = (mode: string) => {
  selectedTheme.value = mode
  localStorage.setItem('themeMode', mode)
  
  const root = document.getElementById('app')
  if (!root) return

  root.classList.remove('dark-mode', 'theme-light')
  
  if (mode === 'dark') {
    root.classList.add('dark-mode')
  } else if (mode === 'light') {
    root.classList.add('theme-light')
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark-mode')
    } else {
      root.classList.add('theme-light')
    }
  }

  showToast(`主题已切换到: ${themeModes.find(m => m.value === mode)?.name || mode}`, 'success')
}

const togglePrivacyMode = (enabled: boolean) => {
  dataStore.isPrivacyMode = enabled
  dataStore.saveData()
  showToast(`隐私模式已${enabled ? '开启' : '关闭'}`, 'success')
}

const handleFeature = (featureName: string) => {
  switch (featureName) {
    case 'About':
      router.push('/about')
      break
    case 'ManageHoldings':
      router.push('/holdings')
      break
    case 'APILog':
      router.push('/logs')
      break
    case 'CloudSync':
      if (authStore.userType === 'free') {
        showToast('该功能需要升级到VIP用户', 'warning')
      } else {
        showToast('云端同步功能正在开发中...', 'info')
      }
      break
    case 'UserInfo':
      showToast('用户信息功能正在开发中...', 'info')
      break
    default:
      showToast(`功能 ${featureName} 正在开发中...`, 'info')
  }
}

const handleUpgrade = (e: Event) => {
  e.preventDefault()
  showToast('正在跳转到升级页面...', 'info')
}

const handleLogout = () => {
  authStore.logout()
  showToast('您已退出登录', 'info')
  router.push('/auth')
}

const goBack = () => {
  router.back()
}

watch(selectedAPI, (newAPI) => {
  showToast(`数据接口已切换至: ${fundAPIs.find(a => a.value === newAPI)?.name || newAPI}`, 'success')
})

onMounted(() => {
  applyTheme(selectedTheme.value)
  
  // 初始化数据
  dataStore.loadData()
  
  // 监听全局数据变化
  watch(() => dataStore.toastMessage, (newMessage) => {
    if (newMessage && dataStore.showToast) {
      showToast(newMessage, 'info')
    }
  })
})
</script>

<style scoped>
.config-view {
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
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
  width: 80px;
}

.config-scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
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
  min-height: 140px;
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
}

.user-display-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  display: inline-block;
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

.feature-card {
  min-height: 120px;
  height: auto;
  overflow: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-card.disabled-card {
  opacity: 0.6;
  cursor: not-allowed;
}

.feature-card.disabled-card:hover {
  transform: none;
  box-shadow: none;
}

.card-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  flex: 1;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 4px;
}

.card-icon {
  font-size: 24px;
  margin-top: 2px;
}

.text-group {
  flex: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.card-description {
  font-size: 12px;
  line-height: 1.3;
  color: var(--text-secondary);
}

/* 设置选择器和API选择器样式 */
.api-selector {
  position: relative;
  margin-top: 8px;
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
.setting-card {
  min-height: 130px;
}

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
.about-card {
  min-height: 100px;
}

/* Toast消息 */
.toast-message {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 80%;
  text-align: center;
  animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s;
  animation-fill-mode: forwards;
  font-size: 14px;
}

.toast-message.info {
  border-left: 4px solid #2196f3;
}

.toast-message.success {
  border-left: 4px solid #4caf50;
}

.toast-message.error {
  border-left: 4px solid #f44336;
}

.toast-message.warning {
  border-left: 4px solid #ff9800;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
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
  }
  
  .features-grid {
    gap: 10px;
  }
  
  .feature-card {
    min-height: 115px;
    padding: 14px;
  }
  
  .setting-card {
    min-height: 120px;
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
  }
  
  .features-grid {
    gap: 8px;
  }
  
  .feature-card {
    min-height: 110px;
    padding: 12px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-description {
    font-size: 11px;
  }
  
  .setting-card {
    min-height: 115px;
  }
  
  .setting-picker {
    gap: 6px;
  }
  
  .setting-picker button {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .toast-message {
    bottom: 80px;
    max-width: 90%;
    font-size: 13px;
    padding: 10px 16px;
  }
}

/* 防止在极窄的屏幕上卡片过小 */
@media (max-width: 360px) {
  .features-grid {
    gap: 6px;
  }
  
  .feature-card {
    min-width: 110px;
    min-height: 105px;
    padding: 10px;
  }
  
  .setting-card {
    min-height: 110px;
  }
}
</style>