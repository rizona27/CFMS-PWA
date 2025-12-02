<template>
  <div class="config-view">
    <div class="config-header"></div>

    <div class="config-scroll-area">
      <div class="config-content-wrapper">
        <div class="config-content">

          <!-- 用户信息卡片 -->
          <section class="section-container user-section">
            <div class="user-card-wrapper">
              <CustomCard 
                title="" 
                description="" 
                icon="" 
                @click="handleFeature('UserInfo')"
                class="user-card-compact"
                :isGlassEffect="false"
                :style="{ 
                  'background': userCardStyles.cardBg, 
                  'border-color': userCardStyles.borderColor,
                }"
              >
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
                    <span class="avatar-char">{{ authStore.displayName.charAt(0) }}</span>
                  </div>
                  <div class="name-status">
                    <p 
                      class="user-display-name" 
                      :style="{ 
                        'background': userType !== 'free' ? userCardStyles.nameGradient : 'unset',
                        'font-style': userType !== 'free' ? 'italic' : 'normal',
                        'color': userType === 'free' ? 'var(--text-primary)' : 'transparent',
                        '-webkit-background-clip': userType !== 'free' ? 'text' : 'unset',
                        '-webkit-text-fill-color': userType !== 'free' ? 'transparent' : 'unset',
                        'background-clip': userType !== 'free' ? 'text' : 'unset',
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
              </CustomCard>
            </div>
          </section>

          <!-- 6个功能卡片统一放在一个section中 -->
          <section class="section-container features-section">
            <div class="features-grid">
              <!-- 第一行 -->
              <CustomCard 
                title="云端同步" 
                description="持仓数据上传与下载" 
                icon="☁️" 
                :fgColor="userType !== 'free' ? '#9333ea' : 'var(--text-secondary)'"
                :bgColor="userType !== 'free' ? 'rgba(147, 51, 234, 0.1)' : 'var(--bg-hover)'"
                :isGlassEffect="userType !== 'free'"
                :class="{ 'disabled-card': userType === 'free' }"
                @click="handleFeature('CloudSync')"
              />
              <CustomCard 
                title="管理持仓" 
                description="新增、编辑或清空持仓数据" 
                icon="📁" 
                bgColor="rgba(59, 130, 246, 0.1)"
                fgColor="#3b82f6"
                @click="handleFeature('ManageHoldings')"
              />
              
              <!-- 第二行 -->
              <CustomCard 
                title="日志查询" 
                description="API请求与响应日志" 
                icon="📜" 
                bgColor="rgba(6, 182, 212, 0.1)"
                fgColor="#06b6d4"
                @click="handleFeature('APILog')"
              />
              <CustomCard 
                title="数据接口" 
                description="切换基金数据源" 
                icon="🌐"
                bgColor="rgba(249, 115, 22, 0.1)"
                fgColor="#f97316"
              >
                <div class="api-selector">
                  <select v-model="selectedAPI" :disabled="userType === 'free'">
                    <option 
                      v-for="api in fundAPIs" 
                      :key="api.value" 
                      :value="api.value"
                      :disabled="api.value !== 'eastmoney' && userType === 'free'"
                    >
                      {{ api.name }} {{ api.value !== 'eastmoney' && userType === 'free' ? ' (VIP)' : '' }}
                    </option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </CustomCard>
              
              <!-- 第三行 -->
              <CustomCard 
                title="隐私模式" 
                description="用户数据脱敏" 
                icon="🔒"
                bgColor="rgba(20, 184, 166, 0.1)"
                fgColor="#14b8a6"
                class="setting-card"
              >
                <div class="setting-picker">
                  <button 
                    :class="{ active: dataStore.isPrivacyMode }" 
                    @click.stop="dataStore.isPrivacyMode = true; dataStore.saveData(); dataStore.showToastMessage('隐私模式已开启')"
                  >
                    开启
                  </button>
                  <button 
                    :class="{ active: !dataStore.isPrivacyMode }" 
                    @click.stop="dataStore.isPrivacyMode = false; dataStore.saveData(); dataStore.showToastMessage('隐私模式已关闭')"
                  >
                    关闭
                  </button>
                </div>
              </CustomCard>
              
              <CustomCard 
                title="主题模式" 
                description="切换界面主题" 
                icon="🎨"
                bgColor="rgba(0, 150, 136, 0.1)"
                fgColor="#009688"
                class="setting-card"
              >
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
              </CustomCard>
            </div>
          </section>

          <!-- 关于卡片 -->
          <section class="section-container about-section">
            <CustomCard 
              title="关于 CFMS" 
              description="程序版本信息和说明" 
              icon="ℹ️" 
              bgColor="rgba(100, 116, 139, 0.1)"
              fgColor="#64748b"
              @click="handleFeature('About')"
              :isGlassEffect="false"
              class="about-card"
            />
          </section>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import CustomCard from '../components/common/CustomCard.vue' 

