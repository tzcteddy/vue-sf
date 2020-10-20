const fs=require('fs');
const path=require('path');

const Koa=require('koa');
const koaStatic=require('koa-static');
const bodyParser = require('koa-bodyparser');


const app=new Koa();
const router=require('./server/router.js');
const resolve=file=>path.resolve(__dirname,file);

// 开放dist目录
app.use(koaStatic(resolve('./dist')));
// 第 2 步：获得一个createBundleRenderer
const {createBundleRenderer}=require('vue-server-renderer');
const bundle=require('./dist/vue-ssr-server-bundle.json');
const clientManifest=require('./dist/vue-ssr-client-manifest.json');

const renderer=createBundleRenderer(bundle,{
    runInNewContext:false,
    template:fs.readFileSync(resolve('./src/index.template.html'),'utf-8'),
    clientManifest:clientManifest
})

function renderToString(context){
    return new Promise((resolve,reject)=>{
        renderer.renderToString(context,(err,html)=>{
            err?reject(err):resolve(html);
        })
    })
}

// 第 3 步：添加一个中间件来处理所有请求
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods())
app.use(async (ctx,next)=>{
    const context = {
        title: "ssr test",
        url: ctx.url
      };
      // 将 context 数据渲染为 HTML
      const html = await renderToString(context);
      ctx.body = html;
})

const port = 3000;
app.listen(port, function () {
    console.log(`server started at localhost:${port}`);
});


// // 切片上传 && 合并
// router.post('/single3', async (req, res) => {
//     let {
//         fields,
//         files
//     } = await handleMultiparty(req, res, true);
 
//     let [chunk] = files.chunk,
//         [filename] = fields.filename;
//     let hash = /([0-9a-zA-Z]+)_\d+/.exec(filename)[1],
//         // suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1],
//         path = `${uploadDir}/${hash}`;
//     !fs.existsSync(path) ? fs.mkdirSync(path) : null;
//     path = `${path}/${filename}`;
//     fs.access(path, async err => {
//         // 存在的则不再进行任何的处理
//         if (!err) {
//             res.send({
//                 code: 0,
//                 path: path.replace(__dirname, `http://127.0.0.1:${PORT}`)
//             });
//             return;
//         }
 
//         // 为了测试出效果，延迟1秒钟
//         await new Promise(resolve => {
//             setTimeout(_ => {
//                 resolve();
//             }, 200);
//         });
 
//         // 不存在的再创建
//         let readStream = fs.createReadStream(chunk.path),
//             writeStream = fs.createWriteStream(path);
//         readStream.pipe(writeStream);
//         readStream.on('end', function () {
//             fs.unlinkSync(chunk.path);
//             res.send({
//                 code: 0,
//                 path: path.replace(__dirname, `http://127.0.0.1:${PORT}`)
//             });
//         });
//     });
// });