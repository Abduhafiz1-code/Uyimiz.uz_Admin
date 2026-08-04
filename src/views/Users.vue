<script setup>
import { ref, reactive, computed } from 'vue'
import Icon from '../components/Icon.vue'
import Modal from '../components/Modal.vue'
import { state, toggleUserBlock, updateUser } from '../store'

const filters = ['Hammasi', 'Uy egalari', 'Xaridorlar', 'Ijarachilar', 'Agentlar', 'Bloklangan']
const activeFilter = ref('Hammasi')
const search = ref('')

const typeMap = { 'Uy egalari': 'uy_egalari', Xaridorlar: 'xaridorlar', Ijarachilar: 'ijarachilar', Agentlar: 'agentlar' }

const filtered = computed(() => {
  let list = state.users
  if (activeFilter.value === 'Bloklangan') {
    list = list.filter(u => u.status === 'Bloklangan')
  } else if (activeFilter.value !== 'Hammasi') {
    list = list.filter(u => u.typeKey === typeMap[activeFilter.value])
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(u => u.name.toLowerCase().includes(q) || u.phone.toLowerCase().includes(q) || String(u.id).includes(q))
  }
  return list
})

function toggleBlock(u) {
  toggleUserBlock(u)
}

/* ---- Tahrirlash modali ---- */
const editing = ref(null)
const form = reactive({ name: '', phone: '', type: '', status: '' })

function openEdit(u) {
  editing.value = u
  form.name = u.name
  form.phone = u.phone
  form.type = u.type
  form.status = u.status
}
function closeEdit() {
  editing.value = null
}
async function saveEdit() {
  const ok = await updateUser(editing.value, { ...form })
  if (ok) closeEdit()
}

/* ---- Profil ko'rish ---- */
const viewing = ref(null)
function openView(u) { viewing.value = u }
</script>

<template>
  <div>
    <div class="topbar">
      <div><h1>Foydalanuvchilar boshqaruvi</h1></div>
    </div>

    <div class="pillbar">
      <div v-for="f in filters" :key="f" class="pill" :class="{ active: activeFilter === f }" @click="activeFilter = f">
        {{ f }}
      </div>
    </div>

    <div class="search">
      <Icon name="search" :size="15" />
      <input v-model="search" placeholder="Ism, telefon yoki ID bo'yicha qidirish" />
    </div>

    <div class="panel">
      <table>
        <thead>
          <tr>
            <th>FOYDALANUVCHI</th><th>TURI</th><th>HOLAT</th><th>RO'YXATDAN O'TGAN</th><th>AMALLAR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filtered" :key="u.id" style="cursor:pointer;" @click="openView(u)">
            <td>
              <div class="name-main">{{ u.name }}</div>
              <div class="name-sub">{{ u.phone }} · ID {{ u.id }}</div>
            </td>
            <td>{{ u.type }}</td>
            <td><span class="badge" :class="u.status === 'Faol' ? 'faol' : 'bloklangan'">{{ u.status }}</span></td>
            <td>{{ u.since }}</td>
            <td @click.stop>
              <div class="actions-cell">
                <button class="btn btn-sm" @click="openView(u)">Ko'rish</button>
                <button class="btn btn-sm" @click="openEdit(u)">Tahrirlash</button>
                <button v-if="u.status === 'Faol'" class="btn btn-sm btn-outline-red" @click="toggleBlock(u)">Bloklash</button>
                <button v-else class="btn btn-sm btn-dark" @click="toggleBlock(u)">Faollashtirish</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="footnote">
        Admin har bir foydalanuvchi profilini ochib, ma'lumotlarini to'g'ridan-to'g'ri tahrirlashi,
        e'lonlarini o'chirishi, hisobini bloklashi yoki butunlay o'chirishi mumkin — cheklovsiz.
      </div>
    </div>

    <Modal v-if="editing" title="Foydalanuvchini tahrirlash" @close="closeEdit">
      <div class="form-row">
        <label>Ism</label>
        <input v-model="form.name" type="text" />
      </div>
      <div class="form-row">
        <label>Telefon</label>
        <input v-model="form.phone" type="text" />
      </div>
      <div class="form-row">
        <label>Turi</label>
        <select v-model="form.type">
          <option>Uy egasi</option>
          <option>Xaridor</option>
          <option>Ijarachi</option>
          <option>Agent</option>
        </select>
      </div>
      <div class="form-row">
        <label>Holati</label>
        <select v-model="form.status">
          <option>Faol</option>
          <option>Bloklangan</option>
        </select>
      </div>
      <div class="form-actions">
        <button class="btn btn-sm" type="button" @click="closeEdit">Bekor qilish</button>
        <button class="btn btn-sm btn-primary" type="button" @click="saveEdit">Saqlash</button>
      </div>
    </Modal>

    <Modal v-if="viewing" :title="viewing.name" @close="viewing = null">
      <div class="form-row"><label>ID</label><div>{{ viewing.id }}</div></div>
      <div class="form-row"><label>Telefon</label><div>{{ viewing.phone }}</div></div>
      <div class="form-row"><label>Turi</label><div>{{ viewing.type }}</div></div>
      <div class="form-row"><label>Holati</label><div>{{ viewing.status }}</div></div>
      <div class="form-row"><label>Ro'yxatdan o'tgan</label><div>{{ viewing.since }}</div></div>
      <div class="form-actions">
        <button class="btn btn-sm btn-primary" type="button" @click="viewing = null">Yopish</button>
      </div>
    </Modal>
  </div>
</template>
