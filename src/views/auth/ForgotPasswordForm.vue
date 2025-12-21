<template>
  <div class="auth-form">
    <div class="form-content">
      <div class="auth-steps-container" :class="{ 'two-steps-active': step === 2 }">
        <div class="auth-step step-one" :class="{ 'slide-left': step === 2 }">
          <div class="form-group with-icon" :class="{
            'has-error': errors.username,
            'has-success': form.username && !errors.username,
            'focused': isUsernameFocused
          }">
            <div class="icon-container">
              <span class="input-icon">👤</span>
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
              @focus="() => { isUsernameFocused = true; handleInputFocus() }"
              @blur="() => { isUsernameFocused = false; handleInputBlur() }"
            />
            <div class="input-actions">
              <button
                v-if="form.username"
                type="button"
                class="clear-button"
                @click="form.username = ''; validateUsername()"
                title="清除"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div class="form-group with-icon" :class="{
            'has-error': errors.email,
            'has-success': form.email && !errors.email,
            'focused': isEmailFocused
          }">
            <div class="icon-container">
              <span class="input-icon">📧</span>
            </div>
            <input
              v-model="form.email"
              type="email"
              placeholder="注册邮箱"
              required
              autocomplete="email"
              class="icon-input"
              @input="validateEmail"
              @focus="() => { isEmailFocused = true; handleInputFocus() }"
              @blur="() => { isEmailFocused = false; handleInputBlur() }"
            />
            <div class="input-actions">
              <button
                v-if="form.email"
                type="button"
                class="clear-button"
                @click="form.email = ''; validateEmail()"
                title="清除"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        
        <div class="auth-step step-two" :class="{ 'slide-in': step === 2, 'active': step === 2 }">
          <div class="success-message">
            <div class="success-icon">✅</div>
            <div class="success-text">
              <h3>邮件已发送</h3>
              <p>重置链接已发送到您的邮箱 <strong>{{ form.email }}</strong></p>
              <p class="tips">请检查您的收件箱（包括垃圾邮件文件夹）</p>
              <p class="tips">链接有效期为24小时</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="auth-button-area">
      <div v-if="step === 1" class="button-container">
        <div class="button-group two-buttons">
          <button
            type="button"
            class="auth-button back-button"
            @click="$emit('back')"
            :disabled="isLoading"
          >
            <span class="button-text">返回</span>
          </button>
          <button
            type="button"
            class="auth-button gradient-button"
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
      
      <div v-else class="button-container">
        <div class="button-group single-button">
          <button
            type="button"
            class="auth-button gradient-button"
            @click="$emit('back')"
          >
            <span class="button-text">返回登录</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'

interface Props {
  isLoading?: boolean
}

interface Emits {
  (e: 'submit', form: any): void
  (e: 'back'): void
  (e: 'check-username', username: string): void
  (e: 'clear-global-error'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<Emits>()

const step = ref(1)
const isUsernameFocused = ref(false)
const isEmailFocused = ref(false)

const form = reactive({
  username: '',
  email: ''
})

const errors = reactive({
  username: '',
  email: ''
})

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
    errors.username = ''
  } else if (username.length < 3) {
    errors.username = ''
  } else {
    errors.username = ''
  }
  emit('clear-global-error')
}

const validateEmail = () => {
  const email = form.email
  if (!email) {
    errors.email = ''
  } else if (!validateEmailFormat(email)) {
    errors.email = ''
  } else {
    errors.email = ''
  }
  emit('clear-global-error')
}

const handleInputFocus = (event?: Event) => {
  if (event) {
    const input = event.target as HTMLElement
    input.parentElement?.classList.add('focused')
  }
}

const handleInputBlur = (event?: Event) => {
  if (event) {
    const input = event.target as HTMLElement
    input.parentElement?.classList.remove('focused')
  }
}

// 添加用户名检查
watch(() => form.username, (newUsername) => {
  if (newUsername && newUsername.length >= 3) {
    // 延迟检查，避免频繁请求
    const timer = setTimeout(() => {
      emit('check-username', newUsername)
    }, 500)
    return () => clearTimeout(timer)
  }
  emit('clear-global-error')
})

