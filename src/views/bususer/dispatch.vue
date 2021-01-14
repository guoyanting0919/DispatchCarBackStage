<template>
  <!-- TODO:這邊用 views/alluser/dispatchBusUser 頁面當作component使用 -->
  <DispatchBusUser />
</template> 

<script>
import DispatchBusUser from "@/views/alluser/dispatchBusUser";
export default {
  name: "dispatchBusUser",
  components: {
    DispatchBusUser,
  },
  data() {
    return {};
  },
  computed: {},
  filters: {},
};
</script>

