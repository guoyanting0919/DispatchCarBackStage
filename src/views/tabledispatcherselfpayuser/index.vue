<template>
  <div class="flex-column dispatch" style="height: calc(100% - 20px)">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 無權限權限按鈕 -->
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

    <!-- 白牌車調度台 -->
    <div style="padding-bottom: 0px" class="app-container flex-item">
      <Title title="白牌車調度台"></Title>
      <div
        class="bg-white formContainer"
        style="height: calc(100% - 50px); padding: 0 16px"
      >
        <!-- 新訂單 -->
        <SubTitle title="新訂單"></SubTitle>
        <div class="bg-white newOrderContainer">
          <p
            style="color: red; font-size: 14px; width: 100%; text-align: center"
            v-if="newOrderList.length == 0"
          >
            暫無新訂單
          </p>
          <transition-group
            name="fade-transform"
            mode="out-in"
            class="newOrderContainer"
          >
            <OrderCard
              v-for="item in newOrderList"
              :key="item.id"
              :order="item"
              @handleReceive="handleReceive"
            ></OrderCard>
          </transition-group>
        </div>

        <!-- 調度台 -->
        <SubTitle title="調度台"></SubTitle>

        <!-- 條件篩選 -->
        <el-date-picker
          size="mini"
          style="width: 350px; margin: 0 1rem"
          v-model="temp.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="起始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>

        <el-select size="mini" v-model="value" placeholder="請選擇訂單狀態">
          <el-option label="新訂單" value="1"></el-option>
          <el-option label="已排班" value="2"></el-option>
          <el-option label="已抵達" value="3"></el-option>
          <el-option label="客上" value="4"></el-option>
          <el-option label="完成" value="5"></el-option>
          <el-option label="已取消" value="9"> </el-option>
        </el-select>

        <el-button
          type="primary"
          style="margin: 0 1rem"
          size="mini"
          @click="getList"
        >
          <i class="iconfont icon-search"></i>
        </el-button>

        <!-- table -->
        <div class="bg-white formContainer" style="height: 100%">
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
            :span-method="objectSpanMethod"
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
              width="80"
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
              width="150"
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
              width="150"
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
                    {{ car.carCategoryName || "一般車" }} /
                    {{ car.seatNum }}人座 /
                    {{ car.carNo }}
                  </el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column
              property="reserveDate"
              label="預約乘車時間"
              width="160"
              align="center"
            >
              <template slot-scope="scope">
                <span style="margin-left: 10px"
                  >{{ scope.row.reserveDate | dateFilter }}
                </span>
              </template>
            </el-table-column>

            <el-table-column property="name" label="起訖點" width="400">
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
              property="canShared"
              label="可否共乘"
              align="center"
              width="130"
            >
              <template slot-scope="scope">
                <div>
                  <el-tag v-if="scope.row.canShared" size="mini" type="success"
                    >共乘</el-tag
                  >
                  <el-tag v-else size="mini" type="danger">不共乘</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              property="carCategoryName"
              label="車輛類型"
              width="150"
              align="center"
            >
            </el-table-column>
            <el-table-column
              property="passengerNum"
              label="搭乘人數"
              width="80"
              align="center"
            >
            </el-table-column>
            <el-table-column
              property="orgName"
              label="承接單位"
              align="center"
              width="180"
            >
            </el-table-column>
            <el-table-column
              align="center"
              :label="'操作'"
              :fixed="isMobile()"
              width="260"
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
                    @click="handleChange(scope.row)"
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
                    start: '06:00',
                    step: '00:10',
                    end: '20:00',
                  }"
                  placeholder="選擇時間"
                >
                </el-time-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="車輛類型">
                <el-select
                  style="width: 100%"
                  v-model="temp.carCategoryId"
                  placeholder="選擇車輛類型"
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
              <el-form-item label="聯絡電話">
                <el-input
                  style="width: 100%"
                  v-model="temp.noticePhone"
                  placeholder="輸入聯絡電話"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="是否共乘">
                <el-switch
                  active-text="願意共乘"
                  inactive-text="不共乘"
                  v-model="temp.canShared"
                ></el-switch>
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
            <template v-if="passengerArr">
              <el-col
                class="passengerContainer"
                :sm="4"
                :md="24"
                v-for="item in passengerArr"
                :key="item.key"
              >
                <el-row :gutter="16">
                  <el-col :sm="4" :md="6" :offset="3">
                    <el-form-item label="姓名">
                      <el-input
                        style="width: 100%"
                        v-model="item.name"
                        placeholder="輸入姓名"
                      >
                      </el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :sm="4" :md="6">
                    <el-form-item label="生日">
                      <el-date-picker
                        style="width: 100%"
                        v-model="item.birth"
                        type="date"
                        placeholder="選擇生日"
                        value-format="yyyy-MM-dd"
                      >
                      </el-date-picker>
                    </el-form-item>
                  </el-col>

                  <el-col :sm="4" :md="6">
                    <el-form-item label="聯絡電話">
                      <el-input
                        style="width: 100%"
                        v-model="item.phone"
                        placeholder="輸入聯絡電話"
                      >
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>
            </template>
            <el-col :sm="12" :md="18">
              <el-form-item label="起點">
                <el-input
                  style="width: 100%"
                  v-model="temp.fromAddr"
                  placeholder="輸入起點"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="4" :md="3">
              <el-form-item label="起點經度">
                <el-input
                  style="width: 100%"
                  v-model="temp.fromLon"
                  placeholder="輸入起點經度"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="4" :md="3">
              <el-form-item label="起點緯度">
                <el-input
                  style="width: 100%"
                  v-model="temp.fromLat"
                  placeholder="輸入起點緯度"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="18">
              <el-form-item label="訖點">
                <el-input
                  style="width: 100%"
                  v-model="temp.toAddr"
                  placeholder="輸入訖點"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="4" :md="3">
              <el-form-item label="訖點經度">
                <el-input
                  style="width: 100%"
                  v-model="temp.toLon"
                  placeholder="輸入訖點經度"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="4" :md="3">
              <el-form-item label="訖點緯度">
                <el-input
                  style="width: 100%"
                  v-model="temp.toLat"
                  placeholder="輸入訖點緯度"
                >
                </el-input>
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
                    v-for="car in carList"
                    :key="car.id"
                    :label="`${car.carNo} / ${car.seatNum}人座 / ${car.carNo}`"
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
import { mapGetters } from "vuex";
import moment from "moment";
import * as signalR from "@aspnet/signalr";
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import SubTitle from "@/components/SubTitle";
import Pagination from "@/components/Pagination";
import OrderStatusTag from "@/components/OrderStatusTag";
import OrderCard from "@/components/OrderCard";
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
        page: 1,
        StartDate: "",
        EndDate: "",
        limit: 10,
        key: undefined,
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

      /* 共乘 */
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
      carPoolDialog: false,
      changeDialog: false,

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
      vm.pos = "";
      vm.listLoading = true;
      vm.listQuery.StartDate = moment(vm.temp.dateRange?.[0]).format(
        "yyyy-MM-DD"
      );
      vm.listQuery.EndDate = moment(vm.temp.dateRange?.[1])
        .add(24, "h")
        .format("yyyy-MM-DD");
      orderSelfPayUser.load(vm.listQuery).then((res) => {
        vm.spanArr = [];

        vm.list = res.data.map((d) => {
          d.driver = "";
          d.car = "";
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
        columnIndex === 11 ||
        columnIndex === 0 ||
        columnIndex === 3 ||
        columnIndex === 7 ||
        columnIndex === 4
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
        vm.carList = res.data;
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
      orderSelfPayUser
        .receive({
          id: orderId,
          orgId: vm.defaultorgid,
        })
        .then((res) => {
          this.$cl(res);
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
    handleEdit() {
      const vm = this;
      let date = moment(vm.temp.date).format("yyyy-MM-DD");
      vm.temp.reserveDate = `${date} ${vm.temp.time}`;
      vm.temp.CarCategoryName = vm.carCategorysList.filter((car) => {
        return car.dtValue === vm.temp.carCategoryId;
      })[0].name;
      vm.temp.remark = JSON.stringify(vm.passengerArr);

      orderSelfPayUser.update(vm.temp).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.editDialog = false;
        vm.getList();
      });
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
      dispatchs.addOrUpdate(data).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.carPoolDialog = false;
        vm.getList();
      });
    },

    /* 變更司機車輛 */
    handleChange(order) {
      const vm = this;
      vm.changeDialog = true;
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