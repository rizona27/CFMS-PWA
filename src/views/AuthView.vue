<template>
  <div class="auth-view" :class="themeClass">
    <div class="auth-scroll-container">
      <div class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">CFMS基金管理系统</h1>
          
          <!-- 模式切换标签 -->
          <div class="mode-tabs">
            <button 
              class="mode-tab" 
              :class="{ active: !isRegistering }" 
              @click="switchToLogin"
            >
              登录
            </button>
            <button 
              class="mode-tab" 
              :class="{ active: isRegistering }" 
              @click="switchToRegister"
            >
              注册
            </button>
          </div>
          
          <!-- 登录表单 -->
          <form v-if="!isRegistering" @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group with-icon">
              <div class="icon-container">
                <span class="input-icon">👤</span>
              </div>
              <input
                v-model="loginForm.username"
                type="text"
                placeholder="用户名"
                required
                autocomplete="username"
                class="icon-input"
              />
            </div>
            
            <div class="form-group with-icon">
              <div class="icon-container">
                <span class="input-icon">🔒</span>
              </div>
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                required
                autocomplete="current-password"
                class="icon-input"
              />
            </div>
            
            <div v-if="showLoginCaptcha && loginAttempts >= 3" class="form-group captcha-group">
              <div class="captcha-row">
                <div class="captcha-input-group">
                  <div class="icon-container">
                    <span class="input-icon">🖼️</span>
                  </div>
                  <input
                    v-model="loginForm.captcha_code"
                    type="text"
                    placeholder="验证码"
                    required
                    class="icon-input captcha-input"
                  />
                </div>
                <div class="captcha-image-container">
                  <div class="captcha-image" @click="refreshCaptcha">
                    <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                    <div v-else class="captcha-placeholder">刷新</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button type="submit" class="auth-button gradient-button" :disabled="isLoading">
              <span class="button-text">
                {{ isLoading ? '登录中...' : '登录' }}
              </span>
            </button>
            
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>
          </form>
          
          <!-- 注册表单 -->
          <form v-else @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group with-icon">
              <div class="icon-container">
                <span class="input-icon">👤</span>
              </div>
              <input
                v-model="authStore.registerForm.username"
                type="text"
                placeholder="用户名"
                required
                autocomplete="username"
                class="icon-input"
              />
            </div>
            
            <div class="form-group with-icon">
              <div class="icon-container">
                <span class="input-icon">🔒</span>
              </div>
              <input
                v-model="authStore.registerForm.password"
                type="password"
                placeholder="密码"
                required
                autocomplete="new-password"
                class="icon-input"
              />
            </div>
            
            <div class="form-group with-icon">
              <div class="icon-container">
                <span class="input-icon">📧</span>
              </div>
              <input
                v-model="authStore.registerForm.email"
                type="email"
                placeholder="邮箱(选填)"
                autocomplete="email"
                class="icon-input"
              />
            </div>
            
            <div v-if="showRegisterCaptcha && registerAttempts >= 3" class="form-group captcha-group">
              <div class="captcha-row">
                <div class="captcha-input-group">
                  <div class="icon-container">
                    <span class="input-icon">🖼️</span>
                  </div>
                  <input
                    v-model="authStore.registerForm.captcha_code"
                    type="text"
                    placeholder="验证码"
                    required
                    class="icon-input captcha-input"
                  />
                </div>
                <div class="captcha-image-container">
                  <div class="captcha-image" @click="refreshCaptcha">
                    <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                    <div v-else class="captcha-placeholder">刷新</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button type="submit" class="auth-button gradient-button" :disabled="isLoading">
              <span class="button-text">
                {{ isLoading ? '注册中...' : '注册' }}
              </span>
            </button>
            
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>
          </form>
          
          <!-- 模式切换链接 -->
          <div class="mode-switch">
            <p v-if="!isRegistering">
              还没有账号？
              <a href="#" @click.prevent="switchToRegister">立即注册</a>
            </p>
            <p v-else>
              已有账号？
              <a href="#" @click.prevent="switchToLogin">立即登录</a>
            </p>
          </div>
          
          <!-- 登录尝试次数提示 -->
          <div v-if="!isRegistering && loginAttempts > 0 && loginAttempts < 3" class="attempt-hint">
            <span class="hint-icon">⚠️</span>
            <span class="hint-text">登录失败 {{ loginAttempts }} 次，{{ 3 - loginAttempts }} 次后将需要验证码</span>
          </div>
          
          <!-- 注册尝试次数提示 -->
          <div v-if="isRegistering && registerAttempts > 0 && registerAttempts < 3" class="attempt-hint">
            <span class="hint-icon">⚠️</span>
            <span class="hint-text">注册失败 {{ registerAttempts }} 次，{{ 3 - registerAttempts }} 次后将需要验证码</span>
          </div>
          
          <div class="auth-footer">
            <!-- 移除了所有提示信息 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// 状态
