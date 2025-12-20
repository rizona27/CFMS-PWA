<template>
  <div class="auth-form">
    <div class="form-content">
      <div class="auth-steps-container single-step-active">
        <div class="auth-step single-step">
          <!-- 用户名输入框 - 修复高度和描边 -->
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
                ✕
              </button>
            </div>
          </div>
          
          <!-- 密码输入框 -->
          <div class="form-group with-icon password-group" :class="{
            'has-error': errors.password,
            'has-success': form.password && !errors.password,
            'focused': isPasswordFocused
          }">
            <div class="icon-container">
              <span class="input-icon">🔒</span>
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
                ✕
              </button>
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              >
                <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 验证码区域 -->
          <div v-if="showCaptcha && attempts >= 3" class="form-group captcha-group">
            <div class="captcha-row">
              <div class="captcha-input-group">
                <div class="icon-container">
                  <span class="input-icon">🖼️</span>
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
                    ✕
                  </button>
                </div>
              </div>
              <div class="captcha-image-container">
                <div class="captcha-image" @click="$emit('refresh-captcha')">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                  <div v-else class="captcha-placeholder">刷新</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 错误提示区域 - 调整高度 -->
      <div class="form-error-area" :class="{
        'has-error': attempts > 0 && hasValidAccountForAttempt,
        'has-locked-error': attempts >= 5 && hasValidAccountForAttempt
      }">
        <div v-if="attempts > 0 && hasValidAccountForAttempt" class="attempt-hint">
          <span class="hint-text">
            <span v-if="attempts < 5">
              密码错误{{ attempts }}次，还剩{{ 5 - attempts }}次锁定
              <span v-if="attempts >= 3">，请输入验证码</span>
            </span>
            <span v-else class="locked-message">
              账户已锁定，请管理员解锁！
            </span>
          </span>
        </div>
        <!-- 用户不存在提示 -->
        <div v-if="showUserMissingMessage && !hasValidAccountForAttempt" class="attempt-hint user-missing-hint">
          <span class="hint-text">
            用户不存在，请检查用户名或<a href="#" @click.prevent="switchToRegister">注册新账号</a>
          </span>
        </div>
      </div>
    </div>
    
    <div class="auth-button-area">
      <div class="button-container">
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
  // 通知父组件用户名失去焦点
  if (form.username) {
    emit('username-blur', form.username)
  }
}

const handlePasswordFocus = (event?: Event) => {
  if (event) {
    const input = event.target as HTMLElement
    input.parentElement?.classList.add('focused')
    // 通知父组件密码获得焦点
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
  // 简单验证
  if (!form.username || form.username.length < 3) {
    return
  }
  
  if (!form.password || form.password.length < 6) {
    return
  }
  
  if (props.showCaptcha && (!form.captcha_code || form.captcha_code.length < 4)) {
    return
  }
  
  emit('submit', form)
}

const switchToRegister = () => {
  emit('switch-to-register')
}

// 监听用户名变化，重置用户不存在提示状态
watch(() => form.username, (newUsername) => {
  if (newUsername) {
    // 当用户开始输入新用户名时，重置状态
    emit('username-blur', newUsername)
  }
})
</script>

<style scoped>
/* 修复输入框父容器高度和描边问题 */
.form-group.with-icon {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  margin-bottom: 0;
  border-radius: 8px;
  overflow: visible; /* 确保描边不被截断 */
  border: 1px solid var(--border-color); /* 添加默认边框 */
  background-color: var(--input-bg);
  height: 48px; /* 固定高度 */
  display: flex;
  align-items: center;
  box-sizing: border-box; /* 确保边框计算在内 */
}

.form-group.with-icon.focused {
  z-index: 100;
  position: relative;
  transform: translateZ(0);
  box-shadow: 0 0 0 2px var(--primary-color);
  border-color: var(--primary-color); /* 添加边框颜色增强视觉效果 */
}

.form-group.with-icon.has-error.focused {
  box-shadow: 0 0 0 2px var(--error-color);
  border-color: var(--error-color);
}

.form-group.with-icon.has-success.focused {
  box-shadow: 0 0 0 2px var(--success-color);
  border-color: var(--success-color);
}

/* 输入框样式调整 */
.icon-input {
  flex: 1;
  height: 100%;
  padding: 0 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-color);
  outline: none;
  box-sizing: border-box; /* 确保内边距计算在内 */
}

.icon-input::placeholder {
  color: var(--placeholder-color);
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

.clear-button, .password-toggle {
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

.clear-button:hover, .password-toggle:hover {
  color: var(--text-color);
}

.clear-button {
  font-size: 12px;
}

.password-toggle svg {
  display: block;
}

/* 表单内容区域调整 */
.form-content {
  position: relative;
  padding: 10px 0;
  min-height: 180px;
}

.auth-step {
  position: relative;
}

.auth-steps-container {
  position: relative;
  min-height: 120px; /* 减小最小高度 */
}

.auth-button-area {
  margin-top: 0 !important; /* 移除冗余间距，由父容器控制 */
}

/* 错误提示区域调整 */
.form-error-area {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
  margin-top: 8px; /* 增加上边距 */
  margin-bottom: 12px; /* 增加下边距 */
}

.form-error-area.has-error {
  height: 40px; /* 增加高度，确保两行文本也能显示 */
}

.form-error-area.has-locked-error {
  height: 45px; /* 锁定消息可能稍高 */
}

.attempt-hint {
  padding: 10px 12px; /* 增加内边距 */
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 6px;
  font-size: 13px; /* 稍微增大字体 */
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
  line-height: 1.4; /* 增加行高 */
}

.attempt-hint .locked-message {
  color: #dc2626;
  font-weight: 500;
}

.attempt-hint.user-missing-hint {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.2);
}

.attempt-hint.user-missing-hint a {
  color: #1d4ed8;
  text-decoration: underline;
  font-weight: 500;
  margin-left: 4px;
}

.attempt-hint.user-missing-hint a:hover {
  color: #1e40af;
}

.theme-dark .attempt-hint {
  background-color: rgba(248, 113, 113, 0.1);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.3);
}

.theme-dark .attempt-hint .locked-message {
  color: #fca5a5;
}

.theme-dark .attempt-hint.user-missing-hint {
  background-color: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  border-color: rgba(96, 165, 250, 0.3);
}

.theme-dark .attempt-hint.user-missing-hint a {
  color: #93c5fd;
}

.theme-dark .attempt-hint.user-missing-hint a:hover {
  color: #bfdbfe;
}

/* 验证码样式调整 */
.captcha-group {
  margin-top: 12px;
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: var(--input-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  height: 48px;
  box-sizing: border-box;
}

.captcha-input-group:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.captcha-image-container {
  flex-shrink: 0;
}

.captcha-image {
  width: 100px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.captcha-image:hover {
  border-color: var(--primary-color);
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  color: var(--text-secondary);
  font-size: 12px;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .form-content {
    min-height: 160px;
  }
  
  .auth-steps-container {
    min-height: 110px;
  }
  
  .form-group.with-icon {
    height: 44px; /* 移动端稍小的高度 */
  }
  
  .form-error-area.has-error {
    height: 38px;
  }
  
  .form-error-area.has-locked-error {
    height: 42px;
  }
  
  .attempt-hint {
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .captcha-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .captcha-image {
    width: 100%;
    height: 44px;
  }
  
  .captcha-input-group {
    width: 100%;
  }
}
</style>

<style scoped src="./styles/auth-styles.css"></style>
