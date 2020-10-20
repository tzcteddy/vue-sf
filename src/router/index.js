import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

export function createRouter(){
    return new VueRouter({
        mode:'history',//一定要是history模式
        routes:[
            {
                path: '/',
                name: 'home',
                component: Home
              },
              {
                path: '/about',
                name: 'about',
                component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
              }
        ]
    })
}
