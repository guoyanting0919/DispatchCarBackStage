<template>
  <div class="flex-column dispatch" style="height: calc(100% - 20px)">
    <BatchLoader @handleClose="handleCloseLoader" :isShow="batchLoaderShow" :totalDataCount="totalDataCount" :currentDataIndex="currentDataIndex" :errorDataArray="errorDataArray" />
    <!-- <div id="map" ref="map" style="width: 0%; height: 0%"></div> -->
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <!-- 長照調度台 -->
    <div class="app-container flex-item">
      <Title title="長照調度台"></Title>

      <div class="bg-white" style="height: calc(100% - 50px); padding: 0 16px;overflow:auto">
        <!-- 新訂單 -->
        <SubTitle title="新訂單">
          <template v-slot:btn>
            <i @click="handelToggle" class="iconfont icon-mouse toogleBtn"></i>
          </template>
        </SubTitle>

        <div class="bg-white newOrderContainer" v-if="toggle">
          <p style="color: red; font-size: 14px; width: 100%; text-align: center" v-if="newOrderList.length == 0">
            暫無新訂單
          </p>
          <transition-group name="fade-transform" mode="out-in" class="cardContainer">
            <OrderCard v-for="item in newOrderList" :key="item.id" :order="item" @handleReceive='handleReceive' @handleTrans='handleTrans' @handleCancle='handleCancle'></OrderCard>
          </transition-group>
        </div>

        <SubTitle title="調度台"></SubTitle>
        <!-- 條件篩選 -->
        <el-date-picker value-format="yyyy-MM-dd" @change="getList" placeholder="選擇日期" size="mini" style="width: 200px; margin: 0 " v-model="listQuery.StartDate" type="date">
        </el-date-picker>

        <el-input style="width: 200px; margin-left: 0.5rem" size="mini" v-model="listQuery.key" clearable placeholder="請輸入關鍵字"></el-input>

        <!-- 列表 -->
        <el-table ref="mainTable" :data="list" border fit v-loading="listLoading" highlight-current-row @selection-change="handleSelectionChange" style="width: 100% ;margin-top:8px">
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

          <el-table-column property="totalAmt" label="預估總額" width="100" align="center">
            <template slot-scope="scope" v-if="scope.row.data">
              <p class="dataInner" v-for="item in scope.row.data" :key="item.id">$ {{item.totalAmt}}</p>
            </template>
          </el-table-column>

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

          <el-table-column property="familyWith" label="陪同人數" width="100" align="center">
            <template slot-scope="scope" v-if="scope.row.data">
              <p class="dataInner" v-for="item in scope.row.data" :key="item.id">{{item.familyWith}}</p>
            </template>
          </el-table-column>

          <el-table-column property="canShared" label="共乘" width="100" align="center">
            <template slot-scope="scope">
              {{scope.row.canShared ? '是' :'否'}}
            </template>
          </el-table-column>

          <!-- <el-table-column property="canShared" label="編輯訂單" width="100" align="center">
            <template slot-scope="scope">
            
            </template>
          </el-table-column> -->

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

    <!-- Dialog -->
    <!-- eidt dialog -->
    <EditDialog :tempObj="temp" :editDialogProp="editDialog" :carCategorysList="carCategorysList" @handleEdit="handleEdit" @handleClose="handleClose"></EditDialog>

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

    <!-- dispatch dialog -->
    <el-dialog title="請選擇預約乘車個案" :visible.sync="coDialog" width="400px">
      <div class="coDialogBody">
        <el-select style="width: 300px" v-model="dispatchCaseUser" filterable size="mini" placeholder="選擇預約乘車個案">
          <el-option v-for="user in caseUserList" :key="user.caseUserId" :label="`${user.name}/${user.caseUserNo}`" :value="user.userId">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="coDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleDispatch">確 定</el-button>
      </span>
    </el-dialog>

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
        <el-button type="primary" @click="handleSetCarPool">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template> 

<script>
import moment from "moment";
import { mapGetters } from "vuex";

import Sticky from "@/components/Sticky";
import SubTitle from "@/components/SubTitle";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import OrderStatusTag from "@/components/OrderStatusTag";
import EditDialog from "@/components/Dialog/editCaseUserDespatch";
import OrderCard from "@/components/OrderCardCase";
import BatchLoader from "@/components/BatchLoader";

