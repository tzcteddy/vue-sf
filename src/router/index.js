import Vue from 'vue'
import VueRouter from 'vue-router'
import Upload from '../views/Upload.vue'

Vue.use(VueRouter)

export function createRouter(){
    return new VueRouter({
        mode:'history',//一定要是history模式
        routes:[
            {
                path: '/',
                name: 'upload',
                component: Upload
              },
              {
                path: '/download',
                name: 'download',
                component: () => import(/* webpackChunkName: "download" */ '../views/Download.vue')
              }
        ]
    })
}
