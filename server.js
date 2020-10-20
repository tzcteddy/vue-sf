const Vue = require('vue');
const Koa = require('koa');
const app = new Koa();

const renderer = require('vue-server-renderer').createRenderer();

app.use(async (ctx, next) => {
    const vm = new Vue({
        data: {
            title: 'ssr',
            url: ctx.url
        },
        template: '<div @click="click">访问{{url}}</div>',
    })
    renderer.renderToString(vm, (err, html) => {
        if (err) {
            ctx.res.status(500).end('Internal Server Error')
            return
        }
        ctx.body = html
    })

})
const port = 3000;
app.listen(port, function () {
    console.log(`server started at localhost:${port}`);
});