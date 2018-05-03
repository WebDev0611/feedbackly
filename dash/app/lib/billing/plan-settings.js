const FEATURES = require("../constants/features");
const _ = require("lodash");

const FREE_PLAN = "FREE_PLAN";
const TEAM_PLAN = "TEAM_PLAN";
const GROWTH_PLAN = "GROWTH_PLAN";
const COMPANY_PLAN = "COMPANY_PLAN";

const SOLUTION_SALES = "SOLUTION_SALES";

const planSettings = {
  [FREE_PLAN]: {
    availableFeatures: [FEATURES.CHANNEL_CREATION, FEATURES.SMS_MESSAGES],
    responseLimit: 50,
    maxAdminCount: 1,
    maxNonAdminCount: 0,
    maxUserCount: 1,
    canBuyMoreUsers: false
  }
};

planSettings[TEAM_PLAN] = {
  availableFeatures: [
    ...planSettings.FREE_PLAN.availableFeatures,
    FEATURES.FILE_EXPORTS.ALL,
    FEATURES.SURVEY_LOGIC
  ],
  responseLimit: 250,
  maxAdminCount: 3,
  maxNonAdminCount: 0,
  maxUserCount: 3,
  canBuyMoreUsers: false
};

planSettings[GROWTH_PLAN] = {
  availableFeatures: [
    ...planSettings.FREE_PLAN.availableFeatures,
    ...planSettings.TEAM_PLAN.availableFeatures,
    FEATURES.SURVEY_APPEARANCE_CUSTOMIZATION,
    FEATURES.NOTIFICATIONS.TO_ORGANIZATION_USERS,
    FEATURES.ORGANIZATION_LOGO
  ],
  responseLimit: 2000,
  maxAdminCount: undefined,
  maxNonAdminCount: undefined,
  maxUserCount: 3,
  canBuyMoreUsers: true
};

planSettings[COMPANY_PLAN] = {
  availableFeatures: [
    ...planSettings.FREE_PLAN.availableFeatures,
    ...planSettings.TEAM_PLAN.availableFeatures,
    ...planSettings.GROWTH_PLAN.availableFeatures,
    FEATURES.NOTIFICATIONS.TO_ALL_EMAILS,
    FEATURES.FEEDBACK_INBOX
  ],
  responseLimit: 5000,
  maxAdminCount: undefined,
  maxNonAdminCount: undefined,
  maxUserCount: 20,
  canBuyMoreUsers: true
};

planSettings[SOLUTION_SALES] = {
  availableFeatures: [
    ...planSettings.FREE_PLAN.availableFeatures,
  ],
  responseLimit: 10000,
  maxAdminCount: undefined,
  maxNonAdminCount: undefined,
  maxUserCount: undefined,
  canBuyMoreUsers: true
}

planSettings[FREE_PLAN].availableFeatures = _.uniq(planSettings[FREE_PLAN].availableFeatures);
planSettings[TEAM_PLAN].availableFeatures = _.uniq(planSettings[TEAM_PLAN].availableFeatures);
planSettings[GROWTH_PLAN].availableFeatures = _.uniq(planSettings[GROWTH_PLAN].availableFeatures);
planSettings[COMPANY_PLAN].availableFeatures = _.uniq(planSettings[COMPANY_PLAN].availableFeatures);

planSettings.planOrder = [FREE_PLAN, TEAM_PLAN, GROWTH_PLAN, COMPANY_PLAN];
planSettings.constants = {
  FREE_PLAN,
  TEAM_PLAN,
  GROWTH_PLAN,
  COMPANY_PLAN,
  SOLUTION_SALES
};

module.exports = planSettings;
