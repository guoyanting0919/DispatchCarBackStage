<template>
  <!-- TODO:這邊用非車行頁面作為元件使用 views/caruse/index -->
  <PickUp :isB='true'></PickUp>
</template>

<script>
import PickUp from "@/views/pickup";

export default {
  name: "pickUpB",
  components: { PickUp },
  mounted() {},
};
</script>

<style lang='scss' scoped>
</style>