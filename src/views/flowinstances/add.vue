<template>
  <div>
    <sticky :className="'sub-navbar '">
      <el-button v-if="active>0" size="mini" style="margin-left: 10px;" type="primary" @click="pre">上一步</el-button>
      <el-button v-if="active<1" size="mini" style="margin-left: 10px;" @click="next">下一步</el-button>
      <el-button v-loading="loading" size="mini" style="margin-left: 10px;" type="success" @click="submitForm">保存</el-button>
    </sticky>
    <div class="createPost-container">
      <el-form class="form-container" :model="postObj" :rules="rules" ref="postObj">
        <el-steps class="steps" :active="active" finish-status="success">
          <el-step title="選擇模板"></el-step>
          <el-step title="基礎信息"></el-step>
        </el-steps>
        <!--選擇模板-->
        <div class="createPost-main-container" v-show="active==0">
          <el-form-item label=" ">
            <el-select style="width: 400px;" v-model="currentSchemeId" size="small" placeholder="請選擇">
              <el-option v-for="item in flowschemes" :key="item.id" :label="item.schemeName" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <div class="flow-form-content">
            <el-card class="box-card" v-if="postObj.frmType == 1">
              <component ref="frmData" v-bind:is="postObj.dbName +'Add'"></component>
            </el-card>
            <template v-else-if="postObj.frmType === 2">
              <CreatedForm insite="true" ref="createdForm" v-if="createdFormData.list && createdFormData.list.length > 0" :data="createdFormData" :value="{}"></CreatedForm>
            </template>
            <form ref="frmData" v-else>
              <p v-html="frmPreview"></p>
            </form>
          </div>
          <div class="flow-form-content" style="height: 500px;">
            <CreatedFlow ref="createdFlow" :form-template="currentForm" :isEdit="true" :isShowContent="isShowContent" :scheme-content="currentScheme.schemeContent"></CreatedFlow>
          </div>
        </div>

        <!--編輯基礎信息-->
        <div class="createPost-main-container" v-show="active==1">
          <el-row>
            <el-col :span="12">
              <el-form-item label="標題" label-width="100px" prop="schemeNameRule">
                <el-input name="name" v-model="postObj.customName" required style="max-width: 200px;"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label-width="100px" label="實例編號:">
                <el-input type="text" v-model="postObj.code" style="max-width: 200px;"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label-width="100px" label="發布時間:" class="postInfo-container-item">
                <el-date-picker v-model="postObj.createDate" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="選擇日期時間"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label-width="100px" label="重要性(占位):" class="postInfo-container-item">
                <el-rate style="margin-top:8px;" :max="3" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :low-threshold="1" :high-threshold="3"></el-rate>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label-width="100px" label="摘要:">
                <el-input type="textarea" :rows="3" placeholder="請輸入內容" v-model="postObj.description"></el-input>
                <span class="word-counter" v-if="contentShortLength">{{contentShortLength}}字</span>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { formatTime } from "@/utils/index";
