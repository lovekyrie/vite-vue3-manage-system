// import { Store } from 'vuex'

// declare module 'vue' {
//   // 声明自己的store state
//   interface State {
//     count: number
//   }

//   //
//   interface ComponentCustomProperties {
//     $store: Store<State>
//   }
// }

declare module 'vuex' {
  export * from 'vuex/types/index.d.ts'
  export * from 'vuex/types/helpers.d.ts'
  export * from 'vuex/types/logger.d.ts'
  export * from 'vuex/types/vue.d.ts'
}