const authStore = useAuthStore()
const dataStore = useDataStore()

// 从 localStorage 或 authStore 获取用户等级
const getUserType = () => {
  const storedUserType = localStorage.getItem('userType')
  if (!storedUserType) {
    return authStore.isLoggedIn ? 'subscribed' : 'free'
  }
  return storedUserType as 'free' | 'subscribed' | 'vip'
}

const userType = ref<'free' | 'subscribed' | 'vip'>(getUserType())

// 监听登录状态变化
watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    const stored = localStorage.getItem('userType')
    userType.value = stored ? stored as 'free' | 'subscribed' | 'vip' : 'subscribed'
  } else {
    userType.value = 'free'
  }
}, { immediate: true })

// 保存用户等级到 localStorage
watch(userType, (newType) => {
  localStorage.setItem('userType', newType)
})

// 用于测试：添加一个方法切换用户等级
const cycleUserType = () => {
  const types: Array<'free' | 'subscribed' | 'vip'> = ['free', 'subscribed', 'vip']
  const currentIndex = types.indexOf(userType.value)
  const nextIndex = (currentIndex + 1) % types.length
  userType.value = types[nextIndex]
  dataStore.showToastMessage(`用户等级切换为: ${userTypeDisplay.value}`)
}

// 根据等级计算绶带文本
const userTypeDisplay = computed(() => {
  switch (userType.value) {
    case 'vip': return '尊享用户'
    case 'subscribed': return '体验用户'
    case 'free': 
    default: return '基础用户'
  }
})

