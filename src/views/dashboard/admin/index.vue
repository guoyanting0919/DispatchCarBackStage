<template>
  <div class="dashboard">
    <!-- 一般的主頁 -->
    <div v-if="!state">
      <el-input
        style="width: 200px"
        v-model="input"
        placeholder="dashBoard"
        @input="debounceUpdate"
        @keydown.native.enter="handleKeydown"
      ></el-input>
    </div>
    <!-- cbsd的主頁 -->

    <div v-else class="trelloContainer bg-white customScrollBar">
      <div class="settingContainer" style="display: flex">
        <el-input
          style="width: 200px"
          v-model="userName"
          placeholder="userName"
        ></el-input>
        <el-input
          style="width: 200px"
          v-model="message"
          placeholder="message"
        ></el-input>
        <el-input
          style="width: 200px"
          v-model="groupName"
          placeholder="groupName"
        ></el-input>
        <el-button @click="send">send</el-button>
        <el-button @click="addToGroup">addToGroup</el-button>
        <el-button @click="sendToGroup">sendToGroup</el-button>
      </div>
      <div class="settingContainer">
        <el-input
          style="width: 200px"
          v-model="temp.title"
          placeholder="title"
        ></el-input>
        <el-input
          style="width: 200px"
          v-model="temp.contents"
          placeholder="newList"
        ></el-input>
        <el-button @click="handleAdd">send</el-button>
      </div>
    </div>

    <!-- <vue-esign 
      ref="esign"
      :width="800"
      :height="300"
      :isCrop="isCrop"
      :lineWidth="lineWidth"
      :lineColor="lineColor"
      :bgColor.sync="bgColor"
    />
    <button @click="handleReset">清空画板</button>
    <button @click="handleGenerate">生成图片</button> -->
  </div>
</template>

<script>
import * as signalR from "@aspnet/signalr";
import { mapGetters } from "vuex";
import _ from "lodash";
export default {
  data() {
    return {
      lineWidth: 4,
      lineColor: "#fff",
      bgColor: "#000",
      resultImg: "",
      isCrop: false,
      // trello
      temp: {
        id: "",
        title: "",
        contents: "",
        status: 0,
      },
      // 表單相關
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 999,
        key: undefined,
      },
      // signalR
      hubConnection: new signalR.HubConnectionBuilder()
        .withUrl("http://openauth.1966.org.tw/api/chatHub")
        .build(),
      signalRMsg: null,
      userName: "",
      message: "",
      groupName: "",
      newList: "",

      sortData: [
        {
          name: "John",
          id: 1,
          status: 0,
        },
        {
          name: "Joao",
          id: 2,
          status: 0,
        },
        {
          name: "Jean",
          id: 3,
          status: 1,
        },
        {
          name: "Gerard",
          id: 4,
          status: 2,
        },
      ],
      dataStatus0: [],
      dataStatus1: [],
      dataStatus2: [],

      input: "",
      state: window.localStorage.getItem("CBSD_ADMIN"),
    };
  },
  computed: {
    ...mapGetters(["defaultorgid"]),
  },
  methods: {
    handleReset() {
      this.$refs.esign.reset();
    },
    handleGenerate() {
      this.$refs.esign
        .generate()
        .then((res) => {
          this.resultImg = res;
        })
        .catch((err) => {
          alert(err); // 画布没有签字时会执行这里 'Not Signned'
        });
    },

    // signalR
    send() {
      const vm = this;
      vm.hubConnection
        .invoke("SendMessage", vm.userName, vm.message)
        .then(() => {
          console.log("SendMessage success");
        })
        .catch(function (err) {
          return console.error(err);
        });
    },
    connectHub() {
      const vm = this;
      vm.hubConnection
        .start()
        .then((res) => {
          console.log(res, "success connect");
          vm.get();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    get() {
      const vm = this;
      vm.hubConnection.on("ReceiveMessage", function (user, msg) {
        console.info("update success!", user, msg);
        vm.signalRMsg = `${user} : ${msg}`;
        vm.$alertT.fire({
          icon: "info",
          title: vm.signalRMsg,
        });
      });
    },
    addToGroup() {
      const vm = this;
      vm.hubConnection
        .invoke("AddToGroup", vm.groupName)
        .then(() => {
          console.log("addToGroup success");
        })
        .catch(function (err) {
          return console.error(err);
        });
    },
    sendToGroup() {
      const vm = this;
      vm.hubConnection
        .invoke("SendMessageToGroupAsync", vm.groupName, "z")
        .then(() => {
          console.log("SendMessageToGroupAsync success");
        })
        .catch(function (err) {
          return console.error(err);
        });
    },

    // no
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    handleKeydown() {
      if (this.input === "cbsd") {
        window.localStorage.setItem("CBSD_ADMIN", "true");

        window.location.reload();
      }
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },

    handleSelect(item) {
      console.log(item);
    },
    handleIconClick(ev) {
      console.log(ev);
    },
    debounceUpdate() {},
    getData() {
      console.log(this.input);
    },
    // debounceUpdate() {
    //   console.log("1");
    //   _.debounce(function () {}, 1000);
    // },
  },
  created() {
    // this.connectHub();
    this.debounceUpdate = _.debounce(this.getData, 1000);
  },
};
</script>
<style scoped lang='scss'>
.trelloContainer {
  display: flex;
  flex-direction: column;
  height: auto;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
}

.settingContainer {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.problemList {
  padding: 1rem;
  width: 30%;
}

.draggableContainer {
  overflow: auto;
  overflow-y: hidden;
  height: 100%;
  width: 100%;
  background: rgb(255, 237, 203);
  min-height: 400px !important;
  min-width: 200px;

  span {
    min-height: 40px;
    display: block;
    min-width: 200px;
    // display: flex;
    // flex-wrap: wrap;
  }
}
.problemListContainer {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 900px;
}
.graggableItem {
  cursor: move;
  display: flex;
  height: 95%;
  box-sizing: border-box;
  // flex-direction: column;
  background: $--color-primary;
  border-radius: 8px;
  color: #fff;
  font-weight: 700;
  padding: 0.5rem;
  margin: 0.5rem;
  position: relative;
}
.stopIndex {
  height: 20% !important;
  display: block;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
}
.stopName {
  // -webkit-writing-mode: vertical-lr;
  // writing-mode: vertical-lr;
}
</style>