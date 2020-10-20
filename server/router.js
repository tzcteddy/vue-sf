const fs=require('fs')
const KoaRouter = require('koa-router')
const router = new KoaRouter();

const multiparty = require("multiparty"),
    uploadDir = `${__dirname}/upload`;

function handleMultiparty (ctx, temp) {
    const { req, res } = ctx;
    return new Promise((resolve, reject) => {
        // multiparty的配置
        let options = {
            maxFieldsSize: 200 * 1024 * 1024
        };
        !temp ? options.uploadDir = uploadDir : null;
        let form = new multiparty.Form(options);
        // multiparty解析
        form.parse(req, function (err, fields, files) {
            if (err) {
                res.send({
                    code: 1,
                    reason: err
                });
                reject(err);
                return;
            }
            resolve({
                fields,
                files
            });
        });
    });
}
router.post('/uploadFile', async (ctx, next) => {
    let {
        fields,
        files
    } = await handleMultiparty(ctx, true);
    let [chunk] = files.chunk,
        [filename] = fields.filename;
    let hash = /([0-9a-zA-Z]+)_\d+/.exec(filename)[1],
        // suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1],
        path = `${uploadDir}/${hash}`;
    !fs.existsSync(path) ? fs.mkdirSync(path) : null;
    path = `${path}/${filename}`;
    fs.access(path, async err => {
        // 存在的则不再进行任何的处理
        if (!err) {
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
            fs.unlinkSync(chunk.path);
           ctx.body={
                code: 0,
                path: path.replace(__dirname, `http://127.0.0.1:${3000}`)
            };
        });
    });
    ctx.body=123
})

module.exports = router