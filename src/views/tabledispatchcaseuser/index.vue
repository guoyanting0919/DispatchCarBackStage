<template>
  <div class="flex-column dispatch" style="height: calc(100% - 20px)">
    <div id="map" ref="map" style="width: 0%; height: 0%"></div>
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
          :span-method="objectSpanMethod"
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
                  v-for="car in dispatchCarFilter(carList, scope.row)"
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
                    getOrder(scope.row);
                  "
                  >編輯訂單</el-button
                >
                <el-button
                  type="warning"
                  size="mini"
                  v-if="scope.row.status !== 1 && scope.row.status !== 9"
                  @click="
                    changeDialog = true;
                    handleChangeDC(scope.row);
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
    <el-dialog title="編輯訂單" :visible.sync="editDialog" width="800px">
      <div class="editDialogBody">
        <el-form
          :label-position="labelPosition"
          label-width="200px"
          :model="temp"
          ref="form"
        >
          <el-row :gutter="16">
            <el-col :sm="12" :md="8">
              <el-form-item label="訂單編號">
                <el-input
                  disabled
                  style="width: 100%"
                  v-model="temp.despatchNo"
                >
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="訂車個案">
                <el-input disabled style="width: 100%" v-model="temp.userName">
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="身分證字號">
                <el-input disabled style="width: 100%" v-model="temp.uid">
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="聯絡電話">
                <el-input style="width: 100%" v-model="temp.noticePhone">
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="車種">
                <el-select
                  style="width: 100%"
                  v-model="temp.carCategoryId"
                  placeholder="選擇車種"
                  @change="temp.wheelchairType = ''"
                >
                  <el-option
                    v-for="type in carCategorysList"
                    :key="type.id"
                    :label="type.name"
                    :value="type.dtValue"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="輪椅">
                <el-select
                  clearable
                  v-model="temp.wheelchairType"
                  placeholder="請選擇輪椅"
                  style="width: 100%"
                >
                  <el-option
                    v-if="temp.carCategoryId === 'SYS_CAR_GENERAL'"
                    value="無"
                    label="無"
                    >無</el-option
                  >
                  <el-option
                    v-if="temp.carCategoryId === 'SYS_CAR_GENERAL'"
                    value="普通輪椅(可收折)"
                    label="普通輪椅(可收折)"
                    >普通輪椅(可收折)</el-option
                  >
                  <el-option
                    v-if="temp.carCategoryId === 'SYS_CAR_WEAL'"
                    value="普通輪椅"
                    label="普通輪椅"
                    >普通輪椅</el-option
                  >
                  <el-option
                    value="高背輪椅"
                    label="高背輪椅"
                    v-if="temp.carCategoryId === 'SYS_CAR_WEAL'"
                    >高背輪椅</el-option
                  >
                  <el-option
                    value="電動輪椅"
                    label="電動輪椅"
                    v-if="temp.carCategoryId === 'SYS_CAR_WEAL'"
                    >電動輪椅</el-option
                  >
                  <el-option
                    value="電動高背輪椅"
                    label="電動高背輪椅"
                    v-if="temp.carCategoryId === 'SYS_CAR_WEAL'"
                    >電動高背輪椅</el-option
                  >
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="願意共乘">
                <el-radio-group v-model="temp.canShared">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="乘車日期">
                <el-date-picker
                  v-model="temp.date"
                  type="date"
                  placeholder="請選擇乘車日期"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                  :picker-options="{
                    disabledDate(time) {
                      return time.getTime() < Date.now() - 8.64e7;
                    },
                  }"
                ></el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="乘車日期">
                <el-time-select
                  v-model="temp.time"
                  :picker-options="{
                    start: '06:00', //timeStartTime
                    step: '00:10',
                    end: '20:00',
                  }"
                  placeholder="請選擇乘車時間"
                  style="width: 100%"
                >
                </el-time-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="陪同人數">
                <el-select
                  style="width: 100%"
                  v-model="temp.familyWith"
                  placeholder="選擇陪同人數"
                >
                  <el-option
                    v-for="num in 8"
                    :key="num"
                    :label="num - 1"
                    :value="num - 1"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="24">
              <el-form-item label="起點">
                <el-select
                  filterable
                  :default-first-option="false"
                  remote
                  :remote-method="remoteMethod"
                  @change="handleChange('from')"
                  @visible-change="handleVisibleChange"
                  ref="atc"
                  :trigger-on-focus="false"
                  v-model="temp.fromAddr"
                  placeholder="請輸入起點"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in searchResults"
                    :key="item.place_id"
                    :value="item.place_id"
                    :label="item.description"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="24">
              <el-form-item label="迄點">
                <el-select
                  filterable
                  :default-first-option="false"
                  remote
                  :remote-method="remoteMethod"
                  @change="handleChange('to')"
                  @visible-change="handleVisibleChange"
                  ref="atc"
                  :trigger-on-focus="false"
                  v-model="temp.toAddr"
                  placeholder="請輸入迄點"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in searchResults"
                    :key="item.place_id"
                    :value="item.place_id"
                    :label="item.description"
                  ></el-option>
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
      :visible.sync="coDialog"
      width="400px"
    >
      <div class="coDialogBody">
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
        <el-button @click="coDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleDispatch">確 定</el-button>
      </span>
    </el-dialog>

    <!-- carPool dialog -->
    <el-dialog title="共乘設定" :visible.sync="carPoolDialog" width="650px">
      <div class="carPoolDialogBody">
        <el-form
          :label-position="labelPosition"
          label-width="200px"
          :model="temp"
          ref="form"
        >
          <el-row :gutter="16">
            <el-col :sm="12" :md="24">
              <el-form-item label="選擇司機">
                <el-select
                  style="width: 100%"
                  v-model="carPoolTemp.driverInfoId"
                  placeholder="請選擇司機"
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

            <el-col :sm="12" :md="24">
              <el-form-item label="選擇車輛">
                <el-select
                  style="width: 100%"
                  v-model="carPoolTemp.carId"
                  placeholder="請選擇車輛"
                >
                  <el-option
                    v-for="car in isShareCarFilter()"
                    :key="car.id"
                    :label="`${car.carCategoryName} / ${car.seatNum}人座 / ${car.carNo}`"
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
        <el-button @click="carPoolDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleSetCarPool()">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template> 
