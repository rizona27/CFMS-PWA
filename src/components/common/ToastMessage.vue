<template>
  <transition name="toast">
    <div v-if="show" class="toast-message" :class="[type, position]" :style="styleObject">
      <div class="toast-icon" v-if="icon">{{ icon }}</div>
      <span class="toast-text">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
  position?: 'top' | 'middle' | 'bottom'
  duration?: number
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  position: 'bottom',
  duration: 3000,
  icon: ''
})

const styleObject = computed(() => {
  const styles: any = {}
  
  if (props.position === 'top') {
    styles.top = '20px'
    styles.bottom = 'auto'
  } else if (props.position === 'middle') {
    styles.top = '50%'
    styles.transform = 'translate(-50%, -50%)'
    styles.bottom = 'auto'
  } else {
    styles.bottom = '100px'
  }
  
  return styles
})
</script>

<style scoped>
.toast-message {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  max-width: 80%;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s;
  animation-fill-mode: forwards;
  font-size: 14px;
  font-weight: 500;
}

.toast-message.top {
  top: 20px;
  bottom: auto;
}

.toast-message.middle {
  top: 50%;
  transform: translate(-50%, -50%);
}

.toast-message.bottom {
  bottom: 100px;
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
}

/* 类型样式 */
.toast-message.info {
  border-left: 4px solid #2196f3;
  background: linear-gradient(135deg, var(--bg-card), rgba(33, 150, 243, 0.05));
}

.toast-message.success {
  border-left: 4px solid #4caf50;
  background: linear-gradient(135deg, var(--bg-card), rgba(76, 175, 80, 0.05));
}

.toast-message.error {
  border-left: 4px solid #f44336;
  background: linear-gradient(135deg, var(--bg-card), rgba(244, 67, 54, 0.05));
}

.toast-message.warning {
  border-left: 4px solid #ff9800;
  background: linear-gradient(135deg, var(--bg-card), rgba(255, 152, 0, 0.05));
}

/* 动画 */
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

/* 响应式 */
@media (max-width: 768px) {
  .toast-message {
    max-width: 90%;
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .toast-message.bottom {
    bottom: 80px;
  }
}
</style>