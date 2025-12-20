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
              @blur="$emit('username-blur', form.username); isUsernameFocused = false; handleInputBlur()"
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
              @focus="() => { isPasswordFocused = true; handleInputFocus() }"
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
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
      
      <div v-if="attempts > 0 && hasValidAccountForAttempt" class="auth-alerts">
        <div class="attempt-hint">
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
      </div>
      
      <div class="errors-container" :class="{ 'has-errors': hasErrors }">
        <div v-if="errors.username" class="error-message">
          {{ errors.username }}
        </div>
        <div v-if="errors.password" class="error-message">
          {{ errors.password }}
        </div>
      </div>
    </div>
    
    <div class="auth-button-area">
      <div class="button-container">
        <button type="button" class="auth-button gradient-button"
          @click="$emit('submit', form)"
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
import { ref, computed, reactive } from 'vue'

interface Props {
  isLoading?: boolean
  attempts?: number
  showCaptcha?: boolean
  captchaImage?: string
  hasValidAccountForAttempt?: boolean
}

interface Emits {
  (e: 'submit', form: any): void
  (e: 'username-blur', username: string): void
  (e: 'refresh-captcha'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  attempts: 0,
  showCaptcha: false,
  captchaImage: '',
  hasValidAccountForAttempt: false
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
    errors.username = '请输入用户名'
  } else if (username.length < 3) {
    errors.username = '用户名至少需要3个字符'
  } else if (username.length > 10) {
    errors.username = '用户名不能超过10个字符'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = '用户名只能包含字母、数字和下划线'
  } else {
    errors.username = ''
  }
}

const validatePassword = () => {
  const password = form.password
  if (!password) {
    errors.password = '请输入密码'
  } else if (password.length < 6) {
    errors.password = '密码至少需要6个字符'
  } else if (password.length > 20) {
    errors.password = '密码不能超过20个字符'
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

const handleCaptchaInput = () => {
  if (form.captcha_code.length > 4) {
    form.captcha_code = form.captcha_code.slice(0, 4)
  }
}
</script>

<style scoped>
.form-group.with-icon {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.form-group.with-icon.focused {
  z-index: 10;
  position: relative;
  transform: translateZ(0);
  box-shadow: 0 0 0 2px var(--primary-color);
}

/* 确保父容器有足够空间 */
.form-content {
  position: relative;
  padding: 10px 0;
}

.auth-step {
  position: relative;
}

.auth-steps-container {
  position: relative;
  min-height: 140px;
}
</style>

<style scoped src="./styles/auth-styles.css"></style>
