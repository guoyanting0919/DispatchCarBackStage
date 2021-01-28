<template>
  <el-dialog @close="handleClose()" title="編輯訂單" :visible.sync="editDialog" width="800px">
    <div id="map" ref="map" style="width: 0%; height: 0%"></div>
    <div class="editDialogBody">
      <el-form :label-position="labelPosition" label-width="200px" :model="temp" :rules="rules" ref="form">
        <el-row :gutter="16">
          <!-- <el-col :sm="12" :md="8">
            <el-form-item label="訂單編號">
              <el-input disabled style="width: 100%" v-model="temp.despatchNo">
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="8">
            <el-form-item label="訂車個案">
              <el-input disabled style="width: 100%" v-model="temp.userName">
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="8">
            <el-form-item label="身分證字號">
              <el-input disabled style="width: 100%" v-model="temp.uid">
              </el-input>
            </el-form-item>
          </el-col> -->

          <el-col :sm="12" :md="8">
            <el-form-item label="聯絡電話" prop="noticePhone">
              <el-input style="width: 100%" v-model="temp.noticePhone">
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="8">
            <el-form-item label="車種" prop="carCategoryId">
              <el-select style="width: 100%" v-model="temp.carCategoryId" placeholder="選擇車種" @change="temp.wheelchairType = ''">
                <el-option v-for="type in carCategorysList" :key="type.id" :label="type.label" :value="type.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="8">
            <el-form-item label="輪椅" prop="wheelchairType">
              <el-select clearable v-model="temp.wheelchairType" placeholder="請選擇輪椅" style="width: 100%">
                <el-option v-if="temp.carCategoryId === 'SYS_CAR_GENERAL'" value="無" label="無">無</el-option>
                <el-option v-if="temp.carCategoryId === 'SYS_CAR_GENERAL'" value="普通輪椅(可收折)" label="普通輪椅(可收折)">普通輪椅(可收折)</el-option>
                <el-option v-if="temp.carCategoryId === 'SYS_CAR_WEAL'" value="普通輪椅" label="普通輪椅">普通輪椅</el-option>
                <el-option value="高背輪椅" label="高背輪椅" v-if="temp.carCategoryId === 'SYS_CAR_WEAL'">高背輪椅</el-option>
                <el-option value="電動輪椅" label="電動輪椅" v-if="temp.carCategoryId === 'SYS_CAR_WEAL'">電動輪椅</el-option>
                <el-option value="電動高背輪椅" label="電動高背輪椅" v-if="temp.carCategoryId === 'SYS_CAR_WEAL'">電動高背輪椅</el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="8">
            <el-form-item label="願意共乘">
              <el-radio-group v-model="temp.canShared">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="8">
            <el-form-item label="乘車日期" prop="date">
              <el-date-picker v-model="temp.date" type="date" placeholder="請選擇乘車日期" value-format="yyyy-MM-dd" style="width: 100%" :picker-options="{
                  disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7;
                  },
                }"></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="8">
            <el-form-item label="乘車時間" prop="time">
              <el-time-select v-model="temp.time" :picker-options="{
                  start: timeStartTime,
                  step: '00:10',
                  end: '20:00',
                }" placeholder="請選擇乘車時間" style="width: 100%">
              </el-time-select>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="8">
            <el-form-item label="陪同人數" prop="familyWith">
              <el-select style="width: 100%" v-model="temp.familyWith" placeholder="選擇陪同人數">
                <el-option v-for="num in 8" :key="num" :label="num - 1" :value="num - 1">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="18">
            <el-form-item label="起點" prop="fromAddr">
              <el-select filterable :default-first-option="false" remote :remote-method="remoteMethod" @change="handleChange('from')" @visible-change="handleVisibleChange" ref="atc" :trigger-on-focus="false" v-model="temp.fromAddr" placeholder="請輸入起點" style="width: 100%">
                <el-option v-for="item in searchResults" :key="item.place_id" :value="item.place_id" :label="item.description"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :sm="24" :md="6">
            <el-form-item label="起點備註" prop="fromAddrRemark">
              <el-select clearable v-model="temp.fromAddrRemark" placeholder="請選擇備註" style="width: 100%">
                <el-option value="醫院診所" label="醫院診所">醫院診所</el-option>
                <el-option value="洗腎中心" label="洗腎中心">洗腎中心</el-option>
                <el-option value="復健診所" label="復健診所">復健診所</el-option>
                <el-option value="住家" label="住家">住家</el-option>
                <el-option value="其他" label="其他">其他</el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="!['醫院診所','洗腎中心','復健診所','住家',''].includes(temp.fromAddrRemark)" :sm="24" :md="24">
            <el-form-item label="起點備註-其他">
              <el-input v-model="temp.fromRemark" placeholder="請輸入起點備註"></el-input>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="18">
            <el-form-item label="迄點" prop="toAddr">
              <el-select filterable :default-first-option="false" remote :remote-method="remoteMethod" @change="handleChange('to')" @visible-change="handleVisibleChange" ref="atc" :trigger-on-focus="false" v-model="temp.toAddr" placeholder="請輸入迄點" style="width: 100%">
                <el-option v-for="item in searchResults" :key="item.place_id" :value="item.place_id" :label="item.description"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="24" :md="6">
            <el-form-item label="訖點備註" prop="toAddrRemark">
              <el-select clearable v-model="temp.toAddrRemark" placeholder="請選擇備註" style="width: 100%">
                <el-option value="醫院診所" label="醫院診所">醫院診所</el-option>
                <el-option value="洗腎中心" label="洗腎中心">洗腎中心</el-option>
                <el-option value="復健診所" label="復健診所">復健診所</el-option>
                <el-option value="住家" label="住家">住家</el-option>
                <el-option value="其他" label="其他">其他</el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="!['醫院診所','洗腎中心','復健診所','住家',''].includes(temp.toAddrRemark)" :sm="24" :md="24">
            <el-form-item label="訖點備註-其他">
              <el-input v-model="temp.toRemark" placeholder="請輸入訖點備註"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleEdit">確 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
