<template>
  <div class="flex-column dispatch" style="height: calc(100% - 20px)">
    <BatchLoader @handleClose="handleCloseLoader" :isShow="batchLoaderShow" :totalDataCount="totalDataCount" :currentDataIndex="currentDataIndex" :errorDataArray="errorDataArray" />
    <!-- <div id="map" ref="map" style="display:none"></div> -->
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 無權限權限按鈕 -->

        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <!-- 白牌車調度台 -->
    <div style="padding-bottom: 0px" class="app-container flex-item">
      <Title title="白牌車調度台"></Title>

      <div class="bg-white formContainer" style="height: calc(100% - 50px); padding: 0 16px">
        <!-- 新訂單 -->
        <SubTitle title="新訂單">
          <template v-slot:btn>
            <i @click="handelToggle" class="iconfont icon-mouse toogleBtn"></i>
          </template>
        </SubTitle>
        <div class="bg-white newOrderContainer" :class="{active:toggle}">
          <p style="color: red; font-size: 14px; width: 100%; text-align: center" v-if="newOrderList.length == 0">
            暫無新訂單
          </p>
          <transition-group name="fade-transform" mode="out-in" class="newOrderContainer">
            <OrderCard v-for="item in newOrderList" :key="item.id" :order="item" @handleReceive="handleReceive"></OrderCard>
          </transition-group>
        </div>

        <!-- 調度台 -->
        <SubTitle title="調度台"></SubTitle>

        <!-- 條件篩選 -->
        <el-date-picker @change="getList" size="mini" style="width: 350px; margin: 0 1rem" v-model="temp.dateRange" type="daterange" range-separator="至" start-placeholder="起始日期" end-placeholder="结束日期">
        </el-date-picker>

        <el-input style="width: 200px; margin-right: 0.5rem" size="mini" v-model="listQuery.key" clearable placeholder="請輸入關鍵字"></el-input>

        <el-select size="mini" @change="getList" v-model="listQuery.Status" placeholder="請選擇訂單狀態">
          <el-option label="所有狀態" :value="-1"></el-option>
          <el-option label="新訂單" :value='1'></el-option>
          <el-option label="已排班" :value="2"></el-option>
          <el-option label="已抵達" :value="3"></el-option>
          <el-option label="客上" :value="4"></el-option>
          <el-option label="完成" :value="5"></el-option>
          <el-option label="已取消" :value="9"> </el-option>
        </el-select>

        <el-button type="primary" style="margin: 0 1rem" size="mini" @click="getList">
          <i class="iconfont icon-search"></i>
        </el-button>

        <!-- table -->
        <div class="bg-white formContainer" style="height: 100%">
          <el-table ref="mainTable" height="calc(100% - 52px)" :data="list" border fit v-loading="listLoading" highlight-current-row @selection-change="handleSelectionChange" style="width: 100%">
            <el-table-column type="selection" width="55" align="center"></el-table-column>

            <el-table-column align="center" property="userName" label="姓名" width="140">
              <template slot-scope="scope" v-if="scope.row.data">
                <p class="dataInner" v-for="item in scope.row.data" :key="item.id">{{item.name}}</p>
              </template>
            </el-table-column>

            <el-table-column align="center" property="status" label="訂單狀態" width="100">
              <template slot-scope="scope">
                <p class="dataInner" v-for="item in scope.row.data" :key="item.id">
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
                    {{ car.carCategoryName || "一般車" }} / {{ car.seatNum }}人座
                    /
                    {{ car.carNo }} / {{car.driverName}}
                  </el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column align="center" property="reserveDate" label="預約乘車時間" width="150">
              <template slot-scope="scope">
                <p class="dataInner" v-for="item in scope.row.data" :key="item.id">
                  {{item.reserveDate | globalDateFilter("yyyy-MM-DD")}}
                  {{item.reserveDate | globalDateFilter("HH:mm")}}
                </p>
              </template>
            </el-table-column>

            <el-table-column align="center" property="expectedMinute" label="預估時間" width="120">
              <template slot-scope="scope">
                <p class="dataInner" v-for="item in scope.row.data" :key="item.id">{{item.expectedMinute}}分</p>
              </template>
            </el-table-column>

            <!-- <el-table-column property="totalAmt" label="預估總額" width="100" align="center">
              <template slot-scope="scope" v-if="scope.row.data">
                <p class="dataInner" v-for="item in scope.row.data" :key="item.id">$ {{item.totalAmt}}</p>
              </template>
            </el-table-column> -->

            <el-table-column align="center" property="carCategoryName" label="車種" width="200">
              <template slot-scope="scope" v-if="scope.row.data">
                <p class="dataInner" v-for="item in scope.row.data" :key="item.id">{{item.carCategoryName}}/{{item.wheelchairType}}</p>
              </template>
            </el-table-column>

            <el-table-column property="name" label="起迄點" width="300">
              <template slot-scope="scope" v-if="scope.row.data">
                <p class="textNoWrap" v-for="item in scope.row.data" :key="item.id"> <i class="iconfont icon-circle"></i>{{item.fromAddr}}<br /> <i class="iconfont icon-Vector10"></i>{{item.toAddr}}</p>
              </template>
            </el-table-column>

            <el-table-column property="passengerNum" label="陪同人數" width="100" align="center">
              <template slot-scope="scope" v-if="scope.row.data">
                <p class="dataInner" v-for="item in scope.row.data" :key="item.id">{{item.passengerNum}}</p>
              </template>
            </el-table-column>

            <el-table-column property="canShared" label="共乘" width="100" align="center">
              <template slot-scope="scope">
                {{scope.row.canShared ? '是' :'否'}}
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

          </el-table>
          <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
        </div>
      </div>
    </div>

    <!-- 燈箱 -->
    <!-- eidt dialog -->
    <EditDialog :tempObj="temp" :editDialogProp="editDialog" :carCategorysList="carCategorysList" :passengerArr="passengerArr" @carCategoryChange='carCategoryChange' @handleEdit="handleEdit" @handleClose="handleClose"></EditDialog>
    <!-- carPool dialog -->
    <el-dialog title="共乘設定" :visible.sync="carPoolDialog" width="650px">
      <div class="carPoolDialogBody">
        <el-form :label-position="labelPosition" label-width="200px" :model="temp" ref="form">
          <el-row :gutter="16">
            <el-col :sm="12" :md="24">
              <el-form-item label="選擇司機">
                <el-select @change="handleDriverChange(carPoolTemp,false,isShareCarFilter())" style="width: 100%" v-model="carPoolTemp.driverInfoId" placeholder="請選擇司機">
                  <el-option v-for="driver in driverList" :key="driver.id" :label="driver.name" :value="driver.id">
                    {{ driver.name }} / {{ driver.phone }}
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="24">
              <el-form-item label="選擇車輛">
                <el-select @change="handleCarChange(carPoolTemp,false)" style="width: 100%" v-model="carPoolTemp.carId" placeholder="請選擇車輛">
                  <el-option v-for="car in isShareCarFilter()" :key="car.id" :label="`${car.carCategoryName} / ${car.seatNum}人座 / ${car.carNo} / ${car.driverName}`" :value="car.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="carPoolDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleSetCarPool()">確 定</el-button>
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
                  <el-option v-for="driver in driverList" :key="driver.id" :label="driver.name" :value="driver.id">
                    {{ driver.name }} / {{ driver.phone }}
                  </el-option>
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
import { mapGetters } from "vuex";
import moment from "moment";
import * as signalR from "@aspnet/signalr";

