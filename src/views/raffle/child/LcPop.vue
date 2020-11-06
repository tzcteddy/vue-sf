<template>
  <div class="luckyPop" v-if="popData" @touchmove.prevent>
    <div class="mark"></div>
    <div class="popMain">
      <div class="lightBg" v-if="type == 'head'"></div>
      <div class="head" v-if="type == 'head'">
        <div class="title">
          <p class="name">{{ title }}</p>
          <p class="icon"><img :src="src" alt="" /></p>
        </div>
        <p class="raduis"></p>
      </div>
      <div class="main" :class="{ mainBorder: type == 'main' }">
        <div class="content">
          <p class="mainText" v-if="popData.content">{{ popData.content }}</p>
          <p class="mainDesc" v-if="popData.desc">{{ popData.desc }}</p>
          <ul class="history" v-if="popData.length" @touchmove.stop>
            <li class="giftList" v-for="item in popData" :key="item.nmae">
              <span class="level">{{ item.rewardRulesName }}</span>
              <span class="levelGift">{{ item.rewardName }} {{ item.rewardNum }} {{ item.rewardUnit }}</span>
            </li>
          </ul>
        </div>
        <p class="button" @click="closePop">{{ btnText }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "lc-pop",
  props: {
    // typeProp:{
    //     type:String
    //     //default:'main'//head
    // },
    // titleProp:{
    //     type:String
    // },
    // popDataProp:{
    //     type:[Object,Array]
    // },
    // btnTextProp:{
    //     type:String
    // },
    // close:{
    //     type:Function,
    //     default:()=>{}
    // }
  },
  data() {
    return {
      type: "main",
      title: "",
      popData: null,
      btnText: "",
      src: "",
    };
  },

  components: {},

  computed: {},

  beforeMount() {},

  mounted() {},

  methods: {
    startPop(options) {
      document.documentElement.style.overflow = "hidden";
      this.$nextTick(() => {
        this.type = options.type;
        this.title = options.title;
        this.popData = options.popData;
        this.btnText = options.btnText;
        this.src = options.src;
      });
    },
    closePop() {
      this.popData = null;
      this.$emit("close");
      document.documentElement.style.overflow = "inherit";
    },
  },

  watch: {},
};
</script>
<style lang="less" scoped>
@textColorOrange: #db7012;
@textColorBlack: #000000;
.fullMixins {
  width: 100%;
  height: 100%;
}
.positionMixins {
  top: 0;
  left: 0;
}
.fontGiftMixins {
  font-size: 0.34rem;
  font-weight: 600;
  line-height: 0.48rem;
  color: @textColorBlack;
}
.fontDescMixins {
  font-size: 0.24rem;
  line-height: 0.34rem;
}
.luckyPop {
  position: fixed;
  .positionMixins();
  .fullMixins();
  z-index: 100;
  .mark {
    position: absolute;
    .positionMixins();
    .fullMixins();
    background: rgba(0, 0, 0, 0.5);
  }
  .popMain {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5.4rem;
    transform: translateX(-50%) translateY(-50%);
    .lightBg {
      position: absolute;
      top: -2rem;
      left: 50%;
      margin-left: -2.16rem;
      width: 4.32rem;
      height: 4.32rem;
      background: url("../../../../static/img/lucky/light.png") no-repeat center;
      background-size: 100%;
      animation: lightTurn 0.8s linear 0s infinite both;
    }
    .head {
      position: relative;
      width: 100%;
      height: 1.6rem;
      background: #00c6ea;
      border-radius: 0.24rem 0.24rem 0 0;

      .title {
        position: absolute;
        .positionMixins();
        width: 100%;
        height: 100%;
        background: url("../../../../static/img/lucky/ribbon.png") no-repeat center -0.48rem;
        background-size: 4.24rem 2.1rem;
        z-index: 1;
        .name {
          position: absolute;
          left: 50%;
          bottom: 0.34rem;
          margin-left: -0.8rem;
          width: 1.6rem;
          height: 0.46rem;
          line-height: 0.46rem;
          text-align: center;
          color: #c75a03;
          font-weight: 500;
          font-size: 0.32rem;
          z-index: 2;
        }
        .icon {
          position: absolute;
          bottom: 0.76rem;
          left: 50%;
          margin-left: -0.8rem;
          width: 1.6rem;
          height: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            margin: auto;
            display: block;
            width: 90%;
            height: 90%;
            object-position: center;
            object-fit: contain;
          }
        }
      }
      .raduis {
        position: absolute;
        bottom: -0.2em;
        left: 0;
        width: 100%;
        height: 0.4rem;
        background: #00c6ea;
        overflow: hidden;
        &::after {
          position: absolute;
          top: 0;
          left: 50%;
          display: block;
          content: "";
          width: 48rem;
          height: 48rem;
          border-radius: 50%;
          background: #fff;
          transform: translateX(-50%);
        }
      }
    }
    .main {
      position: relative;
      padding-bottom: 1.32rem;
      width: 100%;
      background: #fff;
      border-radius: 0 0 0.24rem 0.24rem;
      overflow: hidden;
      &.mainBorder {
        padding-top: 0.3rem;
        border-radius: 0.24rem 0.24rem 0.24rem 0.24rem;
      }
      .content {
        padding: 0 0.2rem;
        .mainText {
          margin-bottom: 0.18rem;
          text-align: center;
          .fontGiftMixins();
        }
        .mainDesc {
          .fontDescMixins();
          text-align: center;
        }
        .history {
          padding: 0.3rem 0;
          margin: 0 auto;
          width: 3.64rem;
          max-height: 3.6rem;
          overflow-y: auto;
          box-sizing: border-box;
          .giftList {
            padding: 0 0.36rem;
            margin: 0.05rem 0 0.05rem;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-content: center;
            height: 0.44rem;
            border-radius: 0.22rem;
            box-sizing: border-box;
            background: #fff8ed;
            .fontDescMixins();
            color: @textColorOrange;
            line-height: 0.44rem;
            .levelGift {
              margin-left: 0.28rem;
              font-weight: 600;
            }
          }
          li:nth-child(2n) {
            background: #fff;
          }
        }
      }
      .button {
        position: absolute;
        bottom: 0.42rem;
        left: 50%;
        margin-left: -1.82rem;
        width: 3.64rem;
        height: 0.6rem;
        line-height: 0.6rem;
        text-align: center;
        font-size: 0.28rem;
        color: #ffffff;
        background: #fd810b;
        box-shadow: 0px 0.1rem 0.42rem 0px #dbdbdb;
        border-radius: 0.3rem;
      }
    }
  }
}
@keyframes lightTurn {
  0% {
    opacity: 1;
  }
  25% {
    opacity: 0.5;
  }
  50% {
    opacity: 0;
  }
  75% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
