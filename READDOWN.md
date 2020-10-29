[SSR应用](./README.md) | [大文件上传](./READUP.md) | 大文件下载

说到大文件下载，其实是和大文件上传原理很像，也是需要将文件按给定的规则切好，然后再拼接合到一起。

## Range

Range是在 HTTP/1.1 中新增的一个字段，这个特性也是我们使用的迅雷等支持多线程下载以及断点下载的核心机制。

首先客户端会发起一个带有Range: bytes=0-xxx的请求，如果服务端支持 Range，则会在响应头中添加Accept-Ranges: bytes来表示支持 Range 的请求，之后客户端才可能发起带 Range 的请求。

服务端通过请求头中的Range: bytes=0-xxx 来判断是否是进行 Range 处理，如果这个值存在而且有效，则只发回请求的那部分文件内容，响应的状态码变成206，表示Partial Content，并设置Content-Range。如果无效，则返回416状态码，表明Request Range Not Satisfiable。如果请求头中不带 Range，那么服务端则正常响应，也不会设置 Content-Range 等。

#### Range格式
即Range: 单位（如bytes）= 开始字节位置-结束字节位置

+ Range: bytes=0-1199 头1200个字节
+ Range: bytes=1200-2399 第二个1200字节
+ Range: bytes=2400-3599 第三个1200字节
+ Range: bytes=3600-5000 最后的1400字节

服务器响应：

第1个响应

Content-Length：1200<br>
Content-Range：bytes 0-1199/5000

第2个响应

Content-Length：1200<br>
Content-Range：bytes 1200-2399/5000

第3个响应

Content-Length：1200<br>
Content-Range：bytes 2400-3599/5000

第4个响应

Content-Length：1400<br>
Content-Range：bytes 3600-5000/5000

直接上代码了

### 前端代码

```js
dowloadFile(){
    let m=10000000;
    let url='/downloadFile'
    axios({
        url,
        method:'get',
        params:{
            hash:this.hash,
            suffix:this.suffix
        }
        }).then((res)=>{
        // const size=Number(res.headers['content-length']);
        const size=res.data
        const length=parseInt(size/m);
        const arr=[];
        for(let i=0;i<length;i++){
            let start=i*m;
            let end=(i===length-1)?size-1:(i+1)*m-1;
            arr.push(this.downloadRange(url,start,end,i))
        }
        Promise.all(arr).then(res => {
            const arrBufferList = res.sort(item => item.i - item.i).map(item => new Uint8Array(item.buffer));
            const allBuffer = this.concatRange(Uint8Array, arrBufferList);
            const blob = new Blob([allBuffer], {type: this.type});
            const blobUrl = URL.createObjectURL(blob);
            const aTag = document.createElement('a');
            aTag.download = this.fileName;
            aTag.href = blobUrl;
            aTag.click();
            URL.revokeObjectURL(blob);
        })
    })
}
```

请求具体的流内容

```js
downloadRange(url,start,end,i){
    return new Promise((resolve)=>{
        axios({
            url,
            method:'get',
            headers:{
                'range':`bytes=${start}-${end}`
            },
            params:{
                hash:this.hash,
                suffix:this.suffix
            },
            responseType: 'blob'
        }).then(res=>{
            res.data.arrayBuffer().then(buffer=>{
                resolve({i,buffer})
            })
        })
    })
}
```

合并数据流
```js
concatRange(Uint8Array,arrays){
    let totalLength=0;
    for(let arr of arrays){
        totalLength+=arr.length;
    }
    let result=new Uint8Array(totalLength);
    let offset=0;
    for(let arr of arrays){
        result.set(arr,offset);
        offset+=arr.length;
    }
    return result
}
```

### 后端代码

```js
router.get('/downloadFile', async(ctx) => {
    const { hash,suffix } = ctx.query;
    let path = `${uploadDir}/${hash}`;
    const { size } = fs.statSync(path+'.'+suffix);
    const range = ctx.headers['range'];
    if (!range) { 
        ctx.set('Accept-Ranges', 'bytes');
        ctx.body = size//fs.readFileSync(path+'.mp4');
        return;
    }
    const { start, end } = getRange(range);
    if (start >= size || end >= size) {
        ctx.response.status = 416;
        ctx.body = '';
        return;
    }
    ctx.response.status = 206;
    ctx.set('Accept-Ranges', 'bytes');
    ctx.set('Content-Range', `bytes ${start}-${end ? end : size - 1}/${size}`);
    ctx.body = fs.createReadStream(path+'.'+suffix, { start, end });
})
function getRange(range){
    let start,end;
    let rangeReg=/=(\d+)-(\d+)/;
    let regResult=rangeReg.exec(range);
    start=Number(regResult[1]);
    end=Number(regResult[2]);
    return{start,end}
}
```



