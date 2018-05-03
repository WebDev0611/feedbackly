import store from 'state/store';

import { goBackToBeginning } from 'state/active-card';
import { setViewBackground } from 'state/view';
import { stopTimer, setTimerValue } from 'state/timer';
import { hidePrivacyPolicy } from 'state/privacy-policy';
import { INTERACTION_THRESHOLD } from 'constants/views';
import { redirect, toValidUrl } from 'utils/url';
import { get } from 'lodash';

import { isEndSelector, activeCardIndexSelector } from 'selectors/active-card';

import * as pluginClient from 'utils/plugin-client';
import * as kioskClient from 'utils/kiosk-client';

const syncTimerWithStore = store => {
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    const { timer, view, activeCard, survey, ping, channel, ipadSignup } = state;

    const redirectUrl = get(survey, 'properties.redirect_url') || get(survey, 'properties.redirect');

    const now = Math.floor(+(new Date()) / 1000);

    const refreshRequired = view.decorators.IPAD && ping.refreshRequired === true;
    const isInTheEndAndTimerIsDrained = isEndSelector(state) === true && timer.isDrained;
    const noInteractionAndIsInTheBeginning = activeCardIndexSelector(state) === 0 && (view.latestInteraction || 0) + INTERACTION_THRESHOLD >= now;
    const refreshRequiredAndPossible = refreshRequired && (isInTheEndAndTimerIsDrained || noInteractionAndIsInTheBeginning) && ipadSignup.stage != 'DONE';
    const shouldRedirect = isInTheEndAndTimerIsDrained && !view.decorators.PLUGIN && !view.decorators.IPAD && redirectUrl !== undefined && redirectUrl.replace(/ /g, '').length > 0;

    if(refreshRequiredAndPossible) {
      if(!kioskClient.postMessage({ reload: 'true' })) {
        window.location.reload();
      }
    } else if(timer.isDrained && view.decorators.IPAD) {
      store.dispatch(goBackToBeginning());
    } else if(isInTheEndAndTimerIsDrained && view.decorators.PLUGIN) {
      pluginClient.postMessage({ action: 'surveyFinished', meta: { udid: channel.udid } });
      unsubscribe();
    } else if(shouldRedirect) {
      redirect(toValidUrl(redirectUrl));
      if(timer.isDrained) {
        store.dispatch(stopTimer());
      }
    } else if(timer.isDrained) {
      store.dispatch(stopTimer());
    }
  });
}

export default syncTimerWithStore;
