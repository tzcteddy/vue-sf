import Vue from 'vue'
import App from './App.vue'
import {createRouter } from './router'
import store from './store'
import message from './components/Message/message.js'
Vue.use(message)
Vue.config.productionTip = false
// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp(){
    const router=createRouter();
    const app=new Vue({
        router,
        store,
        render: h => h(App)
      })
    return {app,router}
}

