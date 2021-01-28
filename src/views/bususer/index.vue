<template>
  <div class="flex-column publicExpense">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 關鍵字搜尋 -->
        <el-input style="width: 200px; margin-right: 0.5rem" size="mini" v-model="listQuery.key" clearable placeholder="請輸入關鍵字"></el-input>
        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 巴士用戶 -->
      <Title title="巴士用戶"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table ref="mainTable" height="calc(100% - 52px)" :data="list" border fit v-loading="listLoading" highlight-current-row style="width: 100%" @selection-change="handleSelectionChange" @row-click="rowClick">
          <!-- <el-table-column
            type="selection"
            width="55"
            align="center"
          ></el-table-column> -->
          <el-table-column property="name" label="用戶姓名" width="200" align="center"></el-table-column>
          <!-- <el-table-column
            property="sex"
            label="性別"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <div>
                <i
                  style="color: #d63737"
                  v-if="!scope.row.sex"
                  class="iconfont icon-Vector5"
                ></i>
                <i
                  style="color: #227294"
                  v-else
                  class="iconfont icon-Vector6"
                ></i>
              </div>
            </template>
          </el-table-column> -->
          <el-table-column property="uid" label="身分證字號" width="200" align="center">
            <template slot-scope="scope">
              {{ scope.row.uid | hideFilter }}
            </template>
          </el-table-column>
          <el-table-column property="phone" label="手機" width="200" align="center"></el-table-column>

          <el-table-column property="cardNo" label="卡號" align="center"></el-table-column>
          <!-- <el-table-column
            property="status"
            label="狀態"
            width="130"
            align="center"
          >
            <template slot-scope="scope">
              <div>
                <el-tag v-if="scope.row.status" type="success">可派發</el-tag>
                <el-tag v-else type="danger">不可派發</el-tag>
              </div>
            </template>
          </el-table-column> -->
          <el-table-column property="setting" label="操作" fixed="right" width="250">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" @click="handleDispatch(scope.row)" type="info" v-if="hasButton('dispatch')">預約</el-button>
                <el-button size="mini" @click="handleEdit(scope.row)" type="success" v-if="hasButton('edit')">編輯</el-button>
                <el-button size="mini" @click="handleCheck(scope.row)" type="warning" v-if="hasButton('check')">檢視</el-button>
              </div>
            </template>
          </el-table-column>

          <!-- <el-table-column property="address" label="地址"></el-table-column> -->
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
import pbMixins from "@/mixins/permissionBtn.js";

import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import elDragDialog from "@/directive/el-dragDialog";
import Pagination from "@/components/Pagination";

import * as busUsers from "@/api/busUsers";
export default {
  name: "publicExpense",
  mixins: [pbMixins],
  components: {
    Sticky,
    Title,
    permissionBtn,
    Pagination,
  },
  directives: {
    elDragDialog,
  },
  data() {
    return {
      value: "",
      // 表格相關
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
      },

      multipleSelection: [], // 列表checkbox選中的值
    };
  },
  filters: {
    phoneFilter(phone) {
      return `${phone.slice(0, 4)}****`;
    },
  },
  methods: {
    // 獲取巴士用戶資料
    getList() {
      const vm = this;
      vm.listLoading = true;
      busUsers.load(vm.listQuery).then((res) => {
        console.log(res.data);
        vm.list = res.data;
        vm.total = res.count;
        vm.listLoading = false;
      });
    },
    //預約
    handleDispatch(user) {
      let id = `${user.userId}-${user.id}`;
      this.$router.push(`/bususer/dispatch/${id}`);
    },
    // 編輯
    handleEdit(user) {
      console.log(user);
      let id = `${user.userId}-${user.id}`;
      this.$router.push(`/bususer/edit/${id}`);
    },
    // 檢視
    handleCheck(user) {
      let id = `${user.userId}-${user.id}`;
      this.$router.push(`/bususer/check/${id}`);
    },
    // 換頁
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
    onBtnClicked(domId) {
      switch (domId) {
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

<style></style>
