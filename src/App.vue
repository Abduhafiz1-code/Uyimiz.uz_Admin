<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue'
import Icon from './components/Icon.vue'
import { state, loadAll } from './store'

const route = useRoute()
const isAuthLayout = computed(() => !route.meta.public)

watch(
  () => state.token,
  (token) => {
    if (token) loadAll()
  },
  { immediate: true }
)
</script>

<template>
  <template v-if="isAuthLayout">
    <Sidebar />
    <main class="main">
      <button class="btn mobile-toggle" style="margin-bottom:14px;" @click="state.sidebarOpen = !state.sidebarOpen">
        <Icon name="menu" :size="20" />
      </button>

      <div v-if="state.loading" class="panel" style="text-align:center;padding:52px;">
        <div class="spinner"></div>
        <span style="color:var(--muted);font-size:13.5px;font-weight:600;">Ma'lumotlar yuklanmoqda...</span>
      </div>
      <div v-else-if="state.error" class="panel" style="text-align:center;padding:40px;color:var(--red);">
        {{ state.error }}
        <div style="margin-top:12px;"><button class="btn btn-dark" @click="loadAll">Qayta urinish</button></div>
      </div>
      <router-view v-else v-slot="{ Component, route }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </main>
  </template>
  <router-view v-else />
  <Toast />
</template>
