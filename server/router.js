const fs=require('fs')
const KoaRouter = require('koa-router')
const router = new KoaRouter();

const multiparty = require('koa2-multiparty');
    uploadDir = `${__dirname}/upload`;

router.post('/uploadFile', multiparty(options = {
    maxFieldsSize: 200 * 1024 * 1024
}),async (ctx, next) => {
    console.log('0')
    const fields=ctx.req.body;
    const files=ctx.req.files;
    console.log('fields',fields)
    console.log('files',files)
    let chunk = files.chunk,
        filename = fields.filename;
    let hash = /([0-9a-zA-Z]+)_\d+/.exec(filename)[1],
        // suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1],
        path = `${uploadDir}/${hash}`;
        console.log('hash',hash)
    !fs.existsSync(path) ? fs.mkdirSync(path) : null;
    path = `${path}/${filename}`;
    console.log('1')
    fs.access(path, async err => {
        console.log('2')
        // 存在的则不再进行任何的处理
        if (!err) {
            console.log('3')
            ctx.body={
                code: 0,
                path: path.replace(__dirname, `http://127.0.0.1:${3000}`)
            };
            return;
        }
        // 为了测试出效果，延迟1秒钟
        await new Promise(resolve => {
            setTimeout(_ => {
                resolve();
            }, 200);
        });

        // 不存在的再创建
        let readStream = fs.createReadStream(chunk.path),
            writeStream = fs.createWriteStream(path);
        readStream.pipe(writeStream);
        readStream.on('end', function () {
            console.log('3')
            fs.unlinkSync(chunk.path);
           ctx.body={
                code: 0,
                path: path.replace(__dirname, `http://127.0.0.1:${3000}`)
            };
        });
    });
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