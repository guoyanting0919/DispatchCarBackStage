<template>
  <div class="flex-column allUserDispatch">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 權限按鈕 -->
        <!-- <el-button size="mini" type="primary">立即預約</el-button>
        <el-button size="mini" type="info">新增下個地點</el-button>-->
        <el-button size="mini" type="info">可用補助額查詢</el-button>
        <el-button size="mini" type="success">回列表</el-button>
      </div>
    </sticky>

    <!-- main -->
    <div class="app-container flex-item">
      <div class="mainContainer">
        <!-- google map -->
        <div class="mapContainer">
          <div id="map" ref="map" style="width: 100%; height: 100%"></div>
        </div>
        <div class="discountContainer">
          <el-table :data="discountData" style="width: 100%">
            <el-table-column prop="direction" label="去程" width="50">
            </el-table-column>
            <el-table-column prop="distance" label="預估距離" width="100">
            </el-table-column>
            <el-table-column prop="duration" label="預估時間">
            </el-table-column>
            <el-table-column prop="totalAmt" label="車資總額">
            </el-table-column>
            <el-table-column prop="subsidyAmt" label="政府補助">
            </el-table-column>
            <el-table-column prop="selfPayAmt" label="自付額">
            </el-table-column>
            <el-table-column prop="withAmt" label="陪同總額"> </el-table-column>
            <el-table-column prop="withAmt" label="個案負擔"> </el-table-column>
          </el-table>
        </div>

        <!-- dispatch -->
        <div class="dispatchContainer">
          <div class="caseUserName">{{ userInfo.name }}</div>
          <div class="dispatchDetail customScrollBar">
            <el-form
              :label-position="labelPosition"
              label-width="200px"
              :model="temp"
              ref="form"
            >
              <el-row :gutter="8">
                <el-col :sm="24" :md="15">
                  <el-form-item label="乘車日期">
                    <el-date-picker
                      v-model="temp.date"
                      type="date"
                      placeholder="請選擇乘車日期"
                      value-format="yyyy-MM-dd"
                      style="width: 100%"
                      @change="getDiscount"
                    ></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="9" v-if="temp.date">
                  <el-form-item label="乘車時間">
                    <el-time-select
                      @change="getDiscount"
                      v-model="temp.time"
                      :picker-options="{
                        start: '08:30',
                        step: '00:15',
                        end: '18:30',
                      }"
                      placeholder="請選擇乘車時間"
                      style="width: 100%"
                    >
                    </el-time-select>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="24">
                  <div>
                    <span class="unitBTitle"
                      >優先搭乘車行排序 (請依序點擊完成排序)</span
                    >
                    <div class="unitBContainer">
                      <div
                        @click="handleOrgBSelect(item.id)"
                        v-for="item in roleOrgB"
                        :key="item.id"
                        class="unitBBox"
                      >
                        {{ item.name }}
                        <div class="orgBIndex" v-if="orgBIndex(item.id) !== -1">
                          {{ orgBIndex(item.id) + 1 }}
                        </div>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :sm="24" :md="24">
                  <el-form-item label="訂車人身份">
                    <el-select
                      clearable
                      v-model="temp.createdIdentity"
                      placeholder="請選擇訂車人身份"
                      style="width: 100%"
                    >
                      <el-option value="本人" label="本人">本人</el-option>
                      <el-option value="家屬" label="家屬">家屬</el-option>
                      <el-option value="A單位" label="A單位">A單位</el-option>
                      <el-option value="B單位" label="B單位">B單位</el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="18">
                  <el-form-item label="起點">
                    <el-select
                      filterable
                      :default-first-option="false"
                      remote
                      :remote-method="remoteMethod"
                      @change="handleChange('from')"
                      @visible-change="handleVisibleChange"
                      ref="atc"
                      :trigger-on-focus="false"
                      v-model="temp.fromAddr"
                      placeholder="請輸入起點"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in searchResults"
                        :key="item.place_id"
                        :value="item.place_id"
                        :label="item.description"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="6">
                  <el-form-item label="起點備註">
                    <el-select
                      clearable
                      v-model="temp.fromAddrRemark"
                      placeholder="請選擇備註"
                      style="width: 100%"
                    >
                      <el-option value="醫院診所" label="醫院診所"
                        >醫院診所</el-option
                      >
                      <el-option value="洗腎中心" label="洗腎中心"
                        >洗腎中心</el-option
                      >
                      <el-option value="復健診所" label="復健診所"
                        >復健診所</el-option
                      >
                      <el-option value="住家" label="住家">住家</el-option>
                      <el-option value="其他" label="其他">其他</el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col v-if="temp.fromAddrRemark === '其他'" :sm="24" :md="24">
                  <el-form-item label="起點備註-其他">
                    <el-input
                      v-model="temp.Id"
                      placeholder="請輸入起點備註"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="18">
                  <el-form-item label="迄點">
                    <el-select
                      filterable
                      :default-first-option="false"
                      remote
                      :remote-method="remoteMethod"
                      @change="handleChange('to')"
                      @visible-change="handleVisibleChange"
                      ref="atc"
                      :trigger-on-focus="false"
                      v-model="temp.toAddr"
                      placeholder="請輸入迄點"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in searchResults"
                        :key="item.place_id"
                        :value="item.place_id"
                        :label="item.description"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="6">
                  <el-form-item label="訖點備註">
                    <el-select
                      clearable
                      v-model="temp.toAddrRemark"
                      placeholder="請選擇備註"
                      style="width: 100%"
                    >
                      <el-option value="醫院診所" label="醫院診所"
                        >醫院診所</el-option
                      >
                      <el-option value="洗腎中心" label="洗腎中心"
                        >洗腎中心</el-option
                      >
                      <el-option value="復健診所" label="復健診所"
                        >復健診所</el-option
                      >
                      <el-option value="住家" label="住家">住家</el-option>
                      <el-option value="其他" label="其他">其他</el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col v-if="temp.toAddrRemark === '其他'" :sm="24" :md="24">
                  <el-form-item label="訖點備註-其他">
                    <el-input
                      v-model="temp.Id"
                      placeholder="請輸入訖點備註"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="12">
                  <el-form-item label="預約回程(回居住地址)">
                    <el-radio-group v-model="temp.haveNextOrderFlag">
                      <el-radio :label="true">是</el-radio>
                      <el-radio :label="false">否</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="12">
                  <el-form-item label="回程乘車時間">
                    <el-time-select
                      v-model="temp.reTime"
                      :picker-options="{
                        start: '08:30',
                        step: '00:15',
                        end: '18:30',
                      }"
                      placeholder="請選擇回程乘車時間"
                      style="width: 100%"
                    >
                    </el-time-select>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="12">
                  <el-form-item label="願意共乘">
                    <el-radio-group v-model="temp.canShared">
                      <el-radio :label="true">是</el-radio>
                      <el-radio :label="false">否</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="6">
                  <el-form-item label="車種">
                    <el-select
                      clearable
                      v-model="temp.carCategoryId"
                      placeholder="請選擇車種"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in carCategorysList"
                        :value="item.dtValue"
                        :label="item.name"
                        :key="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="6">
                  <el-form-item label="輪椅">
                    <el-select
                      clearable
                      v-model="temp.wheelchairType"
                      placeholder="請選擇輪椅"
                      style="width: 100%"
                    >
                      <el-option value="無" label="無">無</el-option>
                      <el-option
                        value="普通輪椅(可收折)"
                        label="普通輪椅(可收折)"
                        >普通輪椅(可收折)</el-option
                      >
                      <el-option value="高背輪椅" label="高背輪椅"
                        >高背輪椅</el-option
                      >
                      <el-option value="電動輪椅" label="電動輪椅"
                        >電動輪椅</el-option
                      >
                      <el-option value="電動高背輪椅" label="電動高背輪椅"
                        >電動高背輪椅</el-option
                      >
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="12">
                  <el-form-item label="陪同人數">
                    <el-select
                      clearable
                      @change="getDiscount"
                      v-model="temp.familyWith"
                      placeholder="請選擇陪同人數"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="num in 8"
                        :key="num - 1"
                        :value="num - 1"
                        :label="`${num - 1}人`"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :sm="24" :md="12">
                  <el-form-item label="簡訊號碼">
                    <el-input
                      v-model="temp.noticePhone"
                      placeholder="請輸入簡訊號碼"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          <div class="dispatchFooter">
            <input type="text" id="auto" />
            <el-button style="height: 40px" type="info" @click="handleSubmit"
              >立即預約</el-button
            >
            <el-button style="height: 40px" type="info">新增下個地點</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script
  async
  defer
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAkLxJzOtyQ6Oyv4e1rTlMxGSixHr0to3Q"
></script>
<script>
import Sticky from "@/components/Sticky";
import * as map from "@/api/map";
import * as org from "@/api/orgs";
import * as user from "@/api/users";
import * as caseUser from "@/api/caseUsers";
import * as orderCaseUser from "@/api/orderCaseUser";
import * as category from "@/api/categorys";
export default {
  components: {
    Sticky,
  },
  data() {
    return {
      /* map */
      map: null, //mian map
      mapCenter: {
        //原始中心點
        lat: 25.0374865,
        lng: 121.5647688,
      },
      service: null, //auto complete service
      searchResults: [], //auto complete options
      sessionToken: null, //令牌
      fromAddr: "", //起點詳細地址
      toAddr: "", //迄點詳細地址

      /* 全域資料 */
      userInfo: "",
      roleInfo: "",
      orgBList: [],
      carCategorysList: [],
      roleOrgB: [], //身份擁有的B單位
      discountData: [], //預估金額資料

      /* 表單相關 */
      labelPosition: "top",
      temp: {
        //未整理資料
        date: "", //預約日期
        time: "", //預約時間
        haveNextOrderFlag: false, //是否預約回程
        reTime: "", //預約回程時間

        /* 主要資料 */
        id: "",
        userId: "",
        caseUserId: "",
        orgId: "",
        reserveDate: "",
        transOrgs: [],
        createdIdentity: "",
        fromAddr: "",
        fromAddrRemark: "",
        toAddr: "",
        toAddrRemark: "",
        remark: "",
        isBack: true,
        canShared: true,
        carCategoryId: "",
        carCategoryName: "",
        wheelchairType: "",
        familyWith: 0,
        noticePhone: "",
      },
      rules: {},
    };
  },
  filters: {},
  methods: {
    /* 初始化google map */
    initMap() {
      const vm = this;
      let dD = new google.maps.DirectionsRenderer();
      let ds = new google.maps.DirectionsService();
      let bounds = new google.maps.LatLngBounds();
      vm.sessionToken = new google.maps.places.AutocompleteSessionToken();
      vm.service = new window.google.maps.places.AutocompleteService();
      this.map = new google.maps.Map(document.getElementById("map"), {
        center: this.mapCenter, // 中心點座標
        zoom: 16, // 1-20，數字愈大，地圖愈細：1是世界地圖，20就會到街道
        maxZoom: 20,
        minZoom: 3,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        // roadmap 顯示默認道路地圖視圖。
        // satellite 顯示 Google 地球衛星圖像。
        // hybrid 顯示正常和衛星視圖的混合。
        // terrain 顯示基於地形信息的物理地圖。
        mapTypeId: "roadmap",
      });
      dD.setMap(this.map);
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

    /* 獲取autocomplete資料 */
    displaySuggestions(predictions, status) {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
        this.searchResults = [];
        return;
      }
      this.searchResults = predictions;
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
        vm.$cl(request);
        vm.getPlaceDetail(place, direction);
        vm.sessionToken = new google.maps.places.AutocompleteSessionToken();
      });
    },

    /* 獲取地點詳情 */
    getPlaceDetail(place, status) {
      const vm = this;
      let params = {
        placeId: place.place_id,
        addrFormat: place.formatted_address,
        addrName: place.name,
        lon: place.geometry.location.toJSON().lng,
        lat: place.geometry.location.toJSON().lat,
      };

      vm.$cl(params);

      map.placeDetail(params).then((res) => {
        vm.$cl(res);
        vm.setMarker(res.result, status);
      });
    },

    /* 放置marker */
    setMarker(data, direction) {
      const vm = this;
      let position = {
        lat: data.lat, // 經度
        lng: data.lon, // 緯度
      };
      let marker = new google.maps.Marker({
        position,
        map: vm.map,
      });
      vm[`${direction}Addr`] = data.addrFormat;
      vm.map.panTo(position);
      vm.getDiscount();

      if (vm.fromAddr && vm.toAddr) {
        //判斷起訖點是否都有值了 若有則畫出路徑
        vm.handleDrawRoute();
      }
    },

    /* 畫路徑線 */
    handleDrawRoute() {
      let bounds = new google.maps.LatLngBounds();
      const vm = this;
      let params = {
        fromAddr: vm.fromAddr,
        toAddr: vm.toAddr,
      };
      map.route(params).then((res) => {
        let jsonData = {
          overview_polyline: {
            points: res.result.polyLine,
          },
        };
        let path = google.maps.geometry.encoding.decodePath(
          jsonData.overview_polyline.points
        );
        for (let i = 0; i < path.length; i++) {
          bounds.extend(path[i]);
        }
        let polyline = new google.maps.Polyline({
          path: path,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 5,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          map: vm.map,
        });
        polyline.setMap(vm.map);
        vm.map.fitBounds(bounds);
        vm.$cl(res);
      });
    },

    /* 清空選項避免enter選到 */
    handleVisibleChange() {
      this.searchResults = [];
    },

    /* 獲取用戶資料 */
    getUser() {
      user
        .getClient({ id: this.$route.params.id.split("-")[0] })
        .then((res) => {
          this.userInfo = res.result;
        });
    },

    /* 獲取身份資料 */
    getRole() {
      caseUser.get({ id: this.$route.params.id.split("-")[1] }).then((res) => {
        this.roleInfo = res.result;

        let useBunit = [
          res.result.orgBId1,
          res.result.orgBId2,
          res.result.orgBId3,
        ];

        this.roleOrgB = this.orgBList.filter((i) => useBunit.includes(i.id));
      });
    },

    /* 獲取所有B單位 */
    getOrgB() {
      org.getOrgB().then((res) => {
        this.orgBList = res.result;
      });
    },

    /* 排序B單位 */
    handleOrgBSelect(id) {
      const vm = this;
      !vm.temp.transOrgs.includes(id)
        ? vm.temp.transOrgs.push(id)
        : (vm.temp.transOrgs = vm.temp.transOrgs.filter((i) => i !== id));
    },

    /* B單位index */
    orgBIndex(val) {
      const vm = this;
      return vm.temp.transOrgs.indexOf(val);
    },

    /* 獲取車種 */
    getCarCategorys() {
      const vm = this;
      let query = {
        page: 1,
        limit: 20,
        TypeId: "SYS_CAR",
      };
      category.getList(query).then((res) => {
        vm.carCategorysList = res.data;
      });
    },

    /* 獲取預估金額 */
    getDiscount() {
      const vm = this;
      let params = {
        CaseUserId: vm.$route.params.id.split("-")[1],
        FromAddr: vm.fromAddr, //桃園市龜山區復興街林口長庚紀念醫院
        ToAddr: vm.toAddr, //桃園市龜山區頂湖路桃園長庚醫院
        FamilyWith: vm.temp.familyWith, //2
        ReservationDate: `${vm.temp.date} ${vm.temp.time}`, //2020-12-22 00:05
      };
      if (
        vm.temp.date &&
        vm.temp.time &&
        vm.toAddr &&
        vm.fromAddr &&
        vm.temp.familyWith
      ) {
        vm.$cl("計算金額");
        vm.$cl(params);
        orderCaseUser.getDiscount(params).then((res) => {
          vm.$cl(res);
          vm.discountData = [res.result];

          // vm.discountData[0] = res.result;
          // vm.discountData[0].direction = "去程";
          // vm.discountData[1] = res.result;
          // vm.discountData[1].direction = "回程";
          // vm.$forceUpdate();
        });
      } else {
        vm.$cl("資料不全 無法計算金額");
        vm.$cl(params);
      }
    },

    /* 立即預約 */
    handleSubmit() {
      const vm = this;
      vm.$cl(vm.temp);
    },
  },
  mounted() {
    this.initMap();
    this.getUser();
    this.getRole();
    this.getOrgB();
    this.getCarCategorys();
  },
};
</script>

