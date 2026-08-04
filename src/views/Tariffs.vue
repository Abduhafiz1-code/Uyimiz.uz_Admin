<script setup>
import { state, saveTariff } from '../store'
</script>

<template>
  <div>
    <div class="topbar"><div><h1>Tariflar / to'lovlar</h1></div></div>

    <div class="settings-grid">
      <div class="setting-card" v-for="t in state.tariffs" :key="t.id">
        <div class="lbl">{{ t.name }}</div>
        <div class="field">
          <input v-model="t.price" style="max-width:160px;" />
          <span v-if="t.period !== '—'" class="suffix">/ {{ t.period }}</span>
        </div>
        <div class="name-sub" style="margin-bottom:10px;">{{ t.desc }}</div>
        <button class="btn" @click="saveTariff(t)">Saqlash</button>
      </div>
    </div>
  </div>
</template>
