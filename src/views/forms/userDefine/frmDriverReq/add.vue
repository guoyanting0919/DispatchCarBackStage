<template>
  <el-container style="border: 1px solid #eee">
    <el-main>
      <el-form :label-position="labelPosition" label-width="200px" :model="temp" :rules="rules" ref="form">
        <SubTitle title="基本資料編輯"></SubTitle>
        <el-row :gutter="16">
          <el-col :sm="12" :md="6">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="temp.name" placeholder="請輸入姓名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="身分證字號" prop="uid">
              <el-input v-model="temp.uid" placeholder="請輸入身分證字號"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="手機" prop="phone">
              <el-input v-model="temp.phone" placeholder="請輸入手機"></el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :md="6">
            <el-form-item label="性別" prop="sex">
              <el-select v-model="temp.sex" placeholder="請選擇性別" style="width: 100%">
                <el-option :value="1" :label="'男'">男</el-option>
                <el-option :value="0" :label="'女'">女</el-option>
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
        </el-row>

        <SubTitle title="司機證照"></SubTitle>
        <div class="tableContainer">
          <div class="tableHeader">
            <div class="headerCheckBox">證照類型</div>
            <div class="expireDate">證照到期日</div>
          </div>
          <el-checkbox-group v-model="temp.driverLicenses">
            <div v-for="license in driverLicensesList" :key="license.categoryId" style="border-bottom: 1px solid #ddd; display: flex">
              <el-checkbox :label="license.categoryId" name="type" style="width: 50%; text-align: center; padding: 1rem">
                {{ license.categoryName }}
              </el-checkbox>
              <div class="expireDateBox">
                <el-date-picker style="width: 70%" :disabled="hasChecked(license.categoryId)" v-model="license.expireDate" value-format="yyyy-MM-dd" type="date" size="mini" placeholder="選擇日期"></el-date-picker>
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
              <el-checkbox :label="insurance.categoryId" style="width: 50%; text-align: center; padding: 1rem">
                {{ insurance.categoryName }}
              </el-checkbox>
              <div class="expireDateBox">
                <el-date-picker :disabled="hasCheckedI(insurance.categoryId)" style="width: 70%" value-format="yyyy-MM-dd" v-model="insurance.expireDate" type="date" size="mini" placeholder="選擇日期"></el-date-picker>
              </div>
            </div>
          </el-checkbox-group>
        </div>

        <SubTitle title="備註"></SubTitle>
        <el-input type="textarea" :rows="2" placeholder="請输入内容" v-model="temp.remark"></el-input>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters } from "vuex";

import SubTitle from "@/components/SubTitle";

import * as forms from "@/api/forms";

import * as categorys from "@/api/categorys";
// import * as drivers from "@/api/drivers";

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
      labelPosition: "top",
      // 司機證照
      driverLicensesList: [],
      // 司機保險
      driverInsurancesList: [],
      temp: {
        // id: "",
        // userId: "",
        // account: "",
        // password: "",
        uid: "",
        name: "",
        pic: "",
        orgId: "",
        sex: null,
        status: 1,
        phone: "",
        remark: "",
        driverLicenses: [],
        driverInsurance: [],
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
    driverInsurancesChecked() {
      return this.driverInsurancesList.filter((option) =>
        this.temp.driverInsurance.some(
          (checked) => checked === option.categoryId
        )
      );
    },
    driverLicensesChecked() {
      return this.driverLicensesList.filter((option) =>
        this.temp.driverLicenses.some(
          (checked) => checked === option.categoryId
        )
      );
    },
  },

  methods: {
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
          vm.driverLicensesList.push(obj);
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
      });
    },

    // 確認新增司機
    handleSave() {
      const vm = this;
      vm.temp.orgId = vm.defaultorgid;
      let obj = JSON.parse(JSON.stringify(vm.temp));
      obj.driverLicenses = JSON.stringify(vm.driverLicensesChecked);
      obj.driverInsurance = JSON.stringify(vm.driverInsurancesChecked);
      return obj;
    },

    // 檢查是否勾選
    hasChecked(id) {
      return !this.temp.driverLicenses.includes(id);
    },
    hasCheckedI(id) {
      return !this.temp.driverInsurance.includes(id);
    },
    handleChange(file, fileList) {
      this.temp.files = fileList
        .filter((u) => u.status === "success")
        .map((u) => u.response.result[0])
        .map((u) => {
          return {
            fileName: u.fileName,
            filePath: u.filePath,
          };
        });
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `當前限制選擇 3 個文件，本次選擇了 ${files.length} 個文件，共選擇了 ${
          files.length + fileList.length
        } 個文件`
      );
    },
    beforeRemove(file) {
      return this.$confirm(`確定移除 ${file.name}？`);
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
      let obj = JSON.parse(JSON.stringify(vm.temp));
      obj.driverLicenses = JSON.stringify(vm.driverLicensesChecked);
      obj.driverInsurance = JSON.stringify(vm.driverInsurancesChecked);
      return obj;
    },
  },
  mounted() {
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

