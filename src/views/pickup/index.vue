<template>
  <div class="flex-column pickup">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 用戶身份選擇 -->
        <el-select size="mini" @change="end = end + 200" v-model="value" clearable placeholder="請選擇用戶身份">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>

        <!-- 服務單位選擇 -->
        <el-select size="mini" v-model="value" clearable placeholder="請選擇服務單位">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>

        <!-- 日期選擇 -->
        <el-date-picker size="mini" v-model="value1" type="date" placeholder="選擇日期"></el-date-picker>

        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 接送數據 -->
      <div class="chartContainer">
        <Title title="接送數據"></Title>
        <div class="cardContainer" v-if="list">
          <div class="dataCard">
            <i class="iconfont icon-chart"></i>
            <p>總趟次</p>
            <count-to class="card-panel-num" :startVal="0" :endVal="list.totalTrip" :duration="2000"></count-to>
          </div>

          <div class="dataCard">
            <i class="iconfont icon-success"></i>
            <p>已完成(共乘)</p>
            <count-to class="card-panel-num" :startVal="0" :endVal="list.carpoolCompleteTrip" :duration="2000"></count-to>
          </div>

          <div class="dataCard">
            <i class="iconfont icon-success"></i>
            <p>已完成(非共乘)</p>
            <count-to class="card-panel-num" :startVal="0" :endVal="list.completeTrip" :duration="2000"></count-to>
          </div>

          <div class="dataCard">
            <i class="iconfont icon-Frame1304"></i>
            <p>空趟</p>
            <count-to class="card-panel-num" :startVal="0" :endVal="list.noSeatTrip" :duration="2000"></count-to>
          </div>

          <div class="dataCard">
            <i class="iconfont icon-InfoCircle"></i>
            <p>未執行</p>
            <count-to class="card-panel-num" :startVal="0" :endVal="list.unExecutionTrip" :duration="2000"></count-to>
          </div>

          <div class="dataCard">
            <i class="iconfont icon-Star"></i>
            <p>達成率</p>
            <count-to class="card-panel-num" :startVal="0" :endVal="list.completeRate" :duration="2000"></count-to>
          </div>
        </div>
      </div>

      <!-- 本週接送 -->
      <!-- <div class="weeklyContainer">
        <Title title="本周接送狀況"></Title>
        <ve-line class="chartMargin" :data="chartData"></ve-line>
      </div> -->
    </div>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import CountTo from "vue-count-to";
import permissionBtn from "@/components/PermissionBtn";

import * as report from "@/api/report";
export default {
  name: "todaypickup",
  components: {
    Sticky,
    CountTo,
    Title,
    permissionBtn,
  },
  data() {
    return {
      list: "",
      listQuery: {
        StartDate: null,
        EndDate: null,
        OrgId: "",
        Sex: null,
      },

      value: "",
      value1: "",
      options: [
        {
          value: "選項1",
          label: "選項1",
        },
        {
          value: "選項2",
          label: "選項2",
        },
        {
          value: "選項3",
          label: "選項3",
        },
        {
          value: "選項4",
          label: "選項4",
        },
        {
          value: "選項5",
          label: "選項5",
        },
      ],
      end: 395,
      chartData: {
        columns: ["日期", "已完成", "空趟", "未執行", "總趟次"],
        rows: [
          { 日期: "1/1", 已完成: 1393, 空趟: 1093, 未執行: 32, 總趟次: 2000 },
          { 日期: "1/2", 已完成: 300, 空趟: 19, 未執行: 42, 總趟次: 450 },
          { 日期: "1/3", 已完成: 493, 空趟: 93, 未執行: 35, 總趟次: 2100 },
          { 日期: "1/4", 已完成: 193, 空趟: 293, 未執行: 62, 總趟次: 30 },
          { 日期: "1/5", 已完成: 123, 空趟: 133, 未執行: 77, 總趟次: 230 },
        ],
      },
    };
  },
  methods: {
    /* 獲取接送數據 */
    getList() {
      report.getPickUp(this.listQuery).then((res) => {
        console.log(res);
        this.list = res.result;
      });
    },
    /* 權限按鈕 */
    onBtnClicked(domId) {
      switch (domId) {
        case "violationBtn":
          this.violationDialog = true;
          break;
        case "search":
          this.getList();
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    this.getList();
  },
};
</script>
 
<style lang="scss" scoped>
.cardContainer {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.dataCard {
  background: #fff;
  width: 200px;
  height: 250px;
  margin: 0.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 2px;

  p {
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.5rem;
    color: #444141;
  }
}

.iconfont {
  font-size: 4rem;
  font-weight: 700;
  color: $--color-primary;
}

.card-panel-num {
  font-weight: 600;
  font-size: 2rem;
  color: $--color-primary;
}
</style>
