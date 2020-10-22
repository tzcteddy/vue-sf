const fs=require('fs')
const KoaRouter = require('koa-router')
const router = new KoaRouter();

const multiparty = require('koa2-multiparty');
    uploadDir = `${__dirname}/upload`;
router.post('/test',async (ctx,next)=>{
    setTimeout(function(){
        ctx.body={
            name:'123'
        }
    },100)
})
router.post('/uploadFile', multiparty(options = {
    maxFieldsSize: 200 * 1024 * 1024
}),async (ctx, next) => {
    const fields=ctx.req.body;
    const files=ctx.req.files;
    let chunk = files.chunk,
        filename = fields.filename;
    let hash = /([0-9a-zA-Z]+)_\d+/.exec(filename)[1],
        // suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1],
        path = `${uploadDir}/${hash}`;
    !fs.existsSync(path) ? fs.mkdirSync(path) : null;
    path = `${path}/${filename}`;
    await new Promise(resolve=>{
        fs.access(path, async err => {
            // 存在的则不再进行任何的处理
            if (!err) {
                ctx.body={
                    code: 0,
                    path: path.replace(__dirname, `http://127.0.0.1:${3000}`)
                };
                resolve()
                return;
            }
            // 不存在的再创建
            let readStream = fs.createReadStream(chunk.path),
                writeStream = fs.createWriteStream(path);
            readStream.pipe(writeStream);
            await new Promise(resolve=>{
                readStream.on('end', async function () {
                    fs.unlinkSync(chunk.path);
                    ctx.body={
                        code: 0,
                        path: path.replace(__dirname, `http://127.0.0.1:${3000}`)
                    };
                    resolve()
                });
            })
            resolve()
            
        });
    })
    
})
router.get('/merge', (ctx) => {
    let {
        hash
    } = ctx.query;
 
    let path = `${uploadDir}/${hash}`,
        fileList = fs.readdirSync(path),
        suffix;
    fileList.sort((a, b) => {
        let reg = /_(\d+)/;
        return reg.exec(a)[1] - reg.exec(b)[1];
    }).forEach(item => {
        !suffix ? suffix = /\.([0-9a-zA-Z]+)$/.exec(item)[1] : null;
        fs.appendFileSync(`${uploadDir}/${hash}.${suffix}`, fs.readFileSync(`${path}/${item}`));
        fs.unlinkSync(`${path}/${item}`);
    });
    fs.rmdirSync(path);
    ctx.body={
        code: 0,
        path: `http://127.0.0.1:${3000}/upload/${hash}.${suffix}`
    };
});
module.exports = router