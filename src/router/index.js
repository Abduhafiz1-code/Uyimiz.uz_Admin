import { createRouter, createWebHashHistory } from 'vue-router'
import { state } from '../store'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import Agents from '../views/Agents.vue'
import Posts from '../views/Posts.vue'
import Moderation from '../views/Moderation.vue'
import Tariffs from '../views/Tariffs.vue'
import Roles from '../views/Roles.vue'
import Settings from '../views/Settings.vue'
import Audit from '../views/Audit.vue'

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/foydalanuvchilar', name: 'users', component: Users },
  { path: '/agentlar', name: 'agents', component: Agents },
  { path: '/elonlar', name: 'posts', component: Posts },
  { path: '/moderatsiya', name: 'moderation', component: Moderation },
  { path: '/tariflar', name: 'tariffs', component: Tariffs },
  { path: '/rollar', name: 'roles', component: Roles },
  { path: '/sozlamalar', name: 'settings', component: Settings },
  { path: '/audit', name: 'audit', component: Audit },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const loggedIn = !!state.token

  if (!to.meta.public && !loggedIn) {
    return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
  }
  if (to.name === 'login' && loggedIn) {
    return { path: '/' }
  }
  return true
})

export default router
