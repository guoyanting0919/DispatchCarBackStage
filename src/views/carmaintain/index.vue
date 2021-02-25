<template>
  <div class="flex-column carMaintain">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 服務單位選擇 -->
        <el-select v-if="orgList" size="mini" @change="getList" v-model="listQuery.OrgId" clearable placeholder="請選擇服務單位">
          <el-option :label="'全部單位'" :value="''"></el-option>
          <el-option v-for="org in orgList" :key="org.id" :label="org.name" :value="org.id"></el-option>
        </el-select>

        <permission-btn size="mini" moduleName="modulemanager" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="車輛保養紀錄"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table ref="mainTable" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 52px)" @row-click="rowClick" @selection-change="handleSelectionChange">
          <el-table-column align="center" type="selection" width="55"></el-table-column>
          <el-table-column min-width="80px" :label="'車牌號碼'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="80px" :label="'檢查時間'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="80px" :label="'里程'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="80px" :label="'保養項目'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column min-width="80px" :label="'金額'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column property="setting" label="操作" width="80">
            <template slot-scope="scope">
              <el-button size="mini" type="success" @click="handleEdit(scope.row)" v-if="hasButton('edit')">編輯</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- add or edit diaolg -->
    <el-dialog :title="`${dialogStatus}訂單`" :visible.sync="addOrEditDialog" width="800px">
      <div class="dialogBody">
        <el-form :label-position="'top'" label-width="200px" :model="temp" ref="form" :rules="rules">
          <el-row :gutter="16">

            <el-col :sm="12" :md="12">
              <el-form-item label="檢查時間" prop="time">
                <el-date-picker style="width: 100%" v-model="temp.time" placeholder="選擇日期">
                </el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="12">
              <el-form-item label="車輛">
                <el-select filterable style="width: 100%" v-model="temp.passengerNum" placeholder="請選擇車輛">
                  <el-option v-for="car in carList" :key="car.id" :label="car.carNo" :value="car.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="12">
              <el-form-item label="里程" prop="name">
                <el-input v-model="temp.time" placeholder="請輸入里程"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="12">
              <el-form-item label="金額" prop="name">
                <el-input v-model="temp.time" placeholder="請輸入金額"></el-input>
              </el-form-item>
            </el-col>

            <el-col :sm="24" :md="24">
              <el-form-item label="保養項目">
                <el-input type="textarea" v-model="temp.desc"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addOrEditDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleEdit()">確 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
import pbMixins from "@/mixins/permissionBtn.js";

/* components */
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";

/* API */
import * as orgs from "@/api/login";
import * as cars from "@/api/cars";
// import * as carMaintain from "@/api/carMaintain";

export default {
  name: "carMaintain",
  mixins: [pbMixins],
  components: { Sticky, Title, permissionBtn, Pagination },
  data() {
    return {
      multipleSelection: [],

      /* 車輛列表 */
      carList: [],
      /* 組織列表 */
      orgList: [],

      /* 列表 */
      list: [{ name: "aaaa" }], // 菜單列表
      total: 10,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
        OrgId: "",
      },

      /* 單筆資料 */
      temp: {
        id: "",
        newsTypeId: "",
        newsTypeName: "",
        releaseDate: "2020-12-16T07:31:15.488Z",
        title: "",
        contents: "",
        attachedFile: "",
        sort: 999,
      },

      /* dialog */
      dialogStatus: "新增",
      addOrEditDialog: false,

      /* 表單驗證 */
      rules: {
        name: [{ required: true, message: "請輸入姓名", trigger: "blur" }],
      },
    };
  },
  methods: {
    /* 獲取主要資料 */
    getList() {
      // const vm = this;
      // carMaintain.load(vm.listQuery).then(res=>{
      //   vm.$cl(res)
      //   vm.list = res.result
      // })
    },

    /* 獲取所有車輛 */
    getCarList() {
      const vm = this;
      cars.load({ limit: 999, page: 1 }).then((res) => {
        vm.carList = res.data;
      });
    },

    /* 獲取用戶組織 */
    getOrg() {
      orgs.getOrgs().then((res) => {
        this.orgList = res.result;
      });
    },

    /* 新增資料 */
    handleAdd() {},

    /* 編輯資料 */
    handleEdit() {},

    /* 獲取單筆資料 */
    handleGetDetail() {
      this.addOrEditDialog = true;
      this.dialogStatus = "編輯";
    },

    /* 刪除資料 */
    handleDelete() {},

    /* 列印 */
    handlePrint() {},

    /* 權限按鈕中控 */
    onBtnClicked(domId) {
      this.$cl(domId);
      switch (domId) {
        case "add":
          this.addOrEditDialog = true;
          this.dialogStatus = "新增";
          break;
        case "edit":
          this.handleGetDetail();
          break;
        case "print":
          this.handlePrint();
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
    this.getList();
    this.getCarList();
    this.getOrg();
  },
};
</script>

<style lang='scss' scoped>
</style>