<template>
  <div class="flex-column orderSelfPayUser">
    <!-- <div id="map" ref="map" style="display:none"></div> -->

    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 關鍵字 -->
        <el-input @clear="getList" @keyup.native.enter="getList" style="width: 200px; margin-right: 0.5rem" size="mini" v-model="listQuery.key" clearable placeholder="請輸入關鍵字">
        </el-input>

        <!-- 日期選擇 -->
        <el-date-picker size="mini" v-model="dateRange" type="daterange" range-separator="至" start-placeholder="開始日期" end-placeholder="结束日期">
        </el-date-picker>

        <!-- 排序 姓名name 乘車時間reserveDate 起點fromAddr 迄點toAddr + desc-->
        <el-select style="margin-left:.5rem;width:150px" clearable @change="getList()" size="mini" v-model="orderby" placeholder="請選擇排序方式">
          <el-option label="姓名" value="name"></el-option>
          <el-option label="預約乘車時間" value="reserveDate"></el-option>
          <el-option label="起點" value="fromAddr"></el-option>
          <el-option label="迄點" value="toAddr"></el-option>
        </el-select>
        <el-button @click="desc=!desc,getList()" class="sortBtn" size="mini" plain>
          <i v-if="!desc" class="iconfont icon-sortalphaasc"></i>
          <i v-else class="iconfont icon-sortalphadesc"></i>
        </el-button>

        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>

      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 全部訂單 -->
      <Title title="白牌車訂單"></Title>
      <div class="bg-white customScrollBar" style="height: calc(100% - 50px)">
        <div class="orderTableContainer customScrollBar">

          <OrderStatusFilter @handleSort="handleSort"></OrderStatusFilter>

          <div v-for="order in list" :key="order.id" class="orderContainer">
            <div class="orderLeft">
              <div class="orderLeftTitle">訂單編號 {{ order.orderNo }}</div>
              <div class="orderLeftDetail">
                <p>承接單位：{{ order.orgName }}</p>
                <p>車種類型：{{ order.carCategoryName }}</p>
                <p>
                  預約時間：{{ order.reserveDate | globalDateFilter('yyyy-MM-DD') }}
                  {{order.reserveDate | globalDateFilter('HH:mm')}}
                </p>
                <!-- <p>建立時間：{{ order.createDate | dateFilter }}</p> -->
                <!-- <p>行程：回程</p> -->
                <!-- <p>訂車人身分：B單位</p> -->
              </div>
            </div>
            <div class="orderCenter">
              <div class="orderCenterTitle">
                <p class="isCarpool">
                  <span :class="[order.canShared ? 'shared' : 'notShared']">
                    <i class="iconfont" :class="[order.canShared ? 'icon-circle' : 'icon-delete']"></i>
                    {{order.canShared ? '可共乘' : '不可共乘'}}
                  </span>
                </p>
                <!-- <span>預估時間</span> -->

                <p>搭乘人數：{{ order.passengerNum }}人</p>
              </div>
              <div class="orderCenterDetail">
                <div class="driverInfo">
                  <div class="driverName">
                    {{ order.name }}
                  </div>
                  <!-- <div class="userId">
                    聯絡電話：{{ order.noticePhone || "0934343234" }}
                  </div> -->
                  <i style="margin-right: 4px" class="iconfont icon-member" v-for="item in order.passengerNum" :key="item">
                  </i>
                </div>
                <div class="addressInfo">
                  <p class="startAdd textNoWrap">
                    {{ order.fromAddr }}
                  </p>
                  <i class="iconfont icon-down"></i>
                  <p class="endAdd textNoWrap">{{ order.toAddr }}</p>
                </div>
              </div>
            </div>
            <div class="orderRight">
              <div class="orderRightTitle">
                <p class="orderStatus">
                  <OrderStatusTag :type="orderStatusMapping[order.status - 1]" :cancelRemark="cancelRemarkList[order.cancelReamrk]"></OrderStatusTag>
                </p>
              </div>
              <div class="orderRightDetail">
                <div class="rightBtnBox">
                  <button v-if="hasButton('check')" class="orderButton orderDetail" @click="handleCheck(order.id)">
                    查看訂單
                  </button>
                  <button class="orderButton orderEdit" @click="
                      editDialog = true;
                      getOrder(order.id);
                    " v-if="[1,2,3].includes(order.status) && hasButton('edit') ">
                    編輯訂單
                  </button>
                  <button @click="handleDespatch(order)" class="orderButton orderStatus" v-if="hasButton('dispatch')">
                    快速預約
                  </button>
                  <button class="orderButton orderCancel" v-if="[1,2,3].includes(order.status) && hasButton('cancel') " @click="handleCancelOrder(order.id)">
                    取消訂單
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- eidt dialog -->
    <EditDialog :tempObj="temp" :editDialogProp="editDialog" :carCategorysList="carCategorysList" :passengerArr="passengerArr" @carCategoryChange='carCategoryChange' @handleEdit="handleEdit" @handleClose="handleClose"></EditDialog>
  </div>