import * as orderCaseUser from "@/api/orderCaseUser";
import * as drivers from "@/api/drivers";
import * as cars from "@/api/cars";
import * as dispatchs from "@/api/dispatchs";
import * as caseUsers from "@/api/caseUsers";
import * as category from "@/api/categorys";
export default {
  name: "dispatch",
  components: {
    Sticky,
    SubTitle,
    Title,
    permissionBtn,
    Pagination,
    OrderStatusTag,
    EditDialog,
    OrderCard,
    BatchLoader,
  },
  computed: {
    ...mapGetters(["defaultorgid"]),
  },
  filters: {
    reserveFilter(date) {
      let time = date.split(" ")[1];
      let hr = time.split(":")[0];
      let min = time.split(":")[1];
      return `${hr}:${min}`;
    },
    minFilter(min) {
      let selfMin = Math.ceil(min);
      return `${selfMin}分鐘`;
    },
  },
  data() {
    return {
      /* 長照個案列表 */
      caseUserList: [],
      dispatchCaseUser: "",
      /* 司機列表 */
      driverList: [],
      /* 車輛列表 */
      carList: [],
      /* 無組織訂單 */
      newOrderList: [],
      /* 車輛類別 */
      carCategorysList: [],

      /* batch loader */
      batchLoaderShow: false,
      totalDataCount: 0,
      currentDataIndex: 0,
      errorDataArray: [],

      toggle: true,

      /* table */
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        key: undefined,
        StartDate: null,
        EndDate: null,
      },
      multipleSelection: [],
      spanArr: [],
      pos: "",

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
      orderTemp: {
        carId: null,
        carNo: "",
        driverInfoId: null,
        driverInfoName: "",
        id: [],
      },

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

      /* changeOrder */
      changeOrder: [],

      /* dialog */
      editDialog: false,
      changeDialog: false,
      coDialog: false,
      carPoolDialog: false,

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
        case "dispatch":
          this.coDialog = true;
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
      orderCaseUser.loadDespatch(vm.listQuery).then((res) => {
        vm.list = res.data.map((d) => {
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
      await orderCaseUser.loadNoOrg().then((res) => {
        vm.newOrderList = res.result;
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
      category.getSimpleList(query).then((res) => {
        vm.carCategorysList = res.result.filter((car) => {
          return (
            car.value === "SYS_CAR_GENERAL" || car.value === "SYS_CAR_WEAL"
          );
        });
      });
    },

    /* 獲取長照用戶資料 */
    getCaseUserList() {
      const vm = this;
      vm.listLoading = true;
      caseUsers.load({ limit: 9999, page: 1 }).then((res) => {
        vm.caseUserList = res.data;
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
          orderCaseUser.remove(ids).then((res) => {
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

    /* 檢查車輛類別是否吻合訂單所需車種 */
    checkCarType(order, car) {
      if (order.carCategoryId === "SYS_CAR_GENERAL") {
        return false;
      } else {
        return order.carCategoryId !== car.carCategoryId;
      }
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
      // console.log("a");
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

    /* 排班車輛檢核 */
    dispatchCarFilter(data = [], rowData) {
      // return data;
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
              return item.seatNum >= rowData.familyWith + 1;
            }
            // 若 這一張訂單車種 不等於 一般車，則 座位數量 必須 大於等於 訂單的陪同人數
            else {
              return item.seatNum >= rowData.familyWith;
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
                    ? currentValue.familyWith + 1
                    : currentValue.familyWith),
                0
              )
            );
          },
        ].every((it) => it());
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
                    ? currentValue.familyWith + 1
                    : currentValue.familyWith),
                0
              )
            );
          },
        ].every((it) => it());
      });
    },

    /* 接收訂單 */
    handleReceive(orderId) {
      const vm = this;
      orderCaseUser.acceptOrder({ id: orderId }).then((res) => {
        console.log(res);

        vm.getList();
        vm.getListNoOrg();
      });
    },

    /* 轉單 */
    handleTrans(orderId) {
      const vm = this;
      orderCaseUser.transOrder({ id: orderId }).then((res) => {
        console.log(res);
        vm.getList();
        vm.getListNoOrg();
      });
    },

    /* 取消 */
    handleCancle(orderId) {
      const vm = this;
      orderCaseUser
        .cancel({
          id: orderId,
          cancelRemark: "SYS_ORDERCANCEL_REMARK_CLIENT_NOORG",
        })
        .then((res) => {
          console.log(res);
          vm.getList();
          vm.getListNoOrg();
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
          let canUseCars = vm.changeDriverFilter(cars, row);
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
              return item.seatNum >= data?.data[0].familyWith + 1;
            }
            // 若 這一張訂單車種 不等於 一般車，則 座位數量 必須 大於等於 訂單的陪同人數
            else {
              return item.seatNum >= data?.data[0].familyWith;
            }
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

    /* 延遲 */
    delay(time) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, time);
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
      orderCaseUser.cancel(params).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.getList();
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

    /* 獲取單筆訂單資料 */
    getOrder({ id }) {
      const vm = this;
      vm.editDialog = true;
      orderCaseUser.get({ id }).then((res) => {
        console.log(res);
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

    /* 預約訂車 */
    handleDispatch() {
      const vm = this;
      if (vm.dispatchCaseUser == "") {
        vm.$alertT.fire({
          icon: "error",
          title: "請選擇預約乘車個案",
        });
      } else {
        let routeParams = vm.caseUserList.filter((u) => {
          return u.userId === vm.dispatchCaseUser;
        })[0];
        vm.coDialog = false;
        vm.$router.push(
          `/tabledispatchcaseuser/dispatch/${routeParams.userId}-${routeParams.caseUserId}`
        );
      }
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

    /* 隱藏/顯示新訂單 */
    handelToggle() {
      const vm = this;
      vm.toggle = !vm.toggle;
    },

    /* 關閉loader */
    handleCloseLoader() {
      this.batchLoaderShow = false;
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
    this.listQuery.StartDate = moment(new Date()).format("yyyy-MM-DD");
    //FIXME:
    // this.listQuery.StartDate = "2021-02-09";
    this.getDriverList();
    this.getCarList();
    this.getCarCategorys();
    this.getCaseUserList();
    await this.getListNoOrg();
    this.getList();
  },
};
</script>

<style lang='scss' scoped>
.orderAddr {
  padding-left: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: 45px;
  position: relative;

  .icon-circle {
    font-weight: 500;
    color: #fa8c16;
    position: absolute;
    left: -9px;
    top: -1px;
  }

  .icon-Vector10 {
    font-weight: 500;
    color: #fa8c16;
    position: absolute;
    left: -9px;
    bottom: -1px;
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