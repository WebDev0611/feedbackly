<template>
  <v-card>
    <v-card-title>
      <h6 translate>Organizations</h6>
      <v-spacer></v-spacer>
      <v-text-field
        append-icon="search"
        label="Search"
        single-line
        hide-details
        v-model="search"
      ></v-text-field>
    </v-card-title>
    <v-data-table
        v-bind:headers="headers"
        v-bind:items="organizations"
        v-bind:search="search"
        v-bind:rows-per-page-items="rowsPerPage"
        :loading="loader"
      >
      <template slot="items" slot-scope="props">
        <td class="text-xs-left">
          <router-link :to="{ name: 'admin.editOrganization', params: { id: props.item._id }}">
              {{props.item.name}}
          </router-link>
        </td>
        <td class="text-xs-left">{{ props.item.segment }}</td>
        <td class="text-xs-left">{{ props.item.plan }}</td>
        <td class="text-xs-right">{{ props.item.created_at | date }}</td>
      </template>
      <template slot="pageText" slot-scope="{ pageStart, pageStop }">
        <translate>From</translate> {{ pageStart }} <translate>to</translate> {{ pageStop }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
/* eslint-disable */
  import moment from 'moment'
  const DATE_FORMAT = 'DD.MM.YYYY HH:mm'
  export default {
    name: 'organizations',
    props: ['organizations'],
    filters: {
      date: (text) => text.length > 0 ? moment(text).format(DATE_FORMAT) : text
    },
    data () {
      return {
        loader: true,
        search: '',
        rowsPerPage: [12, 25, 50, { text: this.$gettext('All'), value: -1 }],
        pagination: {},
        headers: [
          {
            text: this.$gettext('Name'),
            align: 'left',
            value: 'name'
          },
          { text: this.$gettext('Segment'), value: 'segment', align: 'left' },
          { text: this.$gettext('Plan'), value: 'plan', align: 'left'},
          { text: this.$gettext('Created at'), value: 'created_at' },
        ],
      }
    },
    watch: {
      organizations(data){
        if( data.length && data.length > 0) this.loader = false;
      }
    }
  }
</script>