</template>

<script>
import moment from "moment";

import pbMixins from "@/mixins/permissionBtn.js";

import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import elDragDialog from "@/directive/el-dragDialog";
import Pagination from "@/components/Pagination";
import OrderStatusTag from "@/components/OrderStatusTag";
import OrderStatusFilter from "@/components/OrderStatusFilter";
import EditDialog from "@/components/Dialog/editSelfPayUserDespatch";

import * as orderSelfPayUser from "@/api/orderSelfPayUser";
import * as categorys from "@/api/categorys";
import * as dispatch from "@/api/dispatchs";
export default {
  name: "orderSelfPayUser",
  mixins: [pbMixins],
  components: {
    Sticky,
    Title,
    permissionBtn,
    Pagination,
    OrderStatusFilter,
    OrderStatusTag,
    EditDialog,
  },
  directives: {
    elDragDialog,
  },
  data() {
    return {
      /* 車輛類別 */
      carCategorysList: [],
      /* 取消原因 */
      cancelRemarkList: {},

      /* filter */
      orderby: null,
      desc: true,
      dateRange: null,

      /* table */
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        Status: -1,
        StartDate: null,
        EndDate: null,
        page: 1,
        limit: 10,
        key: undefined,
        orderby: null, //姓名name 乘車時間reserveDate 起點fromAddr 迄點toAddr + desc
      },

      /* 列表checkbox選中的值 */
      multipleSelection: [],

      /* 表單相關 */
      labelPosition: "top",
      passengerArr: [],
      passengerNum: 1,
      temp: {
        date: "",
        time: "",
        id: "",
        selfPayUserId: "",
        orgId: "",
        reserveDate: "",
        noticePhone: "",
        fromAddr: "",
        fromLon: "",
        fromLat: "",
        toAddr: "",
        toLon: "",
        toLat: "",
        passengerNum: 0,
        canShared: false,
        status: 1,
        carCategoryId: null,
        CarCategoryName: "",
        wheelchairType: "",
        remark: [{ name: "", birth: "" }],
      },

      /* dialog */
      violationDialog: false,
      editDialog: false,

      /*  order status mapping */
      orderStatusMapping: [
        "newOrder",
        "ready",
        "arrival",
        "boarding",
        "complete",
        "cancel",
        "cancel",
        "cancel",
        "cancel",
      ],
    };
  },
  watch: {
    "temp.passengerNum"(val, oldVal) {
      const vm = this;
      if (val > oldVal) {
        for (let index = oldVal + 1; index <= val; index++) {
          let obj = {
            name: "",
            birth: "",
            //TODO:這邊暫時用第一筆資料的電話當預設聯絡電話
            phone: vm.passengerArr[0]?.phone || "",
            key: index,
          };
          vm.passengerArr.push(obj);
        }
      } else {
        vm.passengerArr = vm.passengerArr.slice(0, val);
      }
    },

    /* 起迄日期搜尋 */
    dateRange(val) {
      const vm = this;
      if (val != null) {
        vm.listQuery.StartDate = moment(val[0]).format("yyyy-MM-DD");
        vm.listQuery.EndDate = moment(val[1]).format("yyyy-MM-DD");
        vm.getList();
      } else {
        vm.listQuery.StartDate = null;
        vm.listQuery.EndDate = null;
        vm.getList();
      }
    },
  },
  methods: {
    /* 獲取訂單 */
    getList() {
      const vm = this;
      if (!vm.desc) {
        vm.listQuery.orderby = vm.orderby || null;
      } else {
        vm.listQuery.orderby = vm.orderby ? `${vm.orderby} desc` : null;
      }
      orderSelfPayUser.load(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },

    /* 獲取所有車輛類型 */
    getCarCategorys() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_CAR",
      };
      categorys.getSimpleList(query).then((res) => {
        vm.carCategorysList = res.result.filter((car) => {
          return (
            car.value === "SYS_CAR_GENERAL" || car.value === "SYS_CAR_WEAL"
          );
        });
      });
    },

    /* 獲取所有取消原因 */
    getCancelRemark() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_ORDERCANCEL_REMARK",
      };
      categorys.getSimpleList(query).then((res) => {
        res.result.forEach((item) => {
          vm.cancelRemarkList[item.value] = item.label;
        });
      });
    },

    /* 獲取單筆訂單資料 */
    getOrder(id) {
      const vm = this;
      orderSelfPayUser.get({ id }).then((res) => {
        vm.temp = Object.assign({}, res.result); // copy obj
        let date = vm.temp.reserveDate.split(" ")[0];
        let time = vm.temp.reserveDate.split(" ")[1].slice(0, 5);
        vm.$set(vm.temp, "date", date);
        vm.$set(vm.temp, "time", time);
        vm.$nextTick(() => {
          vm.passengerArr = JSON.parse(vm.temp.remark);
        });
      });
    },

    /* 快速預約 */
    handleDespatch(order) {
      const vm = this;
      vm.$cl(order);
      vm.$router.push(
        `/orderselfpayuser/dispatch/${order.userId}-${order.selfPayUserId}?orderId=${order.id}`
      );
    },

    /* 確認編輯訂單 */
    handleEdit(data) {
      const vm = this;
      data.reserveDate = `${data.date} ${data.time}`;
      data.carCategoryName = vm.carCategorysList.filter((i) => {
        return i.value === data.carCategoryId;
      })[0].label;
      data.remark = JSON.stringify(vm.passengerArr);

      orderSelfPayUser.update(data).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.editDialog = false;
        vm.getList();
      });
    },

    /* 當車輛類型改變時清空輪椅類型 */
    carCategoryChange() {
      this.temp.wheelchairType = "";
    },

    /* 關閉編輯燈箱 */
    handleClose(status) {
      this.editDialog = status;
    },

    /* 取消排班 */
    handleCancelDispatch(id) {
      const vm = this;
      console.log(id);
      dispatch.cancel([id]).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.getList();
      });
    },

    /* 篩選訂單狀態 */
    handleSort(a) {
      this.listQuery.Status = a * 1;
      this.getList();
    },

    /* 取消訂單 */
    handleCancelOrder(id) {
      const vm = this;
      let params = {
        id,
        cancelRemark: "SYS_ORDERCANCEL_REMARK_ADMIN",
      };
      orderSelfPayUser.cancel(params).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.getList();
      });
    },

    /* 檢視訂單 */
    handleCheck(id) {
      this.$router.push({
        path: `/orderselfpayuser/check/${id}`,
      });
    },

    /* 換頁 */
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },

    /* 權限按鈕 */
    onBtnClicked(domId) {
      this.$cl(domId);
      switch (domId) {
        case "search":
          this.getList();
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    this.getList();
    this.getCarCategorys();
    this.getCancelRemark();
  },
};
</script>

<style lang="scss">
// TODO:css 在 assets/css/views/order/_orderSelfPayUser.scss
</style>
