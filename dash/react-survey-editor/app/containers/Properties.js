import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { Dialog, FlatButton, Tabs, Tab, Slider, DropDownMenu, MenuItem } from 'material-ui'
import FAB from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import * as uiActions from '../modules/ui';
import * as propertiesActions from '../modules/properties';
import tr from '../utils/translate';

const TabButtonStyle = {
  backgroundColor: 'white',
  color: 'rgb(47, 188, 164)',
  whiteSpace: 'normal'
}

const InkBarStyle = {
  backgroundColor: 'rgb(47, 188, 164)',
}

const ContentContainerStyle	= {
  padding: '1em 0px'
}

@connect(
    state => ({
      ui: state.ui,
      properties: state.properties,
    }),
    dispatch => bindActionCreators({
      ...uiActions,
      ...propertiesActions,
    }, dispatch)
)
export default class Properties extends Component {

  renderTimeouts() {
    const format = (time) => time ?
    `${time} sec` :
    tr('Default');
      const {  properties: { question_timeout, final_screen_timeout},
        setQuestionTimeout, setFinalScreenTimeout } = this.props;
      return <Tab label={tr('Question timeout')} buttonStyle={TabButtonStyle}>
        {tr('Question timeout')}: {format(question_timeout)} <br />
        <Slider value={parseInt(question_timeout)} onChange={(e, val) => setQuestionTimeout(val)}
          min={2} max={30} step={1} /><br />
        {tr('Final screen timeout')}: {format(final_screen_timeout)}<br />
        <Slider value={parseInt(final_screen_timeout)} onChange={(e, val) => setFinalScreenTimeout(val)}
          min={2} max={60} step={1} /><br />
      </Tab>
  }
  renderRedirect() {
    const { properties: { redirectHttps, redirect_url}, setRedirectHttps, setRedirectUrl}
      = this.props;
    return <Tab label={tr('Redirect')} buttonStyle={TabButtonStyle}>
      {tr('Redirect address')}<br />
      <div className='row'>
        <div className='col s2'>
          <DropDownMenu value={redirectHttps ? 1 : 0} onChange={(a, val) => setRedirectHttps(val ? 1 : 0)}>
            <MenuItem value={0} primaryText="http://" />
            <MenuItem value={1} primaryText="https://" />
          </DropDownMenu>
        </div>
        <div className='col s10'>
          <input type="text" value={redirect_url} onChange={(e) => setRedirectUrl(e.target.value)}
            style={{verticalAlign: 'top'}}/>
        </div>
      </div>
    </Tab>
  }
  renderPrivacyPolicy() {
    const { properties: {custom_privacy_policy}, setPrivacyPolicy } = this.props;
    return <Tab label={tr('Privacy policy')} buttonStyle={TabButtonStyle}>
      {tr('Additional text to provide with the standard privacy policy.')}<br />
      <textarea value={custom_privacy_policy} onChange={(e) => setPrivacyPolicy(e.target.value)} />
    </Tab>

  }

  render() {
    const { ui: { propertiesOpen, activeLanguage }, openProperties, closeProperties } = this.props;
    const actions = [
      <FlatButton
        key={0}
        label={tr('Close')}
        primary
        onTouchTap={closeProperties} />,
    ];
    return (
      <div style={{ display: 'inline-block', marginLeft: '5px', marginRight: '5px' }}>
        <FAB onClick={openProperties}>
          <FontIcon className="material-icons">
            settings
          </FontIcon>
        </FAB>
        <Dialog
          actions={actions}
          modal={false}
          open={propertiesOpen}
          repositionOnUpdate={false}
          onRequestClose={closeProperties}
        >
          <Tabs inkBarStyle={InkBarStyle}
            contentContainerStyle={ContentContainerStyle}
          >
            { this.renderTimeouts() }
            { this.renderRedirect() }
            { this.renderPrivacyPolicy() }
          </Tabs>
        </Dialog>
      </div>);


  }
}
