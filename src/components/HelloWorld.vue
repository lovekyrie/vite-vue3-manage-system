<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'

interface Word {
  letter: string
  isHover: boolean
}
defineProps<{ msg: string }>()

const arr = Array.from('helloworld'.split('').map(k => ({ letter: k, isHover: false })))
const words: Ref<Word[]> = ref(arr)
function handleHover(word: Word) {
  word.isHover = true
}

function handleRemoveHover(word: Word) {
  word.isHover = false
}
</script>

<template>
  <h1>{{ msg }}</h1>
  <div class="words-wrap">
    <div
      v-for="word in words" :key="word.letter" class="word" :class="{ 'hover-letter': word.isHover }"
      @mouseenter="handleHover(word)" @mouseleave="handleRemoveHover(word)"
    >
      {{ word.letter }}
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

.words-wrap {
  display: flex;
}

.word {
  flex: 0 0 40px;
}

.hover-letter {
  color: #f00;
}
</style>