/* eslint-disable */

import moment from "moment";
import * as map from "@/api/map";
export default {
  name: "editCaseUserDespatchDialog",
  props: {
    /* main data */
    temp: {
      type: Object,
      default: () => {},
      required: true,
    },

    /* toggle */
    editDialogProp: {
      type: Boolean,
      default: false,
      required: true,
    },

    /* labelPosition */
    labelPosition: {
      type: String,
      default: "top",
      required: false,
    },

    /* carCategorysList */
    carCategorysList: {
      type: Array,
      default: () => {},
      required: true,
    },
  },
  data() {
    return {
      editDialog: false,
      today: moment().format("yyyy-MM-DD"),
      /* 地點詳情 */
      fromAddr: "", //起點詳細地址
      toAddr: "", //迄點詳細地址

      /* map */
      map: null,
      service: null, //auto complete service
      searchResults: [], //auto complete options
      sessionToken: null, //令牌
      fromAddr: "", //起點詳細地址
      toAddr: "", //迄點詳細地址
      tableToggle: true,

      rules: {
        date: [{ required: true, message: "必填欄位", tigger: "change" }],
        time: [{ required: true, message: "必填欄位", tigger: "change" }],
        createdIdentity: [
          { required: true, message: "必填欄位", tigger: "change" },
        ],
        fromAddr: [{ required: true, message: "必填欄位", tigger: "change" }],
        fromAddrRemark: [
          { required: true, message: "必填欄位", tigger: "change" },
        ],
        toAddr: [{ required: true, message: "必填欄位", tigger: "change" }],
        toAddrRemark: [
          { required: true, message: "必填欄位", tigger: "change" },
        ],
        carCategoryId: [
          { required: true, message: "必填欄位", tigger: "change" },
        ],
        wheelchairType: [
          { required: true, message: "必填欄位", tigger: "change" },
        ],
        familyWith: [{ required: true, message: "必填欄位" }],
        noticePhone: [{ required: true, message: "必填欄位", tigger: "blur" }],
      },
    };
  },
  computed: {
    timeStartTime() {
      let time;
      if (this.temp.date !== this.today) {
        time = "06:00";
      } else {
        let nowHr = moment().format("HH");
        this.$cl(nowHr);
        let nowMin =
          (Math.floor(moment().format("hh:mm").split(":")[1] / 10) + 1) * 10;
        if (nowMin == 60) {
          nowMin = "00";
          nowHr++;
        }

        time = `${nowHr}:${nowMin}`;
      }
      return time;
    },
  },
  watch: {
    editDialogProp() {
      this.editDialog = this.editDialogProp;
    },
  },
  methods: {
    /* 編輯 */
    handleEdit() {
      const vm = this;
      vm.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit("handleEdit", vm.temp);
        } else {
          vm.$alertT.fire({
            icon: "error",
            title: "請確認欄位是否正確填寫",
          });
        }
      });
    },

    /* 關閉 */
    handleClose() {
      this.$emit("handleClose", false);
    },

    /* init google map api */
    initMapApi() {
      const vm = this;
      vm.map = new google.maps.Map(document.getElementById("map"), {
        center: {
          //原始中心點
          lat: 25.0374865,
          lng: 121.5647688,
        },
        zoom: 15,
      });
      vm.sessionToken = new google.maps.places.AutocompleteSessionToken();
      vm.service = new window.google.maps.places.AutocompleteService();
    },

    /* remoteMethod  */
    remoteMethod(query) {
      const vm = this;
      if (!query) return;
      this.service.getPlacePredictions(
        {
          input: query,
          sessionToken: vm.sessionToken,
        },
        vm.displaySuggestions
      );
    },

    /* 用戶選擇autocomplete選項後 */
    handleChange(direction) {
      const vm = this;
      if (vm.temp[`${direction}Addr`] == "") return;
      const request = {
        placeId: vm.temp[`${direction}Addr`],
        fields: ["name", "formatted_address", "place_id", "geometry"],
        sessionToken: vm.sessionToken,
      };
      const service = new google.maps.places.PlacesService(vm.map);
      service.getDetails(request, (place, status) => {
        vm.getPlaceDetail(place, direction);
        vm.sessionToken = new google.maps.places.AutocompleteSessionToken();
      });
    },

    /* 獲取地點詳情 */
    getPlaceDetail(place, direction) {
      const vm = this;
      let params = {
        placeId: place.place_id,
        addrFormat: place.formatted_address,
        addrName: place.name,
        lon: place.geometry.location.toJSON().lng,
        lat: place.geometry.location.toJSON().lat,
      };
      map.placeDetail(params).then((res) => {
        console.log(res.result.addrFormat);
        vm.temp[`${direction}AddrDetail`] = res.result.addrFormat;
      });
    },

    /* 清空選項避免enter選到 */
    handleVisibleChange() {
      this.searchResults = [];
    },

    /* 獲取autocomplete資料 */
    displaySuggestions(predictions, status) {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
        this.searchResults = [];
        return;
      }
      this.searchResults = predictions;
    },
  },
  mounted() {
    this.initMapApi();
  },
};
</script>

<style>
</style>