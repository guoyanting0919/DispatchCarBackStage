<template>
  <div class="flex-column publicExpense">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 關鍵字搜尋 -->
        <el-input style="width: 200px; margin-right: 0.5rem" size="mini" v-model="value" clearable placeholder="請輸入關鍵字"></el-input>
        <!-- 權限按鈕 -->
        <permission-btn moduleName="builderTables" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 長照個案 -->
      <Title title="長照個案"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table ref="mainTable" height="calc(100% - 52px)" :data="list" border fit v-loading="listLoading" highlight-current-row style="width: 100%" @selection-change="handleSelectionChange" @row-click="rowClick">
          <el-table-column property="name" label="用戶姓名" width="200" align="center"></el-table-column>

          <el-table-column property="uid" label="身分證字號" width="200" align="center">
            <template slot-scope="scope">
              {{ scope.row.uid | hideFilter }}
            </template>
          </el-table-column>

          <el-table-column property="caseUserNo" width="200" label="個案編號" align="center"></el-table-column>

          <el-table-column property="phone" label="手機" width="200" align="center">
            <template slot-scope="scope">
              {{ scope.row.phone  }}
            </template>
          </el-table-column>

          <el-table-column property="tel" label="市話" width="200" align="center">
            <template slot-scope="scope">
              {{ scope.row.tel }}
            </template>
          </el-table-column>

          <el-table-column property="setting" label="操作" fixed="right" width="350">
            <template slot-scope="scope">
              <div class="buttonFlexBox">
                <el-button size="mini" @click="handleDispatch(scope.row)" type="info" v-if="hasButton('dispatch')">預約</el-button>
                <el-button size="mini" @click="handleEdit(scope.row)" type="success" v-if="hasButton('edit')">編輯</el-button>
                <el-button size="mini" @click="handleCheck(scope.row)" type="warning" v-if="hasButton('check')">檢視</el-button>
                <el-button size="mini" @click="handleUnitB(scope.row)" type="primary" v-if="hasButton('unitB')">B單位</el-button>
                <el-button size="mini" @click="handleQuota(scope.row)" type="primary" v-if="hasButton('quota')">額度</el-button>
              </div>
            </template>
          </el-table-column>

          <!-- <el-table-column property="address" label="地址"></el-table-column> -->
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- unitBDialog -->
    <el-dialog :title="unitBDialogTitle" :visible.sync="unitBDialog" width="50%">
      <el-checkbox-group v-model="checkedUnitBs" :min="0" :max="3">
        <el-checkbox v-for="unitB in unitBs" :label="unitB.id" :key="unitB.id">{{ unitB.name }}</el-checkbox>
      </el-checkbox-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="unitBDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmUnitB">確 定</el-button>
      </span>
    </el-dialog>

    <!-- quotaDialog -->
    <el-dialog title="可用額度" :visible.sync="quotaDialog" width="600px">
      <div class="quotaBody">
        <div class="quotaData">
          <div class="quotaDataItem">
            <p>使用額度</p>
            <h1>${{ discountTemp.useDiscount }}</h1>
          </div>
          <div class="quotaDataItem">
            <p>剩餘額度</p>
            <h1>${{ discountTemp.lastDiscount }}</h1>
          </div>
          <div class="quotaDataItem">
            <p>本月可用額度</p>
            <h1>${{ discountTemp.totalDiscount }}</h1>
          </div>
        </div>
        <div class="addQuota">
          <p>新增額度</p>
          <div class="flex alignCeter">
            <el-input style="width: 200px; margin-right: 1rem" :disabled="!hasSpecialButton('editQuota')" v-model="amt"></el-input>
            <el-button type="primary" plain size="mini" @click="amt = 0">清空</el-button>
            <el-button type="primary" size="mini" @click="confirmQuota">確定</el-button>
          </div>
        </div>
        <div class="quotaHistory">
          <p class="quotaHistoryTitle">修改記錄</p>
          <p class="noQuotaHistory" v-if="discountList.length == 0">
            無修改記錄
          </p>
          <template v-else>
            <p class="quotaHistoryData" v-for="item in discountList" :key="item.id">
              {{ item.typeName }} ${{ item.amt }}
              {{ item.createDate | globalDateFilter("yyyy-MM-DD") }}
            </p>
          </template>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import pbMixins from "@/mixins/permissionBtn.js";

import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import elDragDialog from "@/directive/el-dragDialog";
import Pagination from "@/components/Pagination";

import * as caseUsers from "@/api/caseUsers";
import * as orgs from "@/api/orgs";
import * as caseUserDiscounts from "@/api/caseUserDiscounts";
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
      specialButtons: [],
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

      /* 額度相關 */
      discountList: [],
      discountTemp: {
        caseUserId: "",
        lastDiscount: "",
        totalDiscount: "",
        useDiscount: "",
      },
      amt: 0,

      /* dialog */
      unitBDialog: false,
      quotaDialog: false,
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
    /* 獲取特殊修改權限 */
    getSpecialButtons() {
      let router2 = this.$store.getters.modules;
      let a = router2.filter((r) => {
        return r.item.name == "用戶資料";
      });
      let b = a[0].children.filter((r2) => {
        return r2.item.name == "全部用戶";
      });
      this.specialButtons = b[0].item.elements.map((btn) => {
        return btn.domId;
      });
    },

    /* 是否擁有特殊按鈕功能權限 */
    hasSpecialButton(domId) {
      return this.specialButtons.includes(domId);
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

    /* 獲取額度資料 */
    handleQuota(user) {
      const vm = this;
      this.$cl(user);
      vm.amt = 0;
      vm.rowClick(user);
      let caseUserId = user.caseUserId;
      caseUserDiscounts.get({ caseUserId }).then((res) => {
        vm.discountTemp = Object.assign({}, res.result); // copy obj
        this.quotaDialog = true;
      });
      caseUserDiscounts
        .load({ caseUserId, page: 1, limit: 9999 })
        .then((res) => {
          vm.discountList = res.data;
          this.$cl(vm.discountList);
        });
    },

    /* 確認新增額度 */
    confirmQuota() {
      const vm = this;
      let temp = {
        caseUserId: vm.discountTemp.caseUserId,
        amt: vm.amt,
      };
      caseUserDiscounts.add(temp).then((res) => {
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        this.quotaDialog = false;
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
    this.getList();
    this.getUnitBs();
    this.getSpecialButtons();
  },
};
</script>

<style lang="scss" scoped>
.quotaBody {
  width: 100%;
}
.quotaData {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.25rem;
}
.quotaDataItem {
  width: 33%;
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    font-size: 16px;
    margin-bottom: 0.75rem;
  }
}
.addQuota {
  margin-bottom: 1.25rem;
  p {
    font-size: 16px;
    margin-bottom: 0.5rem;
  }
}
.quotaHistoryTitle {
  font-size: 1rem;
  background: $--color-primary-light-8;
  padding: 0.5rem 0;
}

.quotaHistoryData {
  padding: 0.25rem 0;
  border-bottom: 1px solid $--color-primary-light-8;

  &:nth-child(2n + 1) {
    background: $--color-primary-light-9;
  }
}

.noQuotaHistory {
  text-align: center;
  color: red;
}
</style>
