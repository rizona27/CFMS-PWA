<template>
  <div class="step-indicator">
    <div class="step-indicator-content">
      <div class="steps">
        <div
          v-for="step in steps"
          :key="step.number"
          class="step-item"
          :class="{
            'active': currentStep === step.number,
            'completed': currentStep > step.number
          }"
        >
          <div class="step-circle">
            <span v-if="currentStep > step.number" class="check-icon">✓</span>
            <span v-else class="step-number">{{ step.number }}</span>
          </div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>
      
      <div class="step-progress">
        <div
          class="progress-bar"
          :style="{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentStep: number
  steps: Array<{ number: number; label: string }>
}>()
</script>

<style scoped>
.step-indicator {
  margin-bottom: 32px;
  position: relative;
}

.step-indicator-content {
  position: relative;
  padding: 0 20px;
}

.steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-item:not(:last-child) {
  margin-right: 20px;
}

.step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #6b7280;
  font-weight: 600;
  font-size: 18px;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  margin-bottom: 8px;
}

:root.dark .step-circle {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.step-item.active .step-circle {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-color: rgba(59, 130, 246, 0.3);
  transform: scale(1.1);
  box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
}

:root.dark .step-item.active .step-circle {
  box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.2);
}

.step-item.completed .step-circle {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.check-icon {
  font-size: 20px;
  font-weight: bold;
}

.step-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
  margin-top: 4px;
  transition: color 0.3s ease;
}

:root.dark .step-label {
  color: rgba(255, 255, 255, 0.6);
}

.step-item.active .step-label {
  color: #3b82f6;
  font-weight: 600;
}

:root.dark .step-item.active .step-label {
  color: #60a5fa;
}

.step-item.completed .step-label {
  color: #10b981;
}

:root.dark .step-item.completed .step-label {
  color: #34d399;
}

.step-progress {
  position: absolute;
  top: 22px;
  left: 44px;
  right: 44px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  z-index: 1;
  overflow: hidden;
}

:root.dark .step-progress {
  background: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .step-circle {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .step-label {
    font-size: 12px;
  }
  
  .step-progress {
    top: 18px;
    left: 36px;
    right: 36px;
  }
  
  .check-icon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .step-indicator-content {
    padding: 0 10px;
  }
  
  .step-item:not(:last-child) {
    margin-right: 10px;
  }
  
  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 14px;
    margin-bottom: 6px;
  }
  
  .step-progress {
    top: 16px;
    left: 32px;
    right: 32px;
  }
}
</style>