const isRegistering = ref(false)
const showLoginCaptcha = ref(false)
const showRegisterCaptcha = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const loginAttempts = ref(0)
const registerAttempts = ref(0)

// 主题相关
const themeMode = ref('system')
const themeClass = computed(() => {
  if (themeMode.value === 'dark') return 'theme-dark'
  if (themeMode.value === 'light') return 'theme-light'
  return 'theme-system'
})

// 登录表单
const loginForm = ref({
  username: '',
  password: '',
  captcha_code: '',
  captcha_id: ''
})

// 计算属性
const isLoading = computed(() => authStore.isLoading)
const captchaImage = computed(() => authStore.captchaImage)

// 检查当前URL和路由状态
onMounted(() => {
  console.log('当前路径:', window.location.pathname)
  console.log('完整URL:', window.location.href)
  
  // 检查是否从404页面跳转过来
  if (window.location.pathname === '/404' || window.location.pathname === '/auth') {
    // 确保URL正确
    if (window.location.pathname !== '/auth') {
      history.replaceState(null, '', '/auth')
    }
  }
  
  // 初始化主题
  initTheme()
  
  // 监听主题变化
  window.addEventListener('storage', handleThemeChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleThemeChange)
})

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('themeMode') || 'system'
  themeMode.value = savedTheme
  applyTheme(savedTheme)
}

// 处理主题变化
const handleThemeChange = (e: StorageEvent) => {
  if (e.key === 'themeMode') {
    const newTheme = e.newValue || 'system'
    themeMode.value = newTheme
    applyTheme(newTheme)
  }
}

// 应用主题
const applyTheme = (theme: string) => {
  const root = document.documentElement
  root.classList.remove('theme-dark', 'theme-light', 'theme-system')
  
  if (theme === 'dark') {
    root.classList.add('theme-dark')
  } else if (theme === 'light') {
    root.classList.add('theme-light')
  } else {
    root.classList.add('theme-system')
  }
}

// 重置尝试次数
const resetAttempts = () => {
  if (isRegistering.value) {
    registerAttempts.value = 0
    showRegisterCaptcha.value = false
  } else {
    loginAttempts.value = 0
    showLoginCaptcha.value = false
  }
}

// 刷新验证码
const refreshCaptcha = async () => {
  await authStore.getCaptcha()
  if (isRegistering.value) {
    authStore.registerForm.captcha_id = authStore.captchaId
  } else {
    loginForm.value.captcha_id = authStore.captchaId
  }
}

// 切换到登录模式
const switchToLogin = () => {
  isRegistering.value = false
  resetAttempts()
  errorMessage.value = ''
  successMessage.value = ''
  loginForm.value.captcha_code = ''
  loginForm.value.captcha_id = ''
}

