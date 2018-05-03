<template>
  <div>
    <h6 v-translate>Metadata</h6>
    <p v-html="html" />
  </div>
</template>
<script>
export default {
  beforeMount() {
    this.html = this.metadata
      .map(meta => {
        const keys = Object.keys(meta);
        const values = Object.values(meta);
        return keys
          .map(
            (key, k) =>
              k % 2 === 0 ? `<strong>${values[k]}</strong>` : values[k]
          )
          .join(": ");
      })
      .join();
  },
  props: ["metadata"]
};
</script>

<style scoped lang="stylus">
div {
  h6 {
    color: #2fbca4
  }
  box-shadow: 0 1px 5px -1px #eee
}
</style>

