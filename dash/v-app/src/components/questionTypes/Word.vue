<template>
  <span>
    <div v-for="(word, i) in values" :key="i" class="word">
      {{ word }}
    </div>
  </span>
</template>

<script>
export default {
  props: ["values"]
};
</script>

 <style lang="stylus">
 @import '../../stylus/colors';

 .word {
   background-color: $teal-light;
   color: white;
   text-transform: uppercase;
   font-weight: 400;
   border-radius: 5px;
   padding: 0.5em;
   display: inline;
   margin: 0.2em;
 }
</style>

