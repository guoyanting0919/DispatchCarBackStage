<template>
  <div class="flex-column startEndRatio">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">

        <!-- 車輛類別 -->
        <el-select style="width:100px" clearable size="mini" @change="getList" v-model="listQuery.CarCategoryId" placeholder="車輛類別">
          <el-option v-for="item in carCategorysList" :value="item.value" :label="item.label" :key="item.value"></el-option>
        </el-select>

        <!-- 用戶類別 -->
        <el-select style="width:120px" clearable size="mini" @change="getList" v-model="listQuery.UserType" placeholder="用戶類別">
          <el-option v-for="item in userCategorysList" :value="item.value" :label="item.label" :key="item.value"></el-option>
        </el-select>

        <!-- 車輛來源 -->
        <el-select style="width:150px" clearable size="mini" v-model="listQuery.CarFrom" placeholder="車輛來源" @change="getList">
          <el-option :value="'1'" :label="'獎助'"></el-option>
          <el-option :value="'2'" :label="'自購'"></el-option>
          <el-option :value="'3'" :label="'捐贈'"></el-option>
        </el-select>

        <!-- 服務單位選擇 -->
        <el-select style="width:150px" filterable v-if="orgList" size="mini" @change="getList" v-model="listQuery.OrgId" clearable placeholder="服務單位">
          <el-option v-for="org in orgList" :key="org.id" :label="org.name" :value="org.id"></el-option>
        </el-select>

        <!-- 日期選擇 -->
        <el-date-picker value-format="yyyy-MM-dd" size="mini" v-model="dateRange" type="daterange" start-placeholder="開始日期" end-placeholder="结束日期" @change="getList"></el-date-picker>

        <permission-btn size="mini" moduleName="modulemanager" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="起迄區域比率"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <LoadingWord :active='loadingActive' :text='"LOADING..."'></LoadingWord>
        <el-table ref="mainTable" :data="list" border fit highlight-current-row style="width: 100%" height="calc(100% - 52px)" @row-click="rowClick" @selection-change="handleSelectionChange">
          <!-- <el-table-column align="center" type="selection" width="55" fixed></el-table-column> -->
          <el-table-column align='center' :label="'區域'" prop="areaName"> </el-table-column>

          <el-table-column sortable align='center' width="250px" :label="'起點趟次'" prop="startTrip"> </el-table-column>

          <el-table-column sortable align='center' width="250px" :label="'起點趟次比率'" prop="stratRate">
            <template slot-scope="scope">
              <span>{{ scope.row.stratRate | ratioFilter }}</span>
            </template>
          </el-table-column>

          <el-table-column sortable align='center' width="250px" :label="'迄點趟次'" prop="endTrip"> </el-table-column>

          <el-table-column sortable align='center' width="250px" :label="'迄點趟次比率'" prop="endRate">
            <template slot-scope="scope">
              <span>{{ scope.row.endRate | ratioFilter }}</span>
            </template>
          </el-table-column>

          <!-- <el-table-column sortable align='center' width="80" :label="'使用率(%)'" prop="useRate">
            <template slot-scope="scope">
              <span>{{ scope.row.useRate | ratioFilter }}</span>
            </template>
          </el-table-column> -->

        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";
import { getToken } from "@/utils/auth";
import pbMixins from "@/mixins/permissionBtn.js";

/* components */
import Sticky from "@/components/Sticky";
import LoadingWord from "@/components/LoadingWord";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
// import Pagination from "@/components/Pagination";

/* API */
import * as categorys from "@/api/categorys";
import * as orgs from "@/api/login";
import * as report from "@/api/report";

