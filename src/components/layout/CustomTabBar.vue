<template>
  <div class="ios-tab-bar-container">
    <div class="ios-tab-bar glass-effect">
      <div class="tab-buttons">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{ 
            active: activeTab === tab.id,
            'button-glass': activeTab === tab.id
          }"
          @click="switchTab(tab.id)"
        >
          <div class="button-inner">
            <div class="icon-container">
              <span class="tab-icon">{{ tab.icon }}</span>
            </div>
            <span class="tab-label">{{ tab.label }}</span> 
          </div>
          <div class="active-indicator" v-if="activeTab === tab.id"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { id: 'summary', icon: '📊', label: '一览' },
  { id: 'client', icon: '👥', label: '客户' },
  { id: 'ranking', icon: '🏆', label: '排名' },
  { id: 'config', icon: '⚙️', label: '设置' }
]

const activeTab = ref('summary')

const switchTab = (tabId: string) => {
  activeTab.value = tabId
  router.push({ name: tabId })
}

watch(
  () => route.name,
  (routeName) => {
    if (routeName && typeof routeName === 'string') {
      activeTab.value = routeName
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.ios-tab-bar-container {
  position: fixed;
  bottom: 20px; 
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  z-index: 1000;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  pointer-events: none;
}

.ios-tab-bar {
  pointer-events: auto;
  border-radius: 999px; 
  padding: 8px;
  max-width: 400px; 
  margin: 0 auto;
  /* 保持整体外层药丸的磨玻璃效果 */
  box-shadow: var(--card-shadow), 
              0 12px 60px rgba(79, 172, 254, 0.2);
}

.tab-buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 4px;
}

.tab-button {
  position: relative;
  display: flex;
  justify-content: center; 
  align-items: center;
  
  background: transparent;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  /* 统一且平滑的过渡 */
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  
  border-radius: 999px; 
  min-width: unset; 
  /* 关键：未选中时，按钮占据较小空间 */
  flex-grow: 1; 
  overflow: hidden;
}

.tab-button:hover:not(.active) {
  background: var(--bg-hover);
}

.tab-button.active {
  transform: none; 
  /* 关键：激活时，按钮占据更多空间，扩展药丸效果 */
  flex-grow: 3; 
}

/* 1. 过渡和边框极致柔和化 (激活按钮) */
.button-glass {
  background: rgba(79, 172, 254, 0.1) !important; /* 进一步降低透明度 */
  /* 关键修正：边框线极其淡，只有微弱的高光感 */
  border: 1px solid rgba(79, 172, 254, 0.05); 
  box-shadow: 
    0 4px 15px rgba(79, 172, 254, 0.05), /* 降低外部阴影强度 */
    inset 0 0 4px rgba(255, 255, 255, 0.3); /* 降低内部高光强度 */
}

.button-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 2;
  height: 24px;
  /* 关键：调整内部元素对齐，使激活时图标和文字对齐 */
  padding-right: 6px; 
}

.icon-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon {
  font-size: 20px;
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  /* 未选中时：黑白、低透明度、非强调色 */
  filter: grayscale(100%); 
  opacity: 0.7;
  color: var(--text-primary);
}

.tab-button.active .tab-icon {
  transform: none;
  /* 选中时：彩色、高透明度、强调色 */
  filter: none;
  opacity: 1;
  color: var(--accent-color);
}

.tab-label {
  font-size: 14px; 
  font-weight: 600;
  letter-spacing: 0;
  white-space: nowrap; 
  min-width: 30px; 
  
  /* 关键：文字的颜色和透明度过渡 */
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* 2. 激活状态下的文字显示协调性 (着色) */
.tab-button:not(.active) .tab-label {
  /* 未选中时：次要文本颜色，略微不透明 */
  color: var(--text-secondary);
  opacity: 0.8;
  /* 关键：确保未激活时文字完全显示 */
  width: auto;
  transform: translateX(0);
}

.tab-button.active .tab-label {
  /* 选中时：着重强调色，完全不透明 */
  color: var(--accent-color);
  opacity: 1;
  /* 保持文字完全显示，并通过 flex-grow: 3 实现了扩展效果 */
  width: auto;
  transform: translateX(0);
}


.active-indicator {
  display: none;
}

/* 适配深色模式 */
.dark-mode .ios-tab-bar {
    background: var(--glass-bg); 
    border: 1px solid var(--glass-border); 
    box-shadow: var(--card-shadow), 0 12px 60px rgba(0, 0, 0, 0.4);
}

.dark-mode .tab-button:hover:not(.active) {
  background: var(--bg-hover);
}

/* 深色模式下的磨玻璃激活按钮样式 (极致柔和化) */
.dark-mode .button-glass {
  background: rgba(79, 172, 254, 0.1) !important; /* 进一步降低透明度 */
  border: 1px solid rgba(79, 172, 254, 0.08); /* 极淡边框 */
  box-shadow: 
    0 4px 15px rgba(79, 172, 254, 0.05),
    inset 0 0 4px rgba(255, 255, 255, 0.08); 
}

.dark-mode .tab-button.active .tab-icon {
  color: var(--accent-color); 
}

.dark-mode .tab-button.active .tab-label {
  color: var(--accent-color); 
}
</style>