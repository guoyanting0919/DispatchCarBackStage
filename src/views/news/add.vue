<template>
  <div class="flex-column addCaseUserRole">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 權限按鈕 -->
        <el-button
          type="info"
          plain
          size="mini"
          @click="$router.push(`/news/index`)"
          >回列表</el-button
        >
        <el-button size="mini" @click="handleSave" type="success" plain
          >儲存</el-button
        >
      </div>
    </sticky>

    <div class="app-container flex-item">
      <Title title="新增最新消息"></Title>
      <div class="formContainer bg-white customScrollBar">
        <el-form
          :label-position="labelPosition"
          label-width="200px"
          :model="temp"
          :rules="rules"
          ref="form"
        >
          <SubTitle title="最新消息設定"></SubTitle>
          <el-row :gutter="16">
            <el-col :sm="12" :md="24">
              <el-form-item label="主旨">
                <el-input
                  placeholder="請輸入主旨"
                  v-model="temp.title"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="是否置頂">
                <el-switch
                  active-text="置頂"
                  inactive-text="不置頂"
                  v-model="temp.isTop"
                ></el-switch>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="6">
              <el-form-item label="發布日期">
                <el-date-picker
                  style="width: 100%"
                  v-model="temp.releaseDate"
                  type="date"
                  placeholder="選擇發布日期"
                  value-format="yyyy-MM-dd"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="24">
              <el-form-item label="內容">
                <vue-editor
                  id="editor"
                  useCustomImageHandler
                  @image-added="handleImageAdded"
                  :editor-toolbar="customToolbar"
                  v-model="temp.contents"
                  :editorOptions="editorSettings"
                ></vue-editor>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { VueEditor, Quill } from "vue2-editor";
import ImageResize from "quill-image-resize-vue";
Quill.register("modules/imageResize", ImageResize);
import axios from "axios";
// import * as upload from "@/api/upload";

import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import SubTitle from "@/components/SubTitle";
import * as news from "@/api/news";
export default {
  name: "allUserAdd",
  components: {
    Sticky,
    Title,
    SubTitle,
    VueEditor,
  },
  data() {
    return {
      editorSettings: {
        modules: {
          imageResize: {},
        },
      },
      customToolbar: [
        [{ header: [false, 1, 2, 3, 4, 5, 6] }],
        ["bold", "italic", "underline", "strike"],
        [
          { align: "" },
          { align: "center" },
          { align: "right" },
          { align: "justify" },
        ],
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        [{ color: [] }, { background: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      // 表單相關
      labelPosition: "top",
      temp: {
        id: "",
        title: "",
        contents: "",
        releaseDate: "",
        isTop: false,
      },
      rules: {
        stationName: [{ required: true, message: "必填欄位", tigger: "blur" }],
      },
    };
  },
  methods: {
    handleSave() {
      const vm = this;
      vm.$refs.form.validate((valid) => {
        if (valid) {
          news.add(vm.temp).then(() => {
            vm.$alertT.fire({
              icon: "success",
              title: `${vm.temp.title} 新增成功`,
            });
            vm.$router.push("/news/index");
          });
        } else {
          console.log("submit error");
        }
      });
    },
    //圖片上傳
    handleImageAdded: function (file, Editor, cursorLocation, resetUploader) {
      var formData = new FormData();
      formData.append("files", file);
      axios({
        url: `${process.env.VUE_APP_BASE_API}Files/Upload`,
        method: "POST",
        data: formData,
      })
        .then((res) => {
          console.log(res);
          let url = `${process.env.VUE_APP_BASE_IMG_URL}${res.data.result[0].filePath}`;
          console.log(url); // Get url from response
          Editor.insertEmbed(cursorLocation, "image", url);
          resetUploader();
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
