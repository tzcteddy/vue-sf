<template>
  <div class="vue-alert_box" style="position:fixed;top:0;left:0;display:flex;flex-direction:column;justify-content: flex-start;align-items: center;width:100%;">
    <div class="vue-alert_item" style="margin:10px 0;padding:5px 10px;display:inline-block;background:orange;color:white; border-radius:8px;font-size:14px;" v-for="(item, i) in layers" :key="i">{{item.message}}</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      layers: []
    };
  },
  mounted() {
    this.id = 0;
  },
  methods: {
    add(options) {
      let layer = { ...options, id: ++this.id };
      this.layers.push(layer);
      layer.time = setTimeout(() => {
        this.remove(layer);
      }, options.duration);
    },
    remove(layer) {
      clearTimeout(layer.time);
      this.layers = this.layers.filter(it => it.id !== layer.id);
    }
  }
};
</script>
