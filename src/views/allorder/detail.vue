<template>
  <div class="flex-column allOrderDetail">
    <sticky :className="'sub-navbar'">
      <el-button type="info" plain size="mini">回列表</el-button>
    </sticky>
    <div class="app-container flex-item">
      <Title title="訂單總覽"></Title>
      <div class="formContainer bg-white" style="height: calc(100% - 50px)">
        <el-tabs v-model="activeName">
          <el-tab-pane label="訂單明細" name="first">
            <div class="tabContainer">
              <div class="orderBox">
                <div class="orderBoxDetail">
                  <h2 class="textCenter" style="margin-bottom: 0.5rem">
                    訂單編號
                  </h2>
                  <h3 class="textCenter" style="margin-bottom: 3rem">
                    TS1601102573525
                  </h3>
                  <h3 class="mb-2 textCenter">狀態:已排班</h3>
                  <h3 class="mb-2 textCenter">行程:去程</h3>
                  <h3 class="mb-2 textCenter">
                    訂單建立時間<br />2020-09-29 13:45
                  </h3>
                  <h3 class="mb-2 textCenter">
                    預約搭乘時間<br />2020-09-29 13:45
                  </h3>
                </div>
                <div class="orderCost">
                  <h3 class="textCenter">剩餘額度：$ 1520</h3>
                  <h3 class="textCenter">使用額度：$ 1520</h3>
                  <h3 class="textCenter">總金額：$ 1520</h3>
                </div>
              </div>
              <div class="routeBox">
                <div class="routeTitle">
                  <h3 class="colorPrimary" style="margin-right: auto">
                    不可共乘
                  </h3>
                  <h3 style="margin-right: 1rem; color: #343434">
                    輪椅類型：電動
                  </h3>
                  <h3 style="color: #343434">陪同人員：0人</h3>
                </div>
                <div class="routeMap"></div>
                <div class="routeDriver">
                  <div class="caseUserDetailBox">
                    <div>
                      <h2 class="textCenter mb-2">個案名</h2>
                      <h4 class="mb-1 textCenter">個案編號：1081213001</h4>
                      <h4 class="mb-3 textCenter">社會福利身分：一般戶</h4>
                    </div>
                    <div>
                      <h3 class="textCenter mb-2">聯絡人</h3>
                      <h4 class="mb-1 textCenter">聯絡人姓名：</h4>
                      <h4 class="mb-1 textCenter">關係：</h4>
                      <h4 class="mb-1 textCenter">手機：0924012210</h4>
                      <h4 class="mb-1 textCenter">市話：</h4>
                    </div>
                  </div>
                  <div class="routeTimeBox">
                    <div class="routeTimeTitle mb-3">
                      <h3>預估行車時間：11分鐘</h3>
                      <h3>預估里程數：3.399公里</h3>
                    </div>
                    <div style="height: calc(80%)">
                      <el-steps direction="vertical" :active="1">
                        <el-step
                          icon="iconfont icon-iconfont icon-home"
                          title="起點"
                          description="243台灣新北市泰山區貴子路69號"
                        ></el-step>
                        <el-step
                          icon="iconfont icon-iconfont icon-home"
                          title="迄點"
                          description="243台灣新北市泰山區貴子路69號"
                        ></el-step>
                      </el-steps>
                    </div>
                  </div>
                </div>
              </div>
              <div class="orderCostDetail">
                <h4>車資總額</h4>
                <h4 class="mb-2">$170</h4>
                <h4>政府補助</h4>
                <h4 class="mb-2">$125</h4>
                <h4>陪同金額</h4>
                <h4 class="mb-2">$0</h4>
                <h4>實際應收</h4>
                <h4 class="mb-2">$0</h4>
                <h4>實際實收</h4>
                <h4 style="margin-bottom: auto">$0</h4>
                <div class="rbBoxs">
                  <div class="rbBox">司機</div>
                  <div class="rbBox">車輛</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="行車歷程" name="second">
            <div class="tabContainer tabContainer2">
              <div class="caseUserBox">
                <h2 class="mb-2 textCenter">Name</h2>
                <h3 class="mb-1 textCenter">個案編號 1081213001</h3>
                <h3 class="mb-2 caseUserUid textCenter">
                  身分證字號 A123456789
                </h3>
                <div class="userPicBox"></div>
              </div>
              <div class="routeMain">
                <div class="routeMainHeader">
                  <p class="startRoute">新北市新店區建國路２２５巷１號二樓</p>
                  <p>--></p>
                  <p class="endRoute">
                    231台灣新北市新店區建國路289號(慈濟醫院門診)
                  </p>
                </div>
                <div class="customSteps">
                  <el-steps :active="2" align-center>
                    <el-step
                      title="新訂單"
                      description="2020-09-08 20:06"
                    ></el-step>
                    <el-step
                      title="已排班"
                      description="2020-09-08 20:06"
                    ></el-step>
                    <el-step
                      title="已出發"
                      description="2020-09-08 20:06"
                    ></el-step>
                    <el-step
                      title="已抵達"
                      description="2020-09-08 20:06"
                    ></el-step>
                    <el-step
                      title="客上"
                      description="2020-09-08 20:06"
                    ></el-step>
                    <el-step
                      title="客下"
                      description="2020-09-08 20:06"
                    ></el-step>
                    <el-step
                      title="已完成"
                      description="2020-09-08 20:06"
                    ></el-step>
                  </el-steps>
                </div>
                <div class="mapMainContainer">
                  <div class="mapHeader">
                    不可共乘 輪椅類型： 普通輪椅 陪同人員： 1 人
                  </div>
                  <div class="googleMapContainer"></div>
                  <div class="mapFooter">
                    司機：楊定富 車輛編號：TDP-5552 實收金額：22 預估里
                  </div>
                </div>
                <div class="driverRecord">司機備註</div>
              </div>
              <!-- <div class="costBox"></div> -->
            </div>
          </el-tab-pane>
          <el-tab-pane label="個案基本資料" name="third">
            <div class="tabContainer">
              <div class="caseUserHeader">
                <div class="caseUserNo">
                  <p class="mb-1">個案編號</p>
                  <p>1081213001</p>
                </div>
                <div class="caseUserStatus">
                  <p>違規點數：3</p>
                  <p>停權到期日：2020-04-03</p>
                </div>
                <div class="caseUserPay">公費</div>
              </div>
              <div class="caseUserMainContainer">
                <div class="caseUserNameBox">
                  <div class="caseUserNameBoxTop">
                    <h1 class="mb-2">Name</h1>
                    <h4 class="mb-2">身分證字號：F394857687</h4>
                    <div class="userPicBox"></div>
                  </div>
                  <div class="caseUserNameBoxBottom">
                    <p class="mb-2">審核日期： 2020-05-01</p>
                    <p>失效日期：2020-05-01</p>
                  </div>
                </div>
                <div class="caseUserDetailMain">
                  <div class="caseUserMainTop">
                    <div class="mainBoxA">
                      <h1>基本資料</h1>
                      <p>市話：0924012210</p>
                      <p>手機：0924012210</p>
                      <p>生日：2015-06-23</p>
                      <p>電子郵件：test@gmail.com</p>
                      <p>居住地址：新北市 板橋區 英士路192號</p>
                      <p>通訊地址：新北市 新莊區 中泰里011鄰中港二街４３號</p>
                    </div>
                    <div class="mainBoxB">
                      <h1>聯絡人</h1>
                      <p>聯絡人姓名：</p>

                      <p>關係：</p>

                      <p>市話：</p>

                      <p>手機：0924012210</p>

                      <p>電子郵件：</p>
                    </div>
                  </div>
                  <div class="caseUserMainBottom">
                    <h2>個案備註</h2>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="個案可用輔助" name="fourth">
            <div class="tabContainer">
              <div class="caseUserHeader">
                <div class="caseUserNo">
                  <p class="mb-1">個案編號</p>
                  <p>1081213001</p>
                </div>
                <div class="caseUserStatus">
                  <p>違規點數：0</p>
                </div>
                <div class="caseUserPay">可派送</div>
              </div>
              <div class="caseUserMainContainer">
                <div class="caseUserNameBox">
                  <div class="caseUserNameBoxTop">
                    <h1 class="mb-2">Name</h1>
                    <h4 class="mb-2">身分證字號：F394857687</h4>
                    <div class="userPicBox"></div>
                  </div>
                  <div class="caseUserNameBoxBottom">
                    <p class="mb-2">審核日期： 2020-05-01</p>
                    <p>失效日期：2020-05-01</p>
                  </div>
                </div>
                <div class="caseUserDetailMain">
                  <div class="caseUserMainTop">
                    <div class="mainBoxA">
                      <h1>總額度：$1840</h1>
                      <p>使用額度：$444</p>
                      <p>剩餘額度：$1396</p>
                    </div>
                    <div class="mainBoxB">
                      <h1>趟次紀錄</h1>
                      <p>總趟次 13</p>

                      <p>每月預設補助 1840</p>

                      <p>本月空趟次數 0</p>

                      <p>總共空趟次數 0</p>

                      <p>本月自付額 168</p>
                    </div>
                  </div>
                  <div class="caseUserMainBottom">
                    <h2 class="mb-2">修改紀錄</h2>
                    <p>系統新增1601431951 $1840 日期:2020-09-01</p>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
export default {
  name: "allOrderDetail",
  components: {
    Sticky,
    Title,
  },
  data() {
    return {
      activeName: "third",
    };
  },
  mounted() {
    // console.log(this.$route);
    // this.activeName = this.$route.query.type || "third";
    this.activeName = "second";
  },
};
</script>

<style lang="scss" scoped>
.colorPrimary {
  color: $--color-primary;
}
</style>
