import * as map from "@/api/map";
/* eslint-disable */
export default {
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
      searchResultsFrom: [], //auto complete options
      searchResultsTo: [], //auto complete options
      sessionToken: null, //令牌
      fromAddr: "", //起點詳細地址
      toAddr: "", //迄點詳細地址
      tableToggle: true,
    };
  },
  methods: {
    mixinMethod() {
      console.log("a", this.temp);
    },

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
    remoteMethodFrom(query) {
      const vm = this;
      if (!query) return;
      this.service.getPlacePredictions(
        {
          input: query,
          sessionToken: vm.sessionToken,
        },
        vm.displaySuggestionsFrom
      );
    },
    remoteMethodTo(query) {
      const vm = this;
      if (!query) return;
      this.service.getPlacePredictions(
        {
          input: query,
          sessionToken: vm.sessionToken,
        },
        vm.displaySuggestionsTo
      );
    },

    /* 獲取autocomplete資料 */
    displaySuggestionsFrom(predictions, status) {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
        this.searchResultsFrom = [];
        return;
      }
      this.searchResultsFrom = predictions;
    },
    displaySuggestionsTo(predictions, status) {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
        this.searchResultsTo = [];
        return;
      }
      this.searchResultsTo = predictions;
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
        vm.temp[`${status}Lat`] = res.result.lat;
        vm.temp[`${status}Lon`] = res.result.lon;
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

    /* 放置舊marker */
    setOldMarker(data) {
      const vm = this;
      let position = {
        lat: data.lat, // 經度
        lng: data.lon, // 緯度
      };
      let marker = new google.maps.Marker({
        position,
        map: vm.map,
      });
      vm.map.panTo(position);
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
    handleVisibleChangeFrom(val) {
      if (val) {
        this.searchResultsFrom = [];
      }
    },

    handleVisibleChangeTo(val) {
      if (val) {
        this.searchResultsTo = [];
      }
    },

    /* 獲取預估金額 */
    getDiscount() {
      const vm = this;
      let params = {
        CaseUserId: vm.$route.params?.id?.split("-")[1],
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
        vm.temp.familyWith !== ""
      ) {
        try {
          orderCaseUser?.getDiscount(params).then((res) => {
            vm.$cl(res);
            // vm.discountData = [res.result];
            let back = JSON.parse(JSON.stringify(res.result));

            vm.$set(vm.discountData, 0, res.result);
            vm.$set(vm.discountData, 1, back);

            // vm.discountData[0] = res.result;
            vm.discountData[0].direction = "去程";
            // vm.discountData[1] = res.result;
            vm.discountData[1].direction = "回程";
            // vm.$forceUpdate();
          });
        } catch (error) {
          return null;
        }
      } else {
        vm.$cl("資料不全 無法計算金額");
      }
    },
  },
  mounted() {
    this.initMap();
  },
};
