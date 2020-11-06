const fs = require("fs");
const KoaRouter = require("koa-router");
const router = new KoaRouter();

const multiparty = require("koa2-multiparty");
let uploadDir = `${__dirname}/upload`;
router.post("/test", async (ctx) => {
  setTimeout(function () {
    ctx.body = {
      name: "123",
    };
  }, 100);
});
router.post(
  "/uploadFile",
  multiparty({
    maxFieldsSize: 200 * 1024 * 1024,
  }),
  async (ctx) => {
    const fields = ctx.req.body;
    const files = ctx.req.files;
    let chunk = files.chunk,
      filename = fields.filename;
    let hash = /([0-9a-zA-Z]+)_\d+/.exec(filename)[1],
      // suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1],
      path = `${uploadDir}/${hash}`;
    !fs.existsSync(path) ? fs.mkdirSync(path) : null;
    path = `${path}/${filename}`;
    await new Promise((resolve) => {
      fs.access(path, async (err) => {
        // 存在的则不再进行任何的处理
        if (!err) {
          ctx.body = {
            code: 0,
            path: path.replace(__dirname, `http://127.0.0.1:${3000}`),
          };
          resolve();
          return;
        }
        // 不存在的再创建
        let readStream = fs.createReadStream(chunk.path),
          writeStream = fs.createWriteStream(path);
        readStream.pipe(writeStream);
        await new Promise((resolve) => {
          readStream.on("end", async function () {
            fs.unlinkSync(chunk.path);
            ctx.body = {
              code: 0,
              path: path.replace(__dirname, `http://127.0.0.1:${3000}`),
            };
            resolve();
          });
        });
        resolve();
      });
    });
  }
);
router.get("/merge", (ctx) => {
  let { hash } = ctx.query;

  let path = `${uploadDir}/${hash}`,
    fileList = fs.readdirSync(path),
    suffix;
  fileList
    .sort((a, b) => {
      let reg = /_(\d+)/;
      return reg.exec(a)[1] - reg.exec(b)[1];
    })
    .forEach((item) => {
      !suffix ? (suffix = /\.([0-9a-zA-Z]+)$/.exec(item)[1]) : null;
      fs.appendFileSync(`${uploadDir}/${hash}.${suffix}`, fs.readFileSync(`${path}/${item}`));
      fs.unlinkSync(`${path}/${item}`);
    });
  fs.rmdirSync(path);
  ctx.body = {
    code: 0,
    path: `http://127.0.0.1:${3000}/upload/${hash}.${suffix}`,
  };
});

router.get("/downloadFile", async (ctx) => {
  const { hash, suffix } = ctx.query;
  let path = `${uploadDir}/${hash}`;
  const { size } = fs.statSync(path + "." + suffix);
  const range = ctx.headers["range"];
  if (!range) {
    ctx.set("Accept-Ranges", "bytes");
    ctx.body = size; //fs.readFileSync(path+'.mp4');
    return;
  }
  const { start, end } = getRange(range);
  if (start >= size || end >= size) {
    ctx.response.status = 416;
    ctx.body = "";
    return;
  }
  ctx.response.status = 206;
  ctx.set("Accept-Ranges", "bytes");
  ctx.set("Content-Range", `bytes ${start}-${end ? end : size - 1}/${size}`);
  ctx.body = fs.createReadStream(path + "." + suffix, { start, end });
});
function getRange(range) {
  let start, end;
  let rangeReg = /=(\d+)-(\d+)/;
  let regResult = rangeReg.exec(range);
  start = Number(regResult[1]);
  end = Number(regResult[2]);
  return { start, end };
}
module.exports = router;
