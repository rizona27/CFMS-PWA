<template>
  <div class="client-view">
    <div class="client-header">
      <h1>客户管理</h1>
      <p>正在开发中...</p>
    </div>
    <div class="client-content">
      <div class="placeholder">
        <div class="placeholder-icon">👥</div>
        <h3>功能即将上线</h3>
        <p>客户管理页面正在开发中</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑
</script>

<style scoped>
.client-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.client-header {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.client-header h1 {
  color: #333;
  font-size: 22px;
  margin-bottom: 8px;
}

.client-header p {
  color: #666;
  font-size: 14px;
}

.client-content {
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
  animation: float 3s ease-in-out infinite;
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

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>