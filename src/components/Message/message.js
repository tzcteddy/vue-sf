import msgComponent from "./message.vue";
import Vue from "vue";
let instance;
let getInstance = () => {
  instance = new Vue({
    render: h => h(msgComponent)
  }).$mount();
  document.body.appendChild(instance.$el);
};
let message = {
  success(option) {
    !instance && getInstance();
    instance.$children[0].add(option);
  }
};
export { message };
export default {
  install(_vue) {
    let $message = {};
    Object.keys(message).some(key => {
      $message[key] = message[key];
    });
    _vue.prototype.$msg = $message;
  }
};
