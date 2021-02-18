<template>
  <div class="dragDispatcherContainer">
    <div class="orderContainer customScrollBar">
      <div v-for="item in list" :key="item.despatchNo" draggable="true" class="orderCard" @dragstart="handleDargOrder(item)">
        <div class="orderCardTitle" v-if="list">
          <p>{{ item.data[0].carCategoryName }}</p>
          <p v-if="item.canShared">可共乘</p>
          <p v-else>不可共乘</p>
          <p>{{ item.data[0].familyWith }}人搭乘</p>
        </div>
        <div class="orderCardMain">
          <div class="orderInfo">
            <p class="orderInfoName">{{ item.data[0].name }}</p>
            <!-- <p style="margin: 0">聯絡電話 : {{ item.data[0].noticePhone }}</p> -->
          </div>
          <p class="orderTime">
            {{ item.data[0].reserveDate | dateFilter }}
          </p>
          <div class="orderAddr">
            <i class="iconfont icon-circle"></i>
            <i class="iconfont icon-Vector10"></i>
            <p class="startAddr">
              {{ item.data[0].fromAddr }}
            </p>
            <p class="endAddr">{{ item.data[0].toAddr }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="outsideContainer">
      <div class="driverTimeCard">
        <p>車輛 <i class="iconfont icon-right1"></i></p>
        <p style="margin-top: 0.5rem">
          時間 <i class="iconfont icon-right1 iconRoate"></i>
        </p>
      </div>

      <!-- driver fake box -->
      <div class="driverFakeBox">
        <div class="driverCard" v-for="(car) in carList" :key="car.id">
          <div class="driverCardTitle">
            <div class="driverImg"></div>
            <p class="driverName">{{ car.driverName }}({{ car.carNo }})</p>
          </div>
          <p class="carInfo">座位:{{ car.seatNum }} | 輪椅:{{ car.wheelchairNum }} | {{ car.carCategoryName }}</p>
        </div>
      </div>

      <!-- time fake box -->
      <div class="timeFakeBox">
        <div class="timeCard" v-for="item in timelist" :key="item">
          {{ item }}
        </div>
      </div>

      <div class="distatchContainer" @dragover.prevent>
        <div class="driverBox">
          <!-- 司機迴圈 -->
          <div @mouseenter="driverMouseUp" @dragend="driverDragleave" :class="{ active: isActive }" class="driver" draggable="true" v-for="car in carList" :key="car.id">
            <!-- <div class="driverCard">司機</div> -->
            <!-- 時間迴圈 -->
            <div @mouseenter="driverMouseUp" @dragover.self="showShadow" @dragleave.self="clearShadow" @dragend.self="clearShadow" @drop="driverDrop($event, car, time, car.id, key2)" v-for="(time, key2) in car.timeList" :key="key2" class="timeBox">
              <div @mouseenter="driverMouseUp" @dragover.self="showShadow" @dragleave="clearShadow" @dragend="clearShadow" class="whiteDriverTime">
                {{ car.driverName + "" + key2 }}
              </div>
              <!-- <el-button @click="click(item, item2)">{{ key }}</el-button> -->
              <div v-for="(rL, index) in car.readyList" :key="index">
                <div v-if="rL.time===key2" @mouseenter.stop="test2()" @dragend="test()" @mouseleave="test()" @drop.stop="driverDropD($event, driver, time, key, key2)" class="dispatchCard" draggable="true">
                  <div class="dispatchCardTitle">
                    <!-- <p>{{ time[0].OrderDetails.ExpectedMinute }}分</p> -->
                    <p>NEW</p>
                  </div>
                  <p>王小明</p>
                  <p>王小明</p>
                  <p>王小明</p>
                  <p>王小明</p>
                  <p>{{ time.Id }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";

import IScroll from "iscroll/build/iscroll-probe";
// import dispatchs from "@/assets/dispatch";
import * as orderCaseUser from "@/api/orderCaseUser";
import * as cars from "@/api/cars";
import * as drivers from "@/api/drivers";
import * as dispatchs from "@/api/dispatchs";

export default {
  props: {
    start: {
      //開始時間
      type: String,
      default: "05:00",
    },
    end: {
      //結束時間
      type: String,
      default: "23:45",
    },
    step: {
      //間隔時間(分)
      type: Number,
      default: 15,
    },
  },
  data() {
    return {
      /* 司機列表 */
      driverList: [],

      /* 車輛列表 */
      carList: [],

      /* order temp */
      orderTemp: "",

      canDrag: true,
      scroll: null,
      dragData: "",
      dispatchData: "",
      isActive: false,
      ele: document.querySelectorAll(".distatchContainer")[0],
      pos: { top: 0, left: 0, x: 0, y: 0 },
      isDown: false,
      realDispatchList: [],
      sensitivity: 1,

      //派遣訂單
      list: [],
      readyList: [],
      listLoading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 999,
        key: undefined,
        StartDate: null,
        EndDate: null,
      },
    };
  },
  filters: {
    dateFilter(date) {
      let day = moment(date).format("yyyy-MM-DD");
      let time = moment(date).format("HH:mm");
      return `${day} ${time}`;
    },
  },
  computed: {
    timelist() {
      let ctime = moment().format("YYYY-MM-DD") + " " + this.start;
      let arr = [moment(ctime).format("HH:mm")];
      while (
        moment(ctime).isBefore(moment().format("YYYY-MM-DD") + " " + this.end)
      ) {
        ctime = moment(ctime).add(this.step, "minutes");
        arr.push(moment(ctime).format("HH:mm"));
      }
      return arr;
    },
  },
  methods: {
    /* 獲取派遣訂單 */
    async getList() {
      const vm = this;
      vm.listQuery.EndDate = vm.listQuery.StartDate;
      await orderCaseUser.loadDespatch(vm.listQuery).then((res) => {
        vm.list = res.data.filter((d) => {
          return d.data[0].status == 1;
        });

        vm.readyList = res.data.filter((d) => {
          return d.data[0].status !== 1;
        });

        vm.readyList = vm.readyList.map((l) => {
          l.time = moment(l.data[0].reserveDate).format("HH:mm");
          return l;
        });
        vm.total = res.count;
      });
    },

    /* 獲取所有司機 */
    getDriverList() {
      const vm = this;
      vm.listLoading = true;
      drivers.load({ limit: 9999, page: 1 }).then((res) => {
        vm.driverList = res.data;
      });
    },

    /* 獲取所有車輛 */
    getCarList() {
      const vm = this;
      cars.load({ limit: 9999, page: 1 }).then((res) => {
        vm.carList = res.data;
        vm.carList.forEach((item) => {
          item.timeList = this.timelist.reduce((a, b) => ((a[b] = ""), a), {});
          item.readyList = vm.readyList.filter((rL) => rL.carId === item.id);
          console.log(item.readyList);
        });
      });
    },

    dragSetting() {
      const vm = this;
      this.scroll = new IScroll(".distatchContainer", {
        mouseWheel: true, // 允许鼠标滚轮
        scrollX: true,
        scrollY: true,
        probeType: 3,
        momentum: false,
      });

      this.scroll.on("scroll", function () {
        if (vm.canDrag) {
          //   console.log(document.querySelectorAll(".timeFakeBox")[0], this.y);
          document.querySelectorAll(".timeFakeBox")[0].style.transform =
            "translate(0px," + this.y + "px) ";
          document.querySelectorAll(".driverFakeBox")[0].style.transform =
            "translate(" + this.x + "px,0px) ";
        } else {
          return;
        }
      });
    },

    driverDragleave() {
      //   console.log("a");
    },
    driverMouseUp() {
      //   console.log("a");
    },
    driverDrop(e, car) {
      const vm = this;
      this.isActive = true;
      e.target.style.background = "#fff";

      let data = {
        orderNosOrDespatchNos: [vm.orderTemp.despatchNo],
        carId: car.id,
        driverInfoName: car.driverName,
        carNo: car.carNo,
        driverInfoId: vm.driverList.filter((d) => d.name === car.driverName)[0]
          .id,
      };

      this.$cl(data);
      dispatchs.addOrUpdateShare(data).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.getList();
      });
    },
    driverDropD() {
      console.log("aaaa");
    },
    handleDargOrder(i) {
      this.orderTemp = Object.assign({}, i); // copy obj
      console.log(this.orderTemp);
      this.scroll.enabled = true;
    },
    test2() {
      console.log("a");
      // this.canDrag = false;
      this.scroll.enabled = !this.scroll.enabled;
      console.log(this.scroll.enabled);
      // this.scroll = {};
      // console.log(this.scroll);
    },
    showShadow(e) {
      //   this.isActive = true;
      // e.target.style.boxShadow = "inset 0px 0px 20px #888";
      e.target.style.background = "#00000057";
    },
    clearShadow(e) {
      // e.target.style.boxShadow = "none";
      e.target.style.background = "#fff";
    },
    getHeight(x) {
      let step = 100 / this.step;
      return x * step + "px";
    },
  },
  async created() {
    this.listQuery.StartDate = moment(new Date()).format("yyyy-MM-DD");
    await this.getList();
    this.getCarList();
    this.getDriverList();
  },
  mounted() {
    const vm = this;
    setTimeout(() => {
      vm.dragSetting();
    }, 1000);
  },
};
</script>

