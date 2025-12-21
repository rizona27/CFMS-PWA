<template>
  <div class="auth-form">
    <div class="form-content">
      <div class="auth-steps-container single-step-active">
        <div class="auth-step single-step">
          <div class="form-group with-icon" :class="{
            'has-error': errors.username,
            'has-success': form.username && !errors.username,
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
              @blur="handleUsernameBlur"
              @focus="() => { isUsernameFocused = true; handleInputFocus() }"
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
          
          <div class="form-group with-icon password-group" :class="{
            'has-error': errors.password,
            'has-success': form.password && !errors.password,
            'focused': isPasswordFocused
          }">
            <div class="icon-container">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="密码"
              required
              autocomplete="current-password"
              class="icon-input password-input"
              maxlength="20"
              @input="validatePassword"
              @blur="() => { isPasswordFocused = false; handleInputBlur() }"
              @focus="handlePasswordFocus"
            />
            <div class="input-actions">
              <button
                v-if="form.password"
                type="button"
                class="clear-button"
                @click="form.password = ''; validatePassword()"
                title="清除"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              >
                <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="showCaptcha && attempts >= 3" class="form-group captcha-group">
            <div class="captcha-row">
              <div class="captcha-input-group">
                <div class="icon-container">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 9h.01M15 9h.01M9 15h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <input
                  v-model="form.captcha_code"
                  type="text"
                  placeholder="验证码"
                  required
                  class="icon-input captcha-input"
                  maxlength="4"
                  @input="handleCaptchaInput"
                />
                <div class="input-actions">
                  <button
                    v-if="form.captcha_code"
                    type="button"
                    class="clear-button"
                    @click="form.captcha_code = ''"
                    title="清除"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="captcha-image-container">
                <div class="captcha-image" @click="$emit('refresh-captcha')">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                  <div v-else class="captcha-placeholder">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23 4L23 10 17 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M1 20L1 14 7 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 简化的错误提示区域 -->
      <div class="form-error-area-simple" :class="{
        'has-error': attempts > 0 && hasValidAccountForAttempt,
        'has-locked-error': attempts >= 5 && hasValidAccountForAttempt,
        'has-user-missing': showUserMissingMessage && !hasValidAccountForAttempt
      }">
        <div v-if="attempts > 0 && hasValidAccountForAttempt" class="error-text-simple">
          <span v-if="attempts < 5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            密码错误{{ attempts }}次，还剩{{ 5 - attempts }}次锁定
            <span v-if="attempts >= 3">，请输入验证码</span>
          </span>
          <span v-else class="locked-message">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            账户已锁定，请管理员解锁！
          </span>
        </div>
        <div v-if="showUserMissingMessage && !hasValidAccountForAttempt" class="error-text-simple">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          用户不存在，请检查用户名或<a href="#" @click.prevent="switchToRegister">注册新账号</a>
        </div>
      </div>
    </div>
    
    <!-- 统一按钮区域 -->
    <div class="form-actions">
      <div class="button-group single-button">
        <button type="button" class="auth-button gradient-button"
          @click="handleSubmit"
          :disabled="isLoading || hasErrors || !isFormValid">
          <span class="button-text">
            {{ isLoading ? '登录中...' : '登录' }}
          </span>
          <div v-if="isLoading" class="button-loading">
            <div class="loading-spinner"></div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'

interface Props {
  isLoading?: boolean
  attempts?: number
  showCaptcha?: boolean
  captchaImage?: string
  hasValidAccountForAttempt?: boolean
  showUserMissingMessage?: boolean
}

interface Emits {
  (e: 'submit', form: any): void
  (e: 'username-blur', username: string): void
  (e: 'password-focus', username: string): void
  (e: 'refresh-captcha'): void
  (e: 'switch-to-register'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  attempts: 0,
  showCaptcha: false,
  captchaImage: '',
  hasValidAccountForAttempt: false,
  showUserMissingMessage: false
})

const emit = defineEmits<Emits>()

const showPassword = ref(false)
const isUsernameFocused = ref(false)
const isPasswordFocused = ref(false)

