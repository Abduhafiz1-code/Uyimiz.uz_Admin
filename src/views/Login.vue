<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import { login, state } from '../store'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

async function onSubmit() {
  if (!username.value.trim() || !password.value) return
  const ok = await login(username.value.trim(), password.value)
  if (ok) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-glow"></div>
    <div class="login-box">
      <div class="login-brand">
        <span class="dot"><Icon name="settings" :size="16" /></span>
        Uyimiz.uz
      </div>
      <h1>Admin panelga kirish</h1>
      <p class="login-sub">Davom etish uchun login va parolingizni kiriting</p>

      <form @submit.prevent="onSubmit" novalidate>
        <div class="form-row">
          <label>Login</label>
          <input
            v-model="username"
            type="text"
            placeholder="Login"
            autocomplete="username"
            autofocus
          />
        </div>
        <div class="form-row">
          <label>Parol</label>
          <div class="pw-wrap">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button class="pw-toggle" type="button" @click="showPassword = !showPassword" tabindex="-1">
              <Icon :name="showPassword ? 'eye-off' : 'eye'" :size="17" />
            </button>
          </div>
        </div>

        <Transition name="fade-slide">
          <div v-if="state.authError" class="login-error">{{ state.authError }}</div>
        </Transition>

        <button class="btn btn-primary login-submit" type="submit" :disabled="state.authLoading">
          <span v-if="state.authLoading" class="spinner spinner-sm"></span>
          <span v-else>Kirish</span>
        </button>
      </form>
    </div>
  </div>
</template>
