<template>
  <div class="about">
    <img alt="Vue logo" src="../assets/logo.png">
    <p @click="clickDown">下载</p>
  </div>
</template>
<script>
import axios from "axios"
export default {
    name:'Download',
    data:function(){
        return {
            hash:'',
            type:'',
            suffix:'',
            fileName:''
        }
    },
    methods:{
        clickDown(){
            this.hash=localStorage.getItem('hash');
            this.suffix=localStorage.getItem('suffix');
            this.type=localStorage.getItem('type');
            this.fileName=localStorage.getItem('fileName');
            if(!this.hash){
                this.$msg.success({message:'请先上传文件',duration:1000})
                return;
            }
            this.dowloadFile()
        },
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
        },
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
        },
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
    }
}
</script>
