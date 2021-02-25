<template>
  <div class="flex-column noticeSetting">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input style="width: 200px; margin-right: 0.5rem" size="mini" clearable placeholder="請輸入關鍵字"></el-input>
        <permission-btn size="mini" moduleName="modulemanager" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="通知設定"></Title>
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item name="letter">
          <template slot="title">
            <p class="collapseTitle">簡訊設定</p>
          </template>

          <el-form :label-position="'top'" label-width="200px" :model="temp" ref="form" style="padding:0.5rem 1rem">
            <el-row :gutter="16">

              <el-col :sm="12" :md="6">
                <el-form-item label="是否啟用">
                  <el-switch active-text="啟用" inactive-text="關閉" v-model="letterTemp.isEnable"></el-switch>
                </el-form-item>
              </el-col>

              <el-col :sm="12" :md="6">
                <el-form-item label="簡訊公司">
                  <el-select style="width: 100%" v-model="letterTemp.smsProvider" placeholder="請選擇簡訊公司">
                    <el-option :label="'EVERY8DSMS'" :value="'EVERY8DSMS'"> </el-option>
                    <el-option :label="'KOTSMS'" :value="'KOTSMS'"> </el-option>
                    <el-option :label="'MITALKSMS'" :value="'MITALKSMS'"> </el-option>
                    <el-option :label="'SMSGO'" :value="'SMSGO'"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :sm="12" :md="6">
                <el-form-item label="帳號" prop="name">
                  <el-input v-model="letterTemp.smsAccount" placeholder="請輸入帳號"></el-input>
                </el-form-item>
              </el-col>

              <el-col :sm="12" :md="6">
                <el-form-item label="密碼" prop="name">
                  <el-input type='password' :show-password='true' v-model="letterTemp.smsPassword" placeholder="請輸入密碼"></el-input>
                </el-form-item>
              </el-col>

            </el-row>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="email">
          <template slot="title">
            <p class="collapseTitle">信箱設定</p>
          </template>
          <el-form :label-position="'top'" label-width="200px" :model="temp" ref="form" style="padding:0.5rem 1rem">
            <el-row :gutter="16">

              <el-col :sm="12" :md="6">
                <el-form-item label="是否啟用">
                  <el-switch active-text="啟用" inactive-text="關閉" v-model="letterTemp.isEnable"></el-switch>
                </el-form-item>
              </el-col>

              <el-col :sm="12" :md="6">
                <el-form-item label="簡訊公司">
                  <el-select style="width: 100%" v-model="letterTemp.SMSProvider" placeholder="請選擇簡訊公司">
                    <el-option :label="'EVERY8DSMS'" :value="'EVERY8DSMS'"> </el-option>
                    <el-option :label="'KOTSMS'" :value="'KOTSMS'"> </el-option>
                    <el-option :label="'MITALKSMS'" :value="'MITALKSMS'"> </el-option>
                    <el-option :label="'SMSGO'" :value="'SMSGO'"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :sm="12" :md="6">
                <el-form-item label="帳號" prop="name">
                  <el-input v-model="letterTemp.smsAccount" placeholder="請輸入帳號"></el-input>
                </el-form-item>
              </el-col>

              <el-col :sm="12" :md="6">
                <el-form-item label="密碼" prop="name">
                  <el-input v-model="letterTemp.smsPassword" placeholder="請輸入密碼"></el-input>
                </el-form-item>
              </el-col>

            </el-row>
          </el-form>
        </el-collapse-item>

      </el-collapse>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import pbMixins from "@/mixins/permissionBtn.js";

/* components */
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";

/* API */
import * as orgSms from "@/api/orgSms";

export default {
  name: "noticeSetting",
  mixins: [pbMixins],
  components: { Sticky, Title, permissionBtn },
  data() {
    return {
      activeNames: ["email"],
      multipleSelection: [],
      list: [],

      /* 簡訊temp 組織名稱(下拉)、簡訊公司(下拉)(EVERY8DSMS，KOTSMS，MITALKSMS，SMSGO)、帳號、密碼、啟用。*/
      letterTemp: {
        id: "",
        SMSProvider: "", //簡訊公司
        smsAccount: "",
        smsPassword: "",
        isEnable: false,
      },

      /* 信箱 temp */
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
    };
  },
  computed: {
    ...mapGetters(["defaultorgid"]),
  },
  methods: {
    /* 獲取簡訊資料 */
    getLetterList() {
      orgSms.get({ id: this.defaultorgid }).then((res) => {
        this.letterTemp = Object.assign({}, res.result);
        if (res?.result?.isEnable) {
          this.activeNames.push("letter");
        } else {
          this.activeNames = this.activeNames.filter((n) => n != "letter");
        }
      });
    },

    /* 儲存資料 */
    handleSave() {
      this.letterTemp.id = this.letterTemp.id
        ? this.letterTemp.id
        : this.defaultorgid;
      orgSms.addOrUpdate(this.letterTemp).then((res) => {
        console.log(res);
        this.$alertT.fire({
          icon: res.code == 200 ? "success" : "error",
          title: res.message,
        });
        this.getLetterList();
      });
    },

    /* 編輯資料 */
    handleUpdate() {},

    /* 刪除資料 */
    handleDelete() {},

    /* 獲取單筆資料 */
    handleChange() {},

    /* 權限按鈕中控 */
    onBtnClicked(domId) {
      switch (domId) {
        case "save":
          this.handleSave();
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    const vm = this;
    setTimeout(() => {
      vm.getLetterList();
    }, 300);
  },
};
</script>

<style lang='scss' scoped>
.collapseTitle {
  padding: 0 1rem;
  font-size: 1.1rem;
  color: $--color-primary;
}
</style>