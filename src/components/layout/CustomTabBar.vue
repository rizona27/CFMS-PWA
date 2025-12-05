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
  background: var(--glass-bg, rgba(255, 255, 255, 0.8));
  -webkit-backdrop-filter: blur(20px); /* Safari 9+, iOS Safari 9.2+ */
  backdrop-filter: blur(20px); /* Standard syntax */
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.2));
  box-shadow: var(--card-shadow, 0 8px 32px rgba(0, 0, 0, 0.1)), 
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
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  border-radius: 999px; 
  min-width: unset; 
  flex-grow: 1; 
  overflow: hidden;
}

.tab-button:hover:not(.active) {
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
}

.tab-button.active {
  transform: none; 
  flex-grow: 3; 
}

/* 磨玻璃效果 */
.button-glass {
  background: var(--glass-button-bg, rgba(79, 172, 254, 0.1)) !important;
  border: 1px solid var(--glass-button-border, rgba(79, 172, 254, 0.05)); 
  box-shadow: 
    0 4px 15px var(--glass-button-shadow, rgba(79, 172, 254, 0.05)),
    inset 0 0 4px var(--glass-button-highlight, rgba(255, 255, 255, 0.3));
}

.button-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 2;
  height: 24px;
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
  filter: grayscale(100%); 
  opacity: 0.7;
  color: var(--text-primary, #333333);
}

.tab-button.active .tab-icon {
  transform: none;
  filter: none;
  opacity: 1;
  color: var(--accent-color, #2196f3);
}

.tab-label {
  font-size: 14px; 
  font-weight: 600;
  letter-spacing: 0;
  white-space: nowrap; 
  min-width: 30px; 
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.tab-button:not(.active) .tab-label {
  color: var(--text-secondary, #666666);
  opacity: 0.8;
  width: auto;
  transform: translateX(0);
}

.tab-button.active .tab-label {
  color: var(--accent-color, #2196f3);
  opacity: 1;
  width: auto;
  transform: translateX(0);
}

.active-indicator {
  display: none;
}

/* 适配深色模式 */
.dark-mode .ios-tab-bar {
  background: var(--glass-bg-dark, rgba(30, 30, 30, 0.8));
  border: 1px solid var(--glass-border-dark, rgba(255, 255, 255, 0.1));
  box-shadow: var(--card-shadow-dark, 0 8px 32px rgba(0, 0, 0, 0.4));
}

.dark-mode .tab-button:hover:not(.active) {
  background: var(--bg-hover-dark, rgba(255, 255, 255, 0.05));
}

/* 深色模式下的磨玻璃激活按钮样式 */
.dark-mode .button-glass {
  background: var(--glass-button-bg-dark, rgba(79, 172, 254, 0.1)) !important;
  border: 1px solid var(--glass-button-border-dark, rgba(79, 172, 254, 0.08));
  box-shadow: 
    0 4px 15px var(--glass-button-shadow-dark, rgba(79, 172, 254, 0.05)),
    inset 0 0 4px var(--glass-button-highlight-dark, rgba(255, 255, 255, 0.08));
}

.dark-mode .tab-button.active .tab-icon {
  color: var(--accent-color-dark, #64b5f6);
}

.dark-mode .tab-button.active .tab-label {
  color: var(--accent-color-dark, #64b5f6);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .ios-tab-bar-container {
    padding: 0 16px;
    bottom: 16px;
  }
  
  .ios-tab-bar {
    max-width: 360px;
    padding: 6px;
  }
  
  .tab-button {
    padding: 6px 10px;
  }
  
  .tab-icon {
    font-size: 18px;
  }
  
  .tab-label {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .ios-tab-bar-container {
    padding: 0 12px;
    bottom: 12px;
  }
  
  .ios-tab-bar {
    max-width: 320px;
    padding: 4px;
  }
  
  .tab-button {
    padding: 4px 8px;
  }
  
  .tab-icon {
    font-size: 16px;
  }
  
  .tab-label {
    font-size: 12px;
    min-width: 24px;
  }
}
</style>