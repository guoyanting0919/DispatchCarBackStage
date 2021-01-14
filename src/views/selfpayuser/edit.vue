<template>
  <!-- TODO:這邊用 views/alluser/editSelfPayUser 頁面當作component使用 -->
  <EditSelfPayUser />
</template> 

<script>
import EditSelfPayUser from "@/views/alluser/editSelfPayUser";
export default {
  name: "editSelfPayUser",
  components: {
    EditSelfPayUser,
  },
  data() {
    return {};
  },
  computed: {},
  filters: {},
};
</script>

