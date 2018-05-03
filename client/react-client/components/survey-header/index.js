/*eslint-disable*/
import React from 'react'
import { connect } from 'react-redux'

import { onTap } from 'utils/events'

import { toggleLanguageMenu } from 'state/language-menu'
import { getLanguageTranslation } from 'utils/translate'
import { getImageSrcFromCache } from 'utils/images'

import { isEndSelector, activeCardSelector } from 'selectors/active-card'

import Translate from 'components/translate'
import CachedImage from 'components/cached-image'
import TextFill from 'components/text-fill'
import Logo from 'components/logo'
import { getCountryCodeFromLanguage } from 'utils/flags'

const LanguageButton = ({ activeLanguage, onToggleLanguageMenu }) =>{
  return  <i className="flag-container language-button-container" {...onTap(onToggleLanguageMenu)}>
    <span className={`flag-icon flag-icon-${getCountryCodeFromLanguage(activeLanguage)} flag-icon-squared cursor-pointer active scale-in`} />
  </i>}

/*
 *  Prop validation missing! ~msorja7/2017
 */
const SurveyHeader = ({ activeLanguage, isEurosec, onToggleLanguageMenu, organizationLogo,
  showLanguageSelector }) =>
    <div id="survey-header">
      <div className="container">
        <div className="row">
          <div className="col col-4">
            <Logo id="survey-header-feedbackly-logo" /> &nbsp;
          </div>
          <div className="col col-4 text-center" id="survey-header-translations">
            {
              organizationLogo ? <span>
               <img src={getImageSrcFromCache(organizationLogo)} id="survey-header-organization-logo" />&nbsp;
              </span> : <div>&nbsp;</div>
            }
          </div>
          <div className="col col-4" id="survey-header-translations">
            {
              showLanguageSelector ?
               <button className="btn-no-style cursor-pointer language-menu-toggle">
                 <LanguageButton activeLanguage={activeLanguage} onToggleLanguageMenu={onToggleLanguageMenu} />
                 <span className="text">Language</span></button> :
                 <div>&nbsp;</div>
            }
          </div>
        </div>
      </div>
    </div>

const mapStateToProps = state => {
  const { organization, channel, survey } = state

  const currentCard = activeCardSelector(state)
  const currentCardIsQuestion = currentCard.question_type !== undefined
  const languages = survey.languages

  return {
    activeLanguage: state.language,
    organizationLogo: channel.logo || organization.logo,
    showLanguageSelector: !isEndSelector(state) && currentCardIsQuestion && languages.length > 1,
    isEurosec: state.view.decorators.EUROSEC
  }
}

const mapDispatchToProps = dispatch => ({
  onToggleLanguageMenu: () => dispatch(toggleLanguageMenu())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SurveyHeader)