const form = reactive({
  username: '',
  password: '',
  captcha_code: '',
  captcha_id: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const hasErrors = computed(() => {
  return !!errors.username || !!errors.password
})

const isFormValid = computed(() => {
  return form.username.length >= 3 &&
         form.password.length >= 6 &&
         (!props.showCaptcha || form.captcha_code.length >= 4)
})

const validateUsername = () => {
  const username = form.username
  if (!username) {
    errors.username = ''
  } else if (username.length < 3) {
    errors.username = ''
  } else if (username.length > 10) {
    errors.username = ''
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = ''
  } else {
    errors.username = ''
  }
}

const validatePassword = () => {
  const password = form.password
  if (!password) {
    errors.password = ''
  } else if (password.length < 6) {
    errors.password = ''
  } else if (password.length > 20) {
    errors.password = ''
  } else {
    errors.password = ''
  }
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

const handleUsernameBlur = (event?: Event) => {
  if (event) {
    const input = event.target as HTMLElement
    input.parentElement?.classList.remove('focused')
  }
  if (form.username) {
    emit('username-blur', form.username)
  }
}

const handlePasswordFocus = (event?: Event) => {
  if (event) {
    const input = event.target as HTMLElement
    input.parentElement?.classList.add('focused')
    if (form.username) {
      emit('password-focus', form.username)
    }
  }
}

const handleCaptchaInput = () => {
  if (form.captcha_code.length > 4) {
    form.captcha_code = form.captcha_code.slice(0, 4)
  }
}

const handleSubmit = () => {
  if (!form.username || form.username.length < 3) return
  if (!form.password || form.password.length < 6) return
  if (props.showCaptcha && (!form.captcha_code || form.captcha_code.length < 4)) return
  emit('submit', form)
}

const switchToRegister = () => {
  emit('switch-to-register')
}

watch(() => form.username, (newUsername) => {
  if (newUsername) {
    emit('username-blur', newUsername)
  }
})
</script>

<style scoped>
/* 登录表单特殊样式 */
.auth-form {
  width: 100%;
}

/* 验证码容器 */
.captcha-image-container {
  flex-shrink: 0;
}

.captcha-image {
  width: 100px;
  height: var(--input-height);
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border-primary);
  background: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.captcha-image:hover {
  border-color: var(--border-focus);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.captcha-placeholder {
  color: var(--text-tertiary);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-placeholder svg {
  width: 14px;
  height: 14px;
}

/* 统一错误提示 */
.form-error-area-simple {
  height: 20px;
  margin: 4px 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: all 0.2s ease;
  overflow: hidden;
}

.form-error-area-simple.has-error,
.form-error-area-simple.has-user-missing {
  height: 20px;
}

.form-error-area-simple.has-locked-error {
  height: 20px;
}

.error-text-simple {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  text-align: center;
  padding: 2px 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.form-error-area-simple.has-error .error-text-simple {
  color: var(--warning-color);
}

.form-error-area-simple.has-locked-error .error-text-simple {
  color: var(--error-color);
}

.form-error-area-simple.has-user-missing .error-text-simple {
  color: var(--info-color);
}

.error-text-simple a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.error-text-simple a:hover {
  text-decoration: underline;
}

.error-text-simple svg {
  flex-shrink: 0;
}

/* 统一按钮区域 */
.form-actions {
  margin-top: auto;
  padding-top: 0;
  width: 100%;
  flex-shrink: 0;
}

.button-group.single-button {
  height: 44px;
  width: 100%;
}

.auth-button.gradient-button {
  height: 44px;
  width: 100%;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .captcha-image {
    width: 100%;
    height: 44px;
  }
  
  .captcha-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .captcha-input-group {
    width: 100%;
  }
  
  .error-text-simple {
    font-size: 11px;
  }
  
  .error-text-simple svg {
    width: 10px;
    height: 10px;
    margin-right: 3px;
  }
  
  .form-error-area-simple {
    height: 20px;
    margin: 2px 0 6px 0;
  }
  
  .form-error-area-simple.has-error,
  .form-error-area-simple.has-user-missing {
    height: 20px;
  }
  
  .form-error-area-simple.has-locked-error {
    height: 20px;
  }
  
  /* 修复移动端输入框光标位置 */
  .icon-input {
    line-height: 1.2;
    height: 100%;
    padding-top: 0;
    padding-bottom: 0;
    -webkit-appearance: none;
    appearance: none;
  }
  
  .form-group.with-icon {
    align-items: center;
  }
  
  .button-group.single-button {
    height: 44px;
  }
  
  .auth-form .form-content {
    min-height: 180px;
  }
}

/* 深色模式优化 */
.theme-dark .captcha-image {
  border-color: var(--border-primary);
  background: var(--input-bg);
}

.theme-dark .captcha-placeholder {
  color: var(--text-tertiary);
}

/* 移除原来的错误提示样式 */
.form-error-area,
.attempt-hint {
  display: none;
}
</style>
