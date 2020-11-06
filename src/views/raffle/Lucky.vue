<template>
  <div class="luckyWrap">
    <div class="lc-bg">
      <!-- 滚动 -->
      <div class="slideWrap">
        <!-- <lcSlide :list='rollList' @ended="getRolling" v-if="isBegin&&rollList.length>0"></lcSlide> -->
      </div>
      <!-- 中奖记录 -->
      <div class="luckyRecord" @click="getHistory"><span>中奖记录</span></div>
      <!-- 转盘 -->
      <div class="luckyTurn">
        <lcTurn ref="lucky" :list="rewardRulesList" v-if="rewardRulesList.length" @stop="showWin">
          <div class="btn" @click="clickStart($event)">
            <img src="//banzhuren-assistant.oss-cn-beijing.aliyuncs.com/gorgons/images/raffle/start_btn.png" alt="" />
          </div>
        </lcTurn>
      </div>
      <div class="lc-count">
        {{ statusText }}
      </div>
    </div>
    <section class="lucky-block" v-if="activityRules">
      <p class="lucky-title">抽奖规则</p>
      <ul>
        <li class="lc-ba lc-gap" v-for="(item, index) in activityRules.lotteryRule" :key="item.context">
          <p class="lc-icon-num">{{ index + 1 >= 10 ? index : `0${index + 1}` }}</p>
          <div class="lc-detail">
            <p class="lc-font-small">
              {{ item.context }}
            </p>
          </div>
        </li>
      </ul>
    </section>
    <section class="lucky-block" v-if="activityRules">
      <p class="lucky-title">奖品发放</p>
      <ul class="lc-ba">
        <li class="" v-for="item in activityRules.lotterySend" :key="item.title">
          <p class="lc-icon"><img :src="item.url" alt="" /></p>
          <div class="lc-detail">
            <p class="lc-font-mid">
              {{ item.title }}
            </p>
            <p class="lc-font-small">
              {{ item.context }}
              <em v-if="item.detail">{{ `(${item.detail})` }}</em>
            </p>
          </div>
        </li>
      </ul>
    </section>
    <p class="lc-btm-text lc-font-small">活动最终解释权归狸米所有</p>
    <p class="lc-bottom"></p>
    <lcPop ref="pop"></lcPop>
  </div>
</template>

