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
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
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
</style>
