<template>
  <div class="flex-column orderCaseUser">
    <div id="map" ref="map" style="width: 0%; height: 0%"></div>
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 車行選擇 -->
        <el-input
          style="width: 200px; margin-right: 0.5rem"
          size="mini"
          v-model="value"
          clearable
          placeholder="請輸入關鍵字"
        ></el-input>

        <!-- 日期選擇 -->
        <el-date-picker
          size="mini"
          v-model="value1"
          type="daterange"
          range-separator="至"
          start-placeholder="開始日期"
          end-placeholder="结束日期"
        ></el-date-picker>

        <!-- 權限按鈕 -->
        <permission-btn
          moduleName="builderTables"
          size="mini"
          v-on:btn-event="onBtnClicked"
        ></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 全部訂單 -->
      <Title title="長照訂單"></Title>
      <div class="bg-white customScrollBar" style="height: calc(100% - 50px)">
        <div class="orderTableContainer customScrollBar">
          <div class="orderFilterContainer">
            <OrderStatusTag size="big" type="default"></OrderStatusTag>
            <OrderStatusTag size="big" type="newOrder"></OrderStatusTag>
            <OrderStatusTag size="big" type="ready"></OrderStatusTag>
            <OrderStatusTag size="big" type="arrival"></OrderStatusTag>
            <OrderStatusTag size="big" type="boarding"></OrderStatusTag>
            <OrderStatusTag size="big" type="complete"></OrderStatusTag>
            <OrderStatusTag size="big" type="cancel"></OrderStatusTag>
          </div>
          <div v-for="order in list" :key="order.id" class="orderContainer">
            <div class="orderLeft">
              <div class="orderLeftTitle">訂單編號 {{ order.orderNo }}</div>
              <div class="orderLeftDetail">
                <p>承接單位：{{ order.orgName }}</p>
                <p>車種類型：{{ order.carCategoryName }}</p>
                <p>預約時間：{{ order.reserveDate | dateFilter }}</p>
                <p>建立時間：{{ order.createDate | dateFilter }}</p>
                <p>行程：{{ order.isBack ? "去程" : "回程" }}</p>
                <p>訂車人身分：{{ order.createdIdentity }}</p>
                <!-- <p>行程：回程</p> -->
                <!-- <p>訂車人身分：B單位</p> -->
              </div>
            </div>
            <div class="orderCenter">
              <div class="orderCenterTitle">
                <p class="isCarpool">
                  <span v-if="order.canShared">可共乘</span>
                  <span v-else>不可共乘</span>
                </p>
                <!-- <span>預估時間</span> -->

                <p>陪同人數：{{ order.familyWith }}人</p>
              </div>
              <div class="orderCenterDetail">
                <div class="driverInfo">
                  <div class="userInfo">個案姓名：{{ order.userName }}</div>
                  <div class="userInfo">個案編號：{{ order.noticePhone }}</div>
                  <div class="userInfo">
                    身分證字號：{{ order.noticePhone }}
                  </div>
                  <div class="userInfo">
                    接收簡訊號碼：{{ order.noticePhone }}
                  </div>
                  <i
                    style="margin-right: 4px"
                    class="iconfont icon-member"
                    v-for="item in order.familyWith + 1"
                    :key="item"
                  ></i>
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
                <el-button style="padding: 0px 10px" type="primary"
                  >轉單</el-button
                >
                <p class="orderStatus">
                  <OrderStatusTag
                    :type="orderStatusMapping[order.status - 1]"
                    size="mini"
                  ></OrderStatusTag>
                </p>
              </div>
              <div class="orderRightDetail">
                <p>個案負擔：$ {{ order.withAmt }}</p>
                <div class="rightBtnBox">
                  <button
                    class="orderButton orderDetail"
                    @click="handleCheck(order.id)"
                  >
                    查看訂單
                  </button>
                  <button
                    class="orderButton orderEdit"
                    @click="
                      editDialog = true;
                      getOrder(order.id);
                    "
                    v-if="order.status == 1"
                  >
                    編輯訂單
                  </button>
                  <button class="orderButton orderStatus">修改狀態</button>
                  <button
                    class="orderButton orderCancel"
                    v-if="order.status == 1"
                    @click="handleCancelOrder(order.id)"
                  >
                    取消訂單
                  </button>
                  <button
                    class="orderButton orderCancel"
                    v-if="order.status == 2"
                    @click="handleCancelDispatch(order.despatchNo)"
                  >
                    取消排班
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="handleCurrentChange"
        />
      </div>
    </div>

    <!-- eidt dialog -->
    <EditDialog
      :temp="temp"
      :editDialogProp="editDialog"
      :carCategorysList="carCategorysList"
      @handleEdit="handleEdit"
      @handleClose="handleClose"
    ></EditDialog>
  </div>
