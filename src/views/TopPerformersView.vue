<template>
  <div class="top-performers-view">
    <div class="top-performers-header">
      <h1>业绩排名</h1>
      <p>正在开发中...</p>
    </div>
    <div class="top-performers-content">
      <div class="placeholder">
        <div class="placeholder-icon">🏆</div>
        <h3>功能即将上线</h3>
        <p>业绩排名页面正在开发中</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑
</script>

<style scoped>
.top-performers-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-performers-header {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.top-performers-header h1 {
  color: #333;
  font-size: 22px;
  margin-bottom: 8px;
}

.top-performers-header p {
  color: #666;
  font-size: 14px;
}

.top-performers-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
}

.placeholder {
  text-align: center;
  padding: 40px;
}

.placeholder-icon {
  font-size: 60px;
  margin-bottom: 20px;
  animation: spin 4s linear infinite;
}

.placeholder h3 {
  color: #4facfe;
  margin-bottom: 10px;
  font-size: 18px;
}

.placeholder p {
  color: #888;
  font-size: 14px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>