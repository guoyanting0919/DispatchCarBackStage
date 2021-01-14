<template>
  <!-- TODO:這邊用 views/alluser/dispatchCaseUser 頁面當作component使用 -->
  <DispatchCaseUser />
</template> 

<script>
import DispatchCaseUser from "@/views/alluser/dispatchCaseUser";
export default {
  name: "dispatchCaseUser",
  components: {
    DispatchCaseUser,
  },
  data() {
    return {};
  },
  computed: {},
  filters: {},
};
</script>