import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import SubTitle from "@/components/SubTitle";
import Pagination from "@/components/Pagination";
import OrderStatusTag from "@/components/OrderStatusTag";
import OrderCard from "@/components/OrderCardSelfPay";
import BatchLoader from "@/components/BatchLoader";
import EditDialog from "@/components/Dialog/editSelfPayUserDespatch";

import * as orderSelfPayUser from "@/api/orderSelfPayUser";
import * as drivers from "@/api/drivers";
import * as cars from "@/api/cars";
import * as categorys from "@/api/categorys";
import * as dispatchs from "@/api/dispatchs";
export default {
  name: "selfPaydispatch",
  components: {
    Sticky,
    Title,
    permissionBtn,
    SubTitle,
    Pagination,
    OrderStatusTag,
    OrderCard,
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

      /* table */
      list: [],
      pos: "",
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

      /* order temp */
      orderTemp: [],

      /* 表單相關 */
      labelPosition: "top",
      passengerArr: [],
      passengerNum: 1,
      spanArr: [],
      temp: {
        /* vue.$set */
        date: "",
        time: "",
        dateRange: [],

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

      /* 共乘 car pool temp */
      carPoolTemp: {
        carId: null,
        carNo: "",
        driverInfoId: null,
        driverInfoName: "",
        id: [],
      },

      /* batch loader */
      batchLoaderShow: false,
      totalDataCount: 0,
      currentDataIndex: 0,
      errorDataArray: [],

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

      /* changeOrder */
      changeOrder: [],

      /* dialog */
      editDialog: false,
      carPoolDialog: false,
      changeDialog: false,

      /* 隱藏/顯示新訂單 */
      toggle: false,

      /* signalR */
      hubConnection: new signalR.HubConnectionBuilder()
        .withUrl("http://openauth.1966.org.tw/api/chatHub")
        .build(),

      value: "",
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
    /* 是否為移動端 */
    isMobile() {
      const vm = this;
      if (vm.$store.state.app.device === "mobile") {
        return null;
      } else {
        return "right";
      }
    },

    /* 權限按鈕 */
    onBtnClicked(domId) {
      this.$cl(domId);
      switch (domId) {
        case "delete":
          this.handleDeleteOrders(this.multipleSelection);
          break;
        case "carPool":
          this.isShare();
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
      vm.listQuery.StartDate = moment(vm.temp.dateRange?.[0]).format(
        "yyyy-MM-DD"
      );
      vm.listQuery.EndDate = vm.listQuery.StartDate;
      orderSelfPayUser.LoadWithDespatch(vm.listQuery).then((res) => {
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

    /* 獲取無組織訂單 */
    async getListNoOrg() {
      const vm = this;
      await orderSelfPayUser.loadNoOrg({ key: undefined }).then((res) => {
        vm.newOrderList = res.data;
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
      cars.load({ limit: 9999, page: 1 }).then((res) => {
        vm.carList = res.data.filter((car) => {
          return (
            car.carCategoryId === "SYS_CAR_GENERAL" ||
            car.carCategoryId === "SYS_CAR_WEAL"
          );
        });
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
      // console.log(cars, data);
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
            // 若 有某一張定單 車種 不等於 一般車，那只能是 福祉車
            if (data?.data[0].carCategoryName !== "一般車") {
              return item.carCategoryName !== "一般車";
            }
            // 若 有某一張定單 車種 等於 一般車，那可以是 一般車、福祉車
            else {
              return true; // 車種只有 一般車、福祉車 所以都通過
            }
          },
          () => {
            // 若 這一張訂單輪椅類型 不等於 ( "無" 或 "普通輪椅(可收折)" )，那 輪椅數量 要大於等於 1
            if (
              !["無", "普通輪椅(可收折)"].includes(data?.data[0].wheelchairType)
            ) {
              return item.wheelchairNum >= 1;
            }
            // 若 這一張訂單輪椅類型 等於 ( "無" 或 "普通輪椅(可收折)" )，那 輪椅數量 要大於等於 0
            else {
              return item.wheelchairNum >= 0;
            }
          },
          () => {
            // 若 這一張訂單車種 等於 一般車，則 座位數量 必須 大於等於 訂單的陪同人數 + 1
            if (data?.data[0].carCategoryName === "一般車") {
              return item.seatNum >= data?.data[0].passengerNum + 1;
            }
            // 若 這一張訂單車種 不等於 一般車，則 座位數量 必須 大於等於 訂單的陪同人數
            else {
              return item.seatNum >= data?.data[0].passengerNum;
            }
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

    /* 當車輛類型改變時清空輪椅類型 */
    carCategoryChange() {
      this.temp.wheelchairType = "";
    },

    /* 獲取單筆訂單資料 */
    getOrder({ id }) {
      const vm = this;
      vm.editDialog = true;
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
          orderSelfPayUser.remove(ids).then((res) => {
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

    /* 接收訂單 */
    handleReceive(orderId) {
      const vm = this;
      console.log(orderId);
      orderSelfPayUser.acceptOrder({ orderId }).then((res) => {
        this.$cl(res);
        vm.getList();
        vm.getListNoOrg();
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
            // 若 這一張訂單車種 不等於 一般車，那只能是 福祉車
            if (rowData.carCategoryName !== "一般車") {
              return item.carCategoryName !== "一般車";
            }
            // 若 這一張訂單車種 等於 一般車，那可以是 一般車、福祉車
            else {
              return true; // 車種只有 一般車、福祉車 所以都通過
            }
          },
          () => {
            // 若 這一張訂單輪椅類型 不等於 ( "無" 或 "普通輪椅(可收折)" )，那 輪椅數量 要大於等於 1
            if (!["無", "普通輪椅(可收折)"].includes(rowData.wheelchairType)) {
              return item.wheelchairNum >= 1;
            }
            // 若 這一張訂單輪椅類型 等於 ( "無" 或 "普通輪椅(可收折)" )，那 輪椅數量 要大於等於 0
            else {
              return item.wheelchairNum >= 0;
            }
          },
          () => {
            // 若 這一張訂單車種 等於 一般車，則 座位數量 必須 大於等於 訂單的陪同人數 + 1
            if (rowData.carCategoryName === "一般車") {
              return item.seatNum >= rowData.passengerNum + 1;
            }
            // 若 這一張訂單車種 不等於 一般車，則 座位數量 必須 大於等於 訂單的陪同人數
            else {
              return item.seatNum >= rowData.passengerNum;
            }
          },
        ].every((it) => it());
      });
    },

    /* 共乘車輛檢核 */
    isShareCarFilter() {
      let data = this.carList;
      let checkedRowsData = [];
      this.multipleSelection.forEach((option) => {
        option.data.forEach((data) => {
          checkedRowsData.push(data);
        });
      });
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
            // 若 有某一張定單 車種 不等於 一般車，那只能是 福祉車
            if (checkedRowsData.some((el) => el.carCategoryName !== "一般車")) {
              return item.carCategoryName !== "一般車";
            }
            // 若 有某一張定單 車種 等於 一般車，那可以是 一般車、福祉車
            else {
              return true; // 車種只有 一般車、福祉車 所以都通過
            }
          },
          () => {
            return (
              item.wheelchairNum >=
              checkedRowsData.reduce(
                (accumulator, currentValue) =>
                  accumulator +
                  (["無", "普通輪椅(可收折)"].includes(
                    currentValue.wheelchairType
                  )
                    ? 0
                    : 1),
                0
              )
            );
          },
          () => {
            // 座椅數量 必須大於 所有訂單 (一般車訂單的陪同人數 + 1、福祉車訂單的陪同人數) 陪同人數 加總
            return (
              item.seatNum >=
              checkedRowsData.reduce(
                (accumulator, currentValue) =>
                  accumulator +
                  (currentValue.carCategoryName === "一般車"
                    ? currentValue.passengerNum + 1
                    : currentValue.passengerNum),
                0
              )
            );
          },
        ].every((it) => it());
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
      orderSelfPayUser.cancel(params).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.getList();
      });
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

    /* 關閉編輯燈箱 */
    handleClose(status) {
      this.editDialog = status;
    },

    /* 判斷可否共乘 */
    isShare() {
      const vm = this;
      let canShare = true;
      vm.multipleSelection.forEach((i) => {
        if (!i.canShared) canShare = false;
      });
      if (canShare && vm.multipleSelection.length >= 2) {
        vm.carPoolTemp = {
          carId: null,
          carNo: "",
          driverInfoId: null,
          driverInfoName: "",
          id: [],
        };
        vm.carPoolDialog = true;
      } else {
        vm.$alertM.fire({
          icon: "error",
          title: `請勾選兩張(含)以上訂單並確認個別訂單是否願意共乘`,
        });
      }
    },

    /* 確認共乘 */
    handleSetCarPool() {
      const vm = this;
      if (vm.carPoolTemp.driverInfoId == null || vm.carPoolTemp.carId == null) {
        vm.$alertM.fire({
          icon: "error",
          title: `請確實選擇司機及車輛`,
        });
        return;
      }
      let data = {
        orderNosOrDespatchNos: vm.multipleSelection.map((i) => {
          return i.despatchNo;
        }),
        driverInfoId: vm.carPoolTemp.driverInfoId,
        carId: vm.carPoolTemp.carId,
        driverInfoName: vm.driverList.filter((d) => {
          return d.id == vm.carPoolTemp.driverInfoId;
        })[0].name,
        carNo: vm.carList.filter((c) => {
          return c.id == vm.carPoolTemp.carId;
        })[0].carNo,
      };
      dispatchs.addOrUpdateShare(data).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.carPoolDialog = false;
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
            // 若 有某一張定單 車種 不等於 一般車，那只能是 福祉車
            if (checkedRowsData.some((el) => el.carCategoryName !== "一般車")) {
              return item.carCategoryName !== "一般車";
            }
            // 若 有某一張定單 車種 等於 一般車，那可以是 一般車、福祉車
            else {
              return true; // 車種只有 一般車、福祉車 所以都通過
            }
          },
          () => {
            return (
              item.wheelchairNum >=
              checkedRowsData.reduce(
                (accumulator, currentValue) =>
                  accumulator +
                  (["無", "普通輪椅(可收折)"].includes(
                    currentValue.wheelchairType
                  )
                    ? 0
                    : 1),
                0
              )
            );
          },
          () => {
            // 座椅數量 必須大於 所有訂單 (一般車訂單的陪同人數 + 1、福祉車訂單的陪同人數) 陪同人數 加總
            return (
              item.seatNum >=
              checkedRowsData.reduce(
                (accumulator, currentValue) =>
                  accumulator +
                  (currentValue.carCategoryName === "一般車"
                    ? currentValue.passengerNum + 1
                    : currentValue.passengerNum),
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

    /* 隱藏/顯示新訂單 */
    handelToggle() {
      const vm = this;
      vm.$cl(vm.toggle);
      vm.toggle = !vm.toggle;
    },

    /* signalR */
    /* 建立連線 */
    connectHub() {
      const vm = this;
      vm.hubConnection
        .start()
        .then(() => {
          vm.$cl("signalR success connect");
          vm.addListener();
          vm.addListenerReceive();
          vm.addToGroup();
        })
        .catch((err) => {
          this.$cl(err);
        });
    },

    /* 收到新訂單監聽 */
    addListener() {
      const vm = this;
      vm.hubConnection.on("ReceiveOrderMessage", function (order) {
        vm.$alertT.fire({
          icon: "success",
          title: "有一筆新訂單",
        });
        vm.newOrderList.push(order);
      });
    },

    /* 接收成功監聽 */
    addListenerReceive() {
      const vm = this;
      vm.hubConnection.on("ReceiveOrderHide", function (orderId) {
        vm.$alertT.fire({
          icon: "info",
          title: `訂單(${orderId})已被接收`,
        });
        vm.newOrderList = vm.newOrderList.filter(function (order) {
          return order.id != orderId;
        });
        vm.getList();
      });
    },

    /* 加入分組 */
    addToGroup() {
      const vm = this;
      vm.hubConnection
        .invoke("AddToGroup", vm.defaultorgid)
        .then(() => {
          vm.$cl("addToGroup success");
        })
        .catch(function (err) {
          return console.error(err);
        });
    },

    /* 換頁 */
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },

    /* table 功能 */
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
  },
  async mounted() {
    this.$set(this.temp.dateRange, 0, moment(new Date()).format("yyyy-MM-DD"));
    this.$set(this.temp.dateRange, 1, moment(new Date()).format("yyyy-MM-DD"));
    this.connectHub();
    this.getDriverList();
    this.getCarList();
    this.getCarCategorys();
    await this.getListNoOrg();
    this.getList();
  },

  beforeDestroy() {
    /* 離開頁面時中斷signalR連線 */
    this.hubConnection.stop();
  },
};
</script>
<style lang='scss' scoped>
// ::v-deep .hover-row > td {
//   background-color: initial !important;
// }
.newOrderContainer {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  transition: 0.5s;

  &.active {
    height: 0;
    overflow: hidden;
  }
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
.toogleBtn {
  margin-left: 0.5rem;
}
.dataInner {
  margin: 1rem 0;
}
.cardContainer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}
</style>