<template>
  <div class="login-container">
    <div class="content">
      <img class="leftImg" src="~@/assets/login/left.png" alt />
      <el-form
        class="login-form"
        autocomplete="on"
        :model="loginForm"
        :rules="loginRules"
        ref="loginForm"
        label-position="left"
      >
        <h3 class="title">OpenAuth.Pro</h3>
        <p class="tips">OpenAuth.Core企業版</p>
        <el-form-item prop="username">
          <span class="svg-container svg-container_login">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            name="username"
            type="text"
            v-model="loginForm.username"
            autocomplete="on"
            placeholder="請輸入登錄帳號"
          />
        </el-form-item>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password"></svg-icon>
          </span>
          <el-input
            name="password"
            :type="pwdType"
            @keyup.enter.native="handleLogin"
            v-model="loginForm.password"
            autocomplete="on"
            placeholder="請輸入密碼"
          ></el-input>
          <span class="show-pwd" @click="showPwd">
            <svg-icon
              :icon-class="pwdType === 'password' ? 'eye' : 'eye-open'"
            />
          </span>
        </el-form-item>
        <div class="tips" v-if="isIdentityAuth">
          <router-link to="/oidcRedirect">
            <el-badge is-dot
              >接口服務器啟用了Oauth認證，請點擊這裡登錄</el-badge
            >
          </router-link>
        </div>
        <el-form-item v-else>
          <el-button
            v-waves
            type="primary"
            style="width:100%;background:#4452D5;font-size: 24px;height: 50px;"
            :loading="loading"
            @click.native.prevent="handleLogin"
            >登 錄</el-button
          >
        </el-form-item>
        <p class="tips">默認System登錄後，你可以無法無天</p>
        <p class="tips">
          admin/admin登錄後，會少一點權限，資源管理/分類管理的字段會少一點
        </p>
        <p class="tips">
          test/test登錄後，權限會更少,資源管理/分類管理的字段也更少
        </p>
      </el-form>
    </div>

    <!-- <div class="tips">
        -----------------------------------------------------------------------------------------------
    </div>-->

    <!-- <div class="tips">
        默認System登錄後，你可以無法無天
      </div>
      <div class="tips">
        admin/admin登錄後，會少一點權限，資源管理/分類管理的字段會少一點
      </div>
      <div class="tips">
        test/test登錄後，權限會更少,資源管理/分類管理的字段也更少
    </div>-->
  </div>
</template>

<script>
import waves from "@/directive/waves"; // 水波紋指令
import { mapGetters } from "vuex";
export default {
  name: "login",
  directives: {
    waves,
  },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value.length <= 0) {
        callback(new Error("用戶名不能為空"));
      } else {
        callback();
      }
    };
    const validatePass = (rule, value, callback) => {
      if (value.length <= 0) {
        callback(new Error("密碼不能為空"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: "System",
        password: "123456",
      },
      loginRules: {
        username: [
          {
            required: true,
            trigger: "blur",
            validator: validateUsername,
          },
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            validator: validatePass,
          },
        ],
      },
      loading: false,
      pwdType: "password",
    };
  },
  computed: {
    ...mapGetters(["isIdentityAuth"]),
  },
  methods: {
    showPwd() {
      if (this.pwdType === "password") {
        this.pwdType = "";
      } else {
        this.pwdType = "password";
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("Login", this.loginForm)
            .then(() => {
              this.loading = false;
              this.$router.push({
                path: "/",
              });
            })
            .catch(() => {
              this.loading = false;
            });
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
$bg: #2d3a4b;
$light_gray: #eee;
$color_balck: #333;

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $color_balck;
      height: 47px;

      &:-webkit-autofill {
        transition: background-color 5000s ease-in-out 0s;
      }
    }
  }
  .el-form-item {
    margin-bottom: 35px;
    border-radius: 5px;
    color: #454545;
    .el-form-item__content {
      background: #fff;
      border: 1px solid rgba(223, 223, 223, 1);
    }
    &:last-child {
      padding-top: 20px;
      .el-form-item__content {
        border: none;
      }
    }
  }
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
@media screen and (max-width: 1150px) {
  .leftImg {
    width: 450px !important;
  }
}
@media screen and (max-width: 1010px) {
  .leftImg {
    width: 380px !important;
  }
}
@media screen and (max-width: 940px) {
  .leftImg {
    display: block;
    width: 260px !important;
    margin: 0 auto !important;
  }
}
$dark_gray: #d1dfe8;

.login-container {
  height: 100%;
  background: url("~@/assets/login/bg.png") no-repeat;
  background-color: #ebebea;
  background-position: 0 0;
  background-size: 62% 100%;
  text-align: center;
  &:before {
    content: "";
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
  .content {
    display: inline-block;
    vertical-align: middle;
    > img {
      width: 568px;
      margin-right: 150px;
      vertical-align: middle;
    }
    .login-form {
      display: inline-block;
      width: 400px;
      vertical-align: middle;
    }
  }

  .svg-container {
    color: $dark_gray;
    vertical-align: middle;
    width: 33px;
    display: inline-block;
    font-size: 22px;
    &_login {
      font-size: 31px;
    }
  }

  .title {
    font-size: 26px;
    font-weight: 400;
    color: #4452d5;
    margin: 0;
    text-align: left;
  }
  .tips {
    color: #959595;
    font-size: 14px;
    margin-top: 0;
    margin-bottom: 40px;
    text-align: left;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
    font-size: 24px;
  }
}
</style>
