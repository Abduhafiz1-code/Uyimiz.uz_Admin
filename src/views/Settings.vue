<script setup>
import PageHead from '../components/PageHead.vue'
import { saveSetting, state } from '../store'

/**
 * Sozlamalar bitta ro'yxatdan yasaladi — ilgari har bir karta qo'lda
 * takrorlangan edi va yangisini qo'shish uchun 12 qator nusxalash kerak
 * bo'lardi.
 */
const fields = [
  {
    key: 'aiThreshold',
    label: 'AI filtr chegara balli',
    note: "Shu balldan yuqori e'lonlar avtomatik moderatsiya navbatiga tushadi.",
    suffix: '/ 100',
    type: 'number',
  },
  {
    key: 'commission',
    label: 'Platforma komissiyasi',
    note: 'Har bir yopilgan bitimdan olinadigan ulush.',
    suffix: '% bitimdan',
    type: 'number',
    step: '0.1',
  },
  {
    key: 'contractPrice',
    label: 'Onlayn shartnoma narxi',
    note: 'PDF shartnoma yaratish va e-imzo uchun bir martalik to‘lov.',
    suffix: "so'm",
    type: 'number',
  },
  {
    key: 'vipPrice',
    label: 'VIP joylashuv narxi',
    note: "E'lonni qidiruv natijalarida yuqoriga chiqarish.",
    suffix: "so'm / hafta",
    type: 'number',
  },
  {
    key: 'premiumPostPrice',
    label: "Premium e'lon narxi",
    note: "E'lon kartasi ajratib ko'rsatiladi va uzoqroq faol turadi.",
    suffix: "so'm / oy",
    type: 'number',
  },
  {
    key: 'agentCommission',
    label: 'Uyimiz Agent fiks komissiyasi',
    note: 'Agent mijozdan oladigan ulush — bozordagi 10–50% o‘rniga.',
    suffix: '% bitimdan (1–2%)',
    type: 'number',
    step: '0.1',
  },
  {
    key: 'platformShare',
    label: 'Platformaning agentdan ulushi',
    note: 'Agent komissiyasidan platformaga o‘tadigan qism (Uber modeli).',
    suffix: '% (10–15%)',
    type: 'number',
    step: '0.1',
  },
  {
    key: 'agentSubscription',
    label: 'Agent oylik obunasi',
    note: 'CRM va avtomatik mijoz oqimidan foydalanish uchun.',
    suffix: "so'm / oy",
    type: 'number',
  },
]

const stages = [
  { value: 1, label: '1-bosqich — Maklersiz pilot (bepul)' },
  { value: 2, label: '2-bosqich — Tizimlashtirish va monetizatsiya' },
  { value: 3, label: '3-bosqich — Uyimiz Agent integratsiyasi' },
]
</script>

<template>
  <div>
    <PageHead
      eyebrow="Tizim"
      title="Tizim sozlamalari"
      note="Bu qiymatlar butun platformaga — saytga, mobil ilovaga va agent CRM'iga bir vaqtda ta'sir qiladi."
    />

    <div class="grid-cards stagger">
      <div v-for="f in fields" :key="f.key" class="set-card">
        <div class="set-lbl">{{ f.label }}</div>
        <div class="inp">
          <input v-model="state.settings[f.key]" :type="f.type" :step="f.step || undefined" />
          <span class="suffix">{{ f.suffix }}</span>
        </div>
        <p class="set-note">{{ f.note }}</p>
        <button class="btn btn-pri btn-sm" @click="saveSetting(f.key, f.label)">Saqlash</button>
      </div>

      <!-- Bosqich alohida: bu tanlov, raqam emas -->
      <div class="set-card">
        <div class="set-lbl">Rivojlanish bosqichi</div>
        <div class="inp">
          <select v-model.number="state.settings.stage">
            <option v-for="s in stages" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
        <p class="set-note">
          Boshqaruv panelidagi maqsad ko'rsatkichlari shu bosqichga qarab hisoblanadi.
        </p>
        <button class="btn btn-pri btn-sm" @click="saveSetting('stage', 'Rivojlanish bosqichi')">
          Saqlash
        </button>
      </div>
    </div>
  </div>
</template>
