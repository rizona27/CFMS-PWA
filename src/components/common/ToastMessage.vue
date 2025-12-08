<template>
  <transition name="toast">
    <div v-if="show" class="toast-message" :class="[type]" :style="styleObject">
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
  duration?: number
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  icon: ''
})

const styleObject = computed(() => {
  return {
    bottom: '100px', // 显示在底部导航栏上方
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: '90%',
    width: 'auto',
    minWidth: '120px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
})

// 自动关闭
import { watch } from 'vue'
import { ref } from 'vue'

const emit = defineEmits(['update:show'])
const showRef = ref(props.show)

watch(() => props.show, (newVal) => {
  showRef.value = newVal
  if (newVal && props.duration > 0) {
    setTimeout(() => {
      showRef.value = false
      emit('update:show', false)
    }, props.duration)
  }
})

watch(showRef, (newVal) => {
  emit('update:show', newVal)
})
</script>

<style scoped>
.toast-message {
  position: fixed;
  z-index: 9999;
  padding: 12px 20px;
  border-radius: 10px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #1e293b);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color, #e2e8f0);
  animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s;
  animation-fill-mode: forwards;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 类型样式 - 使用CSS变量定义颜色 */
.toast-message.info {
  border-left: 4px solid var(--info-color, #2196f3);
  background: linear-gradient(135deg, var(--bg-card, #ffffff), rgba(33, 150, 243, 0.05));
}

.toast-message.success {
  border-left: 4px solid var(--success-color, #4caf50);
  background: linear-gradient(135deg, var(--bg-card, #ffffff), rgba(76, 175, 80, 0.05));
}

.toast-message.error {
  border-left: 4px solid var(--error-color, #f44336);
  background: linear-gradient(135deg, var(--bg-card, #ffffff), rgba(244, 67, 54, 0.05));
}

.toast-message.warning {
  border-left: 4px solid var(--warning-color, #ff9800);
  background: linear-gradient(135deg, var(--bg-card, #ffffff), rgba(255, 152, 0, 0.05));
}

/* 动画 - 从底部弹出 */
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
    padding: 10px 16px;
    font-size: 13px;
    max-width: 92%;
    bottom: 90px;
  }
  
  .toast-icon {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .toast-message {
    padding: 8px 14px;
    font-size: 12px;
    max-width: 95%;
    bottom: 85px;
  }
  
  .toast-icon {
    font-size: 13px;
  }
}

/* 深色模式适配 */
:root.dark .toast-message {
  background: var(--bg-card, #16213e);
  color: var(--text-primary, #f1f5f9);
  border-color: var(--border-color, #334155);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

:root.dark .toast-message.info {
  background: linear-gradient(135deg, var(--bg-card, #16213e), rgba(33, 150, 243, 0.1));
}

:root.dark .toast-message.success {
  background: linear-gradient(135deg, var(--bg-card, #16213e), rgba(76, 175, 80, 0.1));
}

:root.dark .toast-message.error {
  background: linear-gradient(135deg, var(--bg-card, #16213e), rgba(244, 67, 54, 0.1));
}

:root.dark .toast-message.warning {
  background: linear-gradient(135deg, var(--bg-card, #16213e), rgba(255, 152, 0, 0.1));
}
</style>
