<template>
  <div class="auth-view" :class="themeClass">
    <div class="background-fx">
      <div class="geometric-grid"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
      <div class="gradient-overlay"></div>
    </div>
    
    <div class="auth-scroll-container">
      <div class="auth-container">
        <div class="auth-card fade-in-down">
          <div class="logo-header">
            <h1 class="auth-title">CFMS · 一基暴富</h1>
          </div>
          
          <div class="form-error-area-simple">
            <div v-if="globalError" class="error-text-simple">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ globalError }}</span>
            </div>
            <div v-if="globalSuccess" class="success-text-simple">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ globalSuccess }}</span>
            </div>
          </div>
          
          <div v-if="!success">
            <div class="auth-form">
              <div class="form-content">
                <div class="form-group with-icon" :class="{
                  'has-error': usernameError,
                  'has-success': form.username && !usernameError,
                  'focused': isUsernameFocused
                }">
                  <div class="icon-container">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <input
                    v-model="form.username"
                    type="text"
                    placeholder="用户名"
                    required
                    autocomplete="username"
                    class="icon-input"
                    maxlength="10"
                    @input="validateUsername"
                    @focus="() => { isUsernameFocused = true; }"
                    @blur="() => { isUsernameFocused = false; }"
                  />
                  <div class="input-actions">
                    <button
                      v-if="form.username"
                      type="button"
                      class="clear-button"
                      @click="form.username = ''; validateUsername()"
                      title="清除"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="form-group with-icon" :class="{
                  'has-error': emailError,
                  'has-success': form.email && !emailError,
                  'focused': isEmailFocused
                }">
                  <div class="icon-container">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="注册邮箱"
                    required
                    autocomplete="email"
                    class="icon-input"
                    @input="validateEmail"
                    @focus="() => { isEmailFocused = true; }"
                    @blur="() => { isEmailFocused = false; }"
                  />
                  <div class="input-actions">
                    <button
                      v-if="form.email"
                      type="button"
                      class="clear-button"
                      @click="form.email = ''; validateEmail()"
                      title="清除"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button
                  type="button"
                  class="auth-button gradient-button single-button"
                  @click="handleSubmit"
                  :disabled="isLoading || !isFormValid"
                >
                  <span class="button-text">{{ isLoading ? '发送中...' : '发送重置链接' }}</span>
                  <div v-if="isLoading" class="button-loading">
                    <div class="loading-spinner"></div>
                  </div>
                </button>
              </div>
            </div>
            
            <div class="hint-area">
              <div class="mode-switch">
                <p>
                  <a href="#" @click.prevent="goToAuth">返回登录</a>
                </p>
              </div>
            </div>
          </div>
          
          <div v-else class="success-state">
            <div class="success-text">
              <div class="email-display">
                <em>{{ form.email }}</em>
              </div>
              <div class="tips">
                <p>请检查您的收件箱（包括垃圾邮件文件夹）</p>
                <p>链接有效期为24小时</p>
              </div>
            </div>
            
            <div class="hint-area">
              <div class="mode-switch">
                <p>
                  <a href="#" @click.prevent="goToAuth">返回登录</a>
                </p>
              </div>
            </div>
          </div>
          
          <div class="auth-footer">
            <p class="version-info">{{ copyrightInfo }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { getCopyright } from '../../Version'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const globalError = ref('')
const globalSuccess = ref('')
const success = ref(false)
const isUsernameFocused = ref(false)
const isEmailFocused = ref(false)
const usernameError = ref(false)
const emailError = ref(false)

const form = reactive({
  username: '',
  email: ''
})

const themeMode = ref('system')
const systemTheme = ref('light')
const themeClass = computed(() => {
  let effectiveTheme = themeMode.value
  if (effectiveTheme === 'system') {
    effectiveTheme = systemTheme.value
  }
  if (effectiveTheme === 'dark') return 'theme-dark'
  if (effectiveTheme === 'light') return 'theme-light'
  return 'theme-system'
})

const copyrightInfo = ref(getCopyright())

const isFormValid = computed(() => {
  return form.username.length >= 3 &&
         validateEmailFormat(form.email)
})

const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateUsername = () => {
  const username = form.username
  if (!username) {
    usernameError.value = false
  } else if (username.length < 3) {
    usernameError.value = true
  } else {
    usernameError.value = false
  }
}

const validateEmail = () => {
  const email = form.email
  if (!email) {
    emailError.value = false
  } else if (!validateEmailFormat(email)) {
    emailError.value = true
  } else {
    emailError.value = false
  }
}

const goToAuth = () => {
  router.push('/auth')
}

const handleSubmit = async () => {
  validateUsername()
  validateEmail()
  
  if (usernameError.value || emailError.value) {
    globalError.value = '请填写正确的用户名和邮箱'
    return
  }
  
  isLoading.value = true
  globalError.value = ''
  globalSuccess.value = ''
  
  try {
    const result = await authStore.forgotPassword(form.username, form.email)
    
    if (result.success) {
      success.value = true
      globalSuccess.value = result.message || '重置链接已发送到您的邮箱'
    } else {
      globalError.value = result.message || '发送失败，请重试'
    }
  } catch (err: any) {
    globalError.value = err.message || '发送失败，请重试'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemTheme.value = darkModeMediaQuery.matches ? 'dark' : 'light'
  
  darkModeMediaQuery.addEventListener('change', (e) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
  })
})
</script>

