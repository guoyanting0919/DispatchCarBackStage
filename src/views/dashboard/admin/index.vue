<template>
  <div class="dashboard">
    <!-- https://www.eup.tw/section_spy_single.html?accinfo=50797404-50797404-0000&car_number=AGS-7135&forceRefresh=true&landmark=false -->
    <!-- <iframe
      src="https://www.eup.tw/history_path_single.html?accinfo=50797404-50797404-0000&car_number=AGS-7135&startdate=2021-01-13"
      width="100%"
      height="768px"
      frameborder="0"
      scrolling="auto"
    ></iframe> -->
    <div class="driverApp" v-if="isDev">
      <el-input v-model="despatchNo" placeholder="請輸入訂單ID" style='width:200px;margin-right:1rem'></el-input>
      <el-button @click="changeStatus(3)" type="success">已抵達</el-button>
      <el-button @click="changeStatus(4)" type="success">客上</el-button>
      <el-button @click="changeStatus(5),orderPay" type="info">收款 + 完成</el-button>
      <el-button @click="changeStatus(9,'SYS_ORDERCANCEL_REMARK_DRIVER')" type="danger">取消</el-button>
      <div class="resMessage">

        {{resMessage}}
      </div>
    </div>
  </div>
</template>

<script>
import * as driverApp from "@/api/driverApp";

export default {
  data() {
    return {
      despatchNo: "",
      resMessage: "RES MESSAGE",
    };
  },
  computed: {
    isDev() {
      return process.env.NODE_ENV == "development";
    },
  },
  methods: {
    /* 變更訂單狀態 */
    changeStatus(status, cancelRemark = "") {
      const vm = this;
      this.$cl(vm.despatchNo);
      let data = {
        orderId: vm.despatchNo,
        status: status,
        cancelRemark: cancelRemark,
      };
      driverApp.changeStatus(data).then((res) => {
        this.$cl(res);
        this.resMessage = res;
      });
    },

    /* 收款 */
    orderPay() {
      let data = {
        id: this.despatchNo,
        realFamilyWith: 3,
        realMaidWith: 0,
        realWithAmt: 250,
        realDiscountPercent: 0,
        realDiscountAmt: 0,
        totalDiscountAmt: 0,
        realSelfPay: 1032,
        receivePay: 0,
        signPic: "",
      };

      driverApp.orderPay(data).then((res) => {
        this.$cl(res);
        this.resMessage = res;
      });
    },
  },

  created() {},
};
</script>
<style scoped lang='scss'>
</style>