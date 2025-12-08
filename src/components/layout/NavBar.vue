<template>
  <div class="custom-navbar" :class="{ 'with-shadow': shadow }">
    <button class="back-button" @click="handleBack">
      <span class="back-icon">←</span>
      {{ backText }}
    </button>
    <h1 class="page-title">{{ title }}</h1>
    <div class="nav-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  title: string
  backText?: string
  backRoute?: string
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  backText: '返回',
  backRoute: '',
  shadow: true
})

const router = useRouter()

const handleBack = () => {
  if (props.backRoute) {
    router.push(props.backRoute)
  } else {
    router.back()
  }
}
</script>

<style scoped>
.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card, #ffffff);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.custom-navbar.with-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  color: var(--text-primary, #1e293b);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: var(--accent-color, #3b82f6);
  color: white;
  border-color: var(--accent-color, #3b82f6);
}

.back-icon {
  font-size: 18px;
  line-height: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin: 0;
  text-align: center;
  flex: 1;
}

.nav-spacer {
  width: 80px;
  visibility: hidden;
}

/* 深色模式适配 */
:root.dark .custom-navbar {
  background: var(--bg-card, #16213e);
  border-color: var(--border-color, #334155);
}

:root.dark .custom-navbar.with-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:root.dark .back-button {
  background: var(--bg-hover, rgba(255, 255, 255, 0.05));
  border-color: var(--border-color, #334155);
  color: var(--text-primary, #f1f5f9);
}

:root.dark .back-button:hover {
  background: var(--accent-color, #60a5fa);
  border-color: var(--accent-color, #60a5fa);
}

:root.dark .page-title {
  color: var(--text-primary, #f1f5f9);
}

@media (max-width: 768px) {
  .custom-navbar {
    padding: 10px 12px;
  }
  
  .back-button {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .page-title {
    font-size: 16px;
  }
}
</style>
