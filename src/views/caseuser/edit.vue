<template>
  <!-- TODO:這邊用 views/alluser/editCaseUser 頁面當作component使用 -->
  <EditCaseUser />
</template> 

<script>
import EditCaseUser from "@/views/alluser/editCaseUser";
export default {
  name: "editCaseUser",
  components: {
    EditCaseUser,
  },
  data() {
    return {};
  },
  computed: {},
  filters: {},
};
</script>