import MDinput from "@/components/MDinput";
import Sticky from "@/components/Sticky"; // 粘性header組件
import * as apiFlowschemes from "@/api/flowschemes";
import * as apiFlowinstances from "@/api/flowinstances";
import * as apiForms from "@/api/forms";
import CreatedForm from "@/components/Formcreated/components/CreatedForm";
import CreatedFlow from "@/components/CreatedFlow";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "flowinstance-add",
  components: {
    MDinput,
    Sticky,
    CreatedForm,
    CreatedFlow,
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === "") {
        this.$message({
          message: rule.field + "為必傳項",
          type: "error",
        });
        callback(null);
      } else {
        callback();
      }
    };
    return {
      isShowContent: true,
      currentForm: null,
      postObj: {
        id: undefined,
        code: new Date().getTime(),
        dbName: "", // 關聯的數據庫名
        frmType: 0, // 表單類型 0：默認動態表單，1：用戶自定義頁面
        description: "",
        customName: "",
        frmData: "",
        schemeId: "",
      },
      loading: false,
      flowschemes: [], // 選擇的流程模板列表
      createdFormData: {
        list: [],
        config: {},
      },
      fields: 0, // 表單數據元素個數
      currentSchemeId: "",
      currentScheme: {
        schemeContent: "",
      }, // 當前選中的流程模板
      frmPreview: "",
      active: 0,
      rules: {
        schemeNameRule: [
          {
            validator: validateRequire,
          },
        ],
        frmRule: [
          {
            validator: validateRequire,
          },
        ],
      },
    };
  },
  watch: {
    currentSchemeId(id) {
      this.currentScheme.schemeContent = "";
      this.onSchemeChange(id);
    },
  },
  computed: {
    ...mapGetters(["defaultorgid"]),
    contentShortLength() {
      return this.postObj.description ? this.postObj.description.length : 0;
    },
  },
  created() {
    apiFlowschemes.getList().then((response) => {
      // 獲取模板列表
      this.flowschemes = response.data;
      // 初始化值
      this.currentSchemeId = this.flowschemes[0].id;
    });
  },
  methods: {
    ...mapActions(["updateInstancesIsRender"]),
    next() {
      if (this.active++ > 1) this.active = 0;
    },
    pre() {
      if (this.active-- < 0) this.active = 0;
    },
    onSchemeChange(schemeId) {
      // 預覽表單和流程
      var _this = this;
      this.currentScheme = Object.assign(
        {},
        this.flowschemes.find((u) => u.id === schemeId)
      );
      this.postObj.customName =
        this.currentScheme.schemeName + formatTime("yyyy-MM-dd hh:mm:ss");
      this.postObj.schemeId = schemeId;
      apiForms
        .get({
          id: this.currentScheme.frmId,
        })
        .then((response) => {
          if (response.result.frmType === 1) {
            // 用戶自定義的頁面
            _this.postObj.frmType = 1;
            _this.postObj.dbName = response.result.webId;
          } else if (response.result.frmType === 2) {
            _this.postObj.frmType = 2;
            _this.postObj.dbName = "";
            response.result.html = response.result.content; // 暫無用content替代一下html
            _this.createdFormData = JSON.parse(response.result.contentData);
            _this.frmPreview = response.result.html; // 表單預覽的數據
            _this.fields = response.result.fields; // 表單屬性的個數
          } else {
            _this.postObj.frmType = 0;
            _this.postObj.dbName = "";
            _this.frmPreview = response.result.content;
            _this.frmPreview = response.result.html; // 表單預覽的數據
            _this.fields = response.result.fields; // 表單屬性的個數
          }
        });
    },
    handleAdd() {
      const _this = this;
      _this.postObj.OrgId = this.defaultorgid;

      apiFlowinstances.add(_this.postObj).then(() => {
        _this.loading = false;
        _this.updateInstancesIsRender({ type: "", val: true });
        _this.$notify({
          title: "成功",
          message: "創建成功",
          type: "success",
          duration: 2000,
        });
      });
      _this.loading = false;
    },
    submitForm() {
      var _this = this;
      _this.$refs.postObj.validate((valid) => {
        if (valid) {
          _this.loading = true;
          if (_this.postObj.schemeContent === "") {
            _this.$message({
              message: "請選擇一個流程模板",
              type: "error",
            });
            _this.loading = false;
            return;
          }
          if (_this.postObj.frmType === 1) {
            // 使用的是自定義的頁面提交
            _this.postObj.frmData = JSON.stringify(
              _this.$refs.frmData.getData()
            );
          } else if (_this.postObj.frmType === 0) {
            // 解析表單中提交的數據
            const frmdata = {};
            for (let i = 0; i < _this.$refs.frmData.elements.length; i++) {
              frmdata[_this.$refs.frmData[i].name] =
                _this.$refs.frmData[i].value;
            }
            _this.postObj.frmData = JSON.stringify(frmdata);
          } else {
            _this.$refs.createdForm
              .getData()
              .then((res) => {
                _this.postObj.frmData = JSON.stringify(res);
                _this.handleAdd();
              })
              .catch(() => {
                _this.loading = false;
              });
            return;
          }
          //FIXME:
          _this.handleAdd();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
@import "src/styles/mixin.scss";
iframe {
  border: 0;
}
.createPost-container {
  margin: 10px;
  padding: 10px;
  background-color: white;
  min-height: 100%;

  .createPost-main-container {
    max-width: 1000px;
    margin: 0 auto;
    margin-top: 40px;
  }
}

.steps {
  max-width: 1000px;
  margin: 0 auto;

  .el-step__main {
    margin-left: -21px;
  }
}

.edit-btns {
  padding: 20px;
}

.el-tabs--border-card {
  border: 1px solid #dcdfe6;
  -webkit-box-shadow: 0 0px 0px 0 rgba(0, 0, 0, 0.12),
    0 0 0px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 0px 0px 0 rgba(0, 0, 0, 0.12), 0 0 0px 0 rgba(0, 0, 0, 0.04);
}

.el-tabs--border-card.border-b-none {
  border-bottom: 0 !important;
}

.editor {
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-top: 0;
}

.flow-form-content {
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
}
</style>
