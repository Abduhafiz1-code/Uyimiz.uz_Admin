<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import AdminLayout from './components/AdminLayout.vue'
import EmptyState from './components/EmptyState.vue'
import IconSprite from './components/IconSprite.vue'
import SkeletonRows from './components/SkeletonRows.vue'
import ToastHost from './components/ToastHost.vue'
import { loadAll, state } from './store'

const route = useRoute()
const isAuthLayout = computed(() => !route.meta.public)

watch(
  () => state.token,
  (token) => {
    if (token) loadAll()
  },
  { immediate: true },
)
</script>

<template>
  <IconSprite />

  <AdminLayout v-if="isAuthLayout">
    <!-- Yuklanish: bo'sh ekran o'rniga jadval shaklidagi skelet -->
    <div v-if="state.loading" class="anim-fade">
      <div class="grid-kpi" style="margin-bottom: 22px">
        <div v-for="i in 4" :key="i" class="sk" style="height: 96px" />
      </div>
      <SkeletonRows :rows="7" />
    </div>

    <EmptyState
      v-else-if="state.error"
      title="Backendga ulanib bo'lmadi"
      :note="state.error"
    >
      <button class="btn btn-pri" @click="loadAll">Qayta urinish</button>
    </EmptyState>

    <RouterView v-else v-slot="{ Component, route: r }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="r.path" />
      </Transition>
    </RouterView>
  </AdminLayout>

  <RouterView v-else />

  <ToastHost />
</template>
