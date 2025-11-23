<script setup lang="ts">
import { Ref, ref } from 'vue'
import { useStore } from '../store';

interface Word {
  letter: string
  isHover: boolean
}
defineProps<{ msg: string }>()

const { plus } = useCount()
const arr = Array.from('helloworld'.split('').map(k => ({ letter: k, isHover: false })))
const words: Ref<Word[]> = ref(arr)
const handleHover = (word: Word) => {
  word.isHover = true
}

const handleRemoveHover = (word: Word) => {
  word.isHover = false
}

function useCount() {

  const store = useStore()
  function plus() {
    store.commit('increment')
    console.log('store', store.state.count)
  }
  return { plus }
}
</script>

<template>
  <h1>{{ msg }}</h1>
  <div class="words-wrap">
    <div v-for="word in words" :key="word.letter" class="word" :class="{ 'hover-letter': word.isHover }"
      @mouseenter="handleHover(word)" @mouseleave="handleRemoveHover(word)">
      {{ word.letter }}
    </div>
  </div>
  <el-button @click="plus">增加</el-button>
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
