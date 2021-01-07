<template>
  <div class="flex-column dispatchBusUser">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 權限按鈕 -->
        <el-button size="mini" @click="handleReservation" type="primary" plain
          >預約</el-button
        >
      </div>
    </sticky>

    <div class="app-container flex-item">
      <Title title="幸福巴士預約"></Title>
      <div class="dispatchContainer bg-white">
        <el-form
          :label-position="labelPosition"
          label-width="200px"
          :model="temp"
          :rules="rules"
          ref="form"
        >
          <el-row :gutter="16">
            <el-col :sm="12" :md="8">
              <el-form-item label="預約日期">
                <el-date-picker
                  style="width: 100%"
                  v-model="temp.date"
                  type="date"
                  placeholder="選擇日期"
                  value-format="yyyy-MM-dd"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="預約時間">
                <el-time-select
                  style="width: 100%"
                  v-model="temp.time"
                  :picker-options="{
                    start: '08:00',
                    step: '00:30',
                    end: '16:00',
                  }"
                  placeholder="選擇時間"
                >
                </el-time-select>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="搭乘人數">
                <el-select
                  style="width: 100%"
                  v-model="temp.passengerNum"
                  placeholder="選擇搭乘人數"
                >
                  <el-option
                    v-for="num in 8"
                    :key="num"
                    :label="num"
                    :value="num"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :sm="12" :md="8">
              <el-form-item label="選擇路線">
                <el-select
                  style="width: 100%"
                  v-model="temp.stationLineId"
                  placeholder="選擇路線"
                  @change="handleLineChange()"
                >
                  <el-option
                    v-for="type in lineList"
                    :key="type.id"
                    :label="type.name"
                    :value="type.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="選擇起點站牌">
                <el-select
                  :disabled="temp.stationLineId == ''"
                  style="width: 100%"
                  v-model="temp.fromStationId"
                  placeholder="選擇路線"
                  @change="handleFromChange"
                >
                  <el-option
                    v-for="(type, idx) in lineStop"
                    :key="type.id"
                    :label="`${idx + 1}.${type.stationName}`"
                    :value="type.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :md="8">
              <el-form-item label="選擇終點站牌">
                <el-select
                  :disabled="temp.fromStationId == ''"
                  style="width: 100%"
                  v-model="temp.toStationId"
                  placeholder="選擇路線"
                >
                  <el-option
                    :disabled="type.disabled"
                    v-for="(type, idx) in toLineStop"
                    :key="type.id"
                    :label="`${idx + 1}.${type.stationName}`"
                    :value="type.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
// import * as categorys from "@/api/categorys";
import * as orderBusUser from "@/api/orderBusUser";
import * as busStationLines from "@/api/busStationLines";
import * as busStations from "@/api/busStations";
export default {
  name: "dispatchSelfPay",
  components: {
    Sticky,
    Title,
  },
  data() {
    return {
      //路線
      lineList: [],

      //所有站牌
      stopList: [],

      //起點站牌
      lineStop: [],
      //終點站牌
      toLineStop: [],

      // 表單相關
      labelPosition: "top",
      passengerArr: [],
      passengerNum: 1,
      temp: {
        // 日期
        date: "",
        time: "",

        id: "",
        busUserId: "",
        userId: "",
        orgId: "",
        reserveDate: "",
        stationLineId: "",
        stationLineName: "",
        fromStationId: "",
        fromStationName: "",
        toStationId: "",
        toStationName: "",
        passengerNum: 0,
        remark: "",
      },
      rules: {
        // Id: [{ required: true, message: "請輸入個案編號", trigger: "blur" }],
        caseUserNo: [{ required: true, message: "必填欄位", tigger: "blur" }],
        orgAId: [{ required: true, message: "必填欄位", tigger: "change" }],
      },
    };
  },

  methods: {
    // 獲取巴士路線資料
    getLineList() {
      const vm = this;
      let query = {
        page: 1,
        limit: 99,
        key: undefined,
      };
      busStationLines.load(query).then((res) => {
        res.data.forEach((r) => {
          r.weekArr = r.workWeek?.split(",");
          r.weekArr.sort();
        });
        vm.lineList = res.data;
      });
    },
    // 獲取巴士站牌資料
    getStopList() {
      const vm = this;
      let query = {
        page: 1,
        limit: 999,
        key: undefined,
      };
      busStations.load(query).then((res) => {
        vm.stopList = res.data;
      });
    },
    // 選擇路線
    handleLineChange() {
      const vm = this;
      vm.lineStop = [];
      vm.temp.fromStationId = "";
      vm.temp.toStationId = "";
      console.log(vm.temp.stationLineId);
      busStationLines.get({ id: vm.temp.stationLineId }).then((res) => {
        console.log(res);
        vm.stopList.forEach((s) => {
          if (res.result.assignLineStations.includes(s.id)) {
            s.disabled = false;
            vm.lineStop.push(s);
          }
        });
        console.log(vm.lineStop);
      });
    },
    //選擇起點站
    handleFromChange() {
      const vm = this;
      vm.temp.toStationId = "";
      let fromId = vm.temp.fromStationId;
      let idFlag;
      vm.lineStop.forEach((s, idx) => {
        if (s.id == fromId) {
          idFlag = idx;
        }
      });
      let cloneObj = Object.assign([], vm.lineStop);
      cloneObj.map((obj, index) => {
        if (index <= idFlag) {
          obj.disabled = true;
        } else {
          obj.disabled = false;
        }
      });
      // console.log(cloneObj);
      // cloneObj.splice(0, idFlag + 1, ...[]);
      vm.toLineStop = cloneObj;
    },
    //預約訂單 58985e5b-a659-4ac4-94aa-352ccabb3198  58985e5b-a659-4ac4-94aa-352ccabb319
    handleReservation() {
      const vm = this;
      let date = moment(vm.temp.date).format("yyyy-MM-DD");
      vm.temp.busUserId = vm.$route.params.id.split("-")[1];
      vm.temp.userId = vm.$route.params.id.split("-")[0];
      vm.temp.reserveDate = `${date} ${vm.temp.time}`;
      vm.temp.stationLineName = vm.lineList.filter((l) => {
        return l.id === vm.temp.stationLineId;
      })[0].name;
      vm.temp.fromStationName = vm.lineStop.filter((s) => {
        return s.id === vm.temp.fromStationId;
      })[0].stationName;
      vm.temp.toStationName = vm.toLineStop.filter((s) => {
        return s.id === vm.temp.toStationId;
      })[0].stationName;
      vm.temp.orgId = vm.lineList.filter((item) => {
        return item.id === vm.temp.stationLineId;
      })[0].orgId;
      console.log(vm.temp.orgId);

      orderBusUser.add(vm.temp).then((res) => {
        // console.log(res);
        vm.$alertT.fire({
          icon: "success",
          title: res.message,
        });
        vm.$router.push("/bususer/index");
      });
    },
  },
  mounted() {
    this.getLineList();
    this.getStopList();
    // this.temp.passengerNum = 1;
  },
};
</script>

<style lang="scss" scoped>
.dispatchContainer {
  padding: 24px;
  padding-top: 12px;
}
.name {
  line-height: 20px;
  font-weight: 700;
}
.addr {
  font-size: 10px;
}
.passengerContainer {
  background: rgb(255, 244, 230);
}
</style>