<script
  async
  defer
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAkLxJzOtyQ6Oyv4e1rTlMxGSixHr0to3Q"
></script>
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
import * as map from "@/api/map";
import * as category from "@/api/categorys";
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
      /* map */
      map: null,
      service: null, //auto complete service
      searchResults: [], //auto complete options
      sessionToken: null, //令牌
      fromAddr: "", //起點詳細地址
      toAddr: "", //迄點詳細地址
      tableToggle: true,

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
      orderCaseUser.loadDespatch(vm.listQuery).then((res) => {
        vm.list = res.data.map((d) => {
          vm.spanArr = [];
          d.despatchNo = d.despatchNo ? d.despatchNo : d.orderNo;
          return d;
        });

        vm.total = res.count;
        vm.getSpanArr(vm.list);
        vm.listLoading = false;
      });
    },

    /* 合併row array */
    getSpanArr(data) {
      const vm = this;
      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          vm.spanArr.push(1);
          vm.pos = 0;
        } else {
          // 判斷當前元素與上一個元素是否相同
          if (data[i].despatchNo === data[i - 1].despatchNo) {
            vm.spanArr[vm.pos] += 1;
            vm.spanArr.push(0);
          } else {
            vm.spanArr.push(1);
            vm.pos = i;
          }
        }
      }
    },

    /* 合併共乘欄位 */
    objectSpanMethod({ rowIndex, columnIndex }) {
      if (
        columnIndex === 0 ||
        columnIndex === 3 ||
        columnIndex === 4 ||
        columnIndex === 11 ||
        columnIndex === 12
      ) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        // alert(_row);
        // alert(_col);
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
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

    /* 獲取車種 */
    getCarCategorys() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_CAR",
      };
      category.getList(query).then((res) => {
        vm.carCategorysList = res.data.filter((car) => {
          return (
            car.dtValue === "SYS_CAR_GENERAL" || car.dtValue === "SYS_CAR_WEAL"
          );
        });
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

    /* 共乘 */
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
        id: vm.multipleSelection.map((i) => {
          return i.despatchNo;
        }),
        driverInfoId: vm.carPoolTemp.driverInfoId,
        carId: vm.carPoolTemp.carId,
        driverInfoName: vm.driverList.filter((d) => {
          return d.id == vm.carPoolTemp.driverInfoId;
        })[0].userName,
        carNo: vm.carList.filter((c) => {
          return c.id == vm.carPoolTemp.carId;
        })[0].carNo,
      };
      this.$cl(data);
      dispatchs.addOrUpdate(data).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.carPoolDialog = false;
        vm.getList();
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
      vm.temp.reserveDate = `${vm.temp.date} ${vm.temp.time}`;
      vm.temp.carCategoryName = vm.carCategorysList.filter((i) => {
        return i.dtValue === vm.temp.carCategoryId;
      })[0].name;
      vm.temp.fromAddr = vm.fromAddr;
      vm.temp.toAddr = vm.toAddr;
      orderCaseUser.update(vm.temp).then((res) => {
        vm.editDialog = false;
        vm.$alertT.fire({
          icon: "success",
          title: `訂單${vm.temp.orderNo}編輯成功`,
        });
        vm.getList();
      });
    },

    /* 獲取單筆訂單資料 */
    getOrder(order) {
      const vm = this;
      vm.temp = Object.assign({}, order);
      vm.fromAddr = vm.temp.fromAddr;
      vm.toAddr = vm.temp.toAddr;
      this.$set(vm.temp, "date", order.reserveDate.split(" ")[0]);
      this.$set(vm.temp, "time", order.reserveDate.split(" ")[1].slice(0, 5));
    },

    /* init google map api */
    initMapApi() {
      const vm = this;
      vm.map = new google.maps.Map(document.getElementById("map"), {
        center: {
          //原始中心點
          lat: 25.0374865,
          lng: 121.5647688,
        },
        zoom: 15,
      });
      vm.sessionToken = new google.maps.places.AutocompleteSessionToken();
      vm.service = new window.google.maps.places.AutocompleteService();
    },

    /* remoteMethod  */
    remoteMethod(query) {
      const vm = this;
      if (!query) return;
      this.service.getPlacePredictions(
        {
          input: query,
          sessionToken: vm.sessionToken,
        },
        vm.displaySuggestions
      );
    },

    /* 用戶選擇autocomplete選項後 */
    handleChange(direction) {
      const vm = this;
      if (vm.temp[`${direction}Addr`] == "") return;
      const request = {
        placeId: vm.temp[`${direction}Addr`],
        fields: ["name", "formatted_address", "place_id", "geometry"],
        sessionToken: vm.sessionToken,
      };

      const service = new google.maps.places.PlacesService(vm.map);
      service.getDetails(request, (place, status) => {
        vm.getPlaceDetail(place, direction);
        vm.sessionToken = new google.maps.places.AutocompleteSessionToken();
      });
    },

    /* 獲取地點詳情 */
    getPlaceDetail(place, direction) {
      const vm = this;
      let params = {
        placeId: place.place_id,
        addrFormat: place.formatted_address,
        addrName: place.name,
        lon: place.geometry.location.toJSON().lng,
        lat: place.geometry.location.toJSON().lat,
      };
      map.placeDetail(params).then((res) => {
        vm[`${direction}Addr`] = res.result.addrFormat;
      });
    },

    /* 清空選項避免enter選到 */
    handleVisibleChange() {
      this.searchResults = [];
    },

    /* 獲取autocomplete資料 */
    displaySuggestions(predictions, status) {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
        this.searchResults = [];
        return;
      }
      this.searchResults = predictions;
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
    this.initMapApi();
    this.getDriverList();
    this.getCarList();
    this.getCarCategorys();
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