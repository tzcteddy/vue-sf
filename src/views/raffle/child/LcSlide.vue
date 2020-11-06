<template>
  <div class="lc-slide">
    <slider class="slider" ref="slider" :options="options">
      <!-- slideritem wrapped package with the components you need -->
      <slideritem v-for="(item, index) in list" :key="index">
        <div class="lc-slide-list">{{ `${item.studentName.charAt(0)}**抽中${item.rewardRulesName}，${item.rewardRulesContent}` }}</div>
      </slideritem>
    </slider>
    <p class="lc-slide-mark" @touchmove.prevent></p>
  </div>
</template>

<script>
import { slider, slideritem } from "vue-concise-slider";
export default {
  name: "lc-slide",
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    ended: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      options: {
        pagination: false, // 底部小圆点是否隐藏（true显示，false隐藏）
        currentPage: 0, // 当前页码
        freeze: true,
        autoplay: 2000, // 自动滚动[ms]
        loop: true, // 是否循环滚动
        direction: "vertical", // 滚动方向
        infinite: 1, // 无限滚动前后遍历数
        slidesToScroll: 1, // 滚动行数
        timingFunction: "ease",
        duration: 330,
        centeredSlides: true,
        itemAnimation: true,
      },
    };
  },

  components: { slider, slideritem },

  computed: {},

  beforeMount() {},

  mounted() {
    this.$refs.slider.$on("slide", this.slide.bind(this));
  },

  methods: {
    slide(data) {
      if (data.currentPage == this.list.length - 1) {
        this.$emit("ended");
      }
    },
  },

  watch: {},
};
</script>
<style lang="less" scoped>
.lc-slide {
  position: relative;
  margin: auto;
  padding-left: 0.84rem;
  width: 4.82rem;
  height: 0.5rem;
  background: #ffffff url("../../../../static/img/lucky/horn_icon.png") no-repeat 0.4rem center;
  background-size: 0.36rem 0.28rem;
  border: 0.02rem solid #e64336;
  border-radius: 0.23rem;
  box-sizing: border-box;
  overflow: hidden;
  // font-size: 0;
  z-index: 2;
  .slider,
  .slider-touch {
    height: 0.47rem;
  }
  .lc-slide-mark {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    content: "";
    width: 100%;
    height: 101%;
    z-index: 10;
  }
  .lc-slide-list {
    width: 100%;
    height: 100%;
    line-height: 0.47rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #f05928;
    font-size: 0.26rem;
  }
}
</style>
