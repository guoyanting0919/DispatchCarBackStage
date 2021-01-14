<template>
  <!-- TODO:這邊用 views/alluser/checkCaseUser 頁面當作component使用 -->
  <CheckCaseUser />
</template> 

<script>
import CheckCaseUser from "@/views/alluser/checkCaseUser";
export default {
  name: "checkCaseUser",
  components: {
    CheckCaseUser,
  },
  data() {
    return {};
  },
  computed: {},
  filters: {},
};
</script>

