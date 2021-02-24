<template>
  <div class="flex-column orderCaseUser">
    <!-- <div id="map" ref="map" style="width: 0%; height: 0%"></div> -->
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 關鍵字 -->
        <el-input @clear='getList' @keyup.native.enter="getList" style="width: 200px; margin-right: 0.5rem" size="mini" v-model="listQuery.key" clearable placeholder="請輸入關鍵字">
        </el-input>

        <!-- 日期選擇 -->
        <el-date-picker size="mini" v-model="dateRange" type="daterange" range-separator="至" start-placeholder="開始日期" end-placeholder="结束日期">
        </el-date-picker>

        <!-- 排序 姓名name 乘車時間reserveDate 起點fromStationName 迄點toStationName + desc-->
        <el-select style="margin-left:.5rem;width:150px" clearable @change="getList()" size="mini" v-model="orderby" placeholder="請選擇排序方式">
          <el-option label="姓名" value="name"></el-option>
          <el-option label="聯絡電話" value="phone"></el-option>
          <el-option label="個案編號" value="caseUserNo"></el-option>
          <el-option label="身分證字號" value="uid"></el-option>
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
      <Title title="長照訂單"></Title>
      <div class="bg-white customScrollBar" style="height: calc(100% - 50px)">
        <div class="orderTableContainer customScrollBar">

          <OrderStatusFilter @handleSort="handleSort"></OrderStatusFilter>

          <div v-for="order in list" :key="order.id" class="orderContainer">
            <div class="orderLeft">
              <div class="orderLeftTitle">訂單編號 {{ order.orderNo }}</div>
              <div class="orderLeftDetail">
                <p>承接單位：{{ order.orgName }}</p>
                <p>車種類型：{{ order.carCategoryName }}</p>
                <p>預約時間：{{ order.reserveDate | dateFilter }}</p>
                <!-- <p>建立時間：{{ order.createDate | dateFilter }}</p>
                <p>行程：{{ order.isBack ? "去程" : "回程" }}</p>
                <p>訂車人身分：{{ order.createdIdentity }}</p> -->
                <!-- <p>行程：回程</p> -->
                <!-- <p>訂車人身分：B單位</p> -->
              </div>
            </div>
            <div class="orderCenter">
              <div class="orderCenterTitle">
                <p class="isCarpool">
                  <!-- <span v-if="order.canShared">可共乘</span>
                  <span v-else>不可共乘</span> -->
                  <span :class="[order.canShared ? 'shared' : 'notShared']">
                    <i class="iconfont" :class="[order.canShared ? 'icon-circle' : 'icon-delete']"></i>
                    {{order.canShared ? '可共乘' : '不可共乘'}}
                  </span>
                </p>
                <!-- <span>預估時間</span> -->
                <p>陪同人數：{{ order.familyWith }}人</p>
              </div>
              <div class="orderCenterDetail">
                <div class="driverInfo">
                  <div class="driverName">
                    {{ order.name }}
                  </div>
                  <!-- <div class="userInfo">個案編號：{{ order.noticePhone }}</div> -->
                  <!-- <div class="userInfo">
                    身分證字號：{{ order.noticePhone }}
                  </div> -->
                  <!-- <div class="userInfo">
                    接收簡訊號碼：{{ order.noticePhone }}
                  </div> -->
                  <i style="margin-right: 4px" class="iconfont icon-member" v-for="item in order.familyWith + 1" :key="item"></i>
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
                <el-button v-if="order.hasViolation" style="padding: 0px 10px" type="danger" @click="handleViolation(order)">記點</el-button>
                <p class="orderStatus">
                  <OrderStatusTag :type="orderStatusMapping[order.status - 1]" :cancelRemark="cancelRemarkList[order.cancelReamrk]"></OrderStatusTag>
                </p>
              </div>
              <div class="orderRightDetail">
                <div class="rightBtnBox">
                  <button class="orderButton orderDetail" @click="handleCheck(order)">
                    查看訂單
                  </button>
                  <button class="orderButton orderEdit" @click="
                      editDialog = true;
                      getOrder(order.id);
                    " v-if="(order.status == 1 || order.status == 2 || order.status == 3) && hasButton('edit') ">
                    編輯訂單
                  </button>
                  <button @click="handleDespatch(order)" class="orderButton orderStatus" v-if="hasButton('dispatch')">
                    快速預約
                  </button>
                  <button class="orderButton orderCancel" v-if="order.status == 1" @click="handleCancelOrder(order)">
                    取消訂單
                  </button>
                  <!-- <button class="orderButton orderCancel" v-if="order.status == 2" @click="handleCancelDispatch(order.despatchNo)">
                    取消排班
                  </button> -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- eidt dialog -->
    <EditDialog :tempObj="temp" :editDialogProp="editDialog" :carCategorysList="carCategorysList" @handleEdit="handleEdit" @handleClose="handleClose"></EditDialog>

    <!-- violation dialog -->
    <el-dialog title="記點" :visible.sync="violationDialog" width="475px">
      <el-form ref="dataForm" :model="violationTemp" label-position="right" label-width="80px">
        <el-form-item size="mini" :label="'記點點數'">
          <el-input-number v-model="violationTemp.point" :min="0" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item size="mini" :label="'記點原因'">
          <el-input v-model="violationTemp.remark"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="violationDialog = false">取 消</el-button>
        <el-button type="danger" @click="handleConfirmViolation">確 定</el-button>
      </span>
    </el-dialog>

    <!-- cancel dialog -->
    <el-dialog title='取消訂單' :visible.sync="cancelDialog" width="900px">
      <el-row :gutter="16">
        <el-col :sm="24" :md="12">
          <div class="greyBox">
            <el-row :gutter="16">
              <el-col :sm="12">
                <div class="greyLabel">個案姓名</div>
                <div class="greyValue">{{cancelOrderTemp.userName}}</div>
              </el-col>

              <el-col :sm="12">
                <div class="greyLabel">身分證字號</div>
                <div class="greyValue">{{cancelOrderTemp.userUID}}</div>
              </el-col>

              <el-col :sm="12">
                <div class="greyLabel">個案編號</div>
                <div class="greyValue">{{cancelOrderTemp.caseUserNo}}</div>
              </el-col>

              <el-col :sm="12">
                <div class="greyLabel">訂單狀態</div>
                <div class="greyValue">
                  <OrderStatusTag :type="orderStatusMapping[cancelOrderTemp.status - 1]" size="mini"></OrderStatusTag>
                </div>
              </el-col>

              <el-col :sm="24">
                <div class="greyLabel">乘車時間</div>
                <div class="greyValue">{{cancelOrderTemp.reserveDate | dateFilter}}</div>
              </el-col>

              <el-col :sm="24">
                <div class="greyLabel">訂單編號</div>
                <div class="greyValue">{{cancelOrderTemp.orderNo}}</div>
              </el-col>

              <el-col :sm="24">
                <div class="greyLabel">
                  起點
                  <el-tooltip class="item" effect="dark" :content="cancelOrderTemp.fromAddrRemark" placement="top-start">
                    <i class="iconfont icon-InfoCircle"></i>
                  </el-tooltip>
                </div>
                <div class="greyValue">{{cancelOrderTemp.fromAddr}}</div>
              </el-col>

              <el-col :sm="24">
                <div class="greyLabel">
                  迄點
                  <el-tooltip class="item" effect="dark" :content="cancelOrderTemp.toAddrRemark" placement="top-start">
                    <i class="iconfont icon-InfoCircle"></i>
                  </el-tooltip>
                </div>
                <div class="greyValue">{{cancelOrderTemp.toAddr}}</div>
              </el-col>
            </el-row>
          </div>

          <div class="cancelBottom">
            <el-row :gutter="16">
              <el-col :sm="24">
                <div class="greyLabel">承接車行</div>
                <div class="greyValue">{{cancelOrderTemp.orgName}}</div>
              </el-col>

              <el-col :sm="12">
                <div class="greyLabel">車種</div>
                <div class="greyValue">{{cancelOrderTemp.carCategoryName}}</div>
              </el-col>

              <el-col :sm="12">
                <div class="greyLabel">共乘</div>
                <div class="greyValue">{{cancelOrderTemp.canShared ? '願意共乘' : '不可共乘'}}</div>
              </el-col>

              <el-col :sm="24">
                <div class="greyLabel">建單時間</div>
                <div class="greyValue">{{cancelOrderTemp.createDate }}</div>
              </el-col>

              <el-col :sm="24">
                <div class="greyLabel">建單者組織</div>
                <div class="greyValue">???</div>
              </el-col>
            </el-row>
          </div>
        </el-col>

        <el-col :sm="24" :md="12">
          <h2 class="cancelViolateTitle">目前累計違規點數 ??? 點</h2>
          <h4 class="cancelTodo">一、若於預約時間十分鐘後，未抵達約定乘車地點，視同放棄當次服務，駕駛員回報中心並離開進行下個服務，記違規1點。</h4>
          <h4 class="cancelTodo">二、乘車日前(48小時)未申請更改或取消服務者， 記違規1點。</h4>
          <h4 class="cancelTodo">三、累積違規3點後，停止服務2週，懲處完畢後歸0，重新累積記點規範。</h4>
          <el-form ref="cancelForm" :model="cancelTemp" label-position="right" label-width="80px">
            <el-form-item size="mini" :label="'記點點數'">
              <el-input-number v-model="cancelTemp.point" :min="0" :max="5"></el-input-number>
            </el-form-item>
            <el-form-item required size="mini" :label="'記點原因'">
              <el-input type="textarea" v-model="cancelTemp.remark" :autosize="{ minRows: 6, maxRows: 6}"></el-input>
            </el-form-item>
          </el-form>
        </el-col>

      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDialog = false">取 消</el-button>
        <el-button type="danger" @click="handleConfirmCancel">確 定</el-button>
      </span>
    </el-dialog>
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
import EditDialog from "@/components/Dialog/editCaseUserDespatch";

