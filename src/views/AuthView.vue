<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">CFMS基金管理系统</h1>
        <p class="auth-subtitle">专业基金客户管理系统</p>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              required
              autocomplete="username"
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="请输入密码"
              required
              autocomplete="current-password"
            />
          </div>
          
          <button type="submit" class="login-button" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>
        
        <!-- 测试登录区域 -->
        <div class="test-login">
          <h3>快速测试登录</h3>
          <div class="test-buttons">
            <button class="test-button vip" @click="quickLogin('admin')">
              <span class="test-icon">👑</span>
              <span class="test-label">VIP用户</span>
              <span class="test-username">admin</span>
            </button>
            <button class="test-button subscribed" @click="quickLogin('user')">
              <span class="test-icon">⭐</span>
              <span class="test-label">体验用户</span>
              <span class="test-username">user</span>
            </button>
            <button class="test-button free" @click="quickLogin('guest')">
              <span class="test-icon">👤</span>
              <span class="test-label">基础用户</span>
              <span class="test-username">guest</span>
            </button>
          </div>
        </div>
        
        <div class="auth-footer">
          <p>提示：可以使用 admin/user/guest 登录，密码任意</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const authStore = useAuthStore()

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login(username.value, password.value)
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败'
  } finally {
    isLoading.value = false
  }
}

// 快速登录函数
const quickLogin = (testUsername: string) => {
  username.value = testUsername
  password.value = '123456' // 任意密码
  handleLogin()
}
</script>

<style scoped>
.auth-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.auth-title {
  color: #333;
  text-align: center;
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 600;
}

.auth-subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s, transform 0.2s;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

/* 测试登录区域 */
.test-login {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.test-login h3 {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  font-weight: 500;
}

.test-buttons {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.test-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
}

.test-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.test-button.vip {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
}

.test-button.subscribed {
  background: linear-gradient(135deg, #E0E0E0, #B0B0B0);
  color: #333;
}

.test-button.free {
  background: linear-gradient(135deg, #9E9E9E, #757575);
  color: white;
}

.test-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.test-label {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
}

.test-username {
  font-size: 12px;
  opacity: 0.8;
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.auth-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 12px;
  color: #999;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>