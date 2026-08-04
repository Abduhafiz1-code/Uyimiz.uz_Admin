<script setup>
import { state, toggleTheme, logout } from '../store'
import Icon from './Icon.vue'

const items = [
  { to: '/', label: 'Boshqaruv paneli', icon: 'dashboard' },
  { to: '/foydalanuvchilar', label: 'Foydalanuvchilar', icon: 'users' },
  { to: '/agentlar', label: 'Agentlar', icon: 'agents' },
  { to: '/elonlar', label: "E'lonlar", icon: 'posts' },
  { to: '/moderatsiya', label: 'Moderatsiya', icon: 'mod' },
  { to: '/tariflar', label: "Tariflar / to'lovlar", icon: 'tariffs' },
  { to: '/rollar', label: 'Rollar va ruxsatlar', icon: 'roles' },
  { to: '/sozlamalar', label: 'Tizim sozlamalari', icon: 'settings' },
  { to: '/audit', label: 'Audit jurnali', icon: 'audit' },
]
</script>

<template>
  <aside class="sidebar" :class="{ open: state.sidebarOpen }">
    <div class="brand">
      <span class="dot"><Icon name="settings" :size="14" /></span>
      Uyimiz.uz
    </div>

    <ul class="nav">
      <li v-for="item in items" :key="item.to">
        <router-link :to="item.to" class="nav-item" active-class="active" @click="state.sidebarOpen = false">
          <Icon :name="item.icon" />
          <span>{{ item.label }}</span>
        </router-link>
      </li>
    </ul>

    <div class="sidebar-foot">
      <button class="theme-toggle" @click="toggleTheme" type="button">
        <Icon :name="state.theme === 'dark' ? 'sun' : 'moon'" :size="16" />
        <span>{{ state.theme === 'dark' ? "Kunduzgi rejim" : "Tungi rejim" }}</span>
      </button>
      <div class="label">Kirish darajasi</div>
      <div class="role-pill">⚡ {{ state.currentAdmin?.role || 'Superadmin' }}</div>
      <button class="theme-toggle" style="margin-top:10px;" @click="logout" type="button">
        <Icon name="logout" :size="16" />
        <span>{{ state.currentAdmin?.name ? `Chiqish (${state.currentAdmin.name})` : 'Chiqish' }}</span>
      </button>
    </div>
  </aside>
</template>
