<template>
  <div class="flex-column orderBusUser">
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
      <Title title="巴士訂單"></Title>
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
                <p>乘車路線：{{ order.stationLineName }}</p>
                <p>預約時間：{{ order.reserveDate | dateFilter }}</p>
                <p>建立時間：{{ order.createDate | dateFilter }}</p>
                <!-- <p>行程：回程</p> -->
                <!-- <p>訂車人身分：B單位</p> -->
              </div>
            </div>
            <div class="orderCenter">
              <div class="orderCenterTitle">
                <p class="isCarpool"></p>
                <!-- <span>預估時間</span> -->

                <p>搭乘人數：{{ order.passengerNum }}人</p>
              </div>
              <div class="orderCenterDetail">
                <div class="driverInfo">
                  <div class="driverName">
                    {{ order.userName }}
                  </div>
                  <div class="userId">
                    聯絡電話：{{ order.noticePhone || "0934343234" }}
                  </div>
                  <i
                    style="margin-right: 4px"
                    class="iconfont icon-member"
                    v-for="item in order.passengerNum"
                    :key="item"
                  ></i>
                </div>
                <div class="addressInfo">
                  <p class="startAdd textNoWrap">
                    {{ order.fromStationName }}
                  </p>
                  <i class="iconfont icon-down"></i>
                  <p class="endAdd textNoWrap">{{ order.toStationName }}</p>
                </div>
              </div>
            </div>
            <div class="orderRight">
              <div class="orderRightTitle">
                <p class="orderStatus">
                  <OrderStatusTag
                    :type="orderStatusMapping[order.status - 1]"
                    size="mini"
                  ></OrderStatusTag>
                </p>
              </div>
              <div class="orderRightDetail">
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
                  <!-- <button class="orderButton orderStatus">修改狀態</button> -->
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
    <el-dialog
      title="編輯訂單"
      @closed="temp.passengerNum = 0"
      :visible.sync="editDialog"
      width="800px"
    >
      <div class="editDialogBody">
        <el-form
          :label-position="labelPosition"
          label-width="200px"
          :model="temp"
          ref="form"
        >
          <el-row :gutter="16">
            <el-col :sm="12" :md="8">
              <el-form-item label="預約日期">
                <el-date-picker
                  style="width: 100%"
                  v-model="temp.date"
                  type="date"
                  placeholder="選擇日期"
                  value-format="yyyy-MM-dd"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="預約時間">
                <el-time-select
                  style="width: 100%"
                  v-model="temp.time"
                  :picker-options="{
                    start: '08:30',
                    step: '00:15',
                    end: '18:30',
                  }"
                  placeholder="選擇時間"
                >
                </el-time-select>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="搭乘人數">
                <el-select
                  style="width: 100%"
                  v-model="temp.passengerNum"
                  placeholder="選擇搭乘人數"
                >
                  <el-option
                    v-for="num in 8"
                    :key="num"
                    :label="num"
                    :value="num"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="選擇路線">
                <el-select
                  style="width: 100%"
                  v-model="temp.stationLineId"
                  placeholder="選擇路線"
                  @change="handleLineChange()"
                >
                  <el-option
                    v-for="type in lineList"
                    :key="type.id"
                    :label="type.name"
                    :value="type.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="選擇起點站牌">
                <el-select
                  :disabled="temp.stationLineId == ''"
                  style="width: 100%"
                  v-model="temp.fromStationId"
                  placeholder="選擇路線"
                  @change="handleFromChange"
                >
                  <el-option
                    v-for="(type, idx) in lineStop"
                    :key="type.id"
                    :label="`${idx + 1}.${type.stationName}`"
                    :value="type.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="選擇終點站牌">
                <el-select
                  :disabled="temp.fromStationId == ''"
                  style="width: 100%"
                  v-model="temp.toStationId"
                  placeholder="選擇路線"
                >
                  <el-option
                    :disabled="type.disabled"
                    v-for="(type, idx) in toLineStop"
                    :key="type.id"
                    :label="`${idx + 1}.${type.stationName}`"
                    :value="type.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleEdit()">確 定</el-button>
      </span>
    </el-dialog>
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
import * as orderBusUser from "@/api/orderBusUser";
import * as categorys from "@/api/categorys";
import * as dispatch from "@/api/dispatchs";
import * as busStationLines from "@/api/busStationLines";
import * as busStations from "@/api/busStations";
export default {
  name: "orderBusUser",
  components: {
    Sticky,
    Title,
    permissionBtn,
    Pagination,
    OrderStatusTag,
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
      /* 路線 */
      lineList: [],
      /* 所有站牌 */
      stopList: [],
      /* 起點站牌 */
      lineStop: [],
      /* 終點站牌 */
      toLineStop: [],

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
      passengerNum: 1,
      temp: {
        date: "",
        time: "",

        id: "",
        busUserId: "",
        reserveDate: "",
        stationLineId: "",
        stationLineName: "",
        fromStationId: "",
        fromStationName: "",
        toStationId: "",
        toStationName: "",
        passengerNum: 0,
        remark: "",
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
  watch: {},
  methods: {
    /* 獲取訂單 */
    getList() {
      const vm = this;
      orderBusUser.load(vm.listQuery).then((res) => {
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
      categorys.getList(query).then((res) => {
        vm.carCategorysList = res.data;
      });
    },

    /* 獲取巴士路線資料 */
    getLineList() {
      const vm = this;
      let query = {
        page: 1,
        limit: 99,
        key: undefined,
      };
      busStationLines.load(query).then((res) => {
        res.data.forEach((r) => {
          r.weekArr = r.workWeek?.split(",");
          r.weekArr.sort();
        });
        vm.lineList = res.data;
      });
    },

    /* 獲取巴士站牌資料 */
    getStopList() {
      const vm = this;
      let query = {
        page: 1,
        limit: 999,
        key: undefined,
      };
      busStations.load(query).then((res) => {
        vm.stopList = res.data;
      });
    },

    /* 獲取單筆訂單資料 */
    getOrder(id) {
      const vm = this;
      vm.toLineStop = [];
      vm.lineStop = [];
      orderBusUser.get({ id }).then((res) => {
        vm.temp = Object.assign({}, res.result); // copy obj
        let date = vm.temp.reserveDate.split(" ")[0];
        let time = vm.temp.reserveDate.split(" ")[1].slice(0, 5);
        vm.$set(vm.temp, "date", date);
        vm.$set(vm.temp, "time", time);
        vm.$nextTick(() => {
          busStationLines.get({ id: vm.temp.stationLineId }).then((res) => {
            vm.stopList.forEach((s) => {
              if (res.result.assignLineStations.includes(s.id)) {
                s.disabled = false;
                vm.lineStop.push(s);
              }
              let fromId = vm.temp.fromStationId;
              let idFlag;
              vm.lineStop.forEach((s, idx) => {
                if (s.id == fromId) {
                  idFlag = idx;
                }
              });
              let cloneObj = Object.assign([], vm.lineStop);
              cloneObj.map((obj, index) => {
                if (index <= idFlag) {
                  obj.disabled = true;
                }
              });
              vm.toLineStop = cloneObj;
            });
          });
        });
      });
    },

    /* 選擇起點站 */
    handleFromChange() {
      const vm = this;
      vm.temp.toStationId = "";
      let fromId = vm.temp.fromStationId;
      let idFlag;
      vm.lineStop.forEach((s, idx) => {
        if (s.id == fromId) {
          idFlag = idx;
        }
      });
      let cloneObj = Object.assign([], vm.lineStop);
      cloneObj.map((obj, index) => {
        if (index <= idFlag) {
          obj.disabled = true;
        } else {
          obj.disabled = false;
        }
      });
      vm.toLineStop = cloneObj;
    },

    /* 確認編輯訂單 */
    handleEdit() {
      const vm = this;
      let date = moment(vm.temp.date).format("yyyy-MM-DD");
      vm.temp.reserveDate = `${date} ${vm.temp.time}`;
      vm.temp.stationLineName = vm.lineList.filter((l) => {
        return l.id === vm.temp.stationLineId;
      })[0].name;
      vm.temp.fromStationName = vm.lineStop.filter((s) => {
        return s.id === vm.temp.fromStationId;
      })[0].stationName;
      vm.temp.toStationName = vm.toLineStop.filter((s) => {
        return s.id === vm.temp.toStationId;
      })[0].stationName;

      orderBusUser.update(vm.temp).then((res) => {
        vm.editDialog = false;
        vm.getList();
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
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
      orderBusUser.cancel(params).then((res) => {
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
        path: `/orderbususer/check/${id}`,
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
    this.getLineList();
    this.getStopList();
    this.getList();
    this.getCarCategorys();
  },
};
</script>

<style lang="scss">
/* assets/css/views/order/orderSelfPayUser */
</style>
