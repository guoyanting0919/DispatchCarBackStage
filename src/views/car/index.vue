<template>
  <div class="flex-column car">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 關鍵字搜尋 -->
        <el-input style="width: 200px; margin-right: 0.5rem" size="mini" v-model="value" clearable placeholder="請輸入關鍵字"></el-input>

        <!-- 公司選擇 -->
        <el-select size="mini" v-model="value" clearable placeholder="請選擇公司">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="車輛資料"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table ref="mainTable" height="calc(100% - 52px)" :data="list" v-if="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" @selection-change="handleSelectionChange" @row-click="rowClick">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <!-- <el-table-column
            property="pic"
            label="照片"
            width="80"
            align="center"
          ></el-table-column> -->
          <el-table-column property="carNo" label="車牌號碼" width="120" align="center"></el-table-column>
          <el-table-column property="carCategoryName" label="車輛類別" min-width="140" align="center">
          </el-table-column>
          <el-table-column property="carTop" label="車頂高度" width="120" align="center"></el-table-column>
          <el-table-column property="factoryType" label="廠牌型號" width="170" align="center"></el-table-column>
          <el-table-column property="wheelchairNum" label="輪椅數量" min-width="170" align="center"></el-table-column>
          <el-table-column property="seatNum" label="座椅數量" min-width="170" align="center"></el-table-column>
          <el-table-column property="driverName" label="司機姓名" min-width="170" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.driverName }}</span>
            </template>
          </el-table-column>
          <el-table-column property="status" label="狀態" width="130" align="center">
            <template slot-scope="scope">
              <div>
                <el-tag v-if="scope.row.status" type="success">可派發</el-tag>
                <el-tag v-else type="danger">不可派發</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column property="setting" label="操作" :fixed="isMobile()" width="220">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" type="warning" @click="handleEdit(scope.row)" v-if="hasButton('edit')">編輯</el-button>
                <el-button size="mini" type="success" @click="handleDetail(scope.row)" v-if="hasButton('check')">檢視</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.row)" v-if="hasButton('delete')">刪除</el-button>
              </div>
            </template>
          </el-table-column>
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
import Pagination from "@/components/Pagination";

import * as cars from "@/api/cars";
import * as drivers from "@/api/drivers";
export default {
  name: "car",
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
      // 司機列表
      driverList: [],
      // main data
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
        OrgId: "",
      },
      multipleSelection: [], // 列表checkbox選中的值
    };
  },
  filters: {
    driverFilter(id, driverList) {
      // const vm = this;
      let arr = driverList?.filter((category) => {
        return category.id === id;
      });
      return arr[0]?.userName;
    },
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
    // 獲取所有車輛
    getList() {
      const vm = this;
      vm.listLoading = true;
      cars.load(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
        vm.listLoading = false;
      });
    },
    //獲取所有司機
    getDrivers() {
      const vm = this;
      let query = {
        page: 1,
        limit: 999,
      };
      drivers.load(query).then((res) => {
        console.log(res);
        vm.driverList = res.data;
      });
    },

    // table 功能
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
    // 換頁
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },

    // 主要功能按鈕
    onBtnClicked(domId) {
      console.log(domId);
      switch (domId) {
        case "add":
          this.$router.push("/car/add/1");
          break;
        case "delete":
          if (this.multipleSelection.length !== 0) {
            this.handleDeleteCars(this.multipleSelection);
          }
          break;
        default:
          break;
      }
    },
    handleDetail(car) {
      this.$router.push(`/car/check/${car.id}`);
    },
    handleEdit(car) {
      console.log(car);
      this.$router.push(`/car/edit/${car.id}`);
    },
    handleDeleteCars(car) {
      const vm = this;
      vm.$swal({
        title: "刪除提示",
        text: `確認刪除已選取車輛?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#227294",
        cancelButtonColor: "#d63737",
        confirmButtonText: "確定",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.value) {
          let ids = car.map((c) => c.id);
          cars.deleteCar(ids).then((res) => {
            vm.$alertT.fire({
              icon: "success",
              title: res.message,
            });
            vm.getList();
          });
        } else {
          vm.$alertT.fire({
            icon: "info",
            title: `已取消刪除`,
          });
        }
      });
    },
    handleDelete(car) {
      const vm = this;
      vm.$swal({
        title: "刪除提示",
        text: `確認刪除車輛 車牌號碼：${car.carNo} ?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#227294",
        cancelButtonColor: "#d63737",
        confirmButtonText: "確定",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.value) {
          let ids = [car.id];
          console.log(ids);
          cars.deleteCar(ids).then((res) => {
            vm.$alertT.fire({
              icon: "success",
              title: res.message,
            });
            vm.getList();
          });
        } else {
          vm.$alertT.fire({
            icon: "info",
            title: `已取消刪除`,
          });
        }
      });
    },
  },
  mounted() {
    this.getList();
    this.getDrivers();
  },
};
</script>

<style></style>
