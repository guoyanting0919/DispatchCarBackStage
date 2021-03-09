<template>
  <!-- TODO:這邊用非車行頁面作為元件使用 views/caruse/index -->
  <CarUse :isB='true'></CarUse>
</template>

<script>
import CarUse from "@/views/caruse";

export default {
  name: "carUseB",
  components: { CarUse },
  mounted() {},
};
</script>

<style lang='scss' scoped>
</style>