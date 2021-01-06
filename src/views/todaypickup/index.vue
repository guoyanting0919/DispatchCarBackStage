<template>
  <div class="flex-column todaypickup">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 區域選擇 -->
        <el-select
          size="mini"
          @change="end = end + 200"
          v-model="value"
          clearable
          placeholder="請選擇區域"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>

        <!-- 公司選擇 -->
        <el-select
          size="mini"
          v-model="value"
          clearable
          placeholder="請選擇公司"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <!-- 日期選擇 -->
        <el-date-picker
          size="mini"
          v-model="value1"
          type="date"
          placeholder="選擇日期"
        ></el-date-picker>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 本日接送 -->
      <div class="todayContainer">
        <Title title="本日接送狀況"></Title>
        <div class="todayDataContainer">
          <div class="dataBox">
            <i class="iconfont icon-console"></i>
            <p>總趟次</p>
            <count-to
              class="card-panel-num"
              :startVal="0"
              :endVal="end"
              :duration="2000"
            ></count-to>
          </div>
          <div class="dataBox">
            <i class="iconfont icon-console"></i>
            <p>總趟次</p>

            <count-to
              class="card-panel-num"
              :startVal="0"
              :endVal="end"
              :duration="2000"
            ></count-to>
          </div>
          <div class="dataBox">
            <i class="iconfont icon-console"></i>
            <p>總趟次</p>
            <count-to
              class="card-panel-num"
              :startVal="0"
              :endVal="end"
              :duration="2000"
            ></count-to>
          </div>
          <div class="dataBox">
            <i class="iconfont icon-console"></i>
            <p>總趟次</p>
            <count-to
              class="card-panel-num"
              :startVal="0"
              :endVal="end"
              :duration="2000"
            ></count-to>
          </div>
          <div class="dataBox">
            <i class="iconfont icon-console"></i>
            <p>總趟次</p>
            <count-to
              class="card-panel-num"
              :startVal="0"
              :endVal="end"
              :duration="2000"
            ></count-to>
          </div>
        </div>
      </div>

      <!-- 本週接送 -->
      <div class="weeklyContainer">
        <Title title="本周接送狀況"></Title>
        <ve-line class="chartMargin" :data="chartData"></ve-line>
      </div>
    </div>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import CountTo from "vue-count-to";
export default {
  name: "todaypickup",
  components: {
    Sticky,
    CountTo,
    Title,
  },
  data() {
    return {
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
};
</script>

<style lang="scss">
// .ttt {
//   &::-webkit-scrollbar {
//     z-index: 11;
//     width: 6px;

//     &:horizontal {
//       height: 6px;
//     }
//   }

//   &::-webkit-scrollbar-thumb {
//     border-radius: 5px;
//     width: 6px;
//     background: #ff7b00;
//   }

//   &::-webkit-scrollbar-corner,
//   &::-webkit-scrollbar-track {
//     background: #fff;
//   }

//   &::-webkit-scrollbar-track-piece {
//     background: #fff;
//     width: 6px;
//   }
// }
</style>
