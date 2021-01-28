<template>
  <div class="flex-column driver">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 關鍵字搜尋 -->
        <el-input style="width: 200px; margin-right: 0.5rem" size="mini" v-model="value" clearable placeholder="請輸入關鍵字"></el-input>

        <!-- 縣市選擇 -->
        <el-select size="mini" v-model="value" clearable placeholder="請選擇縣市">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="醫療院所管理"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table ref="mainTable" height="calc(100% - 52px)" :data="gridData" v-if="gridData" border fit highlight-current-row style="width: 100%" @selection-change="handleSelectionChange" @row-click="rowClick">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column property="name" label="名稱" width="120" align="center"></el-table-column>
          <el-table-column property="phone" label="市話" width="170" align="center"></el-table-column>
          <el-table-column property="uid" label="縣市" min-width="140" align="center"></el-table-column>
          <el-table-column property="tel" label="區域" min-width="170" align="center"></el-table-column>
          <el-table-column property="tel" label="地址" min-width="170" align="center"></el-table-column>

          <el-table-column property="setting" label="操作" :fixed="isMobile()" width="220">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" type="warning" @click="handleEdit(scope.row)" v-if="hasButton('edit')">編輯</el-button>
                <el-button size="mini" type="success" @click="handleDetail(scope.row)" v-if="hasButton('detail')">檢視</el-button>
                <el-button size="mini" type="danger" @click="getButtons(scope)" v-if="hasButton('delete')">刪除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" />
      </div>
    </div>
  </div>
</template>

<script>
import pbMixins from "@/mixins/permissionBtn.js";

import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
export default {
  name: "driver",
  mixins: [pbMixins],
  components: {
    Sticky,
    Title,
    permissionBtn,
    Pagination,
  },
  data() {
    return {
      value: "",
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
      // main data
      total: 200,
      listQuery: {
        page: 20,
        limit: 20,
      },
      multipleSelection: [], // 列表checkbox選中的值
      gridData: [
        {
          lock: 1,
          pic: "Ｏ",
          name: "王小虎",
          code: "109X20404",
          uid: "A203******",
          birth: "1954-07-18",
          sex: 0,
          phone: "0921079303",
          tel: "職業小客車",
          status: 1,
          setting: "功能按鈕",
        },
        {
          lock: 1,
          pic: "Ｏ",
          name: "王小虎",
          code: "109X20404",
          uid: "A203******",
          birth: "1954-07-18",
          sex: 0,
          phone: "0921079303",
          tel: "職業小客車",
          status: 0,
          setting: "功能按鈕",
        },
        {
          lock: 0,
          pic: "Ｏ",
          name: "王小虎",
          code: "109X20404",
          uid: "A203******",
          birth: "1954-07-18",
          sex: 1,
          phone: "0921079303",
          tel: "職業小客車",
          status: 1,
          setting: "功能按鈕",
        },
      ],
    };
  },
  methods: {
    // 是否為移動端
    isMobile() {
      const vm = this;
      if (vm.$store.state.app.device === "mobile") {
        return null;
      } else {
        return "right";
      }
    },

    // table 功能
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },

    // 主要功能按鈕
    onBtnClicked(domId) {
      console.log(domId);
      switch (domId) {
        case "unitB":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }
          this.handleUnitB(this.multipleSelection[0]);
          break;
        case "add":
          this.$router.push("/driver/add/1");
          break;
        default:
          break;
      }
    },
    handleDetail(driver) {
      this.$router.push(`/driver/detail/${driver.uid}`);
    },
    handleEdit(driver) {
      this.$router.push(`/driver/edit/${driver.uid}`);
    },
  },
  mounted() {},
};
</script>

<style></style>