<style lang="scss" scoped>
.mainContainer {
  height: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
}

.mapContainer {
  width: 49%;
  height: 100%;
  background: lightcoral;
}

.discountContainer {
  position: absolute;
  width: 45%;
  left: 2%;
  bottom: 1rem;
  height: 300px;
  background: #fff;
  z-index: 99999;
}

.dispatchContainer {
  width: 50%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px;
  padding-top: 12px;
}

.caseUserName {
  height: 7%;
  // background: lightseagreen;
  border-bottom: 1px dashed #aaaaaa;
  display: flex;
  font-weight: 700;
  align-items: center;
  font-size: 2rem;
  color: $primary;
}

.dispatchDetail {
  height: 86%;
  // background: lightsteelblue;
  border-bottom: 1px dashed #aaaaaa;
  overflow: auto;
  overflow-x: hidden;
}

.dispatchFooter {
  height: 7%;
  display: flex;
  // background: lightpink;
  justify-content: flex-end;
  align-items: center;
}

.unitBTitle {
  font-size: 14px;
  color: #606266;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: block;
}

.unitBContainer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  justify-content: space-between;
  position: relative;
}

.unitBBox {
  width: 49%;
  cursor: pointer;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: $lightMain;
  border: 1px solid #ddd;
}

.orgBIndex {
  position: absolute;
  width: 100%;
  height: 100%;
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary;
  opacity: 0.7;
}
</style>
