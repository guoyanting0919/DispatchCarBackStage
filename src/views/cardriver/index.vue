<template>
  <div class="flex-column fareParameters">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="車資參數設定"></Title>
      <div class="bg-white parametersContainer">
        <el-form :label-position="labelPosition" label-width="200px" :model="temp" :rules="rules" ref="form">
          <SubTitle title="車資參數基本設定"></SubTitle>
          <el-row :gutter="16">
            <el-col :sm="12" :md="6">
              <el-form-item label="起跳金額" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入起跳金額"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="起跳公尺數" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入起跳公尺數"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="續跳公尺數" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入續跳公尺數"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="續跳金額" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入續跳金額"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="國道通行費" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入國道通行費"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="夜間加成" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入夜間加成"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="服務費" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入服務費"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <SubTitle title="自付額比例收費倍率"></SubTitle>
          <el-row :gutter="16">
            <el-col :sm="12" :md="6">
              <el-form-item label="平地一般戶" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入倍率"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="平地中低收" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入倍率"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="平地低收" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入倍率"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="偏區一般戶" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入倍率"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="偏區中低收" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入倍率"></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="偏區低收" prop="Id">
                <el-input v-model="temp.Id" placeholder="請輸入倍率"></el-input>
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
import permissionBtn from "@/components/PermissionBtn";
export default {
  name: "fareParameters",
  components: {
    Sticky,
    Title,
    permissionBtn,
    SubTitle,
  },
  data() {
    return {
      labelPosition: "top",
      temp: {
        Id: "",
        cuty: "",
        Type: [],
        lun: [
          {
            value1: "",
            value2: "",
            value3: "",
            value4: "",
            value5: "",
          },
        ],
      },
      rules: {
        Id: [{ required: true, message: "請輸入個案編號", trigger: "blur" }],
        city: [
          { required: true, message: "請輸入個案編號", trigger: "change" },
        ],
      },
    };
  },
  methods: {
    onBtnClicked() {},
  },
};
</script>

<style lang='scss' scoped>
.parametersContainer {
  padding: 8px 16px;
}
</style>