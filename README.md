# vue-sf
SSR应用 | [大文件上传](./READUP.md) | [大文件下载](./READDOWN.md)

**运行**
```
clone项目

cd vue-sf

npm install

node server_m.js
```

## 创建一个SSR应用

### 创建vue项目
1、安装 vue-cli

全局安装vue-cli脚手架

`npm install @vue/cli -g --registry=https://registry.npm.taobao.org`

2、创建一个vue项目

`vue create vue-sf`

3、运行

`npm run serve`

### 改造为SSR

1、安装需要的包

`npm install vue-server-renderer webpack-node-externals cross-env --registry=https://registry.npm.taobao.org --save-dev`

`npm install koa koa-static --save --registry=https://registry.npm.taobao.org`

根目录创建`server.js`

```js
// server.js
// 第 1 步：创建一个 Vue 实例
const Vue = require("vue");
const Koa = require("koa");
const app = new Koa();
// 第 2 步：创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer();

// 第 3 步：添加一个中间件来处理所有请求
app.use(async (ctx, next) => {
  const vm = new Vue({
    data: {
      title: "ssr example",
      url: ctx.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  });
  // 将 Vue 实例渲染为 HTML
  renderer.renderToString(vm, (err, html) => {
    if(err){
      ctx.res.status(500).end('Internal Server Error')
      return
    }
    ctx.body = html
  });
});

const port = 3000;
app.listen(port, function() {
  console.log(`server started at localhost:${port}`);
});
```

运行：`node server.js`

虽然能跑起来，但是到目前为止，我们并没有将客户端的.vue文件通过服务端进行渲染，那么如何将前端的.vue文件与后端node进行结合呢？

2、改造结构

在`src`目录下创建`index.template.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <!--vue-ssr-outlet-->
  </body>
</html>
```
**注意:**`<!--vue-ssr-outlet-->`必须，占位

修改`main.js`
```js
// main.js
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from "./router";

// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp () {
  const router = createRouter();
  const app = new Vue({
    router,
    // 根实例简单的渲染应用程序组件。
    render: h => h(App)
  })
  return { app,router }
}
```
在`src`目录下创建`entry-client.js`
```js
import { createApp } from './main'

// 客户端特定引导逻辑……
const { app } = createApp()

// 这里假定 App.vue 模板中根元素具有 `id="app"`
app.$mount('#app')
```

在`src`目录下创建`entry-server.js`
```js
import { createApp } from "./main";

export default context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，
  // 就已经准备就绪。
  return new Promise((resolve, reject) => {
    const { app, router } = createApp();

    // 设置服务器端 router 的位置
    router.push(context.url);

    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      // 匹配不到的路由，执行 reject 函数，并返回 404
      if (!matchedComponents.length) {
        return reject({
          code: 404
        });
      }
      // Promise 应该 resolve 应用程序实例，以便它可以渲染
      resolve(app);
    }, reject);
  });
};
```

修改`router.js`
```js
import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export function createRouter(){
  return new Router({
    mode: 'history', //一定要是history模式
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/about',
        name: 'about',
        component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
      }
    ]
  })
}
```

改造`webpack`、`package.json`、`server.js`(项目中对应server_m.js)

运行：

`npm run build:win`

`node server_m.js`

可以试着改造下`vuex`