<style lang="scss" scoped>
.dragDispatcherContainer {
  display: flex;
  height: calc(100vh - 104px);
  width: 100%;
  // background: #fff;
  padding: 1rem;

  .orderContainer {
    width: 286px;
    min-height: 100%;
    overflow: auto;
    // padding-top: 1rem;
    // background: lightgreen;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin-right: 1rem;
  }

  .orderCard {
    width: 280px;
    height: auto;
    background: #fff;
    border: 2px solid #fa8c16;
    border-top: 5px solid #fa8c16;
    border-radius: 0px 0px 8px 8px;
    margin-bottom: 1rem;
  }
  .orderCardTitle {
    height: 38px;
    color: #fff;
    background: #fa8c16;
    padding: 0.5rem;
    display: flex;
    font-size: 14px;
    font-weight: 700;
    p {
      margin-right: 1rem;
    }
  }
  .orderCardMain {
    padding: 0.5rem;
    font-size: 14px;
    font-weight: 700;
  }
  .orderInfo {
    color: #fa8c16;
    display: flex;
    margin-bottom: 0.5rem;

    p {
      margin-right: 1rem;
    }
  }
  .orderInfoName {
    color: #000;
    font-size: 1rem;
  }
  .orderTime {
    margin-bottom: 0.5rem;
  }
  .orderAddr {
    padding-left: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    height: 45px;
    border-left: 3px dotted #fa8c16;
    position: relative;

    .icon-circle {
      font-weight: 500;
      color: #fa8c16;
      position: absolute;
      left: -9px;
      top: -1px;
      background: #fff;
    }

    .icon-Vector10 {
      font-weight: 500;
      color: #fa8c16;
      position: absolute;
      left: -9px;
      bottom: -1px;
      background: #fff;
    }
  }

  .startAddr {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .endAddr {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .outsideContainer {
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    width: calc(100% - 286px - 16px);
    position: relative;
  }

  .driverTimeCard {
    color: #fa8c16;
    position: absolute;
    width: 100px;
    height: 100px;
    background: #fff;
    z-index: 999;
    border-bottom: 1px solid #ddd;
    border-right: 1px solid #ddd;
    flex-direction: column;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .iconRoate {
    transform: rotate(90deg);
  }

  .driverFakeBox {
    display: flex;
    // min-width: 100%;
    // background: forestgreen;
  }

  .driverCard {
    background: #fff;
    height: 100px;
    z-index: 999;
    width: 320px;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 1rem;

    &:nth-child(1) {
      // background: brown;
      margin-left: 100px;
    }
  }

  .driverCardTitle {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 0.5rem;
    letter-spacing: 2px;
  }
  .driverImg {
    width: 40px;
    height: 40px;
    background: #ddd;
    border-radius: 200px;
    margin-right: 1rem;
  }
  .driverName {
  }
  .carInfo {
    width: 100%;
    letter-spacing: 2px;
  }

  .timeFakeBox {
    width: 100px;
    background: #fff;
    border-right: 1px solid #ddd;
  }

  .timeCard {
    margin-bottom: 72px;
    text-align: center;
    transform: translateY(-8px);

    &:nth-child(1) {
      transform: translateY(0px);
    }
  }

  .distatchContainer {
    width: calc(100% - 100px);
    height: 100%;
    // background: lightpink;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
  }

  .driver {
    width: 320px;
    // height: 100px;
    background: lightskyblue;
    // margin: 1rem;
    position: relative;
    // padding-top: 100px;

    &.active {
      background: lime;
    }
  }

  .driverBox {
    // width: 2000px;
    display: flex;
  }

  .timeBox {
    height: 90px;
    width: 320px;
    background: #fff;
    border: 1px solid #ddd;
    box-sizing: border-box;
    transition: 0.3s;
    // background: magenta;
    // margin-bottom: 1rem;
    // margin-top: 100px;
  }

  .dispatchCard {
    background: #ffefde;
    padding: 0.5rem;
    border: 2px solid #fa8c16;
    border-top: 5px solid #fa8c16;
    border-radius: 0px 0px 8px 8px;
    width: 33%;
    z-index: 1;
    transition: 0.3s;
    height: 90px;
    overflow: hidden;
    box-shadow: 4px 4px 10px #ddd;

    &:hover {
      // transform: translate(4px, -4px);
      z-index: 2;
      height: auto !important;
    }
  }

  .dispatchCardTitle {
    display: flex;
    justify-content: space-between;
  }

  .whiteDriverTime {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    font-size: 2rem;
    line-height: 90px;
    letter-spacing: 2px;
    font-weight: 700;
    color: #fff;
    transition: 0.3s;
    position: absolute;
    width: 100%;
  }
}
</style>
