<template>
  <div class="flex-column publicExpense">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 關鍵字搜尋 -->
        <el-input
          style="width: 200px; margin-right: 0.5rem"
          size="mini"
          v-model="value"
          clearable
          placeholder="請輸入關鍵字"
        ></el-input>
        <!-- 權限按鈕 -->
        <permission-btn
          moduleName="builderTables"
          size="mini"
          v-on:btn-event="onBtnClicked"
        ></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 長照個案 -->
      <Title title="長照個案"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table
          ref="mainTable"
          height="calc(100% - 52px)"
          :data="list"
          border
          fit
          v-loading="listLoading"
          highlight-current-row
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @row-click="rowClick"
        >
          <el-table-column
            type="selection"
            width="55"
            align="center"
          ></el-table-column>
          <el-table-column
            property="name"
            label="用戶姓名"
            width="200"
            align="center"
          ></el-table-column>
          <el-table-column
            property="sex"
            label="性別"
            width="150"
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
          </el-table-column>
          <el-table-column
            property="caseUserNo"
            label="個案編號"
            align="center"
          ></el-table-column>
          <el-table-column
            property="phone"
            label="手機"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.phone | phoneFilter }}
            </template>
          </el-table-column>
          <el-table-column
            property="setting"
            label="操作"
            fixed="right"
            width="350"
          >
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button
                  size="mini"
                  @click="handleDispatch(scope.row)"
                  type="info"
                  v-if="hasButton('dispatch')"
                  >預約</el-button
                >
                <el-button
                  size="mini"
                  @click="handleEdit(scope.row)"
                  type="success"
                  v-if="hasButton('edit')"
                  >編輯</el-button
                >
                <el-button
                  size="mini"
                  @click="handleCheck(scope.row)"
                  type="warning"
                  v-if="hasButton('check')"
                  >檢視</el-button
                >
                <el-button
                  size="mini"
                  @click="handleUnitB(scope.row)"
                  type="primary"
                  v-if="hasButton('unitB')"
                  >B單位</el-button
                >
                <el-button
                  size="mini"
                  @click="dispatchCaseUser(scope.row)"
                  type="primary"
                  v-if="hasButton('quota')"
                  >額度</el-button
                >
              </div>
            </template>
          </el-table-column>

          <!-- <el-table-column property="address" label="地址"></el-table-column> -->
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="handleCurrentChange"
        />
      </div>
    </div>

    <!-- unitBDialog -->
    <el-dialog
      :title="unitBDialogTitle"
      :visible.sync="unitBDialog"
      width="50%"
    >
      <el-checkbox-group v-model="checkedUnitBs" :min="0" :max="3">
        <el-checkbox
          v-for="unitB in unitBs"
          :label="unitB.id"
          :key="unitB.id"
          >{{ unitB.name }}</el-checkbox
        >
      </el-checkbox-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="unitBDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmUnitB">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import elDragDialog from "@/directive/el-dragDialog";
import Pagination from "@/components/Pagination";
import * as caseUsers from "@/api/caseUsers";
import * as orgs from "@/api/orgs";
export default {
  name: "publicExpense",
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
      buttons: [],
      // 表格相關
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
      },

      caseUserTemp: {
        userId: "", //用戶id
        id: "", //身份id
        caseUserNo: "", //個案編號
        orgAId: "", //Ａ單位(管理單位)
        orgBId1: null, //B單位1
        orgBId2: null, //B單位2
        orgBId3: null, //B單位3
        disabilityLevel: "", //失能等級
        county: "", //居住縣市
        district: "", //居住區域
        addr: "", //居住地址
        lat: 0, //經度
        lon: 0, //緯度
        urgentName: "", //聯絡人姓名
        urgentRelationship: "", //聯絡人關係
        urgentPhone: "", //聯絡人手機
        urgentTel: "", //聯絡人市話
        remark: "", //備註
        caseUserStatus: "1", //可否派發
        statusReason: "", //不可派發原因
        reviewDate: "", //額度控管留用首月,
        wealTypeId: "", //社會福利身份
        wealTypeName: "", //社會福利身份
        isEffectNow: true, //是否生效
      },

      /* dialog */
      unitBDialog: false,
      unitBs: "",
      checkedUnitBs: [],

      multipleSelection: [], // 列表checkbox選中的值
    };
  },
  computed: {
    unitBDialogTitle() {
      return `編輯長照個案 ${this.multipleSelection[0]?.name} B單位 ( ${this.checkedUnitBs.length}/3 )`;
    },
  },
  filters: {
    phoneFilter(phone) {
      return `${phone.slice(0, 4)}****`;
    },
  },
  methods: {
    /* 獲取本路由下所有功能按鈕 */
    getButtons() {
      this.$route.meta.elements.forEach((el) => {
        this.buttons.push(el.domId);
      });
    },

    /* 是否擁有按鈕功能權限 */
    hasButton(domId) {
      return this.buttons.includes(domId);
    },

    /* 獲取長照用戶資料 */
    getList() {
      const vm = this;
      vm.listLoading = true;
      caseUsers.load(vm.listQuery).then((res) => {
        console.log(res.data);
        vm.list = res.data;
        vm.total = res.count;
        vm.listLoading = false;
      });
    },

    /* 獲取所有B單位 */
    getUnitBs() {
      const vm = this;
      orgs.getOrgB().then((res) => {
        vm.unitBs = res.result;
      });
    },

    /* 獲取長照B單位 */
    handleUnitB(user) {
      const vm = this;
      console.log(user);
      vm.checkedUnitBs = [];
      vm.rowClick(user);
      let id = user.caseUserId;
      caseUsers.get({ id }).then((res) => {
        // console.log(res);
        vm.caseUserTemp = Object.assign({}, res.result); // copy obj
        let str = `${vm.caseUserTemp.orgBId1},${vm.caseUserTemp.orgBId2},${vm.caseUserTemp.orgBId3}`;
        let arr = str.split(",");
        vm.checkedUnitBs = arr.filter((id) => {
          return id !== "null";
        });

        vm.unitBDialog = true;
      });
    },

    /* 確認修改B單位 */
    confirmUnitB() {
      const vm = this;
      vm.caseUserTemp.orgBId1 = vm.checkedUnitBs[0] || null;
      vm.caseUserTemp.orgBId2 = vm.checkedUnitBs[1] || null;
      vm.caseUserTemp.orgBId3 = vm.checkedUnitBs[2] || null;
      console.log(vm.caseUserTemp);
      caseUsers.updateUnitB(vm.caseUserTemp).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.unitBDialog = false;
      });
    },

    /* 預約 */
    handleDispatch(user) {
      let id = `${user.userId}-${user.caseUserId}`;
      this.$router.push(`/caseuser/dispatch/${id}`);
    },

    /* 編輯 */
    handleEdit(user) {
      console.log(user);
      let id = `${user.userId}-${user.caseUserId}`;
      this.$router.push(`/caseuser/edit/${id}`);
    },

    /* 檢視 */
    handleCheck(user) {
      let id = `${user.userId}-${user.caseUserId}`;
      this.$router.push(`/caseuser/check/${id}`);
    },

    /* 換頁 */
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
        case "violationBtn":
          this.violationDialog = true;
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    this.getButtons();
    this.getList();
    this.getUnitBs();
  },
};
</script>

<style></style>
