<template>
  <v-layout row wrap>
    <v-flex xs12 sm12 md12>
      <v-card class="grey lighten-4" flat height="60px">
        <v-toolbar class="primary">
          <v-toolbar-title>
            <translate>Organizations</translate>
            </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>favorite</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>more_vert</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
/* eslint-disable */
  export default {
    name: 'toolbar',
    data: () => ({
      bars: [
        { 'class': 'white' },
        { 'class': '', dark: true },
        { 'class': 'primary', dark: true },
        { 'class': 'elevation-0' }
      ]
    }),
    
  }
</script>
