<script setup>
import { state } from '../store'
</script>

<template>
  <Transition name="toast">
    <div v-if="state.toast" class="toast">{{ state.toast }}</div>
  </Transition>
</template>
