<template>
  <transition name="fade">
    <div class="loadingContainer" v-if="active && wordArr">
      <div :style="countingStyle" class="loadMain">
        <span class="w50" :class='{"biggerText":idx ==  count,"middleText":(idx== count-1 || idx== count+1) && !typing}' v-for="(word,idx) in wordArr" :key="idx">{{word}}</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "LoadingWord",
  props: {
    text: {
      type: String,
      default: "LOADING...",
      require: false,
    },
    active: {
      type: Boolean,
      default: true,
      require: false,
    },
    delay: {
      type: Number,
      default: 150,
      require: false,
    },
    typing: {
      type: Boolean,
      default: false,
      require: false,
    },
  },
  data() {
    return {
      time: null,
      count: 0,
    };
  },

  watch: {
    active(val1) {
      const vm = this;
      if (val1) {
        vm.timer();
      } else {
        clearInterval(vm.time);
        vm.count = vm.wordLength;
      }
    },
  },
  computed: {
    wordArr() {
      return this.text.split("");
    },
    wordLength() {
      return this.wordArr.length;
    },
    countingStyle() {
      const vm = this;
      return {
        width: vm.typing ? `${vm.count * 50}px` : `${vm.wordLength * 50}px`,
        overflow: vm.typing ? "hidden" : "",
      };
    },
  },
  methods: {
    timer() {
      const vm = this;
      vm.time = setInterval(() => {
        if (vm.wordLength > vm.count) {
          vm.count++;
        } else {
          vm.count = 0;
        }
      }, vm.delay);
    },
  },
  mounted() {
    this.count = this.wordLength;
  },
};
</script>
<style lang="scss" scoped>
.loadingContainer {
  position: absolute;
  cursor: progress;
  width: 100%;
  height: 100%;
  background: #ffffffeb;
  // opacity: 0.8;
  z-index: 20;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loadMain {
  font-size: 3rem;
  // overflow: hidden;
  position: relative;
  padding-right: 9px;
  white-space: nowrap;
  // transition: 0.05s;
  font-weight: 700;
  //   animation: wordContainerAni 2s ease 0s infinite;

  .w50 {
    display: inline-block;
    width: 50px;
    text-align: center;
    transition: 0.5s;
  }

  .middleText {
    color: $--color-info;
    transform: scale(1.25);
  }

  .biggerText {
    // width: auto;
    transform: scale(2);
    color: $--color-info;
  }

  &::after {
    content: "";
    position: absolute;
    background: #000;
    top: 5%;
    right: 4px;
    height: 90%;
    width: 5px;
    animation: cursorAni 0.75s ease 0s infinite;
  }
}
@keyframes cursorAni {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>