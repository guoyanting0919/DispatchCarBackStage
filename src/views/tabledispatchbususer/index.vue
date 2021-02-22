<template>
  <div class="flex-column dispatch" style="height: calc(100% - 20px)">
    <BatchLoader @handleClose="handleCloseLoader" :isShow="batchLoaderShow" :totalDataCount="totalDataCount" :currentDataIndex="currentDataIndex" :errorDataArray="errorDataArray" />
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 非權限按鈕 -->
        <el-date-picker value-format="yyyy-MM-dd" @change="getList" placeholder="選擇日期" size="mini" style="width: 200px; margin: 0 " v-model="listQuery.StartDate" type="date">
        </el-date-picker>

        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <!-- 幸福巴士調度台 -->
    <div class="app-container flex-item">
      <Title title="幸福巴士調度台"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table ref="mainTable" height="calc(100% - 52px)" :data="list" border fit v-loading="listLoading" highlight-current-row @selection-change="handleSelectionChange" style="width: 100%">
          <el-table-column type="selection" width="55" align="center"></el-table-column>

          <!-- <el-table-column align="center" property="despatchNo" label="訂單編號" width="200"></el-table-column> -->

          <el-table-column align="center" property="userName" label="姓名" width="140">
            <template slot-scope="scope" v-if="scope.row.data">
              <p class="dataInner" v-for="item in scope.row.data" :key="item.id">{{item.name}}</p>
            </template>
          </el-table-column>

          <el-table-column align="center" property="status" label="訂單狀態" width="100">
            <template slot-scope="scope">
              <p class="dataInner" v-for="item in scope.row.data" :key="item.id">
                <!-- <OrderStatusTag :type="orderStatusMapping[item.status - 1]" :cancelRemark="cancelRemarkList[item.cancelReamrk]"></OrderStatusTag> -->
                <OrderStatusTag :type="orderStatusMapping[item.status - 1]"></OrderStatusTag>
              </p>
            </template>
          </el-table-column>

          <el-table-column property="driver" label="司機" width="200" align="center">
            <template slot-scope="scope">
              <el-select @change="handleDriverChange(scope.row)" v-model="scope.row.driverInfoId" filterable size="mini" placeholder="選擇司機" :disabled="scope.row.data[0].status != 1">
                <el-option v-for="driver in driverList" :key="driver.id" :label="driver.name" :value="driver.id">
                  {{ driver.name }} / {{ driver.phone }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column property="car" label="車輛" width="200" align="center">
            <template slot-scope="scope">
              <el-select @change="handleCarChange(scope.row)" v-model="scope.row.carId" filterable size="mini" placeholder="選擇車輛" :disabled="scope.row.data[0].status != 1">
                <el-option v-for="car in dispatchCarFilter(carList, scope.row.data[0])" :key="car.id" :label="car.carNo" :value="car.id">
                  {{ car.seatNum }}人座 / {{ car.carNo }} / {{car.driverName}}
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column property="reserveDate" label="預約乘車時間" width="200" align="center">
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ scope.row.reserveDate | dateFilter }}
              </span>
            </template>
          </el-table-column>

          <el-table-column property="stationLineName" label="預約路線" width="250" align="center">
            <template slot-scope="scope">
              {{scope.row.data[0].stationLineName}}
            </template>
          </el-table-column>

          <el-table-column property="name" label="起迄站" width="150">
            <template slot-scope="scope" v-if="scope.row.data">
              <p class="textNoWrap" v-for="item in scope.row.data" :key="item.id"> <i class="iconfont icon-circle"></i>{{item.fromStationName}}<br /> <i class="iconfont icon-Vector10"></i>{{item.toStationName}}</p>
            </template>
          </el-table-column>

          <el-table-column property="passengerNum" label="陪同人數" width="100" align="center">
            <template slot-scope="scope" v-if="scope.row.data">
              <p class="dataInner" v-for="item in scope.row.data" :key="item.id">{{item.passengerNum}}</p>
            </template>
          </el-table-column>

          <el-table-column align="center" :label="'操作'" fixed="right" width="300">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <div style="margin-right:10px">
                  <p class="dataInner" v-for="item in scope.row.data" :key="item.id">
                    <el-button type="success" size="mini" v-if="scope.row.data[0].status <= 3" @click="getOrder(item)">
                      編輯訂單
                    </el-button>
                  </p>
                </div>
                <el-button type="info" size="mini" v-if="scope.row.data[0].status == 1" @click="handleRoster(scope.row)">
                  排班
                </el-button>
                <el-button type="warning" size="mini" v-if="scope.row.data[0].status ==2" @click="handleChangeDC(scope.row);">
                  變更司機車輛
                </el-button>
                <el-button size="mini" type="danger" v-if="scope.row.data[0].status == 2" @click="handleCancelDispatch(scope.row.despatchNo)">
                  取消排班
                </el-button>
                <el-button size="mini" type="danger" v-if="scope.row.status == 1" @click="handleCancelOrder(scope.row.id)">
                  取消訂單
                </el-button>
              </div>
            </template>
          </el-table-column>

          <!--           <el-table-column align="center" :label="'操作'" fixed="right" width="300">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button type="info" size="mini" v-if="scope.row.status == 1" @click="handleRoster(scope.row)">排班</el-button>
                <el-button type="success" size="mini" v-if="scope.row.status == 1" @click="
                    editDialog = true;
                    getOrder(scope.row.id);
                  ">編輯訂單</el-button>
                <el-button type="warning" size="mini" v-if="scope.row.status !== 1 && scope.row.status !== 9" @click="
                    changeDialog = true;
                    handleChange(scope.row); 
                  ">變更司機車輛</el-button>
                <el-button size="mini" type="danger" v-if="scope.row.status !== 1 && scope.row.status !== 9" @click="handleCancelDispatch(scope.row.despatchNo)">取消排班</el-button>
                <el-button size="mini" type="danger" v-if="scope.row.status == 1" @click="handleCancelOrder(scope.row.id)">取消訂單</el-button>
              </div>
            </template>
          </el-table-column> -->

        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- 燈箱 -->

    <!-- eidt dialog -->
    <EditDialog :temp="temp" :editDialogProp="editDialog" :lineList="lineList" :stopList="stopList" :toLineStop="toLineStop" :lineStop="lineStop" @handleLineChange="handleLineChange" @handleFromChange="handleFromChange" @handleEdit="handleEdit" @handleClose="handleClose"></EditDialog>

    <!-- roster dialog -->
    <el-dialog title="批量排班" :visible.sync="rosterDialog" width="800px">
      <div class="rosterDialogBody">
        <el-form :label-position="labelPosition" label-width="200px" :model="temp" ref="form">
          <el-row :gutter="16">
            <el-col :sm="12" :md="12">
              <el-form-item label="司機">
                <el-select v-model="rosterDriver" filterable placeholder="選擇司機" style="width: 100%">
                  <el-option v-for="driver in driverList" :key="driver.id" :label="`${driver.userName} / ${driver.phone}`" :value="driver.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="12">
              <el-form-item label="車輛">
                <el-select v-model="rosterCar" filterable placeholder="選擇車輛" style="width: 100%">
                  <el-option v-for="car in isShareCarFilter()" :key="car.id" :label="`${car.carCategoryName} / ${car.seatNum}人座 / ${car.carNo}`" :value="car.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rosterDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleRosterOrders()">確 定</el-button>
      </span>
    </el-dialog>

    <!-- change dialog -->
    <el-dialog title="變更司機車輛" :visible.sync="changeDialog" width="800px">
      <div class="changeDialogBody">
        <el-form :label-position="labelPosition" label-width="200px" :model="temp" ref="form">
          <el-row :gutter="16">
            <el-col :sm="12" :md="12">
              <el-form-item label="司機">
                <el-select v-model="orderTemp.driverInfoId" filterable placeholder="選擇司機" style="width: 100%">
                  <el-option v-for="driver in driverList" :key="driver.id" :label="`${driver.name} / ${driver.phone}`" :value="driver.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="12">
              <el-form-item label="車輛">
                <el-select v-model="orderTemp.carId" filterable placeholder="選擇車輛" style="width: 100%">
                  <el-option v-for="car in changeCarFilter()" :key="car.id" :label="`${car.carCategoryName || '一般車'} / ${
                      car.seatNum
                    }人座 / ${car.carNo}`" :value="car.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmChange()">確 定</el-button>
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
import BatchLoader from "@/components/BatchLoader";
import EditDialog from "@/components/Dialog/editBusUserDespatch";

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
    EditDialog,
    BatchLoader,
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
        StartDate: "",
        EndDate: "",
        Status: -1,
        key: undefined,
        page: 1,
        limit: 10,
      },
      multipleSelection: [],

      /* 批次排班 */
      rosterDriver: "",
      rosterCar: "",

      /* batch loader */
      batchLoaderShow: false,
      totalDataCount: 0,
      currentDataIndex: 0,
      errorDataArray: [],

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
      /* changeOrder */
      changeOrder: [],

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
        case "batch":
          if (this.multipleSelection.length == 0) {
            this.$alertT.fire({
              icon: "error",
              title: `請勾選欲排班之訂單`,
            });
            return;
          }
          this.handleBatch(this.multipleSelection);
          break;
        default:
          break;
      }
    },

    /* 獲取派遣訂單 */
    getList() {
      const vm = this;
      vm.listLoading = true;

      vm.listQuery.EndDate = vm.listQuery.StartDate;

      orderBusUser.loadDespatch(vm.listQuery).then((res) => {
        vm.list = res.data.map((d) => {
          d.driver = "";
          d.car = "";
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

    /* 批量排班 */
    async handleBatch(items) {
      const vm = this;
      let flag = true;
      items.forEach((i) => {
        if (
          i.driverInfoId == null ||
          i.carId == null ||
          i.data[0].status != 1
        ) {
          flag = false;
        }
      });
      if (!flag) {
        vm.$alertM.fire({
          icon: "error",
          title: `請確認已勾選訂單都已確實選擇司機車輛且皆為新訂單`,
        });
      } else {
        vm.currentDataIndex = 0;
        vm.errorDataArray = [];
        //批次送出排班API
        vm.batchLoaderShow = true;
        vm.totalDataCount = items.length;
        for (let index = 0; index < items.length; index++) {
          await vm.delay(500);
          let data = {
            orderNosOrDespatchNos: [items[index].despatchNo],
            driverInfoId: items[index].driverInfoId,
            carId: items[index].carId,
            driverInfoName: vm.driverList.filter((d) => {
              return d.id == items[index].driverInfoId;
            })[0].name,
            carNo: vm.carList.filter((c) => {
              return c.id == items[index].carId;
            })[0].carNo,
          };
          dispatchs.addOrUpdateShare(data).then((res) => {
            vm.currentDataIndex = index + 1;
            data.index = vm.currentDataIndex;
            data.code = res.code;
            data.errorRemark = res.message || "";
            vm.errorDataArray.push(data);
            console.log(vm.errorDataArray);
            if (index == items.length - 1) {
              vm.getList();
            }
          });
        }
      }
    },

    /* 關閉loader */
    handleCloseLoader() {
      this.batchLoaderShow = false;
    },

    /* 延遲 */
    delay(time) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, time);
      });
    },

    /* 變更車輛 */
    handleCarChange(row, isTable = true) {
      const vm = this;
      if (!row.driverInfoId) {
        let car = vm.carList.filter((c) => c.id === row.carId)[0];
        row.driverInfoId = vm.driverList.filter(
          (d) => d.name === car.driverName
        )[0].id;
      }
      if (isTable) {
        vm.$nextTick(() => {
          vm.checkCarDriver(row);
        });
      }
    },

    /* 變更司機 */
    handleDriverChange(row, isTable = true, carData = []) {
      console.log(row, isTable, carData);
      const vm = this;
      if (isTable) {
        if (!row.carId) {
          let driver = vm.driverList.filter((d) => d.id === row.driverInfoId)[0]
            ?.name;
          let cars = vm.carList.filter((c) => c.driverName === driver);
          console.log(cars, row);
          let canUseCars = vm.changeDriverFilter(cars, row);
          this.$cl(canUseCars[0]?.id);
          row.carId = canUseCars[0]?.id;
        }
      } else {
        if (!row.carId) {
          let driver = vm.driverList.filter((d) => d.id === row.driverInfoId)[0]
            ?.name;
          let cars = carData.filter((c) => c.driverName === driver);
          row.carId = cars[0]?.id;
        }
      }
      if (isTable) {
        vm.$nextTick(() => {
          vm.checkCarDriver(row);
        });
      }
    },

    /* 變更司機時車輛篩選 */
    changeDriverFilter(cars = [], data = {}) {
      console.log(cars, data);
      return cars.filter((item) => {
        return [
          () => {
            if (item.status === 0) {
              return false;
            } else {
              return true;
            }
          },
          () => {
            return item.seatNum >= data.data[0].passengerNum;
          },
        ].every((it) => it());
      });
    },

    /* 司機車輛若有值則打勾 */
    checkCarDriver(row) {
      const vm = this;
      let checkRow = vm.multipleSelection.map((item) => item.despatchNo);
      if (row.carId && row.driverInfoId) {
        if (!checkRow.includes(row.despatchNo))
          vm.$refs.mainTable.toggleRowSelection(row);
      } else {
        if (checkRow.includes(row.despatchNo))
          vm.$refs.mainTable.toggleRowSelection(row);
      }
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
        orderNosOrDespatchNos: [order.despatchNo],
        driverInfoId: order.driverInfoId,
        carId: order.carId,
        driverInfoName: vm.driverList.filter((d) => {
          return d.id == order.driverInfoId;
        })[0].name,
        carNo: vm.carList.filter((c) => {
          return c.id == order.carId;
        })[0].carNo,
      };
      dispatchs.addOrUpdateShare(data).then((res) => {
        vm.$alertT.fire({
          icon: res.code == 200 ? "success" : "error",
          title: res.message,
        });
        vm.getList();
      });
    },

    /* 排班車輛檢核 */
    dispatchCarFilter(data = [], rowData) {
      return data.filter((item) => {
        return [
          () => {
            // 若 車輛 為 不可派發 (status === 0) ，則不能選
            if (item.status === 0) {
              return false;
            }
            // 若 車輛 為 可派發 (status !== 0) ，則可以選
            else {
              return true;
            }
          },
          () => {
            return item.seatNum >= rowData.passengerNum;
          },
        ].every((it) => it());
      });
    },

    /* 共乘車輛檢核 */
    isShareCarFilter() {
      let data = this.carList;
      let checkedRowsData = this.multipleSelection;
      return data.filter((item) => {
        return [
          () => {
            // 若 車輛 為 不可派發 (status === 0) ，則不能選
            if (item.status === 0) {
              return false;
            }
            // 若 車輛 為 可派發 (status !== 0) ，則可以選
            else {
              return true;
            }
          },
          () => {
            // 座椅數量 必須大於 所有訂單 (一般車訂單的陪同人數 + 1、福祉車訂單的陪同人數) 陪同人數 加總
            return (
              item.seatNum >=
              checkedRowsData.reduce(
                (accumulator, currentValue) =>
                  accumulator + currentValue.passengerNum,
                0
              )
            );
          },
        ].every((it) => it());
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

    /* 變更司機車輛 */
    handleChangeDC(order) {
      const vm = this;
      vm.changeOrder = order.data;
      vm.orderTemp = Object.assign({}, order); // copy obj
      vm.$nextTick(() => {
        vm.changeDialog = true;
      });
    },

    /* 變更司機車輛檢核 */
    changeCarFilter() {
      let data = this.carList;
      let checkedRowsData = this.changeOrder;
      return data.filter((item) => {
        return [
          () => {
            // 若 車輛 為 不可派發 (status === 0) ，則不能選
            if (item.status === 0) {
              return false;
            }
            // 若 車輛 為 可派發 (status !== 0) ，則可以選
            else {
              return true;
            }
          },
          () => {
            // 座椅數量 必須大於 所有訂單 (一般車訂單的陪同人數 + 1、福祉車訂單的陪同人數) 陪同人數 加總
            return (
              item.seatNum >=
              checkedRowsData.reduce(
                (accumulator, currentValue) =>
                  accumulator + currentValue.passengerNum,
                0
              )
            );
          },
        ].every((it) => it());
      });
    },

    /* 確認變更司機車輛 */
    handleConfirmChange() {
      const vm = this;
      let data = {
        orderNosOrDespatchNos: [vm.orderTemp.despatchNo],
        driverInfoId: vm.orderTemp.driverInfoId,
        carId: vm.orderTemp.carId,
        driverInfoName: vm.driverList.filter((d) => {
          return d.id == vm.orderTemp.driverInfoId;
        })[0].name,
        carNo: vm.carList.filter((c) => {
          return c.id == vm.orderTemp.carId;
        })[0].carNo,
      };
      dispatchs.addOrUpdateShare(data).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.changeDialog = false;
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
    getOrder({ id }) {
      const vm = this;
      vm.toLineStop = [];
      vm.lineStop = [];
      vm.editDialog = true;
      orderBusUser.get({ id }).then((res) => {
        this.$cl(res);
        vm.temp = Object.assign({}, res.result); // copy obj
        let date = vm.temp.reserveDate.split(" ")[0];
        let time = vm.temp.reserveDate.split(" ")[1].slice(0, 5);
        vm.$set(vm.temp, "date", date);
        vm.$set(vm.temp, "time", time);
        vm.$nextTick(() => {
          busStationLines.get({ id: vm.temp.stationLineId }).then((res) => {
            this.$cl(res);
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
    handleLineChange(id) {
      const vm = this;
      vm.lineStop = [];
      vm.temp.fromStationId = "";
      vm.temp.toStationId = "";
      busStationLines.get({ id }).then((res) => {
        vm.stopList.forEach((s) => {
          if (res.result.assignLineStations.includes(s.id)) {
            s.disabled = false;
            vm.lineStop.push(s);
          }
        });
      });
    },

    /* 選擇起點站 */
    handleFromChange(id) {
      const vm = this;
      vm.temp.toStationId = "";
      let fromId = id;
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

    /* 關閉編輯燈箱 */
    handleClose(status) {
      this.editDialog = status;
    },

    //變更司機車輛
    handleChange(order) {
      const vm = this;
      vm.orderTemp = Object.assign({}, order); // copy obj
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
    this.listQuery.StartDate = moment().format("yyyy-MM-DD");
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

.dataInner {
  margin: 1rem 0;
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