export default {
  name: "startEndRatio",
  mixins: [pbMixins],
  components: { Sticky, Title, permissionBtn, LoadingWord },
  data() {
    return {
      currentPath: "",
      /* loading */
      loadingActive: false,
      /* 車輛類別 */
      carCategorysList: [],
      /* 身份類別 */
      userCategorysList: [],
      /* 組織列表 */
      orgList: [],

      dateRange: [],
      multipleSelection: [],
      list: [], // 菜單列表
      listQuery: {
        StartDate: null,
        EndDate: null,
        UserType: "", //用戶類別
        CarFrom: "", //車輛來源
        CarCategoryId: "", //車輛類別
        OrgId: "", //所屬單位
      },
    };
  },
  filters: {
    ratioFilter(num) {
      return (num * 1).toFixed(2);
    },
  },
  methods: {
    /* 獲取主要資料 */
    getList() {
      const vm = this;
      vm.loadingActive = true;
      this.listQuery.StartDate = this.dateRange?.[0];
      this.listQuery.EndDate = this.dateRange?.[1];
      let fnName =
        vm.currentPath === "startendratio"
          ? "getStartEndRatio"
          : "getStartEndRatioB";
      report[fnName](vm.listQuery).then((res) => {
        vm.$cl(res);
        console.log(res);
        vm.list = res.result;
        vm.loadingActive = false;
      });
    },

    /* 獲取所有車輛類型 */
    getCarCategorys() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_CAR",
      };
      categorys.getSimpleList(query).then((res) => {
        vm.carCategorysList = res.result.filter((car) => {
          return (
            car.value === "SYS_CAR_GENERAL" || car.value === "SYS_CAR_WEAL"
          );
        });
      });
    },

    /* 獲取所有用戶身份 */
    getUserCategorys() {
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_USERCATEGORY",
      };
      categorys.getSimpleList(query).then((res) => {
        this.userCategorysList = res.result;
      });
    },

    /* 獲取用戶組織 */
    getOrg() {
      orgs.getOrgs().then((res) => {
        this.orgList = res.result;
      });
    },

    /* 匯出報表 */
    handleExpoort() {
      const vm = this;
      let crlName =
        vm.currentPath === "startendratio"
          ? "ExportSEareaReportByCaseOrgA"
          : "ExportSEareaReportByOrderOrg";
      vm.loadingActive = true;
      let {
        StartDate,
        EndDate,
        OrgId,
        UserType,
        CarFrom,
        CarCategoryId,
      } = vm.listQuery;
      StartDate = moment(StartDate).format("yyyy-MM-DD");
      EndDate = moment(EndDate).format("yyyy-MM-DD");
      const nowTime = Date.parse(new Date());
      let config = {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "blob", //// 回應類型為 blob
      };
      config.headers["X-Token"] = getToken();
      axios
        .get(
          `${process.env.VUE_APP_BASE_API}Reports/${crlName}?StartDate=${StartDate}&EndDate=${EndDate}&OrgId=${OrgId}&UserType=${UserType}&CarFrom=${CarFrom}&CarCategoryId=${CarCategoryId}`,
          config
        )
        .then((res) => {
          let blob = new Blob([res.data], {
            type: "application/" + res.headers["content-type"],
          });
          let downloadElement = document.createElement("a");
          let href = window.URL.createObjectURL(blob); // 創建下載的鏈接
          downloadElement.href = href;
          downloadElement.download = `起迄區域比率報表${nowTime}.xlsx`; // 下載後文件名
          // 此寫法兼容可火狐瀏覽器
          document.body.appendChild(downloadElement);
          downloadElement.click(); // 點擊下載
          document.body.removeChild(downloadElement); // 下載完成移除元素
          window.URL.revokeObjectURL(href); // 釋放掉 blob 對象

          vm.$nextTick(() => {
            vm.loadingActive = false;
          });
        })
        .catch(() => {
          vm.$alertM.fire({
            icon: "error",
            title: "下載失敗",
          });
          vm.loadingActive = false;
        });
    },

    /* 新增資料 */
    handleAdd() {},

    /* 編輯資料 */
    handleUpdate() {},

    /* 刪除資料 */
    handleDelete() {},

    /* 獲取單筆資料 */
    handleGet() {},

    /* 權限按鈕中控 */
    onBtnClicked(domId) {
      this.$cl(domId);
      const vm = this;
      switch (domId) {
        case "export":
          vm.$swal({
            title: "匯出提示",
            text: `匯出資料將與搜尋結果相同`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#227294",
            cancelButtonColor: "#d63737",
            confirmButtonText: "確認匯出",
            cancelButtonText: "取消匯出",
          }).then((result) => {
            if (result.value) {
              vm.handleExpoort();
            } else {
              vm.$alertT.fire({
                icon: "info",
                title: "已取消匯出",
              });
            }
          });
          break;
        case "search":
          this.getList();
          break;
        default:
          break;
      }
    },
    rowClick() {},
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
  },
  mounted() {
    this.$set(
      this.dateRange,
      0,
      moment().subtract(1, "month").format("yyyy-MM-DD")
    );
    this.$set(this.dateRange, 1, moment().format("yyyy-MM-DD"));
    this.getList();
    this.getCarCategorys();
    this.getUserCategorys();
    this.getOrg();
  },
  created() {
    this.currentPath = this.$route.path.split("/")[1];
  },
};
</script>

<style lang='scss' scoped>
</style>