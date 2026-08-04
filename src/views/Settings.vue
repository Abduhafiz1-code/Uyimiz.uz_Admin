<script setup>
import { state, saveSetting } from '../store'

const premiumLabel = "Premium e'lon narxi"

function save(field, label) {
  saveSetting(field, label)
}
</script>

<template>
  <div>
    <div class="topbar"><div><h1>Tizim sozlamalari</h1></div></div>

    <div class="settings-grid">
      <div class="setting-card">
        <div class="lbl">AI filtr chegara balli</div>
        <div class="field">
          <input type="number" v-model="state.settings.aiThreshold" />
          <span class="suffix">/ 100</span>
        </div>
        <button class="btn" @click="save('aiThreshold', 'AI filtr chegara balli')">Saqlash</button>
      </div>

      <div class="setting-card">
        <div class="lbl">Platforma komissiyasi (bitimdan)</div>
        <div class="field">
          <input type="number" step="0.1" v-model="state.settings.commission" />
          <span class="suffix">% bitimdan</span>
        </div>
        <button class="btn" @click="save('commission', 'Platforma komissiyasi')">Saqlash</button>
      </div>

      <div class="setting-card">
        <div class="lbl">Shartnoma narxi</div>
        <div class="field">
          <input type="number" v-model="state.settings.contractPrice" />
          <span class="suffix">so'm</span>
        </div>
        <button class="btn" @click="save('contractPrice', 'Shartnoma narxi')">Saqlash</button>
      </div>

      <div class="setting-card">
        <div class="lbl">VIP joylashuv narxi</div>
        <div class="field">
          <input type="number" v-model="state.settings.vipPrice" />
          <span class="suffix">so'm / hafta</span>
        </div>
        <button class="btn" @click="save('vipPrice', 'VIP joylashuv narxi')">Saqlash</button>
      </div>

      <div class="setting-card">
        <div class="lbl">Premium e'lon narxi</div>
        <div class="field">
          <input type="number" v-model="state.settings.premiumPostPrice" />
          <span class="suffix">so'm / oy</span>
        </div>
        <button class="btn" @click="save('premiumPostPrice', premiumLabel)">Saqlash</button>
      </div>

      <div class="setting-card">
        <div class="lbl">Uyimiz Agent fiks komissiyasi</div>
        <div class="field">
          <input type="number" step="0.1" v-model="state.settings.agentCommission" />
          <span class="suffix">% bitimdan (1–2%)</span>
        </div>
        <button class="btn" @click="save('agentCommission', 'Uyimiz Agent fiks komissiyasi')">Saqlash</button>
      </div>

      <div class="setting-card">
        <div class="lbl">Platformaning agentdan ulushi</div>
        <div class="field">
          <input type="number" step="0.1" v-model="state.settings.platformShare" />
          <span class="suffix">% (10–15%, Uber modeli)</span>
        </div>
        <button class="btn" @click="save('platformShare', 'Platformaning agentdan ulushi')">Saqlash</button>
      </div>

      <div class="setting-card">
        <div class="lbl">Agent oylik obunasi</div>
        <div class="field">
          <input type="number" v-model="state.settings.agentSubscription" />
          <span class="suffix">so'm / oy</span>
        </div>
        <button class="btn" @click="save('agentSubscription', 'Agent oylik obunasi')">Saqlash</button>
      </div>

      <div class="setting-card">
        <div class="lbl">Rivojlanish bosqichi</div>
        <div class="field">
          <select v-model.number="state.settings.stage">
            <option :value="1">1-bosqich — Maklersiz pilot (bepul)</option>
            <option :value="2">2-bosqich — Tizimlashtirish va monetizatsiya</option>
            <option :value="3">3-bosqich — Uyimiz Agent integratsiyasi</option>
          </select>
        </div>
        <button class="btn" @click="save('stage', 'Rivojlanish bosqichi')">Saqlash</button>
      </div>
    </div>
  </div>
</template>
