<template>
  <div class="flex-column orderSelfPayUser">
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
      <Title title="白牌車訂單"></Title>
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
                    {{ order.fromAddr }}
                  </p>
                  <i class="iconfont icon-down"></i>
                  <p class="endAdd textNoWrap">{{ order.toAddr }}</p>
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
import * as orderSelfPayUser from "@/api/orderSelfPayUser";
import * as categorys from "@/api/categorys";
import * as dispatchSelfPayUser from "@/api/dispatchSelfPayUser";
export default {
  name: "orderSelfPayUser",
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
      orderSelfPayUser.load(vm.listQuery).then((res) => {
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

    /* 取消排班 */
    handleCancelDispatch(id) {
      const vm = this;
      dispatchSelfPayUser.cancel([id]).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.getList();
      });
    },

    /* 取消排班 */
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

    /* 檢視訂單 */
    handleCheck(id) {
      this.$router.push({
        path: `/orderselfpayuser/check/${id}`,
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

<style lang="scss"></style>
