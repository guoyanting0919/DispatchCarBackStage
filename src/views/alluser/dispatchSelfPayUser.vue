<template>
  <div class="flex-column dispatchSelfPay">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 權限按鈕 -->
        <el-button size="mini" @click="handleReservation" type="primary" plain
          >預約</el-button
        >
        <el-button size="mini" @click="handleChange" type="info" plain
          >起訖點互換</el-button
        >
        <el-button size="mini" @click="handleBack" type="success" plain
          >回列表</el-button
        >
      </div>
    </sticky>

    <div class="app-container flex-item">
      <Title title="白牌車預約"></Title>
      <!-- 預約表單 -->
      <div class="dispatchContainer bg-white">
        <SubTitle title="預約表單"></SubTitle>
        <el-form
          :label-position="labelPosition"
          label-width="200px"
          :model="temp"
          :rules="rules"
          ref="form"
        >
          <el-row :gutter="16">
            <el-col :sm="12" :md="8">
              <el-form-item label="預約日期" prop="date">
                <el-date-picker
                  style="width: 100%"
                  v-model="temp.date"
                  type="date"
                  placeholder="選擇日期"
                  value-format="yyyy-MM-dd"
                  :picker-options="{
                    disabledDate(time) {
                      return time.getTime() < Date.now() - 8.64e7;
                    },
                  }"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="預約時間" prop="time">
                <el-time-select
                  style="width: 100%"
                  v-model="temp.time"
                  :picker-options="{
                    start: timeStartTime,
                    step: '00:10',
                    end: '20:00',
                  }"
                  placeholder="選擇時間"
                >
                </el-time-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="車輛類型" prop="carCategoryId">
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
              <el-form-item label="聯絡電話" prop="noticePhone">
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
                        :picker-options="{
                          disabledDate(time) {
                            return time.getTime() > Date.now();
                          },
                        }"
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
              <el-form-item label="起點" prop="fromAddr">
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
              <el-form-item label="訖點" prop="toAddr">
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

      <!-- 歷史訂單 -->

      <div class="bg-white dispatchContainer">
        <SubTitle title="歷史訂單"></SubTitle>
        <el-table
          ref="mainTable"
          :data="list"
          border
          fit
          v-loading="listLoading"
          highlight-current-row
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @row-click="rowClick"
        >
          <el-table-column
            property="reserveDate"
            label="預約日期"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.reserveDate | dateFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column
            property="reserveDate"
            label="預約時間"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.reserveDate | timeFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column
            property="carCategoryName"
            label="車輛類型"
            width="200"
            align="center"
          ></el-table-column>
          <el-table-column
            property="noticePhone"
            label="聯絡電話"
            width="150"
            align="center"
          >
          </el-table-column>
          <el-table-column property="canShared" label="是否共乘">
            <template slot-scope="scope">
              <span v-if="scope.row.canShared">是</span>
              <span v-else>否</span>
            </template>
          </el-table-column>
          <el-table-column
            property="passengerNum"
            label="搭乘人數"
          ></el-table-column>
          <el-table-column property="fromAddr" label="起點"></el-table-column>
          <el-table-column property="toAddr" label="訖點"></el-table-column>

          <el-table-column
            property="setting"
            label="操作"
            fixed="right"
            width="100"
          >
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button
                  size="mini"
                  @click="handleCopy(scope.row)"
                  type="success"
                  >複製訂單</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- <pagination
          v-if="total > 0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="handleCurrentChange"
        /> -->
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
// import Pagination from "@/components/Pagination";
import SubTitle from "@/components/SubTitle";
import * as categorys from "@/api/categorys";
import * as user from "@/api/users";
import * as orderSelfPayUser from "@/api/orderSelfPayUser";
export default {
  name: "dispatchSelfPay",
  components: {
    Sticky,
    Title,
    SubTitle,
  },
  data() {
    return {
      /* 今天日期 */
      today: "",

      buttons: [],
      //車輛類別
      carCategorysList: [],

      /* 用戶資料 */
      userInfo: "",

      // table相關
      list: [],
      listLoading: false,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 10,
        orgId: "",
        key: undefined,
      },
      total: "",
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
        userId: "",
        orgId: "",
        reserveDate: "",
        noticePhone: "",
        fromAddr: "", //新北市板橋區中山路二段109號
        fromLon: 0,
        fromLat: 0,
        toAddr: "", //新北市板橋區板新路109號
        toLon: 0,
        toLat: 0,
        passengerNum: 0,
        canShared: true,
        status: 1,
        carCategoryId: null,
        CarCategoryName: "",
        remark: [{ name: "", birth: "" }],
      },
      rules: {
        date: [{ required: true, message: "必填欄位", tigger: "change" }],
        time: [{ required: true, message: "必填欄位", tigger: "change" }],
        carCategoryId: [
          { required: true, message: "必填欄位", tigger: "change" },
        ],
        noticePhone: [
          { required: true, message: "必填欄位", tigger: "change" },
        ],
        fromAddr: [{ required: true, message: "必填欄位", tigger: "change" }],
        toAddr: [{ required: true, message: "必填欄位", tigger: "change" }],
        required: [{ required: true, message: "必填欄位", tigger: "change" }],
        caseUserNo: [{ required: true, message: "必填欄位", tigger: "blur" }],
        orgAId: [{ required: true, message: "必填欄位", tigger: "change" }],
      },
    };
  },
  filters: {
    dateFilter(date) {
      let res = moment(date).format("YYYY-MM-DD");
      return res;
    },
    timeFilter(date) {
      let res = moment(date).format("YYYY-MM-DDThh:mm").split("T")[1];
      return res;
    },
  },
  watch: {
    "temp.passengerNum"(val, oldVal) {
      const vm = this;
      let num;
      if (val > oldVal) {
        num = val - oldVal;
        for (let index = oldVal + 1; index <= val; index++) {
          let obj = {
            name: "",
            birth: "",
            phone: vm.userInfo.phone,
            key: index,
          };
          vm.passengerArr.push(obj);
        }
      } else {
        num = oldVal - val;
        console.log(val, oldVal, num);
        vm.passengerArr = vm.passengerArr.slice(0, val);
        console.log(vm.passengerArr);
      }
    },
  },

  computed: {
    timeStartTime() {
      let time;
      if (this.temp.date !== this.today) {
        time = "06:00";
      } else {
        let nowHr = moment().format("HH");
        let nowMin =
          (Math.floor(moment().format("hh:mm").split(":")[1] / 10) + 1) * 10;

        if (nowMin == 60) {
          nowMin = "00";
          nowHr++;
        }

        time = `${nowHr}:${nowMin}`;
      }
      return time;
    },
  },
  methods: {
    /* 獲取本路由下所有功能按鈕 */
    getButtons() {
      this.$route.meta.elements.forEach((el) => {
        this.buttons.push(el.domId);
      });
    },

    /* 是否擁有按鈕功能權限 */
    hasButton(domId) {
      return this.buttons.includes(domId);
    },

    /* 獲取歷史訂單 */
    getList() {
      const vm = this;
      vm.listQuery.key = vm.$route.params.id.split("-")[0];
      orderSelfPayUser.load(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
        vm.listLoading = false;
        console.log(vm.list);
      });
    },

    /* 獲取所有車輛類別 */
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

    /* 獲取用戶資料 */
    async getUser() {
      await user
        .getClient({ id: this.$route.params.id.split("-")[0] })
        .then((res) => {
          this.userInfo = res.result;
        });
    },

    /* 預約訂單 */
    handleReservation() {
      // console.log(this.passengerArr);

      this.$refs.form.validate((valid) => {
        if (valid) {
          const vm = this;
          vm.temp.id = "";
          vm.temp.orgId = "";
          vm.temp.orgName = "";
          let date = moment(vm.temp.date).format("yyyy-MM-DD");
          vm.temp.selfPayUserId = vm.$route.params.id.split("-")[1];
          vm.temp.userId = vm.$route.params.id.split("-")[0];
          vm.temp.reserveDate = `${date} ${vm.temp.time}`;
          vm.temp.CarCategoryName = vm.carCategorysList.filter((car) => {
            return car.dtValue === vm.temp.carCategoryId;
          })[0].name;
          vm.temp.remark = JSON.stringify(vm.passengerArr);
          console.log(vm.temp, JSON.parse(vm.temp.remark));

          orderSelfPayUser.add(vm.temp).then((res) => {
            vm.$alertT.fire({
              icon: "success",
              title: res.message,
            });
            this.handleBack();
            //TODO:白牌用戶頁面跳轉記得換路徑

            // vm.$router.push("/alluser/index");
            // vm.$router.push("/selfpayuser/index");
          });
        }
      });
    },

    /* 複製訂單 */
    handleCopy(order) {
      this.temp = Object.assign({}, order); // copy obj
      this.temp.remark = [{ name: "", birth: "", phone: "" }];
      this.$nextTick(() => {
        this.passengerArr = [];
        console.log(this.passengerArr);
        console.log(order.remark);
        this.passengerArr = JSON.parse(order.remark);
        console.log(this.passengerArr);
      });
    },

    /* 回列表 */
    handleBack() {
      //TODO:白牌用戶頁面跳轉記得換路徑
      // this.$router.push("/alluser/index");
      this.$router.go(-1);
      // this.$router.push("/selfpayuser/index");
    },

    /* 換頁 */
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },

    /* 起訖點互換 */
    handleChange() {
      let ex = this.temp.fromAddr;
      let exFlon = this.temp.fromLon;
      let exFlat = this.temp.fromLat;
      this.temp.fromLon = this.temp.toLon;
      this.temp.fromLat = this.temp.toLat;
      this.temp.toLon = exFlon;
      this.temp.toLat = exFlat;
      this.temp.fromAddr = this.temp.toAddr;
      this.temp.toAddr = ex;
    },
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },

    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    loadAll() {
      return [
        { value: "玉峰大橋", address: "24.654981, 121.306182" },
        {
          value: "秀巒部落",
          address: " 24.670562, 121.265620",
        },
        {
          value: "道下",
          address: "24.620131, 121.286526",
        },
      ];
    },
    handleSelect(item) {
      console.log(item);
    },
    handleIconClick(ev) {
      console.log(ev);
    },
  },
  async mounted() {
    this.today = moment().format("yyyy-MM-DD");
    this.restaurants = this.loadAll();
    this.getCarCategorys();
    this.getList();
    await this.getUser();
    this.temp.passengerNum = 1;
    this.$nextTick(() => {
      this.passengerArr[0].name = this.userInfo.name;
      this.passengerArr[0].birth = this.userInfo.birthday;
      this.passengerArr[0].phone = this.userInfo.phone;
    });
  },
};
</script>

<style lang="scss" scoped>
.dispatchContainer {
  padding: 24px;
  padding-top: 12px;
}
.name {
  line-height: 20px;
  font-weight: 700;
}
.addr {
  font-size: 10px;
}
.passengerContainer {
  background: rgb(255, 244, 230);
}
</style>