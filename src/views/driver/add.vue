<template>
  <div class="flex-column driverAdd">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-button type="info" plain size="mini">回列表</el-button>
        <el-button @click="handleSave" type="success" size="mini">儲存</el-button>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="新增司機"></Title>
      <div class="bg-white formContainer customScrollBar">
        <el-form :label-position="labelPosition" label-width="200px" :model="temp" :rules="rules" ref="form">
          <SubTitle title="基本資料編輯"></SubTitle>
          <el-row :gutter="16">
            <el-col :sm="12" :md="6">
              <el-form-item label="帳號" prop="account">
                <el-input v-model="temp.account" placeholder="請輸入帳號"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="密碼" prop="password">
                <el-input v-model="temp.password" placeholder="請輸入密碼"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="temp.name" placeholder="請輸入姓名"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="司機狀態" prop="town">
                <el-select v-model="temp.town" placeholder="請選擇司機狀態" style="width: 100%">
                  <el-option :value="'在職'" :label="'在職'"></el-option>
                  <el-option :value="'離職'" :label="'離職'"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="性別" prop="sex">
                <el-select v-model="temp.sex" placeholder="請選擇性別" style="width: 100%">
                  <el-option :value="'1'" :label="'男'"></el-option>
                  <el-option :value="'0'" :label="'女'"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="手機號碼" prop="phone">
                <el-input v-model="temp.phone" placeholder="請輸入手機號碼"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="生日" prop="birthday">
                <el-date-picker v-model="temp.birthday" type="date" placeholder="請選擇生日" style="width: 100%" value-format="yyyy-MM-dd"></el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="身分證字號" prop="uid">
                <el-input v-model="temp.uid" placeholder="請輸入身分證字號"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="地址" prop="addr">
                <el-input v-model="temp.addr" placeholder="請輸入地址"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="地址經度" prop="addrLng">
                <el-input v-model="temp.addrLng" placeholder="請輸入地址經度"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="6">
              <el-form-item label="地址緯度" prop="addrLat">
                <el-input v-model="temp.addrLat" placeholder="請輸入地址緯度"></el-input>
              </el-form-item>
            </el-col>

          </el-row>

        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import SubTitle from "@/components/SubTitle";
import * as drivers from "@/api/drivers";
export default {
  name: "driverAdd",
  components: {
    Sticky,
    Title,
    SubTitle,
  },
  data() {
    return {
      labelPosition: "top",
      // 司機證照
      driverLicensesList: [],
      // 司機保險
      driverInsurancesList: [],
      temp: {
        account: "",
        password: "",
        name: "",
        thiId: null,
        town: "",
        sex: "",
        phone: "",
        birthday: "",
        uid: "",
        addr: "",
        addrLng: "",
        addrLat: "",
        driverLicense: "",
        releaseDate: "",
        highestEdu: "",
        localEvaluation: "",
        onJobDate: "",
        offJobDate: "",
      },
      rules: {
        Id: [{ required: true, message: "請輸入個案編號", trigger: "blur" }],
        city: [
          { required: true, message: "請輸入個案編號", trigger: "change" },
        ],
      },
    };
  },
  computed: {},
  methods: {
    // 確認新增司機
    handleSave() {
      const vm = this;
      vm.temp.orgId = vm.defaultorgid;
      vm.temp.account = vm.temp.phone;
      vm.temp.password = vm.temp.uid.slice(-4);
      let obj = JSON.parse(JSON.stringify(vm.temp));
      obj.driverLicenses = vm.driverLicensesChecked;
      obj.driverInsurance = vm.driverInsurancesChecked;
      drivers.add(obj).then(() => {
        // console.log(res);
        vm.$alertT.fire({
          icon: "success",
          title: `司機 ${obj.name} 新增成功`,
        });
        vm.$router.push("/driver/index");
      });
    },

    // 檢查是否勾選
    hasChecked(id) {
      return !this.temp.driverLicenses.includes(id);
    },
  },
  mounted() {},
};
</script>

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
