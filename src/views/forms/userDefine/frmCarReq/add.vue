<template>
  <el-container style="border: 1px solid #eee">
    <el-main>
      <el-form :label-position="labelPosition" label-width="200px" :model="temp" :rules="rules" ref="form">
        <SubTitle title="車輛基本資料編輯"></SubTitle>
        <el-row :gutter="16">
          <el-col :sm="12" :md="6">
            <el-form-item label="車牌號碼" prop="carNo">
              <el-input v-model="temp.carNo" placeholder="請輸入車牌號碼"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="車輛類別" prop="carCategoryId">
              <el-select v-model="temp.carCategoryId" placeholder="請選擇車輛類別" style="width: 100%">
                <el-option v-for="category in carCategorysList" :key="category.id" :value="category.value" :label="category.label"></el-option>
                <!-- <el-option :value="2" :label="'不可派發'">不可派發</el-option> -->
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="車輛顏色" prop="carColor">
              <el-input v-model="temp.carColor" placeholder="請輸入車輛顏色"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="廠牌型號" prop="factoryType">
              <el-input v-model="temp.factoryType" placeholder="請輸入廠牌型號"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="車輛來源" prop="carFrom">
              <el-select v-model="temp.carFrom" placeholder="請選擇車輛來源" style="width: 100%">
                <el-option :value="'1'" :label="'獎助'"></el-option>
                <el-option :value="'2'" :label="'自購'"></el-option>
                <el-option :value="'3'" :label="'捐贈'"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="捐贈單位" prop="donationUnit">
              <el-input v-model="temp.donationUnit" placeholder="請輸入捐贈單位"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="座椅數量" prop="seatNum">
              <el-input-number style="width: 100%" v-model="temp.seatNum" :min="0" :max="10"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="輪椅數量" prop="wheelchairNum">
              <el-input-number style="width: 100%" v-model="temp.wheelchairNum" :min="0" :max="10"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="車身高度" prop="carTop">
              <el-input v-model="temp.carTop" placeholder="請輸入捐贈單位"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="司機姓名" prop="driverInfoId">
              <el-select v-model="temp.driverInfoId" placeholder="請選擇司機" style="width: 100%">
                <el-option v-for="driver in driverList" :value="driver.id" :label="driver.name" :key="driver.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="可否派發" prop="status">
              <el-select v-model="temp.status" placeholder="請選擇可否派發" style="width: 100%">
                <el-option :value="1" :label="'可派發'">可派發</el-option>
                <el-option :value="0" :label="'不可派發'">不可派發</el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="出廠年月" prop="makeDate">
              <el-date-picker v-model="temp.makeDate" type="date" placeholder="請選擇出廠年月" style="width: 100%" value-format="yyyy-MM-dd"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="最後驗車日" prop="lastCheckDate">
              <el-date-picker v-model="temp.lastCheckDate" type="date" placeholder="請選擇最後驗車日" value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
            </el-form-item>
          </el-col>
          <!-- <el-col :sm="12" :md="6">
              <el-form-item label="車輛審核" prop="reviewStatus">
                <el-radio-group v-model="temp.reviewStatus">
                  <el-radio label="是"></el-radio>
                  <el-radio label="否"></el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col> -->
        </el-row>

        <SubTitle title="服務身份"></SubTitle>
        <el-form-item label="" prop="carServiceUserTypes">
          <el-checkbox-group v-model="temp.carServiceUserTypes">
            <el-checkbox v-for="type in serviceUserTypesList" :key="type.categoryId" :label="type.categoryId">{{ type.categoryName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <SubTitle title="車輛設備"></SubTitle>
        <el-form-item label="" prop="carDevices">
          <el-checkbox-group v-model="temp.carDevices">
            <el-checkbox v-for="device in carDevicesList" :key="device.categoryId" :label="device.categoryId">{{ device.categoryName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <SubTitle title="所需證照"></SubTitle>
        <el-form-item label="" prop="carLicenses">
          <el-checkbox-group v-model="temp.carLicenses">
            <el-checkbox v-for="license in carLicensesList" :key="license.categoryId" :label="license.categoryId">{{ license.categoryName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <SubTitle title="保險"></SubTitle>
        <div class="tableContainer">
          <div class="tableHeader">
            <div class="headerCheckBox">保險類型</div>
            <div class="expireDate">保險到期日</div>
          </div>
          <el-checkbox-group v-model="temp.carInsurances">
            <div v-for="insurance in carInsurancesList" :key="insurance.categoryId" style="border-bottom: 1px solid #ddd; display: flex">
              <el-checkbox :label="insurance.categoryId" style="width: 50%; text-align: center; padding: 1rem">
                {{ insurance.categoryName }}
              </el-checkbox>
              <div class="expireDateBox">
                <el-date-picker :disabled="hasChecked(insurance.categoryId)" style="width: 70%" v-model="insurance.expireDate" type="date" value-format="yyyy-MM-dd" size="mini" placeholder="選擇日期"></el-date-picker>
              </div>
            </div>
          </el-checkbox-group>
        </div>

        <SubTitle title="備註"></SubTitle>
        <el-input type="textarea" :rows="2" placeholder="請輸入內容" v-model="temp.remark"></el-input>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters } from "vuex";

import SubTitle from "@/components/SubTitle";

import * as forms from "@/api/forms";
import * as categorys from "@/api/categorys";
// import * as cars from "@/api/cars";
import * as drivers from "@/api/drivers";

export default {
  name: "frmCarReqAdd",
  components: { SubTitle },
  props: {
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // const validateRequire = (rule, value, callback) => {
    //   if (value === "") {
    //     this.$message({
    //       message: rule.field + "為必傳項",
    //       type: "error",
    //     });
    //     callback(null);
    //   } else {
    //     callback();
    //   }
    // };
    return {
      /* 司機列表 */
      driverList: [],
      /* 服務用戶身份 */
      serviceUserTypesList: [],
      /* 車輛類別 */
      carCategorysList: [],
      /* 車輛證照 */
      carLicensesList: [],
      /* 車輛設備 */
      carDevicesList: [],
      /* 車輛保險 */
      carInsurancesList: [],

      labelPosition: "top",
      temp: {
        id: "",
        orgId: "",
        driverInfoId: "",
        carCategoryId: "",
        carCategoryName: "",
        carNo: "",
        carPic: "",
        carTop: "",
        factoryType: "",
        carFrom: "",
        donationUnit: "",
        carColor: "",
        wheelchairNum: 0,
        seatNum: 0,
        makeDate: "",
        lastCheckDate: "",
        status: 1,
        remark: "",
        carServiceUserTypes: [], // 服務用戶身份
        carLicenses: [], // 車輛證照
        carInsurances: [], // 車輛保險
        carDevices: [], // 車輛設備
      },
      rules: {
        Id: [{ required: true, message: "請輸入個案編號", trigger: "blur" }],
        city: [
          { required: true, message: "請輸入個案編號", trigger: "change" },
        ],
      },
    };
  },

  computed: {
    ...mapGetters(["defaultorgid"]),
    serviceUserTypesChecked() {
      return this.serviceUserTypesList.filter((option) =>
        this.temp.carServiceUserTypes.some(
          (checked) => checked === option.categoryId
        )
      );
    },
    carDevicesChecked() {
      return this.carDevicesList.filter((option) =>
        this.temp.carDevices.some((checked) => checked === option.categoryId)
      );
    },
    carInsurancesChecked() {
      return this.carInsurancesList.filter((option) =>
        this.temp.carInsurances.some((checked) => checked === option.categoryId)
      );
    },
    carLicensesChecked() {
      return this.carLicensesList.filter((option) =>
        this.temp.carLicenses.some((checked) => checked === option.categoryId)
      );
    },
  },

  methods: {
    /* 獲取所有司機 */
    getDrivers() {
      const vm = this;
      let query = {
        page: 1,
        limit: 999,
        Status: -1,
      };
      drivers.load(query).then((res) => {
        console.log(res);
        vm.driverList = res.data;
      });
    },

    /* 獲取所有用戶身份 */
    getUserType() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_USERCATEGORY",
      };
      categorys.getSimpleList(query).then((res) => {
        res.result.forEach((userType) => {
          let obj = {};
          obj.categoryId = userType.value;
          obj.categoryName = userType.label;
          vm.serviceUserTypesList.push(obj);
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

    /* 獲取所有車輛證照 */
    getCarLicenses() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_CAR_LICENSE",
      };
      categorys.getSimpleList(query).then((res) => {
        res.result.forEach((license) => {
          let obj = {};
          obj.categoryId = license.value;
          obj.categoryName = license.label;
          vm.carLicensesList.push(obj);
        });
      });
    },

    /* 獲取所有車輛設備 */
    getCarDevices() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_CAR_DEVICE",
      };
      categorys.getSimpleList(query).then((res) => {
        res.result.forEach((device) => {
          let obj = {};
          obj.categoryId = device.value;
          obj.categoryName = device.label;
          vm.carDevicesList.push(obj);
        });
      });
    },

    /* 獲取所有保險項目 */
    getCarInsurances() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_CAR_INSURANCE",
      };
      categorys.getSimpleList(query).then((res) => {
        res.result.forEach((insurances) => {
          let obj = {};
          obj.categoryId = insurances.value;
          obj.categoryName = insurances.label;
          obj.expireDate = "";
          vm.carInsurancesList.push(obj);
        });
      });
    },

    /* back */
    handleBack() {
      const vm = this;
      vm.$router.push("/car/index");
    },

    /* 檢查是否勾選 */
    hasChecked(id) {
      return !this.temp.carInsurances.includes(id);
    },
    fetchData(id) {
      forms
        .get(id)
        .then(() => {})
        .catch((err) => {
          console.log(err);
        });
    },
    getFormInfo() {
      // 用於流程分支條件選擇
      return [
        {
          name: "userName",
          title: "請假人姓名",
        },
        {
          name: "startDate",
          title: "開始日期",
        },
        {
          name: "endDate",
          title: "結束日期",
        },
        {
          name: "requestComment",
          title: "請假說明",
        },
      ];
    },
    getData() {
      const vm = this;
      vm.temp.orgId = vm.defaultorgid;
      vm.temp.carCategoryName = vm.carCategorysList.filter((c) => {
        return c.value == vm.temp.carCategoryId;
      })[0]?.label;
      // console.log(JSON.parse(JSON.stringify(vm.temp)));
      // console.log(vm.serviceUserTypesChecked);
      let obj = JSON.parse(JSON.stringify(vm.temp));
      obj.carDevices = JSON.stringify(vm.carDevicesChecked);
      obj.carInsurances = JSON.stringify(vm.carInsurancesChecked);
      obj.carLicenses = JSON.stringify(vm.carLicensesChecked);
      obj.carServiceUserTypes = JSON.stringify(vm.temp.carServiceUserTypes);

      console.log(obj);
      return obj;
    },
  },
  mounted() {
    this.getCarCategorys();
    this.getDrivers();
    this.getCarDevices();
    this.getCarInsurances();
    this.getCarLicenses();
    this.getUserType();
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";
</style>
<style lang="scss" scoped>
.formTitle:nth-child(1) {
  margin-top: 1rem;
}
.uploadPic {
  width: 240px;
  height: 240px;
  background: #ffe6d1;
  margin: auto;
  margin-top: 1.5rem;
}
.avatar-uploader-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.tableContainer {
  width: 100%;
  // background: lightcoral;
}
.tableHeader {
  display: flex;
}
.headerCheckBox {
  border-right: 1px solid #fff;
}
.headerCheckBox,
.expireDate {
  width: 50%;
  text-align: center;
  padding: 1rem 0;
  background: #fafafa;
  font-size: 13px;
  font-weight: 700;
  box-sizing: border-box;
}
.expireDateBox {
  width: 50%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
