<template>
  <div class="createPost-container">
    <el-container style="height: 100%;">
      <el-header style="padding: 0;height: 42px;">
        <sticky :className="'sub-navbar '">
          <div class="filter-container">
            <el-button v-loading="loading" size="mini" class="filter-item" style="margin-left: 10px;" @click="submitForm">保存</el-button>
          </div>
        </sticky>
      </el-header>
      <el-main style="padding:0;height: calc(100% - 42px);">
        <el-container style="height: 100%;">
          <el-aside style="background: #fff;">
            <el-form class="form-container" :model="postForm" :rules="rules" ref="postForm" label-position="top">
              <div class="createPost-main-container" style="margin: 0;height: 100%;">
                <el-form-item prop="name">
                  <MDinput name="name" v-model="postForm.name" required :maxlength="100">標題</MDinput>
                </el-form-item>

                <el-form-item label="摘要" label-position="top">
                  <el-input type="textarea" :rows="6" placeholder="請輸入內容" v-model="postForm.description"></el-input>
                  <span class="word-counter" v-show="contentShortLength">{{contentShortLength}}字</span>
                </el-form-item>

                <el-form-item label="表單類型" label-position="top">
                  <el-select v-model="postForm.frmType" placeholder style="width: 100%;">
                    <el-option label="動態表單" :value="0"></el-option>
                    <el-option label="自定義開發頁面" :value="1"></el-option>
                    <el-option label="可拖拽動態表單" :value="2"></el-option>
                  </el-select>

                  <el-select style="margin-top: 10px;width: 100%;" v-model="postForm.webId" v-if="postForm.frmType == 1" placeholder="請選擇系統內置的頁面">
                    <el-option label="請假單" value="FrmLeaveReq"></el-option>
                    <el-option label="車輛申請表單" value="FrmCarReq"></el-option>
                    <el-option label="司機申請表單" value="FrmDriverReq"></el-option>
                  </el-select>
                </el-form-item>
              </div>
            </el-form>
          </el-aside>
          <el-main style="padding:0;">
            <div class="editor-container" style="height: 100%;" v-if="postForm.frmType === 0 || postForm.frmType === 2">

              <!-- 拖拉式自定義表單 -->
              <FormContainer ref="contentDataForm" :edit-info="editInfo" v-if="postForm.frmType === 2"></FormContainer>

              <!-- 動態表單FIXME:暫時沒用 -->
              <template v-if="postForm.frmType === 0">
                <Ueditor ref="ue" v-bind:content="postForm.content" :formType="postForm.frmType" v-bind:fileds="postForm.fields" @ready="ueReady"></Ueditor>
              </template>
            </div>

            <el-card class="box-card" v-if="postForm.frmType == 1">
              <component v-bind:is="postForm.webId != '' && postForm.webId +'Add'"></component>
            </el-card>
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import MDinput from "@/components/MDinput";
import Ueditor from "@/components/Ueditor";
import Sticky from "@/components/Sticky"; // 粘性header組件
import FormContainer from "@/components/Formcreated/index";
import * as forms from "@/api/forms";
import { mapGetters, mapActions } from "vuex";

const defaultForm = {
  id: undefined,
  description: "",
  webId: "", // 用戶開發的頁面ID
  frmType: 2, // 表單類型，默認為0動態表單，1為用戶開發的頁面
  name: "",
  fields: 0, // 字段個數
  delete: 0, // 刪除標記
  disabled: 0,
  contentData: "", // 表單中的控件屬性描述
  contentParse: "", // 表單控件位置模板
  content: "", // 未處理的HTML
};

export default {
  name: "form-detail",
  components: {
    MDinput,
    Sticky,
    Ueditor,
    FormContainer,
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === "") {
        this.$message({
          message: rule.field + "為必傳項",
          type: "error",
        });
      } else {
        callback();
      }
    };
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      rules: {
        name: [
          {
            validator: validateRequire,
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    ...mapGetters(["defaultorgid", "formDetails", "addFormDetail"]),
    contentShortLength() {
      return this.postForm && this.postForm.description
        ? this.postForm.description.length
        : 0;
    },
    editInfo() {
      return (
        (this.postForm.contentData && JSON.parse(this.postForm.contentData)) ||
        {}
      );
    },
  },
  beforeDestroy() {
    if (this.postForm.frmType === 0) {
      // 動態表單需要獲取ue中的值
      this.postForm = Object.assign(this.postForm, this.$refs.ue.getObj());
    } else if (this.postForm.frmType === 2) {
      this.postForm.contentData = JSON.stringify(
        this.$refs.contentDataForm.handleGenerateJson()
      );
    }
    if (!this.postForm.id) {
      this.saveAddFormDetails(this.postForm);
      return;
    }
    let data = {};
    data[this.postForm.id] = this.postForm;
    this.saveFormDetails(data);
  },
  mounted() {
    this.init();
  },

  methods: {
    ...mapActions(["saveFormDetails", "saveAddFormDetails", "updateIsRender"]),
    init() {
      this.postForm.frmType =
        this.$route.query["frmType"] !== undefined
          ? this.$route.query["frmType"]
          : 2;
      if (!this.isEdit) {
        this.postForm = Object.assign({}, this.addFormDetail || defaultForm);
      } else {
        // ueditor需要準備好了調用數據，frmtype為2時，不調用ueditor
        if (Number(this.postForm.frmType) !== 0) {
          const id = this.$route.params && this.$route.params.id;
          this.postForm = this.formDetails[id];
        }
      }
    },
    ueReady() {
      // ueditor準備好了，來數據吧
      if (this.isEdit && !this.postForm.contentData) {
        const id = this.$route.params && this.$route.params.id;
        this.fetchData({
          id: id,
        });
      }
    },
    fetchData(id) {
      forms
        .get(id)
        .then((response) => {
          this.postForm = response.result;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    submitForm() {
      if (this.postForm.frmType === 0) {
        // 動態表單需要獲取ue中的值
        this.postForm = Object.assign(this.postForm, this.$refs.ue.getObj());
      } else if (this.postForm.frmType === 2) {
        this.postForm.contentData = JSON.stringify(
          this.$refs.contentDataForm.handleGenerateJson()
        );
      }
      this.$refs.postForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.postForm.OrgId = this.defaultorgid;
          this.updateIsRender(true);
          if (this.isEdit) {
            this.postForm.id = this.$route.params && this.$route.params.id;
            forms.update(this.postForm).then(() => {
              this.loading = false;
              this.$notify({
                title: "成功",
                message: "修改成功",
                type: "success",
                duration: 2000,
              });
            });
          } else {
            forms.add(this.postForm).then(() => {
              this.loading = false;
              this.$notify({
                title: "成功",
                message: "創建成功",
                type: "success",
                duration: 2000,
              });
            });
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";

.createPost-container {
  position: relative;
  height: 100%;
  overflow: hidden;
  margin: 0;

  .createPost-main-container {
    margin: 10px;
    background-color: white;
    padding: 10px;
    padding-top: 0;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }

    .editor-container {
      min-height: 500px;
      margin: 0 0 30px;

      .editor-upload-btn-container {
        text-align: right;
        margin-right: 10px;

        .editor-upload-btn {
          display: inline-block;
        }
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: -10px;
    top: 0px;
  }
}
</style>
