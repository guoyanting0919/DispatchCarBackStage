import Vue from "vue";
import layer from "vue-layer";

import "normalize.css/normalize.css"; // A modern alternative to CSS resets

import ElementUI from "element-ui";
// import "@/assets/custom-theme/index.css";

/* 基本style */
import "./assets/custom-theme/basicElementUi.scss";
//theme2
// import "@/assets/custom-theme/custom.scss";
// import "@/assets/custom-theme/custom2.scss";

import locale from "element-ui/lib/locale/lang/zh-TW";
import VueSweetalert2 from "vue-sweetalert2";
import VueContextMenu from "vue-contextmenu";
import VueQuillEditor from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import "@/styles/index.scss"; // global css

import VCharts from "v-charts";

import App from "./App";
import router from "./router";
import store from "./store";
import api from "./api/ytApis";

import "@/icons"; // icon

/* 路由權限管理 */
import "@/permission";

/* iconfont */
import "@/assets/public/css/iconfont/iconfont.css";
import "@/assets/public/css/iconfont/iconfont.js";
import "@/assets/public/css/comIconfont/iconfont/iconfont.css";
import "@/assets/public/css/comIconfont/iconfont/iconfont.js";

/* all(建議放套件Css下層) */
import "../src/assets/all.scss";

/* 自定義流程表單 */
import FrmLeaveReqAdd from "@/views/forms/userDefine/frmLeaveReq/add"; // 請假流程
import FrmLeaveReqDetail from "@/views/forms/userDefine/frmLeaveReq/detail"; // 請假流程
Vue.component("FrmLeaveReqAdd", FrmLeaveReqAdd); // 請假流程
Vue.component("FrmLeaveReqDetail", FrmLeaveReqDetail); // 請假流程

import FrmCarReqAdd from "@/views/forms/userDefine/frmCarReq/add"; // 車輛申請流程
import FrmCarReqDetail from "@/views/forms/userDefine/frmCarReq/detail"; // 車輛申請流程
Vue.component("FrmCarReqAdd", FrmCarReqAdd); // 車輛申請流程
Vue.component("FrmCarReqDetail", FrmCarReqDetail); // 車輛申請流程

import FrmDriverReqAdd from "@/views/forms/userDefine/frmDriverReq/add"; // 司機申請流程
import FrmDriverReqDetail from "@/views/forms/userDefine/frmDriverReq/detail"; // 司機申請流程
Vue.component("FrmDriverReqAdd", FrmDriverReqAdd); // 司機申請流程
Vue.component("FrmDriverReqDetail", FrmDriverReqDetail); // 司機申請流程

import vueEsign from "vue-esign";
Vue.use(vueEsign);

/* Filters */
import dateFilter from "./filters/dateFilter";
import hideFilter from "./filters/hideFilter";
Vue.filter("globalDateFilter", dateFilter); // 全域啟用
Vue.filter("hideFilter", hideFilter); // 全域啟用

Vue.use(ElementUI, { locale });
Vue.use(VueSweetalert2);
Vue.use(VueContextMenu);
Vue.use(VueQuillEditor);
Vue.use(VCharts);

const alertT = Vue.prototype.$swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener("mouseenter", Vue.prototype.$swal.stopTimer);
    toast.addEventListener("mouseleave", Vue.prototype.$swal.resumeTimer);
  },
});

const alertM = Vue.prototype.$swal.mixin({
  toast: false,
  position: "center",
  showConfirmButton: true,
  showCloseButton: false,
  timer: 3000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener("mouseenter", Vue.prototype.$swal.stopTimer);
    toast.addEventListener("mouseleave", Vue.prototype.$swal.resumeTimer);
  },
});

let globalConsole = function(data) {
  if (process.env.NODE_ENV === "development") console.log(data);
};

Vue.config.productionTip = false;
Vue.prototype.$api = api;
Vue.prototype.$cl = globalConsole;
Vue.prototype.$alertT = alertT;
Vue.prototype.$alertM = alertM;
Vue.prototype.$layer = layer(Vue, {
  msgtime: 3,
});
new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
});
