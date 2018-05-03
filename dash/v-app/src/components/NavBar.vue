<template>
  <nav class="inline-block">
    <img src="/images/nav-logo.png" style="width: 33px; height: 22px; margin-top: 1em;" />

    <li v-for="(item,i) in menuitems" :key="i" v-if="item.display">
      <a v-if="item.link" :href="item.link">
        <div v-if="item.icon">
          <i class="material-icons">{{ item.icon }}</i>
        </div>
        {{ item.label }}
      </a>
      <router-link v-if="item.routerLink" :to="item.routerLink">
        <div v-if="item.icon">
          <i class="material-icons">{{ item.icon }}</i>
        </div>
        {{ item.label }}
      </router-link>
    </li>

  </nav>
</template>

<script>
import { get } from "lodash";
import FEATURES from "@/constants/features";
import { GET_REFERRAL_STATUS } from "@/constants/main";
export default {
  data() {
    return {
      defaults: {
        rights: {}
      }
    };
  },
  props: ["userRights"],
  computed: {
    features() {
      return get(this, "userRights.availableFeatures") || [];
    },
    rights() {
      return { ...this.defaults.rights, ...this.userRights };
    },
    menuitems() {
      return [
        { icon: "", label: "Admin", display: this.rights.system_admin, routerLink: "/admin" },
        { icon: "timeline", label: this.$gettext("Summary"), link: "/app/#/summary", display: true },
        { icon: "pie_chart", label: this.$gettext("Results"), link: "/app/#/results", display: true },
        {
          icon: "format_list_bulleted",
          label: this.$gettext("Feedback list"),
          link: "/app/#/feedbacks",
          display: true
        },
        {
          icon: "inbox",
          label: this.$gettext("Feedback inbox"),
          routerLink: "/Inbox",
          display:
            this.features.indexOf(FEATURES.FEEDBACK_INBOX) === -1 ||
            (this.features.indexOf(FEATURES.FEEDBACK_INBOX) > -1 &&
              this.rights.enable_feedback_inbox_for_user)
        },
        {
          icon: "content_paste",
          label: this.$gettext("Surveys"),
          link: "/app/#/survey-list",
          display: this.rights.survey_create
        },
        {
          icon: "record_voice_over",
          label: this.$gettext("Channel management"),
          link: "/app/#/channel-management",
          display: this.rights.organization_admin
        },
        {
          icon: "notifications",
          label: this.$gettext("Notifications"),
          link: "/app/#/notifications-list",
          display: true
        },
        {
          icon: "monetization_on",
          label: this.$gettext("Upsales"),
          link: "/app/#/upsells",
          display: this.features.indexOf(FEATURES.UPSELL_MODULE) > -1
        },
        {
          icon: "domain",
          label: this.$gettext("Organization"),
          routerLink: { name: "organization.settings" },
          display: this.rights.organization_admin
        },
        { icon: "swap_vert", label: this.$gettext("Switch organization"), link: "/app/#/" },
        { icon: "favorite", label: this.$gettext("Referrals"), link: "/app/#/referral", display: this.rights.segment === 'SELF_SIGNUP' },
        {
          icon: "help_outline",
          label: this.$gettext("Help center"),
          link: "https://feedbacklyhelp.zendesk.com",
          display: true
        },
        { icon: "settings", label: this.$gettext("Settings"), link: "/app/#/user/settings", display: true }
      ];
    }
  }
};
</script>

<style scoped>
nav {
  width: 80px;
  background-color: #607d8b;
  color: white;
  font-size: 10px;
  font-weight: 500;
  text-align: center;
}

nav li {
  list-style: none;
  padding: 7px 3px;
  transition: background-color 0.5s ease;
  background-color: #607d8b;
}

nav li a {
  text-decoration: none;
  color: white !important;
}

nav li.active,
nav li:hover {
  background-color: #566f7c;
}

nav li i {
  font-size: 1.2rem !important;
}

.inline-block {
  display: inline-block;
}
</style>
