<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import Modal from '../components/Modal.vue'
import { state, addAdmin, updateAdmin, removeAdmin } from '../store'

const route = useRoute()
const router = useRouter()

const rows = [
  { perm: "E'lon joylash / tahrirlash (o'ziniki)", vals: [1, 1, 1, 1] },
  { perm: "Boshqa foydalanuvchi e'lonini tahrirlash / o'chirish", vals: [0, 0, 1, 1] },
  { perm: 'Foydalanuvchini bloklash / o\'chirish', vals: [0, 0, 1, 1] },
  { perm: 'Agentni sertifikatlash / bekor qilish', vals: [0, 0, 0, 1] },
  { perm: 'Komissiya va tarif narxlarini belgilash', vals: [0, 0, 0, 1] },
  { perm: "Boshqa adminlarni qo'shish / tizim sozlamalarini o'zgartirish", vals: [0, 0, 0, 1] },
]

/* ---- Admin qo'shish / tahrirlash ---- */
const showAdd = ref(false)
const editing = ref(null)
const showPassword = ref(false)
const form = reactive({ name: '', phone: '', role: 'Admin', status: 'Faol', username: '', password: '' })
const formError = ref('')

function openAdd() {
  form.name = ''; form.phone = ''; form.role = 'Admin'; form.status = 'Faol'
  form.username = ''; form.password = ''
  formError.value = ''
  showAdd.value = true
}
function openEdit(a) {
  editing.value = a
  form.name = a.name; form.phone = a.phone; form.role = a.role; form.status = a.status
  form.username = a.username || ''; form.password = ''
  formError.value = ''
}
function closeModal() { showAdd.value = false; editing.value = null; showPassword.value = false }
const modalTitle = computed(() => editing.value ? 'Adminni tahrirlash' : "Yangi admin qo'shish")

async function save() {
  formError.value = ''
  if (!form.name.trim()) { formError.value = 'Ismni kiriting'; return }
  if (!form.username.trim()) { formError.value = 'Login (username) kiriting'; return }
  if (!editing.value && form.password.length < 6) {
    formError.value = 'Parol kamida 6 belgidan iborat bo\'lishi kerak'
    return
  }
  if (editing.value && form.password && form.password.length < 6) {
    formError.value = 'Parol kamida 6 belgidan iborat bo\'lishi kerak'
    return
  }

  const payload = { name: form.name, phone: form.phone, role: form.role, status: form.status, username: form.username }
  if (form.password) payload.password = form.password

  if (editing.value) {
    const ok = await updateAdmin(editing.value, payload)
    if (ok) closeModal()
  } else {
    const ok = await addAdmin(payload)
    if (ok) closeModal()
  }
}
function remove(a) {
  if (a.role === 'Superadmin') return
  removeAdmin(a)
}

onMounted(() => {
  if (route.query.add === '1') {
    openAdd()
    router.replace({ path: '/rollar' })
  }
})
</script>

<template>
  <div>
    <div class="topbar">
      <div><h1>Rollar va ruxsatlar matritsasi</h1></div>
      <div class="top-actions">
        <button class="btn btn-primary" @click="openAdd">
          <Icon name="plus" :size="15" /> Admin qo'shish
        </button>
      </div>
    </div>

    <div class="panel" style="margin-bottom:20px;">
      <table>
        <thead>
          <tr><th>ISM</th><th>LOGIN</th><th>TELEFON</th><th>ROL</th><th>HOLAT</th><th>QO'SHILGAN</th><th>AMALLAR</th></tr>
        </thead>
        <tbody>
          <tr v-for="a in state.admins" :key="a.id" style="cursor:pointer;" @click="openEdit(a)">
            <td class="name-main">{{ a.name }}</td>
            <td>{{ a.username || '—' }}</td>
            <td>{{ a.phone }}</td>
            <td>{{ a.role }}</td>
            <td><span class="badge" :class="a.status === 'Faol' ? 'faol' : 'bloklangan'">{{ a.status }}</span></td>
            <td>{{ a.since }}</td>
            <td @click.stop>
              <div class="actions-cell">
                <button class="btn btn-sm" @click="openEdit(a)">Tahrirlash</button>
                <button v-if="a.role !== 'Superadmin'" class="btn btn-sm btn-outline-red" @click="remove(a)">O'chirish</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="panel">
      <table class="matrix-table">
        <thead>
          <tr><th>RUXSAT</th><th>FOYDALANUVCHI</th><th>AGENT</th><th>MODERATOR</th><th>ADMIN</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.perm">
            <td>{{ r.perm }}</td>
            <td v-for="(v, i) in r.vals" :key="i">
              <span v-if="v" class="check">✓</span>
              <span v-else class="dash">—</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="footnote">
        <b>Superadmin</b> — eng yuqori daraja: u hamma narsaga ruxsatga ega — foydalanuvchi va agentlarni
        ko'rish, tahrirlash, bloklash, o'chirishdan tortib, komissiya foizi, tarif narxlari va tizim
        sozlamalarini o'zgartirishgacha. Moderator huquqi cheklangan — faqat e'lon va foydalanuvchi darajasida.
      </div>
    </div>

    <Modal v-if="showAdd || editing" :title="modalTitle" @close="closeModal">
      <div class="form-row">
        <label>Ism</label>
        <input v-model="form.name" type="text" placeholder="F.I.Sh" />
      </div>
      <div class="form-row">
        <label>Telefon</label>
        <input v-model="form.phone" type="text" placeholder="+998 90 123 45 67" />
      </div>
      <div class="form-row">
        <label>Login (username)</label>
        <input v-model="form.username" type="text" placeholder="masalan: usmon" autocomplete="off" />
      </div>
      <div class="form-row">
        <label>{{ editing ? "Yangi parol (o'zgartirmasangiz bo'sh qoldiring)" : 'Parol' }}</label>
        <div class="pw-wrap">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="kamida 6 belgi"
            autocomplete="new-password"
          />
          <button class="pw-toggle" type="button" @click="showPassword = !showPassword" tabindex="-1">
            <Icon :name="showPassword ? 'eye-off' : 'eye'" :size="16" />
          </button>
        </div>
      </div>
      <div class="form-row">
        <label>Rol</label>
        <select v-model="form.role">
          <option>Moderator</option>
          <option>Admin</option>
          <option>Superadmin</option>
        </select>
      </div>
      <div class="form-row">
        <label>Holati</label>
        <select v-model="form.status">
          <option>Faol</option>
          <option>Bloklangan</option>
        </select>
      </div>
      <div v-if="formError" class="login-error">{{ formError }}</div>
      <div class="form-actions">
        <button class="btn btn-sm" type="button" @click="closeModal">Bekor qilish</button>
        <button class="btn btn-sm btn-primary" type="button" @click="save">Saqlash</button>
      </div>
    </Modal>
  </div>
</template>
