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
        <div v-if="showUserMissingMessage && !hasValidAccountForAttempt" class="attempt-hint user-missing-hint">
          <span class="hint-text">
            用户不存在，请检查用户名或<a href="#" @click.prevent="switchToRegister">注册新账号</a>
          </span>
        </div>
      </div>
    </div>
    
    <div class="auth-button-area">
      <div class="button-container">
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
/* 移除所有内部样式，使用统一的 auth-styles.css */
</style>