// 切换到注册模式
const switchToRegister = async () => {
  isRegistering.value = true
  resetAttempts()
  errorMessage.value = ''
  successMessage.value = ''
  
  // 获取验证码（如果需要）
  if (registerAttempts.value >= 3) {
    await authStore.getCaptcha()
    authStore.registerForm.captcha_id = authStore.captchaId
  }
}

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    console.log('正在登录，用户名:', loginForm.value.username)
    
    // 忽略用户名大小写
    const normalizedUsername = loginForm.value.username.toLowerCase()
    
    // 检查是否需要验证码
    const needCaptcha = loginAttempts.value >= 3
    
    if (needCaptcha && !loginForm.value.captcha_code) {
      errorMessage.value = '请输入验证码'
      return
    }
    
    // 如果需要验证码但尚未获取，先获取验证码
    if (needCaptcha && !authStore.captchaId) {
      await authStore.getCaptcha()
      loginForm.value.captcha_id = authStore.captchaId
    }
    
    const success = await authStore.login(
      normalizedUsername, // 使用小写的用户名
      loginForm.value.password,
      needCaptcha ? loginForm.value.captcha_code : '',
      needCaptcha ? loginForm.value.captcha_id : ''
    )
    
    if (success) {
      // 登录成功，重置尝试次数
      loginAttempts.value = 0
      showLoginCaptcha.value = false
      successMessage.value = `登录成功！欢迎 ${authStore.displayName}`
      
      // 延迟跳转到主页
      setTimeout(() => {
        router.push('/')
      }, 1500)
      
    } else {
      // 登录失败，增加尝试次数
      loginAttempts.value++
      
      // 如果达到3次失败，显示验证码
      if (loginAttempts.value >= 3) {
        showLoginCaptcha.value = true
        await authStore.getCaptcha()
        loginForm.value.captcha_id = authStore.captchaId
      }
      
      errorMessage.value = authStore.error || '登录失败，请检查用户名和密码'
    }
    
  } catch (error: any) {
    console.error('登录错误:', error)
    errorMessage.value = `登录失败: ${error.message || '请检查网络连接和服务器状态'}`
  }
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    console.log('正在注册，用户名:', authStore.registerForm.username)
    
    // 检查是否需要验证码
    const needCaptcha = registerAttempts.value >= 3
    
    if (needCaptcha && !authStore.registerForm.captcha_code) {
      errorMessage.value = '请输入验证码'
      return
    }
    
    // 如果需要验证码但尚未获取，先获取验证码
    if (needCaptcha && !authStore.captchaId) {
      await authStore.getCaptcha()
      authStore.registerForm.captcha_id = authStore.captchaId
    }
    
    const success = await authStore.register(authStore.registerForm)
    
    if (success) {
      // 注册成功，重置尝试次数
      registerAttempts.value = 0
      showRegisterCaptcha.value = false
      successMessage.value = `注册成功！欢迎 ${authStore.displayName}`
      
      // 延迟跳转到主页
      setTimeout(() => {
        router.push('/')
      }, 1500)
      
    } else {
      // 注册失败，增加尝试次数
      registerAttempts.value++
      
      // 如果达到3次失败，显示验证码
      if (registerAttempts.value >= 3) {
        showRegisterCaptcha.value = true
        await authStore.getCaptcha()
        authStore.registerForm.captcha_id = authStore.captchaId
      }
      
      errorMessage.value = authStore.error || '注册失败'
    }
    
  } catch (error: any) {
    console.error('注册错误:', error)
    errorMessage.value = `注册失败: ${error.message || '请检查网络连接和服务器状态'}`
  }
}
</script>

<style scoped>
.auth-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  overflow: auto;
  transition: background-color 0.3s ease;
}

/* 主题相关样式 */
.auth-view.theme-light {
  background: linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%);
}

.auth-view.theme-dark {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
}

.auth-view.theme-system {
  background: linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%);
}

@media (prefers-color-scheme: dark) {
  .auth-view.theme-system {
    background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  }
}

.auth-scroll-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.auth-card {
  border-radius: 20px;
  padding: 40px 35px;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 520px; /* 基础最小高度，自适应内容 */
}

.theme-light .auth-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.95) 100%);
}

.theme-dark .auth-card {
  background: linear-gradient(135deg, rgba(30, 30, 46, 0.95) 0%, rgba(25, 25, 40, 0.95) 100%);
}

.theme-system .auth-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.95) 100%);
}

@media (prefers-color-scheme: dark) {
  .theme-system .auth-card {
    background: linear-gradient(135deg, rgba(30, 30, 46, 0.95) 0%, rgba(25, 25, 40, 0.95) 100%);
  }
}

.auth-title {
  text-align: center;
  margin-bottom: 35px;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  letter-spacing: 1px;
  transition: color 0.3s ease;
}

