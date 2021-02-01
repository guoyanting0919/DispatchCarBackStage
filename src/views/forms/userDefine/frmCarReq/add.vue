<template>
  <el-container style="border: 1px solid #eee">
    <el-main>
      <el-form label-width="80px" ref="dataForm" :model="temp" :rules="rules">
        <el-form-item label="車輛類型">
          <el-radio-group v-model="temp.requestType">
            <el-radio label="病假"></el-radio>
            <el-radio label="事假"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="'請假人'" prop="userName">
          <el-input name="name" v-model="temp.userName"></el-input>
        </el-form-item>

        <el-form-item label="開始時間">
          <el-col :span="11">
            <el-date-picker type="date" placeholder="選擇日期" v-model="temp.startDate" style="width: 100%;"></el-date-picker>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="11">
            <el-time-picker type="fixed-time" placeholder="選擇時間" v-model="temp.startTime" style="width: 100%;"></el-time-picker>
          </el-col>
        </el-form-item>

        <el-form-item label="結束時間">
          <el-col :span="11">
            <el-date-picker type="date" placeholder="選擇日期" v-model="temp.endDate" style="width: 100%;"></el-date-picker>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="11">
            <el-time-picker type="fixed-time" placeholder="選擇時間" v-model="temp.endTime" style="width: 100%;"></el-time-picker>
          </el-col>
        </el-form-item>

        <el-form-item size="small" :label="'請假說明'" prop="requestComment">
          <el-input type="textarea" :rows="3" v-model="temp.requestComment"></el-input>
        </el-form-item>

        <el-form-item>
          <el-upload class="upload-demo" :on-change="handleChange" :action="baseURL +'/Files/Upload'" :on-remove="handleRemove" :before-remove="beforeRemove" multiple name="files" :limit="3" list-type="picture" :on-exceed="handleExceed">
            <el-button size="small" type="primary">上傳附加，如醫院就診記錄</el-button>
            <div slot="tip" class="el-upload__tip">只能上傳不超過1Mb</div>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import * as forms from "@/api/forms";

export default {
  name: "frm-leave-req-add",
  components: {},
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
        callback(null);
      } else {
        callback();
      }
    };
    return {
      baseURL: process.env.BASE_API, // api的base_url
      temp: {
        id: "", // ID
        userName: "", // 請假人姓名
        requestType: "", // 請假分類，病假，事假，公休等
        startDate: "", // 開始日期
        startTime: "", // 開始時間
        endDate: "", // 結束日期
        endTime: "", // 結束時間
        requestComment: "", // 請假說明
        attachment: "", // 附件，用於提交病假證據等
        files: [],
        extendInfo: "", // 其他信息,防止最後加逗號，可以刪除
      },

      loading: false,
      rules: {
        name: [
          {
            validator: validateRequire,
          },
        ],
      },
    };
  },

  methods: {
    handleChange(file, fileList) {
      this.temp.files = fileList
        .filter((u) => u.status === "success")
        .map((u) => u.response.result[0])
        .map((u) => {
          return {
            fileName: u.fileName,
            filePath: u.filePath,
          };
        });
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `當前限制選擇 3 個文件，本次選擇了 ${files.length} 個文件，共選擇了 ${
          files.length + fileList.length
        } 個文件`
      );
    },
    beforeRemove(file) {
      return this.$confirm(`確定移除 ${file.name}？`);
    },
    fetchData(id) {
      forms
        .get(id)
        .then(() => {})
        .catch((err) => {
          console.log(err);
        });
    },
    getFormInfo() {
      // 用於流程分支條件選擇
      return [
        {
          name: "userName",
          title: "請假人姓名",
        },
        {
          name: "startDate",
          title: "開始日期",
        },
        {
          name: "endDate",
          title: "結束日期",
        },
        {
          name: "requestComment",
          title: "請假說明",
        },
      ];
    },
    getData() {
      return this.temp;
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";
</style>
