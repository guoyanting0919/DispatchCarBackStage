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

    <!-- 長照調度台 -->
    <div class="app-container flex-item">
      <Title title="長照調度台"></Title>
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
            property="status"
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
                  :disabled="checkCarType(scope.row, car)"
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
            align="center"
            property="reserveDate"
            label="預約乘車時間"
            width="130"
          >
            <template slot-scope="scope">
              <span>
                {{ scope.row.reserveDate | reserveFilter }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
            align="center"
            property="expectedMinute"
            label="預估時間"
            width="120"
          >
            <template slot-scope="scope">
              <span>
                {{ scope.row.expectedMinute | minFilter }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
            property="totalAmt"
            label="預估總額"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <span> ${{ scope.row.totalAmt }} </span>
            </template>
          </el-table-column>

          <el-table-column
            align="center"
            property="carCategoryName"
            label="車種"
            width="150"
          >
            <template slot-scope="scope">
              <div style="text-align: left">
                <p>{{ scope.row.carCategoryName }}</p>
                <p>{{ scope.row.wheelchairType }}</p>
              </div>
            </template>
          </el-table-column>

          <el-table-column property="name" label="起迄點" width="300">
            <template slot-scope="scope">
              <div class="orderAddr">
                <i class="iconfont icon-circle"></i>
                <i class="iconfont icon-Vector10"></i>
                <p class="startAddr">
                  {{ scope.row.fromAddr }}
                </p>
                <p class="endAddr">{{ scope.row.toAddr }}</p>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            property="familyWith"
            label="陪同人數"
            width="100"
            align="center"
          >
          </el-table-column>

          <el-table-column
            property="canShared"
            label="共乘"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <p v-if="scope.row.canShared">是</p>
              <p v-else>否</p>
            </template>
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
              <el-form-item label="選擇路線"> </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="選擇起點站牌"> </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="選擇終點站牌"> </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleEdit()">確 定</el-button>
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
                    :disabled="checkCarType(orderTemp, car)"
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

    <!-- dispatch dialog -->
    <el-dialog
      title="請選擇預約乘車個案"
      :visible.sync="dispatchDialog"
      width="400px"
    >
      <div class="dispatchDialogBody">
        <el-select
          style="width: 300px"
          v-model="dispatchCaseUser"
          filterable
          size="mini"
          placeholder="選擇預約乘車個案"
        >
          <el-option
            v-for="user in caseUserList"
            :key="user.caseUserId"
            :label="`${user.name}/${user.caseUserNo}`"
            :value="user.userId"
          >
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dispatchDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleDispatch">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template> 

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import OrderStatusTag from "@/components/OrderStatusTag";
import * as orderCaseUser from "@/api/orderCaseUser";
import * as drivers from "@/api/drivers";
import * as cars from "@/api/cars";
import * as dispatchs from "@/api/dispatchs";
import * as caseUsers from "@/api/caseUsers";
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
    reserveFilter(date) {
      let time = date.split(" ")[1];
      let hr = time.split(":")[0];
      let min = time.split(":")[1];
      return `${hr}:${min}`;
    },
    minFilter(min) {
      // let selfMin = min.toString().split(".")[0];
      // let selSen = min.toString().split(".")[1] * 6;
      // return `${selfMin}分${selSen}秒`;
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
      changeDialog: false,
      dispatchDialog: false,

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
        case "dispatch":
          this.dispatchDialog = true;
          break;
        default:
          break;
      }
    },

    /* 獲取派遣訂單 */
    getList() {
      const vm = this;
      vm.listLoading = true;
      orderCaseUser.loadDespatch(vm.listQuery).then((res) => {
        vm.list = res.data.map((d) => {
          d.despatchNo = d.despatchNo ? d.despatchNo : d.orderNo;
          return d;
        });
        vm.total = res.count;
        vm.listLoading = false;
        vm.$cl(vm.list);
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

    /* 獲取長照用戶資料 */
    getCaseUserList() {
      const vm = this;
      vm.listLoading = true;
      caseUsers.load({ limit: 9999, page: 1 }).then((res) => {
        console.log(res.data);
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
    handleBatch(items) {
      const vm = this;
      vm.$cl(items);
      // 確認司機車輛都已勾選
      let flag = true;
      items.forEach((i) => {
        if (i.driverInfoId == null || i.carId == null) {
          flag = false;
        }
      });
      if (!flag) {
        vm.$alertM.fire({
          icon: "error",
          title: `請確認已勾選訂單都已確實選擇司機車輛`,
        });
      } else {
        //批次送出排班API
        for (let index = 0; index < items.length; index++) {
          let data = {
            id: [items[index].despatchNo],
            driverInfoId: items[index].driverInfoId,
            carId: items[index].carId,
            driverInfoName: vm.driverList.filter((d) => {
              return d.id == items[index].driverInfoId;
            })[0].userName,
            carNo: vm.carList.filter((c) => {
              return c.id == items[index].carId;
            })[0].carNo,
          };
          dispatchs.addOrUpdate(data).then((res) => {
            vm.$alertT.fire({
              icon: "success",
              title: res.message,
            });
            if (index == items.length - 1) {
              vm.getList();
            }
          });
        }
      }
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

    /* 編輯訂單 */
    handleEdit() {
      const vm = this;
      let date = moment(vm.temp.date).format("yyyy-MM-DD");
      vm.temp.reserveDate = `${date} ${vm.temp.time}`;

      orderCaseUser.update(vm.temp).then((res) => {
        vm.editDialog = false;
        vm.getList();
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
      });
    },

    /* 獲取單筆訂單資料 */
    getOrder(id) {
      this.$cl(id);
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
        vm.$cl(routeParams);
        vm.$router.push(`/alluser/addCaseUser/${this.multipleSelection[0].id}?fast=${this.multipleSelection[0].fast}`)
      }
    },

    /* 變更司機車輛 */
    handleChange(order) {
      const vm = this;
      vm.orderTemp = Object.assign({}, order); // copy obj
    },

    /* 確認變更司機車輛 */
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
    this.getDriverList();
    this.getCarList();
    this.getCaseUserList();
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
</style>