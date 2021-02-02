<template>
  <div class="createPost-container">
    <sticky :className="'sub-navbar '">
      <el-row>
        <el-col :span="8">{{flowObj.customName}}</el-col>
        <el-col :span="16">
          <el-input style="width:200px" v-model="postObj.verificationOpinion" placeholder="請輸入審核意見"></el-input>
          <verify-status v-model="postObj.verificationFinally" />
          <el-select v-model="postObj.NodeRejectType" placeholder v-if="postObj.verificationFinally =='3'">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-select v-model="postObj.NodeRejectStep" placeholder v-if="postObj.NodeRejectType =='2' && postObj.verificationFinally =='3'">
            <el-option v-for="item in FlowNodes" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">提交</el-button>
        </el-col>
      </el-row>
    </sticky>

    <el-card class="box-card" v-if="flowObj.frmType ==1">
      <component v-bind:is="flowObj.dbName != '' && flowObj.dbName +'Detail'" :frmData="flowObj.frmData"></component>
    </el-card>
    <el-card class="box-card" v-if="flowObj.frmType == 2">
      <div style="padding-right: 25px;">
        <CreatedForm insite="true" ref="createdForm" v-if="createdFormData.list && createdFormData.list.length > 0" :data="createdFormData" :value="defaultValue"></CreatedForm>
      </div>
    </el-card>
    <el-card class="box-card" v-else>
      <p v-html="flowObj.frmPreviewHtml"></p>
    </el-card>
    <el-card class="box-card">
      <div style="height: 500px">
        <CreatedFlow ref="createdFlow" :form-template="currentForm" :isEdit="true" :isShowContent="isShowContent" :scheme-content="flowObj.schemeContent"></CreatedFlow>
      </div>
    </el-card>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky"; // 粘性header組件
import VerifyStatus from "./Dropdown/VerifyStatus";
import * as apiFlowinstances from "@/api/flowinstances";
import CreatedFlow from "@/components/CreatedFlow";
import CreatedForm from "@/components/Formcreated/components/CreatedForm";
import { mapActions } from "vuex";

export default {
  name: "verify-flowinstance",
  components: {
    Sticky,
    VerifyStatus,
    CreatedFlow,
    CreatedForm,
  },
  data() {
    return {
      isShowContent: true,
      currentForm: null,
      loading: false, // 按鈕加載loading
      FlowNodes: [], // 當前實例的所有節點
      postObj: {
        flowInstanceId: "",
        verificationOpinion: "",
        verificationFinally: 1,
        NodeRejectStep: "",
        NodeRejectType: "0", // 默認上一步
      },
      createdFormData: {
        list: [],
        config: {},
      },
      options: [
        {
          value: "0",
          label: "上一步",
        },
        {
          value: "1",
          label: "第一步",
        },
        {
          value: "2",
          label: "指定步驟",
        },
      ],
      defaultValue: {},
      flowObj: {
        customName: "",
        schemeContent: "",
        createDate: "",
        activityName: "",
        code: "",
        dbName: "",
        frmType: 0,
        frmData: "",
        activityId: "",
      },
    };
  },
  created() {
    const id = this.$route.params && this.$route.params.id;
    this.postObj.flowInstanceId = id;
    apiFlowinstances
      .get({
        id: id,
      })
      .then((response) => {
        this.flowObj = response.result;
        if (this.flowObj.frmType !== 1) {
          this.createdFormData = this.setCreatedFormData(
            JSON.parse(response.result.frmContentData)
          );
        }
        this.defaultValue = JSON.parse(response.result.frmData);
        var nodes = JSON.parse(this.flowObj.schemeContent).nodes;
        this.FlowNodes = nodes; // 需要過濾條件，應該退回到已經處理過的某個節點
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {
    ...mapActions(["updateInstancesIsRender"]),
    submitForm() {
      this.loading = true;
      apiFlowinstances.verify(this.postObj).then(() => {
        this.loading = false;
        this.updateInstancesIsRender({ type: "", val: true });
        this.$notify({
          title: "成功",
          message: "創建成功",
          type: "success",
          duration: 2000,
        });
      });
    },
    setCreatedFormData(data) {
      data &&
        data.list &&
        data.list.length > 0 &&
        data.list.forEach((item) => {
          item.options.disabled = true;
        });
      return data;
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

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
