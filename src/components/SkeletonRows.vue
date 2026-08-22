<script setup>
defineProps({
  rows: { type: Number, default: 5 },
  height: { type: Number, default: 44 },
})
</script>

<template>
  <div class="sk-list">
    <div
      v-for="i in rows"
      :key="i"
      class="sk"
      :style="{ height: height + 'px', animationDelay: `${i * 0.07}s` }"
    />
  </div>
</template>

<style scoped>
.sk-list {
  display: grid;
  gap: 9px;
}
</style>
