<template>
  <!-- TODO:這邊用 views/alluser/editBusUser 頁面當作component使用 -->
  <EditBusUser />
</template> 

<script>
import EditBusUser from "@/views/alluser/editBusUser";
export default {
  name: "editBusUser",
  components: {
    EditBusUser,
  },
  data() {
    return {};
  },
  computed: {},
  filters: {},
};
</script>

