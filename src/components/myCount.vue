<script setup>
import { computed, ref, watchEffect } from 'vue'
const count = ref(0)

function add() {
  count.value++
}

const doubleCount = computed(() => count.value * 2)

let color = ref('red')
watchEffect(() => {
  if (count.value % 2) {
    color.value = 'green'
  } else {
    color.value = 'red'
  }
})
</script>

<template>
  <div @click="add">{{ count }}</div>
  <div>{{ doubleCount }}</div>
</template>

<style scoped>
.count {
  color: v-bind(color)
}
</style>