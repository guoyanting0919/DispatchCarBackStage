<template>
  <div class="flex-column dispatch" style="height: calc(100% - 20px)">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 非權限按鈕 -->
        <el-input
          style="width: 200px; margin-right: 0.5rem"
          size="mini"
          v-model="value"
          clearable
          placeholder="請輸入關鍵字"
        ></el-input>

        <!-- 權限按鈕 -->
        <permission-btn
          moduleName="builderTables"
          size="mini"
          v-on:btn-event="onBtnClicked"
        ></permission-btn>
      </div>
    </sticky>

    <!-- 幸福巴士調度台 -->
    <div class="app-container flex-item">
      <Title title="幸福巴士調度台"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table
          ref="mainTable"
          height="calc(100% - 52px)"
          :data="list"
          border
          fit
          v-loading="listLoading"
          highlight-current-row
          @selection-change="handleSelectionChange"
          style="width: 100%"
        >
          <el-table-column
            type="selection"
            width="55"
            align="center"
          ></el-table-column>
          <el-table-column
            align="center"
            property="userName"
            label="姓名"
            width="120"
          >
          </el-table-column>
          <el-table-column
            align="center"
            property="userName"
            label="訂單狀態"
            width="100"
          >
            <template slot-scope="scope">
              <OrderStatusTag
                :type="orderStatusMapping[scope.row.status - 1]"
              ></OrderStatusTag>
            </template>
          </el-table-column>

          <el-table-column
            property="driver"
            label="司機"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.driverInfoId"
                filterable
                size="mini"
                placeholder="選擇司機"
                :disabled="scope.row.status != 1"
              >
                <el-option
                  v-for="driver in driverList"
                  :key="driver.id"
                  :label="driver.userName"
                  :value="driver.id"
                >
                  {{ driver.userName }} / {{ driver.phone }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column
            property="car"
            label="車輛"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.carId"
                filterable
                size="mini"
                placeholder="選擇車輛"
                :disabled="scope.row.status != 1"
              >
                <el-option
                  v-for="car in carList"
                  :key="car.id"
                  :label="car.carNo"
                  :value="car.id"
                >
                  {{ car.carCategoryName || "一般車" }} / {{ car.seatNum }}人座
                  /
                  {{ car.carNo }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column
            property="reserveDate"
            label="預約乘車時間"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px"
                >{{ scope.row.reserveDate | dateFilter }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
            property="stationLineName"
            label="預約路線"
            width="150"
            align="center"
          >
          </el-table-column>

          <el-table-column property="name" label="起迄站" width="300">
            <template slot-scope="scope">
              <div class="orderAddr">
                <i class="iconfont icon-circle"></i>
                <i class="iconfont icon-Vector10"></i>
                <p class="startAddr">
                  {{ scope.row.fromStationName }}
                </p>
                <p class="endAddr">{{ scope.row.toStationName }}</p>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            property="passengerNum"
            label="搭乘人數"
            width="100"
            align="center"
          >
          </el-table-column>

          <el-table-column
            align="center"
            :label="'操作'"
            fixed="right"
            width="300"
          >
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button
                  type="info"
                  size="mini"
                  v-if="scope.row.status == 1"
                  @click="handleRoster(scope.row)"
                  >排班</el-button
                >
                <el-button
                  type="success"
                  size="mini"
                  v-if="scope.row.status == 1"
                  @click="
                    editDialog = true;
                    getOrder(scope.row.id);
                  "
                  >編輯訂單</el-button
                >
                <el-button
                  type="warning"
                  size="mini"
                  v-if="scope.row.status !== 1 && scope.row.status !== 9"
                  @click="
                    changeDialog = true;
                    handleChange(scope.row);
                  "
                  >變更司機車輛</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  v-if="scope.row.status !== 1 && scope.row.status !== 9"
                  @click="handleCancelDispatch(scope.row.despatchNo)"
                  >取消排班</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  v-if="scope.row.status == 1"
                  @click="handleCancelOrder(scope.row.id)"
                  >取消訂單</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 燈箱 -->

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

    <!-- roster dialog -->
    <el-dialog title="批量排班" :visible.sync="rosterDialog" width="800px">
      <div class="rosterDialogBody">
        <el-form
          :label-position="labelPosition"
          label-width="200px"
          :model="temp"
          ref="form"
        >
          <el-row :gutter="16">
            <el-col :sm="12" :md="12">
              <el-form-item label="司機">
                <el-select
                  v-model="rosterDriver"
                  filterable
                  placeholder="選擇司機"
                  style="width: 100%"
                >
                  <el-option
                    v-for="driver in driverList"
                    :key="driver.id"
                    :label="`${driver.userName} / ${driver.phone}`"
                    :value="driver.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="12">
              <el-form-item label="車輛">
                <el-select
                  v-model="rosterCar"
                  filterable
                  placeholder="選擇車輛"
                  style="width: 100%"
                >
                  <el-option
                    v-for="car in carList"
                    :key="car.id"
                    :label="`${car.carCategoryName || '一般車'} / ${
                      car.seatNum
                    }人座 / ${car.carNo}`"
                    :value="car.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rosterDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleRosterOrders()"
          >確 定</el-button
        >
      </span>
    </el-dialog>

    <!-- change dialog -->
    <el-dialog title="變更司機車輛" :visible.sync="changeDialog" width="800px">
      <div class="changeDialogBody">
        <el-form
          :label-position="labelPosition"
          label-width="200px"
          :model="temp"
          ref="form"
        >
          <el-row :gutter="16">
            <el-col :sm="12" :md="12">
              <el-form-item label="司機">
                <el-select
                  v-model="orderTemp.driverInfoId"
                  filterable
                  placeholder="選擇司機"
                  style="width: 100%"
                >
                  <el-option
                    v-for="driver in driverList"
                    :key="driver.id"
                    :label="`${driver.userName} / ${driver.phone}`"
                    :value="driver.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="12">
              <el-form-item label="車輛">
                <el-select
                  v-model="orderTemp.carId"
                  filterable
                  placeholder="選擇車輛"
                  style="width: 100%"
                >
                  <el-option
                    v-for="car in carList"
                    :key="car.id"
                    :label="`${car.carCategoryName || '一般車'} / ${
                      car.seatNum
                    }人座 / ${car.carNo}`"
                    :value="car.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmChange()"
          >確 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template> 

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import * as signalR from "@aspnet/signalr";
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import OrderStatusTag from "@/components/OrderStatusTag";
import * as orderBusUser from "@/api/orderBusUser";
import * as drivers from "@/api/drivers";
import * as cars from "@/api/cars";
import * as busStationLines from "@/api/busStationLines";
import * as busStations from "@/api/busStations";
import * as dispatchs from "@/api/dispatchs";
export default {
  name: "dispatch",
  components: {
    Sticky,
    Title,
    permissionBtn,
    Pagination,
    OrderStatusTag,
  },
  computed: {
    ...mapGetters(["defaultorgid"]),
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
      /* 司機列表 */
      driverList: [],
      /* 車輛列表 */
      carList: [],
      /* 無組織訂單 */
      newOrderList: [],
      /* 車輛類別 */
      carCategorysList: [],
      /* 路線 */
      lineList: [],
      /* 所有站牌 */
      stopList: [],
      /* 起點站牌 */
      lineStop: [],
      /* 終點站牌 */
      toLineStop: [],

      /* table */
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        key: undefined,
      },
      multipleSelection: [],

      /* 批次排班 */
      rosterDriver: "",
      rosterCar: "",

      /*  order temp */
      /* 表單相關 */
      labelPosition: "top",
      passengerArr: [],
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

      /* orderTemp */
      orderTemp: {},

      /* 共乘 car pool temp */
      carPoolTemp: {
        carId: null,
        carNo: "",
        driverInfoId: null,
        driverInfoName: "",
        id: [],
      },

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

      /* dialog */
      editDialog: false,
      rosterDialog: false,
      changeDialog: false,

      /* signalR */
      hubConnection: new signalR.HubConnectionBuilder()
        .withUrl("http://openauth.1966.org.tw/api/chatHub")
        .build(),

      value: "",
    };
  },
  methods: {
    /* 權限按鈕 */
    onBtnClicked(domId) {
      this.$cl(domId);
      switch (domId) {
        case "delete":
          this.handleDeleteOrders(this.multipleSelection);
          break;
        case "roster":
          this.handleCanRoster();

          break;
        default:
          break;
      }
    },

    /* 獲取派遣訂單 */
    getList() {
      const vm = this;
      vm.listLoading = true;
      orderBusUser.load(vm.listQuery).then((res) => {
        vm.list = res.data.map((d) => {
          d.despatchNo = d.despatchNo ? d.despatchNo : d.orderNo;
          return d;
        });
        vm.total = res.count;
        vm.listLoading = false;
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
      vm.listLoading = true;
      cars.load({ limit: 9999, page: 1 }).then((res) => {
        vm.carList = res.data;
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

    /* 批次刪除訂單 */
    handleDeleteOrders(car) {
      const vm = this;
      vm.$swal({
        title: "刪除提示",
        text: `確認刪除已選取訂單?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#227294",
        cancelButtonColor: "#d63737",
        confirmButtonText: "確定",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.value) {
          let ids = car.map((c) => c.id);
          orderBusUser.remove(ids).then((res) => {
            vm.$alertT.fire({
              icon: "success",
              title: res.message,
            });
            vm.getList();
          });
        } else {
          vm.$alertT.fire({
            icon: "info",
            title: `已取消刪除`,
          });
        }
      });
    },

    /* 排班 */
    handleRoster(order) {
      const vm = this;
      if (order.driverInfoId == null || order.carId == null) {
        vm.$alertM.fire({
          icon: "error",
          title: `請確實選擇司機及車輛`,
        });
        return;
      }
      let data = {
        id: [order.despatchNo],
        driverInfoId: order.driverInfoId,
        carId: order.carId,
        driverInfoName: vm.driverList.filter((d) => {
          return d.id == order.driverInfoId;
        })[0].userName,
        carNo: vm.carList.filter((c) => {
          return c.id == order.carId;
        })[0].carNo,
      };
      dispatchs.addOrUpdate(data).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.getList();
      });
    },

    /* 批量排班 */
    handleRosterOrders() {
      const vm = this;
      if (vm.rosterCar == "" || vm.rosterDriver == "") {
        vm.$alertM.fire({
          icon: "error",
          title: `請確實選擇司機及車輛`,
        });
        return;
      }
      let ids = [];
      vm.multipleSelection.forEach((o) => {
        ids.push(o.despatchNo);
      });
      let idLength = ids.length;
      let flag = 1;
      ids.forEach((id) => {
        let data = {
          id: [id],
          driverInfoId: vm.rosterDriver,
          carId: vm.rosterCar,
          driverInfoName: vm.driverList.filter((d) => {
            return d.id == vm.rosterDriver;
          })[0].userName,
          carNo: vm.carList.filter((c) => {
            return c.id == vm.rosterCar;
          })[0].carNo,
        };
        dispatchs.addOrUpdate(data).then((res) => {
          if (flag < idLength) {
            flag++;
          } else {
            vm.$alertT.fire({
              icon: "success",
              title: res.message,
            });
            vm.rosterDialog = false;
            vm.getList();
          }
        });
      });
    },

    /* 取消排班 */
    handleCancelDispatch(id) {
      const vm = this;
      dispatchs.cancel([id]).then((res) => {
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

    /* 編輯訂單 */
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

    /* 檢查是否可排班 */
    handleCanRoster() {
      const vm = this;
      if (vm.multipleSelection.length < 1) {
        vm.$alertM.fire({
          icon: "error",
          title: `請勾選欲排班之訂單`,
        });
      } else {
        let flag = vm.multipleSelection.filter((o) => {
          return o.status !== 1;
        });
        if (flag.length > 0) {
          vm.$alertM.fire({
            icon: "error",
            title: `請確認已勾選訂單狀態皆為新訂單`,
          });
        } else {
          vm.rosterCar = "";
          vm.rosterDriver = "";
          vm.rosterDialog = true;
        }
      }
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

    /* 選擇路線 */
    handleLineChange() {
      const vm = this;
      vm.lineStop = [];
      vm.temp.fromStationId = "";
      vm.temp.toStationId = "";
      busStationLines.get({ id: vm.temp.stationLineId }).then((res) => {
        vm.stopList.forEach((s) => {
          if (res.result.assignLineStations.includes(s.id)) {
            s.disabled = false;
            vm.lineStop.push(s);
          }
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

    //變更司機車輛
    handleChange(order) {
      const vm = this;
      vm.orderTemp = Object.assign({}, order); // copy obj
    },

    //確認變更司機車輛
    handleConfirmChange() {
      const vm = this;

      let data = {
        id: [vm.orderTemp.despatchNo],
        driverInfoId: vm.orderTemp.driverInfoId,
        carId: vm.orderTemp.carId,
        driverInfoName: vm.driverList.filter((d) => {
          return d.id == vm.orderTemp.driverInfoId;
        })[0].userName,
        carNo: vm.carList.filter((c) => {
          return c.id == vm.orderTemp.carId;
        })[0].carNo,
      };
      dispatchs.addOrUpdate(data).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.changeDialog = false;
        vm.getList();
      });
    },

    // 換頁
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    // table 功能
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
  },
  async mounted() {
    this.getLineList();
    this.getStopList();
    this.getDriverList();
    this.getCarList();
    this.getList();
  },
};
</script>

<style lang='scss' scoped>
.newOrderContainer {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
.orderCard {
  width: 320px;
  margin-right: 0.5rem;
  height: auto;
  background: #fff;
  border: 2px solid $--color-primary;
  border-top: 5px solid $--color-primary;
  border-radius: 0px 0px 8px 8px;
  margin-bottom: 1rem;
}
.orderCardTitle {
  height: 38px;
  color: #fff;
  background: $--color-primary;
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
  color: $--color-primary;
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
  border-left: 3px dotted $--color-primary;
  position: relative;

  .icon-circle {
    font-weight: 500;
    color: $--color-primary;
    position: absolute;
    left: -9px;
    top: -1px;
    background: #fff;
  }

  .icon-Vector10 {
    font-weight: 500;
    color: $--color-primary;
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
</style>