<script>
// import lcSlide from './child/LcSlide';
import lcTurn from "./child/LcTurn";
import lcPop from "./child/LcPop";
import luckyData from "./luckyData";
export default {
  name: "",
  props: [""],
  data() {
    return {
      id: "",
      studentId: "",
      activityRules: null,
      //转盘下文案
      statusText: "",
      //剩余抽奖次数
      remainTimes: 0,
      //开始时间
      startTime: "",
      //结束时间
      endTime: "",
      //结束延迟后的时间
      endDelayTime: "",
      //是否开始
      isBegin: false,
      //转盘列表
      rewardRulesList: [],
      winIndex: null,
      //滚动列表
      rollList: [],
      //中奖记录列表
      historyList: [],
      canGetHistory: true,
      param: null,
      isDrawing: false,
      serverTime: "",
    };
  },

  components: { lcTurn, lcPop },

  computed: {},

  beforeMount() {
    this.studentId = sessionStorage.getItem("studentid");
  },

  mounted() {
    this.getRewardIndex();
  },

  methods: {
    //获取首页内容
    getRewardIndex() {
      let pgRewardDrawVo = luckyData;

      this.activityRules = JSON.parse(pgRewardDrawVo.activityRules);
      this.startTime = this.instanceDate(pgRewardDrawVo.startTime);
      this.endTime = this.instanceDate(pgRewardDrawVo.nextEndTime);
      this.endDelayTime = this.instanceDate(pgRewardDrawVo.nextEndDelayTime) || this.endTime;
      this.isBegin = pgRewardDrawVo.begin;
      this.rewardRulesList = JSON.parse(JSON.stringify(pgRewardDrawVo.pgRewardRulesList));
      this.id = pgRewardDrawVo.id;
      this.remainTimes = luckyData.remainTimes || 0;
      this.serverTime = luckyData.serverTime ? this.instanceDate(luckyData.serverTime) : new Date();
      this.param = {
        activityId: this.id,
        studentId: this.studentId,
      };
      // !val?this.getRolling():null;
      this.handlerStatusText();
    },
    //获取滚动内容
    getRolling() {
      this.$api.getRewardRolling(this.param).then((res) => {
        let rollList = [];
        if (res.data.code == 200) {
          try {
            rollList = res.data.data.lotteryWinList;
            this.rollList = rollList;
          } catch (error) {
            console.log(error);
          }
        }
        //this.rollList.push(...rollList)
      });
    },
    //获取历史记录
    getHistory() {
      if (!this.canGetHistory) return;
      this.canGetHistory = false;
      this.$api.getRewardHistory(this.param).then((res) => {
        if (res.data.code == 200) {
          try {
            this.historyList = res.data.data.lotteryWinList;
          } catch (error) {
            console.log(error);
          }
          this.showHistory();
        } else {
          this.$toast(res.data.msg);
        }
        setTimeout(() => {
          this.canGetHistory = true;
        }, 1750);
      });
    },
    //点击开始
    clickStart(event) {
      event.preventDefault();
      // if (!this.canDraw() || this.isDrawing) return;
      // this.isDrawing = true;
      this.drawLucky();
    },
    //抽奖接口
    drawLucky() {
      this.winIndex = Math.floor(Math.random() * (6 - 0 + 1)) + 0;
      this.$refs["lucky"].start(this.winIndex);
      return;
      // this.$api.luckDraw(this.param).then((res) => {
      //   if (res.data.code !== 200) {
      //     this.$toast(res.data.msg);
      //     setTimeout(() => {
      //       this.isDrawing = false;
      //     }, 1750);
      //     return;
      //   }
      //   try {
      //     let data = res.data.data;
      //     //更新机会
      //     this.remainTimes = data.remainTimes;
      //     this.handlerStatusText();
      //     //判断是否要文案提示
      //     if (data.officeWord) {
      //       this.$toast(data.officeWord);
      //       setTimeout(() => {
      //         this.isDrawing = false;
      //       }, 1750);
      //       return;
      //     }
      //     //匹配奖品并启动转盘
      //     this.rewardRulesList.forEach((item, index) => {
      //       if (item.id == data.rewardRuleId) {
      //         this.winIndex = index;
      //         this.$refs["lucky"].start(this.winIndex);
      //       }
      //     });
      //   } catch (error) {
      //     console.log(error);
      //   }
      // });
    },
    //无法抽奖提示
    canDraw() {
      //活动已结束
      if (this.isEnded()) {
        this.$toast("您已过抽奖时间，无法抽奖");
        // this.$refs['pop'].startPop({
        //     type:'main',
        //     popData:{
        //         content:"活动已结束",
        //     },
        //     btnText:"确定"
        // })
        return false;
      }
      //未开始
      if (!this.isBegin) {
        this.$refs["pop"].startPop({
          type: "main",
          popData: {
            content: "活动未开始",
            //desc:`活动时间：${this.timeToDate(this.startTime,'MM月DD日hh:mm')}-${this.timeToDate(this.endTime,'MM月DD日hh:mm')}`
          },
          btnText: "确定",
        });
        return false;
      }
      //没有抽奖机会
      // if(this.remainTimes<=0){
      //     this.$refs['pop'].startPop({
      //         type:'main',
      //         popData:{
      //             content:"暂无抽奖机会",
      //         },
      //         btnText:"我知道了"
      //     })
      //     return false
      // }
      return true;
    },
    //中奖弹框
    showWin(checkedIndex) {
      let win = this.rewardRulesList[this.winIndex];
      this.isDrawing = false;
      if (!checkedIndex) return;
      this.$refs["pop"].startPop({
        type: "head",
        title: "中奖啦",
        popData: {
          content: `${win.name} ${win.rewardContent}`,
          desc: win.rewardDescribe,
        },
        src: win.rewardValue,
        btnText: "确定",
      });
    },
    //中奖记录弹框
    showHistory() {
      let popDefault = {
        content: "还没有中奖哦~",
      };
      let len = this.historyList.length;
      this.$refs["pop"].startPop({
        type: len ? "head" : "main",
        title: len ? "我的奖品" : "",
        popData: len ? this.historyList : popDefault,
        src: len ? "//banzhuren-assistant.oss-cn-beijing.aliyuncs.com/gorgons/images/raffle/gift.png" : "",
        btnText: len ? "我知道了" : "去抽奖",
      });
    },
    //设置展示文案
    handlerStatusText() {
      if (this.isEnded()) {
        this.statusText = "活动已结束";
        return;
      }
      let val = this.remainTimes;
      this.statusText = val > 0 ? `您有${val}次机会` : "暂无抽奖机会";
    },
    isEnded() {
      if (!this.endTime || !this.endDelayTime) {
        return false;
      }
      let val = this.remainTimes;
      let endTime = this.endTime.getTime();
      let endDelayTime = this.endDelayTime.getTime();
      endTime = val > 0 ? (endTime = endDelayTime) : endTime;
      return this.serverTime.getTime() >= endTime;
    },
    //date 2020-07-20 10:00:00
    instanceDate(date) {
      if (!date) return date;
      let reg = /-/g;
      date = date.replace(reg, "/");
      return new Date(date);
    },
    timeToDate(date, fmt = "YY-MM-DD hh:mm:ss") {
      let dateTime = date;
      let Y = dateTime.getFullYear();
      let M = dateTime.getMonth() + 1 < 10 ? "0" + (dateTime.getMonth() + 1) : dateTime.getMonth() + 1;
      let D = dateTime.getDate() < 10 ? "0" + dateTime.getDate() : dateTime.getDate();
      let h = dateTime.getHours() < 10 ? "0" + dateTime.getHours() : dateTime.getHours();
      let m = dateTime.getMinutes() < 10 ? "0" + dateTime.getMinutes() : dateTime.getMinutes();
      let s = dateTime.getSeconds() < 10 ? "0" + dateTime.getSeconds() : dateTime.getSeconds();
      let GT = { YY: Y, MM: M, DD: D, hh: h, mm: m, ss: s };
      return fmt.replace(/([a-z]){2}/gi, function (word) {
        return GT[word];
      });
    },
  },
  watch: {},
};
</script>
<style lang="less" scoped>
.luckyWrap {
  position: relative;
  //padding-bottom: 0.52rem;
  margin: auto;
  background: #fe6007;
  width: 7.5rem;
  max-height: 100% !important;
  overflow-x: hidden;
  font-size: 0;
  text-align: left;
  .lc-bg {
    padding-top: 2.56rem;
    background: url("//banzhuren-assistant.oss-cn-beijing.aliyuncs.com/gorgons/images/raffle/lc_bg.png") no-repeat 0 0;
    background-size: 100%;
    height: 12.04rem;
    box-sizing: border-box;
    .slideWrap {
      margin-bottom: 0.55rem;
      height: 0.5rem;
      overflow: hidden;
    }
    .luckyRecord {
      position: fixed;
      right: 0;
      top: 3.3rem;
      padding-left: 0.32rem;
      width: 0.96rem;
      height: 0.7rem;
      border-radius: 0.35rem 0 0 0.35rem;
      background: #ed146b;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      span {
        display: inline-block;
        line-height: 0.26rem;
        font-size: 0.24rem;
        color: #ffffff;
      }
    }
    .luckyTurn {
      margin: 0 auto 0.46rem;
      width: 6.52rem;
      height: 6.52rem;
      padding: 0.44rem;
      box-sizing: border-box;
    }
    .lc-count {
      margin: 0 auto;
      width: 4.4rem;
      height: 0.46rem;
      line-height: 0.46rem;
      text-align: center;
      font-size: 0.28rem;
      color: #ffffff;
    }
  }
  section {
    margin: 0 auto 0.3rem;
    width: 6.9rem;
    padding: 0.3rem;
    background: #cc4d06;
    box-sizing: border-box;
    border-radius: 0.22rem;
    box-shadow: 0.02rem 0.02rem 0.2rem 0px #cc4d06 inset;
    .lucky-title {
      margin: 0 auto 0.3rem;
      width: 2.4rem;
      height: 0.64rem;
      line-height: 0.64rem;
      text-align: center;
      background: linear-gradient(#fbfca7, #fddc7a);
      border-radius: 32px;
      font-size: 0.36rem;
      color: #ee6832;
    }

    ul {
      width: 100%;

      li {
        padding: 0.34rem 0.3rem;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        box-sizing: border-box;
        background: #fff;
        .lc-icon {
          margin-right: 0.3rem;
          width: 0.8rem;
          height: 0.64rem;
          flex-shrink: 0;
        }
        .lc-icon-num {
          margin-right: 0.3rem;
          width: 0.78rem;
          height: 0.78rem;
          line-height: 0.78rem;
          text-align: center;
          border-radius: 0.32;
          flex-shrink: 0;
          font-size: 0.4rem;
          color: #ffffff;
          border-radius: 0.28rem;
        }

        .lc-detail {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          color: #a52200;
        }
      }
      & li:nth-child(1) .lc-icon-num {
        background: linear-gradient(#ffa1b5, #ff687e);
        box-shadow: 0px 0.04rem 0.12rem 0px #feaebc, 0px 0px 0.06rem 0px #ff667c inset;
      }
      & li:nth-child(2) .lc-icon-num {
        background: linear-gradient(#b9eeff, #35b8e3);
        box-shadow: 0px 0.04rem 0.12rem 0px #dcf6ff;
      }
      & li:nth-child(3) .lc-icon-num {
        background: linear-gradient(#ffd7a5, #fd7424);
        box-shadow: 0px 0.04rem 0.12rem 0px #ffd3a0;
      }
    }
  }
  .lc-btm-text {
    margin-bottom: 0.22rem;
    color: #ca1b00;
    text-align: center;
  }
  .lc-bottom {
    position: absolute;
    //bottom: 0;
    left: 0;
    width: 100%;
    height: 0.3rem;
    opacity: 0.56;
    background: #fe9c48;
    border-radius: 0.36rem 0.36rem 0px 0px;
  }
  .lc-ba {
    border-radius: 0.22rem;
    box-shadow: 0.02rem 0.02rem 0.04rem 0px #cc4d06, 0px 0px 0.04rem 0px #da5205;
    overflow: hidden;
  }
  .lc-gap {
    margin-top: 0.3rem;
  }
  .lc-font-small {
    font-size: 0.26rem;
  }
  .lc-font-mid {
    font-size: 0.32rem;
    font-weight: SC;
  }
  em {
    font-style: normal;
    color: #ee6832;
  }
  .btn {
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -1rem 0 0 -1rem;
    width: 2rem;
    height: 2rem;
    background: rgba(255, 255, 255, 0.54);
    border-radius: 50%;
    font-size: 0;
    img {
      position: absolute;
      top: -0.52rem;
      left: 50%;
      margin-left: -0.95rem;
      width: 1.9rem;
      height: 2.48rem;
      animation: btnAnimal 0.8s linear infinite;
    }
  }
}
@-webkit-keyframes btnAnimal {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1);
    transform: scale(0.9);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
@keyframes btnAnimal {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1);
    transform: scale(0.9);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
</style>
