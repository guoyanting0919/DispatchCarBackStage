<template>
  <el-container style="border: 1px solid #eee">
    <el-main>
      <el-form :label-position="labelPosition" label-width="200px" :model="temp" ref="form">
        <SubTitle title="基本資料編輯"></SubTitle>
        <el-row :gutter="16">
          <el-col :sm="12" :md="6">
            <el-form-item label="姓名" prop="name">
              <el-input disabled v-model="temp.name" placeholder="請輸入姓名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="身分證字號" prop="uid">
              <el-input disabled v-model="temp.uid" placeholder="請輸入身分證字號"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="手機" prop="phone">
              <el-input disabled v-model="temp.phone" placeholder="請輸入手機"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="性別" prop="sex">
              <el-select disabled v-model="temp.sex" placeholder="請選擇性別" style="width: 100%">
                <el-option :value="1" :label="'男'">男</el-option>
                <el-option :value="0" :label="'女'">女</el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="可否派發" prop="status">
              <el-select disabled v-model="temp.status" placeholder="請選擇可否派發" style="width: 100%">
                <el-option :value="1" :label="'可派發'">可派發</el-option>
                <el-option :value="0" :label="'不可派發'">不可派發</el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <SubTitle title="司機證照"></SubTitle>
        <div class="tableContainer">
          <div class="tableHeader">
            <div class="headerCheckBox">證照類型</div>
            <div class="expireDate">證照到期日</div>
          </div>
          <el-checkbox-group v-model="temp.driverLicenses">
            <div v-for="license in driverLicensesList" :key="license.categoryId" style="border-bottom: 1px solid #ddd; display: flex">
              <el-checkbox disabled :label="license.categoryId" name="type" style="width: 50%; text-align: center; padding: 1rem">
                {{ license.categoryName }}
              </el-checkbox>
              <div class="expireDateBox">
                <el-date-picker disabled style="width: 70%" v-model="license.expireDate" value-format="yyyy-MM-dd" type="date" size="mini" placeholder="選擇日期"></el-date-picker>
              </div>
            </div>
          </el-checkbox-group>
        </div>

        <SubTitle title="保險"></SubTitle>
        <div class="tableContainer">
          <div class="tableHeader">
            <div class="headerCheckBox">保險類型</div>
            <div class="expireDate">保險到期日</div>
          </div>
          <el-checkbox-group v-model="temp.driverInsurance">
            <div v-for="insurance in driverInsurancesList" :key="insurance.categoryId" style="border-bottom: 1px solid #ddd; display: flex">
              <el-checkbox disabled :label="insurance.categoryId" style="width: 50%; text-align: center; padding: 1rem">
                {{ insurance.categoryName }}
              </el-checkbox>
              <div class="expireDateBox">
                <el-date-picker disabled style="width: 70%" value-format="yyyy-MM-dd" v-model="insurance.expireDate" type="date" size="mini" placeholder="選擇日期"></el-date-picker>
              </div>
            </div>
          </el-checkbox-group>
        </div>

        <SubTitle title="備註"></SubTitle>
        <el-input type="textarea" :rows="2" disabled placeholder="請输入内容" v-model="temp.remark"></el-input>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import SubTitle from "@/components/SubTitle";
import * as categorys from "@/api/categorys";
import * as drivers from "@/api/drivers";
export default {
  name: "frmDriverDetail",
  components: {
    SubTitle,
  },
  props: ["frmData"],
  data() {
    return {
      labelPosition: "top",
      // 司機證照
      driverLicensesList: [],
      // 司機保險
      driverInsurancesList: [],
      assignObj: "",
      // baseURL: process.env.BASE_IMG_URL, // 附件的根目錄
    };
  },
  computed: {
    temp: function () {
      let data = JSON.parse(this.frmData);
      data.driverInsurance = JSON.parse(data.driverInsurance);
      data.driverLicenses = JSON.parse(data.driverLicenses);
      return data;
    },
    driverInsurancesChecked() {
      console.log(this.temp.driverInsurance);
      return this.driverInsurancesList.filter((option) =>
        this.temp.driverInsurance.some(
          (checked) => checked.categoryId === option.categoryId
        )
      );
    },
    driverLicensesChecked() {
      return this.driverLicensesList.filter((option) =>
        this.temp.driverLicenses.some(
          (checked) => checked.categoryId === option.categoryId
        )
      );
    },
  },
  methods: {
    // 獲取司機
    async getList() {
      const vm = this;
      await drivers.get({ id: vm.$route.params.id }).then((res) => {
        // console.log(res.result);
        vm.assignObj = JSON.parse(JSON.stringify(res.result));

        let resClone = JSON.parse(JSON.stringify(res.result));
        let replaceKey = ["driverLicenses", "driverInsurance"];

        replaceKey.forEach((item, index, arr) => {
          resClone[arr[index]] = resClone[arr[index]].map(
            (item1) => item1?.categoryId
          );
        });
        vm.temp = resClone;
        // console.log(vm.temp);
      });
    },
    // 獲取司機證照
    getDriverLicenses() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_DRIVER_LICENSE",
      };
      categorys.getList(query).then((res) => {
        res.data.forEach((license) => {
          let obj = {};
          obj.categoryId = license.dtValue;
          obj.categoryName = license.name;
          obj.expireDate = "";
          vm.driverLicensesList.push(obj);
        });
        vm.driverLicensesList.forEach((i) => {
          let arr = vm.assignObj.driverLicenses.filter((d) => {
            return d.categoryId === i.categoryId;
          });
          i.expireDate = arr[0]?.expireDate;
        });
      });
    },
    //獲取所有保險項目
    getDriverInsurances() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_DRIVER_INSURANCE",
      };
      categorys.getList(query).then((res) => {
        res.data.forEach((insurances) => {
          let obj = {};
          obj.categoryId = insurances.dtValue;
          obj.categoryName = insurances.name;
          obj.expireDate = "";
          vm.driverInsurancesList.push(obj);
        });
        vm.driverInsurancesList.forEach((i) => {
          let arr = vm.assignObj.driverInsurance.filter((d) => {
            return d.categoryId === i.categoryId;
          });
          i.expireDate = arr[0]?.expireDate;
        });
      });
    },

    // 檢查是否勾選
    hasChecked(id) {
      return !this.temp.driverLicenses.includes(id);
    },
    hasCheckedI(id) {
      return !this.temp.driverInsurance.includes(id);
    },
  },
  async mounted() {
    await this.getList();
    this.getDriverLicenses();
    this.getDriverInsurances();
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
