<template>
  <!-- TODO:這邊用 views/alluser/checkBusUser 頁面當作component使用 -->
  <CheckBusUser />
</template> 

<script>
import CheckBusUser from "@/views/alluser/checkBusUser";
export default {
  name: "checkBusUser",
  components: {
    CheckBusUser,
  },
  data() {
    return {};
  },
  computed: {},
  filters: {},
};
</script>