</template>

<script>
import moment from "moment";
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import elDragDialog from "@/directive/el-dragDialog";
import Pagination from "@/components/Pagination";
import OrderStatusTag from "@/components/OrderStatusTag";
import EditDialog from "@/components/Dialog/editCaseUserDespatch";

import * as orderCaseUser from "@/api/orderCaseUser";
import * as categorys from "@/api/categorys";

import * as dispatch from "@/api/dispatchs";
export default {
  name: "orderCaseUser",
  components: {
    Sticky,
    Title,
    permissionBtn,
    Pagination,
    OrderStatusTag,
    EditDialog,
  },
  directives: {
    elDragDialog,
  },
  filters: {
    dateFilter(date) {
      let day = moment(date).format("yyyy-MM-DD");
      let time = moment(date).format("HH:mm");
      return `${day} ${time}`;
    },
  },
  data() {
    return {
      //車輛類別
      carCategorysList: [],
      //table
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        key: undefined,
      },
      multipleSelection: [], // 列表checkbox選中的值
      // 表單相關
      labelPosition: "top",
      passengerArr: [],
      passengerNum: 1,
      temp: {
        // 日期
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
        remark: [{ name: "", birth: "" }],
      },

      // dialog

      violationDialog: false,
      editDialog: false,

      // order status mapping
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

      value: "",
      value1: "",
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
  },
  methods: {
    /* 獲取訂單 */
    getList() {
      const vm = this;
      orderCaseUser.load(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
        this.$cl(vm.list);
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
      categorys.getList(query).then((res) => {
        vm.carCategorysList = res.data.filter((car) => {
          return (
            car.dtValue === "SYS_CAR_GENERAL" || car.dtValue === "SYS_CAR_WEAL"
          );
        });
      });
    },

    /* 獲取單筆訂單資料 */
    getOrder(id) {
      const vm = this;
      orderCaseUser.get({ id }).then((res) => {
        vm.temp = Object.assign({}, res.result); // copy obj
        vm.temp.fromAddrDetail = vm.temp.fromAddr;
        vm.temp.toAddrDetail = vm.temp.toAddr;
        this.$set(vm.temp, "date", res.result.reserveDate.split(" ")[0]);
        this.$set(
          vm.temp,
          "time",
          res.result.reserveDate.split(" ")[1].slice(0, 5)
        );
      });
    },

    /* 關閉編輯燈箱 */
    handleClose(status) {
      this.editDialog = status;
    },

    /* 編輯訂單 */
    handleEdit(data) {
      console.log(data);
      const vm = this;
      data.reserveDate = `${data.date} ${data.time}`;
      data.carCategoryName = vm.carCategorysList.filter((i) => {
        return i.dtValue === data.carCategoryId;
      })[0].name;
      data.fromAddr = data.fromAddrDetail;
      data.toAddr = data.toAddrDetail;
      orderCaseUser.update(data).then(() => {
        vm.editDialog = false;
        vm.$alertT.fire({
          icon: "success",
          title: `訂單${data.orderNo}編輯成功`,
        });
        vm.getList();
      });
    },

    /* 取消排班 */
    handleCancelDispatch(id) {
      const vm = this;
      dispatch.cancel([id]).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.getList();
      });
    },

    /* 取消訂單 */
    handleCancelOrder(id) {
      const vm = this;
      let params = {
        id,
        cancelRemark: "SYS_ORDERCANCEL_REMARK_ADMIN",
      };
      orderCaseUser.cancel(params).then((res) => {
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
        path: `/ordercaseuser/check/${id}`,
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
        case "violationBtn":
          this.violationDialog = true;
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    this.getList();
    this.getCarCategorys();
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/basic/_mixin.scss";
.orderTableContainer {
  height: calc(100% - 52px);
  overflow: auto;
  padding-right: 0.75rem;
  background-color: #efefef;

  @include rwd($md) {
    display: flex;
    flex-wrap: wrap;
  }
}

.orderFilterContainer {
  display: flex;
  flex-wrap: wrap;

  span {
    margin: 1rem;
    margin-left: 0;
    margin-top: 0;
    cursor: pointer;
  }
}

.orderStatusBox {
  margin-right: 1rem;
  margin-bottom: 1rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #343434;
  border-radius: 8px;
  color: #343434;
  cursor: pointer;

  &.active {
    color: $--color-primary;
    border: 1px solid $--color-primary;
    background-color: $--color-primary;
    color: #fff;
  }
}

.orderContainer {
  display: flex;
  height: 200px;
  margin-bottom: 1rem;

  @include rwd($md) {
    flex-direction: column;
    height: auto;
    width: 48%;
    margin: 0 1%;
    margin-bottom: 2rem;
  }

  @include rwd($sm) {
    width: 100%;
  }
}

.orderLeft {
  width: 30%;
  background: $--color-primary;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.orderLeftTitle {
  font-size: 16px;
  margin-bottom: 0.7rem;
  font-weight: 700;
  padding: 0.5rem;
  border-bottom: 1px solid #fff;
}

.orderLeftDetail {
  padding: 0.5rem;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  font-weight: 700;
  font-size: 14px;

  p {
    @include rwd($md) {
      margin-bottom: 0.5rem;
    }
  }
}

.orderCenter {
  width: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.orderCenterTitle {
  display: flex;
  font-size: 16px;
  font-weight: 700;
  padding: 0.5rem;
  border-bottom: 1px solid #000;

  @include rwd($md) {
    font-size: 15px;
    font-weight: 500;
  }
}

.isCarpool {
  margin-right: auto;
  color: $--color-primary;
}

.wheelchairType {
  margin-right: 1rem;
}

.orderCenterDetail {
  display: flex;
  height: 100%;
}

.driverInfo {
  padding-top: 1rem;
  width: 40%;
  font-size: 14px;
  height: 100%;
  padding: 0.5rem;
  border-right: 1px solid gray;

  @include rwd($md) {
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }

  div {
    @include rwd($md) {
      text-align: center;
    }
  }
}

.driverName {
  font-size: 24px;
  margin-bottom: 0.5rem;
}

.userInfo {
  margin-bottom: 0.5rem;
}

.addressInfo {
  padding-top: 1rem;
  width: 60%;
  height: 100%;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.startAdd,
.endAdd {
  text-align: center;
  padding: 0.5rem;
  border-radius: 8px;
  max-width: 100%;
  @include rwd($md) {
    font-size: 15px;
  }
}

.startAdd {
  background-color: lightblue;
}

.endAdd {
  background-color: lightpink;
}

.orderRight {
  width: 20%;
  background-color: #343434;
  display: flex;
  flex-direction: column;
}

.orderRightTitle {
  display: flex;
  padding: 0.4rem;
  background-color: #888;
}

.orderStatus {
  margin-left: auto;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.changeOrder {
  font-size: 14px;
  border-radius: 100px;
  box-shadow: none;
  color: #fff;
  border: 1px solid #fff;
  background: #a79509;
}

.orderRightDetail {
  padding: 0.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  margin: 1rem 0;
  font-weight: 700;

  @include rwd($md) {
    margin: 0;
    padding: 1em;
    height: 130px;
  }
}

.rightBtnBox {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.orderButton {
  font-size: 15px;
  border-radius: 100px;
  border: 2px solid #fff;
  font-weight: 700;
  margin: 0.5rem;
  padding: 0.25rem 0.5rem;
}

.orderEdit {
  color: #fff;
  background-color: #138496;
}
.orderStatus {
  color: #fff;
  background-color: #138496;
}
.orderCancel {
  color: #fff;
  background-color: #aa0000;
}

.orderDetail {
  color: #fff;
  background-color: #138496;
}

.orderLeft,
.orderCenter,
.orderRight {
  @include rwd($md) {
    width: 100%;
  }
}
</style>
