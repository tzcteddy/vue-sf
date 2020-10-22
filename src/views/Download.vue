<template>
  <div class="about">
    <img alt="Vue logo" src="../assets/logo.png">
    <p @click="clickDown">下载</p>
  </div>
</template>
<script>
export default {
    name:'Download',
    data:function(){
        return {

        }
    },
    methods:{
        clickDown(){
            let hash=this.$route.query.hash;
            if(!hash){
                console.log(this)
                this.$msg.success({message:'请先上传文件',duration:1000})
                return;
            }
            this.dowloadFile()
        },
        dowloadFile(){

        }
    }
}
</script>