// 用户卡片和用户名动态样式
const userCardStyles = computed(() => {
  switch (userType.value) {
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
  { name: '大智慧', value: 'dazhihui' }
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

  dataStore.showToastMessage(`主题已切换到: ${themeModes.find(m => m.value === mode)?.name || mode}`)
}

watch(selectedAPI, (newAPI) => {
  dataStore.showToastMessage(`数据接口已切换至: ${fundAPIs.find(a => a.value === newAPI)?.name || newAPI}`)
})

const handleFeature = (featureName: string) => {
  dataStore.showToastMessage(`功能 ${featureName} 正在开发中...`)
}

const handleUpgrade = (e: Event) => {
  e.preventDefault()
  dataStore.showToastMessage('正在跳转到升级页面...')
}

const handleLogout = () => {
  authStore.logout()
  userType.value = 'free'
  dataStore.showToastMessage('您已退出登录')
}

onMounted(() => {
  applyTheme(selectedTheme.value)
  
  // 开发测试：在控制台暴露切换用户等级的方法
  if (process.env.NODE_ENV === 'development') {
    ;(window as any).cycleUserType = cycleUserType
    console.log('开发模式：可以使用 window.cycleUserType() 切换用户等级')
  }
})
</script>

<style scoped>
.config-view {
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.config-header {
  padding: 20px 20px 0;
}

.config-scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 100px;
  position: relative;
}

.config-content-wrapper {
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 160px);
}

/* 调整三大部分之间的间距 */
.config-content {
  padding: 0 20px; 
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 功能卡片区域内部 */
.features-section {
  display: flex;
  flex-direction: column;
}

/* 修正卡片网格布局，确保始终每行2个卡片 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* 设置卡片的最小和最大宽度，防止不正常缩小 */
.features-grid :deep(.custom-card) {
  min-width: 140px;
  max-width: 100%;
  min-height: 120px; /* 增加一点高度给设置卡片 */
  height: auto; /* 改为自动高度 */
  overflow: hidden;
  padding: 14px;
  display: flex;
  flex-direction: column;
}

.features-grid :deep(.card-inner) {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  flex: 1;
}

.features-grid :deep(.card-header) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.features-grid :deep(.card-icon) {
  font-size: 18px;
  margin-top: 2px;
}

.features-grid :deep(.card-title) {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}

.features-grid :deep(.card-description) {
  font-size: 12px;
  line-height: 1.3;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* 调整卡片内容区域，给设置选项留出空间 */
.features-grid :deep(.card-content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-top: 4px;
  padding-bottom: 4px; /* 增加底部内边距 */
}

/* 设置选择器和API选择器样式 */
.api-selector {
  position: relative;
  margin-top: 8px;
  margin-bottom: 4px; /* 确保不贴卡片底部 */
}

.api-selector select {
  width: 100%;
  padding: 8px 10px;
  padding-right: 28px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
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
.setting-card :deep(.custom-card) {
  min-height: 130px; /* 设置卡片需要更高一些 */
}

.setting-card :deep(.card-content) {
  padding-bottom: 8px; /* 设置卡片底部内边距更大 */
}

.setting-picker {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 4px; /* 确保不贴卡片底部 */
}

.setting-picker button {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
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

/* 用户卡片样式 - 完全重构 */
.user-card-wrapper {
  position: relative;
  width: 100%;
}

.user-card-compact {
  position: relative;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
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
  gap: 12px;
  flex: 1;
  margin-bottom: 10px; /* 给按钮留出空间 */
}

.avatar-box {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-hover);
  border-radius: 50%;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 18px;
}

.name-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-display-name {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  display: inline-block;
}

/* 修正按钮位置：升级在左下角，退出在右下角 */
.user-card-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: auto; /* 推到卡片底部 */
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.upgrade-link {
  color: var(--accent-color);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(var(--accent-color-rgb), 0.1);
  transition: all 0.2s ease;
  order: 1;
}

.upgrade-link:hover {
  background: rgba(var(--accent-color-rgb), 0.2);
  text-decoration: none;
}

.logout-btn-compact {
  background: var(--bg-hover);
  border: none;
  color: #ef4444;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  order: 2;
}

.logout-btn-compact:hover {
  background: rgba(239, 68, 68, 0.1);
}

.user-card-compact :deep(.card-inner) {
  gap: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-card-compact :deep(.card-header) {
  display: block;
}

.user-card-compact :deep(.text-group) {
  display: none;
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

/* 关于卡片区域 */
.about-section {
  margin-bottom: 40px;
}

.about-card :deep(.custom-card) {
  min-height: 100px;
  height: 100px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .features-grid :deep(.custom-card) {
    min-width: 130px;
    min-height: 120px;
  }
  
  .setting-card :deep(.custom-card) {
    min-height: 125px;
  }
}

@media (max-width: 480px) {
  .config-content-wrapper {
    max-width: 100%;
  }
  
  .config-scroll-area {
    padding-bottom: 120px;
  }
  
  .config-content-wrapper {
    min-height: calc(100vh - 200px);
  }
  
  .config-content {
    gap: 20px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .features-grid :deep(.custom-card) {
    min-width: 120px;
    min-height: 115px;
    padding: 12px;
  }
  
  .setting-card :deep(.custom-card) {
    min-height: 120px;
  }
  
  .user-info-detail-compact {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
  
  .user-card-buttons {
    padding-top: 10px;
  }
}

/* 防止在极窄的屏幕上卡片过小 */
@media (max-width: 360px) {
  .features-grid {
    gap: 6px;
  }
  
  .features-grid :deep(.custom-card) {
    min-width: 110px;
    padding: 10px;
    min-height: 110px;
  }
  
  .setting-card :deep(.custom-card) {
    min-height: 115px;
  }
  
  .features-grid :deep(.card-title) {
    font-size: 14px;
  }
  
  .features-grid :deep(.card-description) {
    font-size: 11px;
  }
  
  .user-card-compact {
    min-height: 130px;
    padding: 14px;
  }
}
</style>