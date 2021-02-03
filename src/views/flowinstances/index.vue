<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" size="mini" prefix-icon="el-icon-search" style="width: 200px;margin-bottom: 0;" class="filter-item" :placeholder="'名稱'" v-model="listQuery.key"></el-input>
        <permission-btn moduleName="/flowinstances/index" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>

        <el-checkbox class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1" v-model="showDescription">描述</el-checkbox>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <el-table height="calc(100% - 52px)" ref="mainTable" :key="tableKey" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%;" @row-click="rowClick" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55"></el-table-column>

        <el-table-column :label="'實例編碼'" min-width="80px">
          <template slot-scope="scope">
            <span>{{scope.row.code}}</span>
          </template>
        </el-table-column>

        <el-table-column :label="'名稱'">
          <template slot-scope="scope">
            <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.customName}}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="80px" :label="'當前活動節點'">
          <template slot-scope="scope">
            <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.activityName}}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="150px" v-if="showDescription" :label="'描述'">
          <template slot-scope="scope">
            <span style="color:red;">{{scope.row.description}}</span>
          </template>
        </el-table-column>

        <el-table-column class-name="status-col" :label="'狀態'" width="100">
          <template slot-scope="scope">
            <span :class="scope.row.isFinish | statusFilter">{{statusOptions.find(u =>u.key == scope.row.isFinish).display_name}}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
    </div>
  </div>
</template>

<script>
// import Layout from "@/views/layout/Layout";
import * as flowinstances from "@/api/flowinstances";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "flowInstance",
  components: {
    Sticky,
    permissionBtn,
    Pagination,
  },
  directives: {
    waves,
  },
  data() {
    return {
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
      },
      statusOptions: [
        {
          key: 0,
          display_name: "正在運行",
        },
        {
          key: 1,
          display_name: "完成",
        },
        {
          key: 2,
          display_name: "未知",
        },
        {
          key: 3,
          display_name: "沒有通過",
        },
        {
          key: 4,
          display_name: "完成",
        },
      ],
      showDescription: true,
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        create: "添加",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [
          {
            required: true,
            message: "名稱不能為空",
            trigger: "blur",
          },
        ],
      },
      downloadLoading: false,
    };
  },
  filters: {
    statusFilter(isFinish) {
      const statusMap = {
        0: "color-info",
        1: "color-success",
        2: "color-danger",
        3: "color-danger",
        4: "color-danger",
      };
      return statusMap[isFinish];
    },
  },
  computed: {
    ...mapGetters(["isMineRender"]),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (vm.isMineRender) {
        vm.getList();
      }
    });
  },
  created() {
    this.getList();
  },
  methods: {
    ...mapActions(["updateInstancesIsRender"]),
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onBtnClicked: function (domId) {
      console.log("you click:" + domId);
      switch (domId) {
        case "btnAdd":
          this.$router.push("/flowinstances/add/1");
          break;
        case "btnDetail":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行查看",
              type: "error",
            });
            return;
          }
          this.handleUpdate(this.multipleSelection[0]);
          break;
        case "btnDel":
          if (this.multipleSelection.length < 1) {
            this.$message({
              message: "至少刪除一個",
              type: "error",
            });
            return;
          }
          this.handleDelete(this.multipleSelection);
          break;
        default:
          break;
      }
    },
    getList() {
      this.listLoading = true;
      flowinstances.getList(this.listQuery).then((response) => {
        this.list = response.data;
        this.total = response.count;
        this.listLoading = false;
        this.updateInstancesIsRender({ type: "isMineRender", val: false });
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    handleModifyStatus(row, isFinish) {
      // 模擬修改狀態
      this.$message({
        message: "操作成功",
        type: "success",
      });
      row.isFinish = isFinish;
    },
    handleUpdate(row) {
      // 彈出編輯框
      this.$router.push("/flowinstances/detail/" + row.id);
    },
    handleDelete(rows) {
      // 多行刪除
      flowinstances.del(rows.map((u) => u.id)).then(() => {
        this.updateInstancesIsRender({ type: "", val: true });
        this.$notify({
          title: "成功",
          message: "刪除成功",
          type: "success",
          duration: 2000,
        });
        rows.forEach((row) => {
          const index = this.list.indexOf(row);
          this.list.splice(index, 1);
        });
      });
    },
  },
};
</script>