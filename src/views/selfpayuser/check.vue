<template>
  <!-- TODO:這邊用 views/alluser/checkSelfPayUser 頁面當作component使用 -->
  <CheckSelfPayUser />
</template> 

<script>
import CheckSelfPayUser from "@/views/alluser/checkSelfPayUser";
export default {
  name: "checkSelfPayUser",
  components: {
    CheckSelfPayUser,
  },
  data() {
    return {};
  },
  computed: {},
  filters: {},
};
</script>