.theme-light .auth-title {
  color: #1a237e;
}

.theme-dark .auth-title {
  color: #e3f2fd;
  background: linear-gradient(135deg, #64b5f6, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.theme-system .auth-title {
  color: #1a237e;
}

@media (prefers-color-scheme: dark) {
  .theme-system .auth-title {
    color: #e3f2fd;
    background: linear-gradient(135deg, #64b5f6, #2196f3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* 模式切换标签 */
.mode-tabs {
  display: flex;
  margin-bottom: 35px;
  border-radius: 0;
  transition: all 0.3s ease;
}

.theme-light .mode-tabs {
  border-bottom: 2px solid rgba(52, 152, 219, 0.2);
}

.theme-dark .mode-tabs {
  border-bottom: 2px solid rgba(66, 165, 245, 0.3);
}

.theme-system .mode-tabs {
  border-bottom: 2px solid rgba(52, 152, 219, 0.2);
}

@media (prefers-color-scheme: dark) {
  .theme-system .mode-tabs {
    border-bottom: 2px solid rgba(66, 165, 245, 0.3);
  }
}

.mode-tab {
  flex: 1;
  padding: 14px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
}

.theme-light .mode-tab {
  color: #5d697a;
}

.theme-dark .mode-tab {
  color: #b0bec5;
}

.theme-system .mode-tab {
  color: #5d697a;
}

@media (prefers-color-scheme: dark) {
  .theme-system .mode-tab {
    color: #b0bec5;
  }
}

.mode-tab:hover {
  background: rgba(52, 152, 219, 0.05);
}

.theme-light .mode-tab:hover {
  color: #1a237e;
}

.theme-dark .mode-tab:hover {
  color: #64b5f6;
}

.theme-system .mode-tab:hover {
  color: #1a237e;
}

@media (prefers-color-scheme: dark) {
  .theme-system .mode-tab:hover {
    color: #64b5f6;
  }
}

.mode-tab.active {
  font-weight: 700;
}

.theme-light .mode-tab.active {
  color: #1a237e;
}

.theme-dark .mode-tab.active {
  color: #42a5f5;
}

.theme-system .mode-tab.active {
  color: #1a237e;
}

@media (prefers-color-scheme: dark) {
  .theme-system .mode-tab.active {
    color: #42a5f5;
  }
}

.mode-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 15%;
  right: 15%;
  height: 3px;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.theme-light .mode-tab.active::after {
  background: linear-gradient(90deg, #1a237e, #283593);
}

.theme-dark .mode-tab.active::after {
  background: linear-gradient(90deg, #42a5f5, #2196f3);
}

.theme-system .mode-tab.active::after {
  background: linear-gradient(90deg, #1a237e, #283593);
}

@media (prefers-color-scheme: dark) {
  .theme-system .mode-tab.active::after {
    background: linear-gradient(90deg, #42a5f5, #2196f3);
  }
}

/* 表单样式 */
.auth-form {
  margin-bottom: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 22px;
}

.form-group.with-icon {
  display: flex;
  align-items: center;
  border-radius: 12px;
  padding: 0 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.theme-light .form-group.with-icon {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dfe6e9;
}

.theme-dark .form-group.with-icon {
  background: rgba(40, 40, 60, 0.9);
  border: 1px solid #424242;
}

.theme-system .form-group.with-icon {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dfe6e9;
}

@media (prefers-color-scheme: dark) {
  .theme-system .form-group.with-icon {
    background: rgba(40, 40, 60, 0.9);
    border: 1px solid #424242;
  }
}

.form-group.with-icon:focus-within {
  transform: translateY(-1px);
  box-shadow: 
    0 4px 10px rgba(0, 0, 0, 0.05),
    0 0 0 2px rgba(26, 35, 126, 0.2);
}

.theme-light .form-group.with-icon:focus-within {
  border-color: #1a237e;
}

.theme-dark .form-group.with-icon:focus-within {
  border-color: #42a5f5;
}

.theme-system .form-group.with-icon:focus-within {
  border-color: #1a237e;
}

@media (prefers-color-scheme: dark) {
  .theme-system .form-group.with-icon:focus-within {
    border-color: #42a5f5;
  }
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  margin-right: 12px;
  font-size: 18px;
  transition: color 0.3s ease;
}

.theme-light .icon-container {
  color: #1a237e;
}

.theme-dark .icon-container {
  color: #90a4ae;
}

.theme-system .icon-container {
  color: #1a237e;
}

@media (prefers-color-scheme: dark) {
  .theme-system .icon-container {
    color: #90a4ae;
  }
}

.input-icon {
  opacity: 0.8;
}

.icon-input {
  flex: 1;
  padding: 16px 0;
  border: none;
  background: transparent;
  font-size: 15px;
  outline: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.theme-light .icon-input {
  color: #1a237e;
}

.theme-dark .icon-input {
  color: #e0e0e0;
}

.theme-system .icon-input {
  color: #1a237e;
}

@media (prefers-color-scheme: dark) {
  .theme-system .icon-input {
    color: #e0e0e0;
  }
}

.icon-input::placeholder {
  font-weight: 400;
  transition: color 0.3s ease;
}

.theme-light .icon-input::placeholder {
  color: #5d697a;
}

.theme-dark .icon-input::placeholder {
  color: #90a4ae;
}

.theme-system .icon-input::placeholder {
  color: #5d697a;
}

@media (prefers-color-scheme: dark) {
  .theme-system .icon-input::placeholder {
    color: #90a4ae;
  }
}

/* 验证码容器 - 修复布局问题 */
.captcha-group {
  margin-top: 10px;
  width: 100%;
}

.captcha-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;
}

.captcha-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  border-radius: 12px;
  padding: 0 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  min-height: 54px;
  min-width: 0; /* 防止flex项目溢出 */
}

.theme-light .captcha-input-group {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dfe6e9;
}

.theme-dark .captcha-input-group {
  background: rgba(40, 40, 60, 0.9);
  border: 1px solid #424242;
}

.theme-system .captcha-input-group {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dfe6e9;
}

@media (prefers-color-scheme: dark) {
  .theme-system .captcha-input-group {
    background: rgba(40, 40, 60, 0.9);
    border: 1px solid #424242;
  }
}

.captcha-input-group:focus-within {
  box-shadow: 
    0 0 0 2px rgba(26, 35, 126, 0.2),
    0 4px 10px rgba(0, 0, 0, 0.05);
}

.theme-light .captcha-input-group:focus-within {
  border-color: #1a237e;
}

.theme-dark .captcha-input-group:focus-within {
  border-color: #42a5f5;
}

.theme-system .captcha-input-group:focus-within {
  border-color: #1a237e;
}

@media (prefers-color-scheme: dark) {
  .theme-system .captcha-input-group:focus-within {
    border-color: #42a5f5;
  }
}

.captcha-image-container {
  flex: 1;
  min-width: 120px;
  max-width: 140px;
}

.captcha-image {
  width: 100%;
  height: 100%;
  min-height: 54px;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.theme-light .captcha-image {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dfe6e9;
}

.theme-dark .captcha-image {
  background: rgba(40, 40, 60, 0.9);
  border: 1px solid #424242;
}

.theme-system .captcha-image {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dfe6e9;
}

@media (prefers-color-scheme: dark) {
  .theme-system .captcha-image {
    background: rgba(40, 40, 60, 0.9);
    border: 1px solid #424242;
  }
}

.captcha-image:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-light .captcha-image:hover {
  border-color: #1a237e;
}

.theme-dark .captcha-image:hover {
  border-color: #42a5f5;
}

.theme-system .captcha-image:hover {
  border-color: #1a237e;
}

@media (prefers-color-scheme: dark) {
  .theme-system .captcha-image:hover {
    border-color: #42a5f5;
  }
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.captcha-placeholder {
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.theme-light .captcha-placeholder {
  color: #5d697a;
}

.theme-dark .captcha-placeholder {
  color: #90a4ae;
}

.theme-system .captcha-placeholder {
  color: #5d697a;
}

@media (prefers-color-scheme: dark) {
  .theme-system .captcha-placeholder {
    color: #90a4ae;
  }
}

/* 渐变按钮 - 活泼颜色 */
.gradient-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  box-sizing: border-box;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #C2E9FB 0%, #A1C4FD 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.gradient-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #BAC8E0 0%, #6A85B6 100%);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.gradient-button .button-text {
  position: relative;
  z-index: 2;
  display: block;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.gradient-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6);
}

.gradient-button:hover:not(:disabled)::after {
  opacity: 1;
}

.gradient-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(79, 172, 254, 0.4);
}

.gradient-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 错误和成功消息 */
.error-message {
  margin-top: 18px;
  padding: 14px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
  border: 1px solid;
  font-weight: 500;
  transition: all 0.3s ease;
}

.theme-light .error-message {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.2);
}

.theme-dark .error-message {
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
  border-color: rgba(239, 83, 80, 0.2);
}

.theme-system .error-message {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.2);
}

@media (prefers-color-scheme: dark) {
  .theme-system .error-message {
    background: rgba(239, 83, 80, 0.1);
    color: #ef5350;
    border-color: rgba(239, 83, 80, 0.2);
  }
}

.success-message {
  margin-top: 18px;
  padding: 14px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
  border: 1px solid;
  font-weight: 500;
  transition: all 0.3s ease;
}

.theme-light .success-message {
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  border-color: rgba(46, 204, 113, 0.2);
}

.theme-dark .success-message {
  background: rgba(102, 187, 106, 0.1);
  color: #66bb6a;
  border-color: rgba(102, 187, 106, 0.2);
}

.theme-system .success-message {
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  border-color: rgba(46, 204, 113, 0.2);
}

@media (prefers-color-scheme: dark) {
  .theme-system .success-message {
    background: rgba(102, 187, 106, 0.1);
    color: #66bb6a;
    border-color: rgba(102, 187, 106, 0.2);
  }
}

/* 模式切换链接 */
.mode-switch {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
  padding-top: 20px;
  border-top: 1px solid;
  transition: all 0.3s ease;
}

.theme-light .mode-switch {
  color: #5d697a;
  border-top-color: rgba(93, 105, 122, 0.3);
}

.theme-dark .mode-switch {
  color: #b0bec5;
  border-top-color: rgba(176, 190, 197, 0.3);
}

.theme-system .mode-switch {
  color: #5d697a;
  border-top-color: rgba(93, 105, 122, 0.3);
}

@media (prefers-color-scheme: dark) {
  .theme-system .mode-switch {
    color: #b0bec5;
    border-top-color: rgba(176, 190, 197, 0.3);
  }
}

.mode-switch a {
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

.theme-light .mode-switch a {
  color: #1a237e;
}

.theme-dark .mode-switch a {
  color: #64b5f6;
}

.theme-system .mode-switch a {
  color: #1a237e;
}

@media (prefers-color-scheme: dark) {
  .theme-system .mode-switch a {
    color: #64b5f6;
  }
}

.mode-switch a:hover {
  text-decoration: none;
}

.theme-light .mode-switch a:hover {
  background: rgba(26, 35, 126, 0.1);
}

.theme-dark .mode-switch a:hover {
  background: rgba(66, 165, 245, 0.1);
}

.theme-system .mode-switch a:hover {
  background: rgba(26, 35, 126, 0.1);
}

@media (prefers-color-scheme: dark) {
  .theme-system .mode-switch a:hover {
    background: rgba(66, 165, 245, 0.1);
  }
}

/* 尝试次数提示 */
.attempt-hint {
  margin-top: 15px;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.theme-light .attempt-hint {
  background: rgba(255, 193, 7, 0.1);
  color: #f57c00;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.theme-dark .attempt-hint {
  background: rgba(255, 193, 7, 0.1);
  color: #ffb74d;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.theme-system .attempt-hint {
  background: rgba(255, 193, 7, 0.1);
  color: #f57c00;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

@media (prefers-color-scheme: dark) {
  .theme-system .attempt-hint {
    color: #ffb74d;
  }
}

.hint-icon {
  font-size: 16px;
}

.hint-text {
  flex: 1;
}

.auth-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 12px;
  padding-top: 20px;
  border-top: 1px solid;
  transition: all 0.3s ease;
}

.theme-light .auth-footer {
  color: #5d697a;
  border-top-color: rgba(93, 105, 122, 0.3);
}

.theme-dark .auth-footer {
  color: #90a4ae;
  border-top-color: rgba(144, 164, 174, 0.3);
}

.theme-system .auth-footer {
  color: #5d697a;
  border-top-color: rgba(93, 105, 122, 0.3);
}

@media (prefers-color-scheme: dark) {
  .theme-system .auth-footer {
    color: #90a4ae;
    border-top-color: rgba(144, 164, 174, 0.3);
  }
}

/* 响应式设计 - 手机端优化 */
@media (max-height: 700px) {
  .auth-card {
    padding: 30px 25px;
    min-height: 480px;
  }
  
  .auth-title {
    font-size: 26px;
    margin-bottom: 25px;
  }
  
  .mode-tabs {
    margin-bottom: 25px;
  }
  
  .form-group {
    margin-bottom: 18px;
  }
  
  .form-group.with-icon {
    padding: 0 12px;
  }
  
  .icon-input {
    padding: 14px 0;
    font-size: 14px;
  }
  
  .captcha-image-container {
    min-width: 110px;
  }
  
  .captcha-image {
    min-height: 50px;
  }
  
  .gradient-button {
    padding: 14px;
    font-size: 15px;
  }
}

@media (max-height: 600px) {
  .auth-card {
    padding: 25px 20px;
    min-height: 450px;
  }
  
  .auth-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .mode-tab {
    padding: 12px;
    font-size: 15px;
  }
  
  .captcha-image-container {
    min-width: 100px;
  }
  
  .captcha-image {
    min-height: 46px;
  }
}

/* 适配小屏幕宽度 - 手机端优化 */
@media (max-width: 480px) {
  .auth-container {
    padding: 15px;
    max-width: 100%;
  }
  
  .auth-card {
    padding: 30px 20px;
    min-height: 480px;
  }
  
  .auth-title {
    font-size: 24px;
  }
  
  .mode-tab {
    font-size: 15px;
    padding: 12px 10px;
  }
  
  /* 验证码在手机端保持同一行 */
  .captcha-row {
    flex-direction: row;
    gap: 10px;
  }
  
  .captcha-input-group {
    flex: 2;
    min-height: 50px;
  }
  
  .captcha-image-container {
    flex: 1;
    min-width: 100px;
    max-width: 120px;
  }
  
  .captcha-image {
    min-height: 50px;
  }
  
  .captcha-placeholder {
    font-size: 12px;
  }
  
  /* 按钮在手机端优化 */
  .gradient-button {
    padding: 15px;
    font-size: 16px;
  }
  
  .button-text {
    font-weight: 700;
    font-size: 16px;
  }
  
  .mode-switch {
    font-size: 13px;
  }
  
  .attempt-hint {
    font-size: 12px;
    padding: 10px;
  }
}

/* 极窄屏幕适配 */
@media (max-width: 360px) {
  .auth-card {
    padding: 25px 15px;
    min-height: 460px;
  }
  
  .auth-title {
    font-size: 22px;
  }
  
  .mode-tab {
    padding: 10px 8px;
    font-size: 14px;
  }
  
  .captcha-input-group {
    min-height: 48px;
  }
  
  .captcha-image-container {
    min-width: 90px;
    max-width: 100px;
  }
  
  .captcha-image {
    min-height: 48px;
  }
  
  .gradient-button {
    padding: 14px;
    font-size: 15px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .auth-scroll-container {
    align-items: flex-start;
    padding-top: 10px;
  }
  
  .auth-card {
    min-height: 400px;
    padding: 20px 25px;
  }
  
  .auth-title {
    font-size: 22px;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group.with-icon {
    padding: 0 10px;
    min-height: 44px;
  }
  
  .icon-input {
    padding: 10px 0;
    font-size: 14px;
  }
  
  .captcha-row {
    gap: 8px;
  }
  
  .captcha-input-group {
    min-height: 44px;
  }
  
  .captcha-image {
    min-height: 44px;
  }
}
</style>