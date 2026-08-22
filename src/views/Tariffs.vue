<script setup>
import EmptyState from '../components/EmptyState.vue'
import PageHead from '../components/PageHead.vue'
import { saveTariff, state } from '../store'
</script>

<template>
  <div>
    <PageHead
      eyebrow="Monetizatsiya"
      title="Tariflar va to'lovlar"
      note="Foydalanuvchiga ko'rinadigan narx yorliqlari. O'zgartirish darhol saytga va ilovaga tarqaladi."
    />

    <EmptyState
      v-if="!state.tariffs.length"
      title="Tarif topilmadi"
      note="Backendda hali tarif yaratilmagan."
    />

    <div v-else class="grid-cards stagger">
      <div v-for="t in state.tariffs" :key="t.id" class="set-card">
        <div class="set-lbl">{{ t.name }}</div>
        <div class="inp">
          <input v-model="t.price" type="text" />
          <span v-if="t.period && t.period !== '—'" class="suffix">/ {{ t.period }}</span>
        </div>
        <p class="set-note">{{ t.desc }}</p>
        <button class="btn btn-pri btn-sm" @click="saveTariff(t)">Saqlash</button>
      </div>
    </div>
  </div>
</template>
