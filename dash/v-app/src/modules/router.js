import Vue from "vue";
import Router from "vue-router";

import Admin from "./admin/Admin";
import AdminOrganization from "./admin/Organization";
import OrganizationDetails from "./admin/OrganizationDetails";
import Users from "./admin/Users";
import Channels from "./admin/channels/Channels";
import Channelgroups from "./admin/Channelgroups";

import Inbox from "./inbox/Inbox";
import inboxDetails from "./inbox/Inbox-details";

import Organization from "./organization/Organization";
import OrganizationSettings from "./organization/OrganizationSettings";
import OrganizationUsers from "./organization/OrganizationUsers";
import UserGroups from "./organization/UserGroups";

import OrganizationVisualAppearance from "./organization/OrganizationVisualAppearance";

import Referral from "./referral/ReferralStatus";

import LoginSignupMain from "./login-signup/LoginSignupMain";
import LoginSignupForgot from "./login-signup/LoginSignupForgot";
import SignUp from "./signup/SignUp";
import LoginSignupResetPassword from "./login-signup/LoginSignupResetPassword";

import SmsTopUp from "./sms-top-up/SmsTopUp";

Vue.use(Router);

const router = new Router({

  routes: [
    { path: "/login", name: "loginSignup", component: LoginSignupMain },
    {
      path: "/login/forgot",
      name: "loginSignup_forgot",
      component: LoginSignupForgot
    },
    {
      path: "/login/reset-password/:token",
      name: "loginSignup_resetPassword",
      component: LoginSignupResetPassword
    },
    {
      path: "/admin",
      name: "Admin",
      component: Admin
    },
    {
      path: "/admin/organizations/new",
      name: "admin.newOrganization",
      component: OrganizationDetails
    },
    {
      path: "/admin/organizations/:id",
      name: "AdminOrganizations",
      component: AdminOrganization,
      children: [
        {
          path: "edit",
          component: OrganizationDetails,
          name: "admin.editOrganization"
        },
        { path: "users", component: Users, name: "admin.Users" },
        { path: "users/:userId", component: Users, name: "admin.Users.edit" },
        { path: "channels", component: Channels, name: "admin.Channels" },
        {
          path: "channels/:channelId",
          component: Channels,
          name: "admin.Channels.edit"
        },
        {
          path: "channelgroups",
          component: Channelgroups,
          name: "admin.Channelgroups"
        },
        {
          path: "channelgroups/:channelgroupId",
          component: Channelgroups,
          name: "admin.Channelgroups.edit"
        }
      ]
    },
    {
      path: "/inbox/",
      component: Inbox,
      name: "Inbox",
      children: [
        {
          path: "/inbox/:clientId",
          component: inboxDetails,
          name: "Inbox.client"
        }
      ]
    },
    {
      path: "/organization/",
      component: Organization,
      name: "organization",
      children: [
        {
          path: "/organization/settings",
          component: OrganizationSettings,
          name: "organization.settings"
        },
        {
          path: "/organization/users",
          component: OrganizationUsers,
          name: "organization.users"
        },
        {
          path: "/organization/users/:id",
          component: OrganizationUsers,
          name: "organization.users.edit"
        },
        {
          path: "/organization/user-groups",
          component: UserGroups,
          name: "organization.user-groups"
        },
        {
          path: "/organization/visual-appearance",
          component: OrganizationVisualAppearance,
          name: "organization.visual-appearance"
        }
      ]
    },
    {
      path: "/referral",
      name: "referral_status",
      component: Referral
    },
    {
      path: "/signup/:token",
      name: "loginSignup_signup",
      component: SignUp
    },
    {
      path: "/sms-top-up",
      component: SmsTopUp,
      name: "SmsTopUp"
    }
  ]
});

router.beforeEach((to, from, next) => {
  // if (to.matched.length === 0) next("/login");
  // else next();

  next();
});

export default router;
