<template>
  <!-- TODO:這邊用非車行頁面作為元件使用 views/areaservice/index -->
  <AreaService :isB='true'></AreaService>
</template>

<script>
import AreaService from "@/views/areaservice";

export default {
  name: "areaServiceB",
  components: { AreaService },
  mounted() {},
};
</script>

<style lang='scss' scoped>
</style>