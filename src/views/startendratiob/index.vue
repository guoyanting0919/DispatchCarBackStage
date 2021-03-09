<template>
  <!-- TODO:這邊用非車行頁面作為元件使用 views/startendratio/index -->
  <StartEndRatio :isB='true'></StartEndRatio>
</template>

<script>
import StartEndRatio from "@/views/startendratio";

export default {
  name: "startEndRatioB",
  components: { StartEndRatio },
  mounted() {},
};
</script>

<style lang='scss' scoped>
</style>