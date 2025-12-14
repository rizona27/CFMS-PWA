<template>
  <div class="no-results-wrapper">
    <div class="no-results-content">
      <div class="icon-container">
        <img
          src="@/assets/noresults.png"
          alt="无搜索结果"
          class="no-results-icon"
        />
      </div>

      <div class="text-content">
        <h1 class="main-title">无筛选结果</h1>
        <p class="subtitle">请修改筛选条件</p>
      </div>

      <div class="decorative-elements">
        <div class="decor-line decor-1"></div>
        <div class="decor-line decor-2"></div>
        <div class="decor-line decor-3"></div>
        <div class="decor-line decor-4"></div>
        <div class="decor-circle decor-circle-1"></div>
        <div class="decor-circle decor-circle-2"></div>
        <div class="decor-circle decor-circle-3"></div>
        <div class="decor-dot decor-dot-1"></div>
        <div class="decor-dot decor-dot-2"></div>
        <div class="decor-dot decor-dot-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  fullHeight?: boolean
}>()
</script>

<style scoped>
.no-results-wrapper {
  width: 100%;
  height: auto;
  min-height: 200px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding-top: 40px;
  margin-top: 20px;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.no-results-content {
  text-align: center;
  padding: 40px 32px;
  max-width: 400px;
  z-index: 10;
  position: relative;
}

.icon-container {
  width: 90px;
  height: 90px;
  margin: 0 auto 24px;
  background-color: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #fecaca;
  position: relative;
  z-index: 2;
}

.icon-container::before {
  content: '';
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(254, 202, 202, 0.3), rgba(254, 226, 226, 0.2));
  z-index: 1;
}

.no-results-icon {
  width: 45px;
  height: 45px;
  filter: brightness(0.9);
  z-index: 2;
  position: relative;
}

.main-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  position: relative;
  z-index: 2;
}

.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

/* 装饰线条 */
.decor-line {
  position: absolute;
  width: 180px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  opacity: 0.15;
  animation: moveLine 20s infinite linear;
  filter: blur(0.5px);
}

.decor-1 {
  top: 20%;
  left: -10%;
  transform: rotate(30deg);
  animation-delay: 0s;
  animation-duration: 25s;
}

.decor-2 {
  bottom: 25%;
  right: -15%;
  transform: rotate(-45deg);
  animation-delay: 5s;
  animation-duration: 22s;
}

.decor-3 {
  top: 40%;
  left: -5%;
  transform: rotate(15deg);
  animation-delay: 10s;
  animation-duration: 28s;
  opacity: 0.1;
}

.decor-4 {
  bottom: 40%;
  right: -10%;
  transform: rotate(-25deg);
  animation-delay: 15s;
  animation-duration: 24s;
  opacity: 0.1;
}

/* 装饰圆圈 */
.decor-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--accent-color);
  opacity: 0.08;
  animation: floatCircle 30s infinite ease-in-out;
}

.decor-circle-1 {
  width: 150px;
  height: 150px;
  top: 15%;
  left: 10%;
  animation-delay: 0s;
  animation-duration: 40s;
}

.decor-circle-2 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  right: 15%;
  animation-delay: 10s;
  animation-duration: 35s;
}

.decor-circle-3 {
  width: 70px;
  height: 70px;
  top: 60%;
  left: 20%;
  animation-delay: 20s;
  animation-duration: 30s;
  opacity: 0.05;
}

/* 装饰点 */
.decor-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--accent-color);
  opacity: 0.2;
  animation: pulseDot 8s infinite ease-in-out;
  filter: blur(0.5px);
}

.decor-dot-1 {
  top: 30%;
  left: 80%;
  animation-delay: 0s;
}

.decor-dot-2 {
  top: 70%;
  left: 10%;
  animation-delay: 2s;
}

.decor-dot-3 {
  top: 50%;
  left: 90%;
  animation-delay: 4s;
  width: 6px;
  height: 6px;
}

@keyframes moveLine {
  0% {
    transform: translateX(-100px) rotate(var(--rotation, 30deg));
  }
  100% {
    transform: translateX(calc(100vw + 100px)) rotate(var(--rotation, 30deg));
  }
}

@keyframes floatCircle {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(20px, -15px) rotate(120deg);
  }
  66% {
    transform: translate(-10px, 10px) rotate(240deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

@keyframes pulseDot {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.2);
  }
}

@media (max-width: 768px) {
  .no-results-wrapper {
    min-height: 180px;
    padding-top: 30px;
    margin-top: 15px;
  }
  
  .no-results-content {
    padding: 32px 16px;
  }
  
  .icon-container {
    width: 75px;
    height: 75px;
    margin-bottom: 20px;
  }
  
  .icon-container::before {
    width: 90px;
    height: 90px;
  }
  
  .no-results-icon {
    width: 40px;
    height: 40px;
  }
  
  .main-title {
    font-size: 18px;
    margin-bottom: 6px;
  }
  
  .subtitle {
    font-size: 13px;
  }
  
  .decor-1,
  .decor-2,
  .decor-3,
  .decor-4 {
    width: 120px;
  }
  
  .decor-circle-1 {
    width: 100px;
    height: 100px;
  }
  
  .decor-circle-2 {
    width: 70px;
    height: 70px;
  }
  
  .decor-circle-3 {
    width: 50px;
    height: 50px;
  }
}

:root.dark .icon-container {
  background-color: rgba(127, 29, 29, 0.2);
  border-color: rgba(127, 29, 29, 0.4);
}

:root.dark .icon-container::before {
  background: linear-gradient(135deg, rgba(127, 29, 29, 0.2), rgba(69, 10, 10, 0.1));
}
</style>