import * as orderCaseUser from "@/api/orderCaseUser";
import * as categorys from "@/api/categorys";
import * as dispatch from "@/api/dispatchs";
export default {
  name: "orderCaseUser",
  mixins: [pbMixins],
  components: {
    Sticky,
    Title,
    permissionBtn,
    Pagination,
    OrderStatusTag,
    EditDialog,
    OrderStatusFilter,
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
        orderby: null, //姓名name 乘車時間reserveDate 起點fromStationName 迄點toStationName + desc
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
        remark: [{ name: "", birth: "" }],
      },

      /* 記點temp */
      violationTemp: {
        userId: "",
        caseUserId: "",
        orderId: "",
        point: 0,
        remark: "",
      },

      /* 取消訂單temp */
      cancelOrderTemp: {},
      cancelTemp: {
        point: 0,
        remark: "",
      },

      /* dialog */
      violationDialog: false,
      editDialog: false,
      cancelDialog: false,

      /* order status mapping */
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
      orderCaseUser.get({ id }).then((res) => {
        vm.temp = Object.assign({}, res.result); // copy obj
        let fromRemark = ["醫院診所", "洗腎中心", "復健診所", "住家"].includes(
          vm.temp.fromAddrRemark
        )
          ? ""
          : vm.temp.fromAddrRemark;
        this.$set(vm.temp, "fromRemark", fromRemark);

        let toRemark = ["醫院診所", "洗腎中心", "復健診所", "住家"].includes(
          vm.temp.toAddrRemark
        )
          ? ""
          : vm.temp.toAddrRemark;
        this.$set(vm.temp, "toRemark", toRemark);

        vm.temp.toAddrRemark = [
          "醫院診所",
          "洗腎中心",
          "復健診所",
          "住家",
        ].includes(vm.temp.toAddrRemark)
          ? vm.temp.toAddrRemark
          : "其他";
        vm.temp.fromAddrRemark = [
          "醫院診所",
          "洗腎中心",
          "復健診所",
          "住家",
        ].includes(vm.temp.fromAddrRemark)
          ? vm.temp.fromAddrRemark
          : "其他";
        this.$set(vm.temp, "date", res.result.reserveDate.split(" ")[0]);
        this.$set(
          vm.temp,
          "time",
          res.result.reserveDate.split(" ")[1].slice(0, 5)
        );
      });
    },

    /* 記點 */
    handleViolation({ caseUserId, userId, id }) {
      const vm = this;
      vm.violationDialog = true;
      vm.violationTemp = {
        ...this.violationTemp,
        caseUserId,
        userId,
        orderId: id,
      };
    },

    /* 確認記點 */
    handleConfirmViolation() {
      const vm = this;
      this.$cl(vm.violationTemp);
      orderCaseUser.violation(vm.violationTemp).then((res) => {
        this.$cl(res);
        vm.violationTemp.point = 0;
        vm.violationTemp.remark = "";
        vm.violationDialog = false;
      });
    },

    /* 篩選訂單狀態 */
    handleSort(a) {
      this.listQuery.Status = a * 1;
      this.getList();
    },

    /* 快速預約 */
    handleDespatch(order) {
      const vm = this;
      vm.$router.push(
        `/ordercaseuser/dispatch/${order.userId}-${order.caseUserId}?orderId=${order.id}`
      );
    },

    /* 關閉編輯燈箱 */
    handleClose(status) {
      this.editDialog = status;
    },

    /* 編輯訂單 */
    handleEdit(data) {
      const vm = this;
      data.toAddrRemark =
        data.toAddrRemark === "其他" ? data.toRemark : data.toAddrRemark;
      data.fromAddrRemark =
        data.fromAddrRemark === "其他" ? data.fromRemark : data.fromAddrRemark;
      data.reserveDate = `${data.date} ${data.time}`;
      data.carCategoryName = vm.carCategorysList.filter((i) => {
        return i.value === data.carCategoryId;
      })[0].label;
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
    handleCancelOrder({ id }) {
      const vm = this;
      vm.$cl(id);
      orderCaseUser.getDetail({ orderId: id }).then((res) => {
        this.$cl(res);
        vm.cancelOrderTemp = res.result;
        vm.$nextTick(() => {
          vm.cancelDialog = true;
        });
      });
    },

    /* 確認取消訂單 */
    handleConfirmCancel() {
      const vm = this;
      if (vm.cancelTemp.remark == "") {
        vm.$alertT.fire({
          icon: "error",
          title: "請填寫記點原因",
        });
      } else {
        let params = {
          cancelRemark: "SYS_ORDERCANCEL_REMARK_ADMIN",
          hasVilation: true,
          id: vm.cancelOrderTemp.id,
          point: vm.cancelTemp.point,
          remark: vm.cancelTemp.remark,
        };
        console.log(params);
        orderCaseUser.cancel(params).then((res) => {
          vm.$alertT.fire({
            icon: "success",
            title: res.message,
          });
          vm.cancelTemp.point = 0;
          vm.cancelTemp.remark = "";
          vm.cancelDialog = false;
          vm.getList();
        });
      }
    },

    /* 檢視訂單 */
    handleCheck({ id, userId, caseUserId }) {
      this.$router.push(
        `/ordercaseuser/check/${id}?userId=${userId}&caseUserId=${caseUserId}`
      );
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
  height: 160px;
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

  .shared {
    color: $--color-success;
  }
  .notShared {
    color: $--color-danger;
  }
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

.greyBox {
  background: #eeeeee;
  padding: 1rem;
  border-radius: 0.25rem;
}

.cancelBottom {
  padding: 1rem;
  padding-bottom: 0;
}
.greyLabel {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #000000;
  margin-right: 0.5rem;
  margin-bottom: 1rem;
  width: 4.5rem;
}
.greyValue {
  display: inline-block;
}
.cancelViolateTitle {
  color: #000000;
  margin-bottom: 1rem;
}
.cancelTodo {
  color: red;
  padding: 0 2em;
  font-weight: normal;
  margin-bottom: 1rem;
  text-indent: -2em;
}
.icon-InfoCircle {
  font-size: 8px;
}
</style>
