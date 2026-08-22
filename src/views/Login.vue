<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import UiIcon from '../components/UiIcon.vue'
import { login, state } from '../store'

const router = useRouter()
const route = useRoute()

const phone = ref('')
const password = ref('')
const showPassword = ref(false)

async function onSubmit() {
  if (!phone.value.trim() || !password.value) return
  const ok = await login(phone.value.trim(), password.value)
  if (ok) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  }
}
</script>

<template>
  <div class="login-wrap girih">
    <div class="login-card">
      <div class="login-brand">
        <svg class="mark"><use href="#star" /></svg>
        <span>Uyimiz <b>Admin</b></span>
      </div>

      <h1>Admin panelga kirish</h1>
      <p class="sub">Davom etish uchun telefon raqami va parolingizni kiriting</p>

      <form class="form-grid" novalidate @submit.prevent="onSubmit">
        <div class="form-field">
          <label>Telefon</label>
          <div class="inp">
            <UiIcon name="i-phone" :size="15" />
            <input
              v-model="phone"
              type="tel"
              placeholder="+998 90 123 45 67"
              autocomplete="username"
              autofocus
            />
          </div>
        </div>

        <div class="form-field">
          <label>Parol</label>
          <div class="pw">
            <div class="inp">
              <UiIcon name="i-lock" :size="15" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>
            <button
              class="pw-eye"
              type="button"
              tabindex="-1"
              :aria-label="showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'"
              @click="showPassword = !showPassword"
            >
              <UiIcon :name="showPassword ? 'i-eye-off' : 'i-eye'" :size="16" />
            </button>
          </div>
        </div>

        <Transition name="toast">
          <div v-if="state.authError" class="form-error">{{ state.authError }}</div>
        </Transition>

        <button class="btn btn-pri login-submit" type="submit" :disabled="state.authLoading">
          <span v-if="state.authLoading" class="spinner" />
          <span>{{ state.authLoading ? 'Tekshirilmoqda…' : 'Kirish' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