<style scoped>
.auth-view {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.theme-light {
  --primary-color: #6366f1;
  --primary-light: rgba(99, 102, 241, 0.1);
  --secondary-color: #8b5cf6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --input-bg: rgba(255, 255, 255, 0.8);
  --border-primary: #e5e7eb;
  --border-focus: #6366f1;
  --error-color: #ef4444;
  --error-light: rgba(239, 68, 68, 0.1);
  --success-color: #10b981;
  --success-light: rgba(16, 185, 129, 0.1);
  --warning-color: #f59e0b;
  --info-color: #3b82f6;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.theme-dark {
  --primary-color: #8b5cf6;
  --primary-light: rgba(139, 92, 246, 0.15);
  --secondary-color: #a78bfa;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --input-bg: rgba(31, 41, 55, 0.8);
  --border-primary: #374151;
  --border-focus: #8b5cf6;
  --error-color: #f87171;
  --error-light: rgba(248, 113, 113, 0.15);
  --success-color: #34d399;
  --success-light: rgba(52, 211, 153, 0.15);
  --warning-color: #fbbf24;
  --info-color: #60a5fa;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.background-fx {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.geometric-grid {
  position: absolute;
  width: 200%;
  height: 200%;
  background-image:
    linear-gradient(var(--border-primary) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-primary) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.1;
  transform: rotate(15deg) translate(-25%, -25%);
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: rotate(15deg) translate(-25%, -25%); }
  100% { transform: rotate(15deg) translate(-15%, -15%); }
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  opacity: 0.1;
  filter: blur(20px);
  animation: float 15s infinite ease-in-out;
}

.shape-1 { width: 200px; height: 200px; top: 10%; left: 5%; animation-delay: 0s; }
.shape-2 { width: 150px; height: 150px; top: 20%; right: 10%; animation-delay: -3s; }
.shape-3 { width: 250px; height: 250px; bottom: 15%; left: 15%; animation-delay: -6s; }
.shape-4 { width: 100px; height: 100px; bottom: 30%; right: 20%; animation-delay: -9s; }
.shape-5 { width: 180px; height: 180px; top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -12s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.gradient-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.05) 0%,
    rgba(139, 92, 246, 0.05) 50%,
    rgba(16, 185, 129, 0.05) 100%);
}

.auth-scroll-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.auth-card {
  background: rgba(var(--bg-primary), 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(var(--border-primary), 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-form {
  width: 100%;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.form-group {
  position: relative;
  width: 100%;
  margin-bottom: 0;
}

.form-group.with-icon {
  display: flex;
  align-items: center;
  height: 48px;
  background: var(--input-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 0 12px;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.form-group.with-icon.focused {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group.with-icon.has-error {
  border-color: var(--error-color);
}

.form-group.with-icon.has-success {
  border-color: var(--success-color);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.form-group.with-icon.focused .icon-container {
  color: var(--primary-color);
}

.form-group.with-icon.has-error .icon-container {
  color: var(--error-color);
}

.form-group.with-icon.has-success .icon-container {
  color: var(--success-color);
}

.icon-input {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  outline: none;
  padding: 0;
  min-width: 0;
}

.icon-input::placeholder {
  color: var(--text-tertiary);
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.clear-button:hover {
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.05);
}

.auth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  outline: none;
}

.auth-button.gradient-button {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.auth-button.gradient-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.auth-button.gradient-button:active:not(:disabled) {
  transform: translateY(0);
}

.auth-button.gradient-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.auth-button.single-button {
  width: 100%;
  height: 48px;
}

.button-text {
  position: relative;
  z-index: 1;
}

.button-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: inherit;
  border-radius: inherit;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-actions {
  margin-top: 12px;
  width: 100%;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
}

.version-info {
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 0;
}

.success-text-simple {
  font-size: 12px;
  font-weight: 500;
  color: var(--success-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.error-text-simple {
  font-size: 12px;
  font-weight: 500;
  color: var(--error-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.success-state {
  text-align: center;
  padding: 32px 20px 24px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.success-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.email-display {
  margin: 0 0 20px 0;
}

.email-display em {
  font-style: italic;
  font-size: 16px;
  font-weight: 500;
  color: var(--primary-color);
  font-family: 'Georgia', 'Times New Roman', serif;
}

.success-text .tips {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
}

.success-text .tips p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 6px 0;
}

.hint-area {
  margin-top: 20px;
  text-align: center;
}

.mode-switch {
  font-size: 13px;
  color: var(--text-secondary);
}

.mode-switch a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  position: relative;
}

.mode-switch a:hover {
  color: var(--secondary-color);
}

@media (max-width: 480px) {
  .auth-scroll-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    min-height: calc(100vh - 32px);
  }
  
  .auth-card {
    margin: 0;
    width: 100%;
    padding: 24px 20px;
    transform: translateY(0);
  }
  
  .auth-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
  }
  
  .success-state {
    padding: 20px 16px 16px;
  }
  
  .success-text {
    font-size: 13px;
  }
  
  .email-display em {
    font-size: 15px;
  }
  
  .success-text .tips {
    margin-top: 16px;
    padding-top: 12px;
  }
  
  .success-text .tips p {
    font-size: 12px;
  }
}

.theme-dark .success-text {
  color: var(--text-secondary);
}

.theme-dark .email-display em {
  color: var(--primary-color);
}

.theme-dark .success-text .tips {
  border-top-color: var(--border-primary);
}

.theme-dark .success-text .tips p {
  color: var(--text-tertiary);
}

.theme-dark .mode-switch a {
  color: var(--primary-color);
}

.theme-dark .mode-switch a:hover {
  color: var(--secondary-color);
}
</style>
