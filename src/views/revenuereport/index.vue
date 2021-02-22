<template>
  <div class="flex-column revenueReport">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 區域選擇 -->
        <el-select size="mini" v-model="value" clearable placeholder="請選擇區域">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>

        <!-- 公司選擇 -->
        <el-select size="mini" v-model="value" clearable placeholder="請選擇公司">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>

        <!-- 日期選擇 -->
        <el-date-picker size="mini" v-model="value1" type="daterange" range-separator="至" start-placeholder="開始日期" end-placeholder="结束日期"></el-date-picker>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 營收報表 -->
      <div class="reportContainer">
        <Title title="營收報表"></Title>
        <ve-bar height="300px" :data="chartData"></ve-bar>
      </div>

      <!-- 車輛使用率 -->
      <div class="carContainer">
        <Title title="車輛使用率"></Title>
        <div class="carBoxies">
          <div class="carBox" v-for="item in 5" :key="item">
            <p>NAM-03</p>
            <p>豐均國際租賃有限公司</p>
            <ve-ring class="carChart" :data="chartData2" :settings="chartSettings2"></ve-ring>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
export default {
  name: "carUse",
  components: {
    Sticky,
    Title,
  },
  data() {
    // this.chartSettings = {
    //   metrics: ["金額"],
    //   dimension: ["車牌"],
    //   yAxisName: ["單位(NTD)"],
    // };
    return {
      chartSettings: {
        metrics: ["金額"],
        dimension: ["key"],
      },
      chartData: {
        columns: ["key", "金額"],
        rows: [
          { key: "總營收", 金額: 654614 },
          { key: "個案負擔", 金額: 126768 },
          { key: "政府補助", 金額: 491846 },
        ],
      },
      chartSettings2: {
        radius: [40, 80],
        offsetY: 120,
        dimension: "key",
        metrics: "value",
      },

      chartData2: {
        columns: ["key", "value"],
        rows: [
          { key: "個案負擔", value: 30 },
          { key: "政府補助", value: 70 },
          { key: "總營收", value: 70 },
        ],
      },
      value: "",
      value1: "",
      options: [
        {
          value: "选项1",
          label: "黄金糕",
        },
        {
          value: "选项2",
          label: "双皮奶",
        },
        {
          value: "选项3",
          label: "蚵仔煎",
        },
        {
          value: "选项4",
          label: "龙须面",
        },
        {
          value: "选项5",
          label: "北京烤鸭",
        },
      ],
    };
  },
};
</script>

<style lang="scss"></style>
