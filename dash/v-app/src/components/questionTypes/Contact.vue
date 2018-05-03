<template>
  <div>
    <table>
    <tr v-for="(field,i) in values" :key="i" class="field">
      <td class="label">{{field.label}}</td>
      
      <td v-if="field.type === 'boolean'"> 
        <v-icon v-if="field.data === 'true'">check_box</v-icon>
        <v-icon v-else>check_box_outline_blank</v-icon>
      </td>
      <td v-else>{{field.data}}</td>
    </tr>
    </table>
  </div>
</template>

<script>
export default {
props: ["values"]
}
</script>

<style lang="stylus" scoped>
table td{
  padding 0.3em
}

.label{
  font-weight 400
  }

</style>
