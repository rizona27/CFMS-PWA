<template>
  <div 
    class="custom-card" 
    :class="{ 'glass-effect': isGlassEffect }"
    :style="cardStyle"
    @click="handleClick"
  >
    <div class="card-inner">
      <div class="card-header">
        <div v-if="icon" class="icon-container" :style="{ color: fgColor }">
          <span class="icon">{{ icon }}</span>
        </div>
        <div class="text-group">
          <h3 v-if="title" class="card-title" :style="{ color: fgColor }">{{ title }}</h3>
          <p v-if="description" class="card-description" :style="{ color: `${fgColor}aa` }">{{ description }}</p>
        </div>
        <div class="toggle-slot" v-if="$slots.toggle">
          <slot name="toggle"></slot>
        </div>
      </div>
      
      <div class="card-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  title: String,
  description: String,
  icon: String, // Emoji or icon name
  bgColor: {
    type: String,
    default: 'var(--bg-card)'
  },
  fgColor: {
    type: String,
    default: 'var(--text-primary)'
  },
  isGlassEffect: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const cardStyle = computed(() => ({
  '--bg': props.bgColor,
  '--fg': props.fgColor,
}))

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
/* 引用 style.css 中的变量 */
.custom-card {
  background: var(--bg);
  color: var(--fg);
  border-radius: var(--card-radius); /* 16px */
  padding: 18px;
  cursor: pointer;
  transition: all 0.25s ease;
  min-height: 80px;
}

.custom-card:not(.glass-effect) {
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 10px var(--shadow-color);
}

.custom-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}

.card-inner {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-container {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon {
  font-size: 24px;
}

.text-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.card-description {
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  line-height: 1.3;
  color: var(--text-secondary);
  opacity: 0.8;
}

.card-content {
  padding-top: 5px;
}

/* 强制插槽内的内容不继承 card 的颜色，使用 Vue 应用的标准颜色 */
.card-content :deep(select),
.card-content :deep(button) {
  color: var(--text-primary);
}
</style>