<template>
  <div class="lucky-turn" ref="luckyTurn">
    <ul :style="{ webkitTransform: `rotate(${rotateAngle}deg)`, transform: `rotate(${rotateAngle}deg)` }">
      <li class="lucky-item" :style="getListStyle(index)" v-for="(item, index) in list" :key="index">
        <p class="lc-name" :style="getNameStyle()">{{ item.rewardContent || item.name }}</p>
      </li>
      <li class="lucky-center">
        <div class="lucky-inner">
          <div class="lc-icon" :style="getListStyle(index, 'inner')" v-for="(item, index) in list" :key="item.name + index">
            <p v-if="item.rewardValueType == 'word'" class="lc-icon-text">
              <span :class="{ 'lc-icon-checkedT': checkedIndex == index }">{{ item.rewardValue }}</span>
            </p>
            <p v-if="item.rewardValueType == 'picture'" class="lc-icon-img">
              <img :class="{ 'lc-icon-checkedI': checkedIndex == index }" :src="item.rewardValue" alt="" />
            </p>
          </div>
        </div>
      </li>
    </ul>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "lc-turn",
  props: {
    list: {
      type: Array,
      require: true,
    },
    stop: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      //数量
      count: 0,
      //旋转角度
      rotateAngle: 0,
      startAngle: 0,
      curIndex: 0,
      checkedIndex: NaN,
      isTurning: false,
    };
  },

  components: {},

  computed: {},

  beforeMount() {},

  mounted() {
    this.count = this.list.length;
    //console.log('半径',this.getRadius())
  },

  methods: {
    getRadius() {
      return this.$refs["luckyTurn"].clientWidth / 2;
    },
    filterRem(num) {
      let winW = document.documentElement.clientWidth;
      return (num * 2 * winW) / 750;
    },
    getBase() {
      //扇形角度
      let angle = 360 / this.count;
      //弧度
      let radian = (angle / 2 / 180) * Math.PI;
      //半径
      let radius = this.filterRem(142);
      let width = radius * Math.tan(radian);
      return {
        angle,
        radian,
        radius,
        width,
      };
    },
    getListStyle(index, type) {
      let { angle, radian, radius, width } = this.getBase();
      let borderTopColor = `${index == 0 ? "#fff" : index % 2 !== 0 ? "#FAF8FF" : "#DED6FF"}`;
      if (type == "inner") {
        radius = this.filterRem(142) - this.filterRem(18);
        width = radius * Math.tan(radian);
        borderTopColor = `${index == 0 ? "#faf8ff" : index % 2 !== 0 ? "#F3F0FF" : "#AE9DFF"}`;
      }
      return {
        border: "0px solid transparent",
        borderTopColor,
        borderTopWidth: `${radius}px`,
        borderRightWidth: `${width}px`,
        borderLeftWidth: `${width}px`,
        //transform:`translateX(-${50}%)`,
        transform: `translateX(-${50}%) rotate(${index * angle}deg)`,
        // transformOrigin:`${this.filterRem(68.37)}px ${this.filterRem(141)}px`
        transformOrigin: `${width}px ${radius}px`,
      };
    },
    getNameStyle() {
      let { radius, width } = this.getBase();
      return {
        width: `${width}px`,
        top: `-${radius - 1}px`,
        height: `0.36rem`,
        lineHeight: `0.36rem`,
      };
    },
    start(index) {
      if (this.isTurning) return;
      this.isTurning = true;
      let angle = (360 * 2) / this.list.length / 4;
      let moreNum = this.getdiff(this.curIndex, index);
      if (this.startAngle < 0) {
        this.startAngle = 0;
      }
      let rotate = this.startAngle + (360 * 10 + angle * moreNum * 2);
      this.startAngle = rotate;
      this.rotateAngle = rotate;
      setTimeout(() => {
        this.curIndex = index;
        this.checkedIndex = index === 0 ? NaN : index;
        this.isTurning = false;
        setTimeout(() => {
          //抖动动画结束
          this.$emit("stop", this.checkedIndex);
          this.checkedIndex = NaN;
        }, 1200);
      }, 5 * 1000 + 500);
    },
    getdiff(cur, index) {
      let diff;
      if (cur <= index) {
        //diff=this.list.length-cur-index
        diff = this.list.length + cur - index;
      } else {
        diff = cur - index;
      }
      return diff;
    },
  },

  watch: {
    list: function (val) {
      if (val.length) {
        this.count = val.length;
      }
    },
  },
};
</script>
<style lang="less" scoped>
.lucky-turn {
  position: relative;
  height: 100%;
  ul {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    -webkit-transition: all 5s cubic-bezier(0.25, 0.1, 0.25, 1) 0s;
    transition: all 5s cubic-bezier(0.25, 0.1, 0.25, 1) 0s;
    .lucky-item {
      position: absolute;
      top: 0;
      left: 0;
      margin-left: 50%;
      width: 0;
      height: 0;
      opacity: 1;

      .lc-name {
        position: absolute;
        display: inline-block;
        text-align: center;
        font-size: 0.22rem;
        color: #c54a06;
        -webkit-transform: translateX(-50%);
        transform: translateX(-50%);
      }
    }
    .lucky-center {
      position: absolute;
      top: 0;
      left: 0;
      padding: 0.36rem;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border-radius: 50%;
      overflow: hidden;
      .lucky-inner {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4.92rem;
        height: 4.92rem;
        box-sizing: border-box;
        border-radius: 50%;
        overflow: hidden;
        -webkit-transform: translateX(-50%) translateY(-50%);
        transform: translateX(-50%) translateY(-50%);
        // will-change: transform;
      }
      .lc-icon {
        position: absolute;
        top: 0;
        left: 0;
        margin-left: 50%;
        width: 0;
        height: 0;
        opacity: 1;
        display: inline-block;
        .lc-icon-text {
          position: absolute;
          -webkit-transform: translateX(-50%) translateY(-280%);
          transform: translateX(-50%) translateY(-280%);
          display: block;
          width: 1.12rem;
          min-height: 0.8rem;
          max-height: 0.8rem;
          line-height: 0.4rem;
          font-size: 0.28rem;
          font-weight: SC;
          color: #f05928;
          text-align: center;
          .lc-icon-checkedT {
            display: block;
            width: 1.12rem;
            -webkit-animation: checked 0.5s linear 0s 2 both;
            animation: checked 0.5s linear 0s 2 both;
          }
        }
        .lc-icon-img {
          position: absolute;
          -webkit-transform: translateX(-50%) translateY(-190%);
          transform: translateX(-50%) translateY(-190%);
          width: 1rem;
          height: 1.2rem;
          img {
            position: relative;
            display: block;
            margin: auto;
            width: 80%;
            height: 80%;
            object-position: center;
            object-fit: contain;
          }
          .lc-icon-checkedI {
            -webkit-animation: checked 0.5s linear 0s 2 both;
            animation: checked 0.5s linear 0s 2 both;
          }
        }
      }
    }
  }
}
@-webkit-keyframes checked {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  25% {
    -webkit-transform: rotate(-15deg);
    transform: rotate(-15deg);
  }
  50% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  75% {
    -webkit-transform: rotate(-15deg);
    transform: rotate(-15deg);
  }
  100% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
}
@keyframes checked {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  25% {
    -webkit-transform: rotate(-15deg);
    transform: rotate(-15deg);
  }
  50% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  75% {
    -webkit-transform: rotate(-15deg);
    transform: rotate(-15deg);
  }
  100% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
}
</style>