const handleSubmit = async () => {
  validateUsername()
  validateEmail()
  
  if (errors.username || errors.email) {
    return
  }
  
  try {
    await emit('submit', form)
    step.value = 2
  } catch (err: any) {
    console.error('提交失败:', err)
  }
}
</script>

<style scoped>
/* 统一表单容器样式 */
.form-content {
  padding: 10px 0 !important;
  min-height: 180px;
  position: relative;
  width: 100%;
}

/* 统一输入框组样式 */
.form-group.with-icon {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: visible;
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  height: 48px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
}

.form-group.with-icon.focused {
  z-index: 100;
  position: relative;
  transform: translateZ(0);
  box-shadow: 0 0 0 2px var(--primary-color);
  border-color: var(--primary-color);
}

/* 统一步骤容器 */
.auth-steps-container {
  position: relative;
  min-height: 140px;
  transition: min-height 0.3s ease;
  width: 100%;
}

.auth-step.step-two {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--card-bg);
  border-radius: 12px;
  z-index: 5;
}

.auth-step.step-two.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-step.step-two.slide-in {
  display: flex;
}

.auth-step.step-one.slide-left {
  transform: translateX(-100%);
  opacity: 0;
}

.auth-step {
  transition: all 0.3s ease;
  width: 100%;
}

/* 成功消息样式 */
.success-message {
  text-align: center;
  padding: 20px;
  width: 100%;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.success-text h3 {
  margin: 0 0 10px 0;
  color: #10b981;
  font-size: 18px;
}

.success-text p {
  margin: 8px 0;
  color: #64748b;
  font-size: 14px;
}

.success-text .tips {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 15px;
}

.theme-dark .success-text h3 {
  color: #34d399;
}

.theme-dark .success-text p {
  color: #cbd5e1;
}

.theme-dark .success-text .tips {
  color: #94a3b8;
}

/* 统一按钮区域 */
.auth-button-area {
  margin-top: 0 !important;
  width: 100%;
}

.button-container {
  width: 100%;
  display: flex;
  align-items: stretch;
  margin: 0 !important;
  padding: 0 !important;
}

.button-group {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 20px;
}

.button-group.single-button {
  gap: 0;
}

.button-group.two-buttons {
  display: flex;
  gap: 12px;
}

.auth-button {
  flex: 1;
  height: 48px;
  padding: 0 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  min-width: 0;
}

.back-button {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.gradient-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.theme-dark .back-button {
  background: rgba(99, 102, 241, 0.12);
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.2);
}

.theme-dark .gradient-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.auth-button:hover:not(:disabled),
.back-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.15);
}

.gradient-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.3);
}

.theme-dark .gradient-button:hover:not(:disabled) {
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.4);
}

.auth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.button-text {
  position: relative;
  z-index: 2;
}

.button-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: inherit;
  border-radius: inherit;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 统一输入框样式 */
.icon-input {
  flex: 1;
  height: 100%;
  padding: 0 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-color);
  outline: none;
  box-sizing: border-box;
  text-align: left;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 100%;
  flex-shrink: 0;
}

.input-actions {
  display: flex;
  align-items: center;
  padding-right: 8px;
  gap: 4px;
}

.clear-button {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: color 0.2s;
  padding: 4px;
  min-width: 24px;
  min-height: 24px;
}

.clear-button:hover {
  color: var(--text-color);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .button-group.two-buttons {
    display: flex;
    flex-direction: row;
    gap: 12px;
    width: 100%;
  }
  
  .back-button, .gradient-button {
    flex: 1;
    min-width: auto;
  }
  
  .form-content {
    min-height: 160px;
  }
  
  .auth-steps-container {
    min-height: 120px;
  }
  
  .form-group.with-icon {
    height: 44px;
  }
  
  .button-group.two-buttons .auth-button {
    height: 44px;
  }
  
  .success-icon {
    font-size: 36px;
  }
  
  .success-text h3 {
    font-size: 16px;
  }
  
  .success-text p {
    font-size: 13px;
  }
}
</script>

<style scoped src="./styles/auth-styles.css"></style>