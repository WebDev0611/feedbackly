import React from 'react';
import { connect } from 'react-redux';
import './style.scss';
import { bindActionCreators } from 'redux';
import { hideIpadSignup, getSignupState, SIGNUP_STAGE_DONE, SIGNUP_STAGE_PENDING_SURVEY, SIGNUP_STAGE_PENDING_SIGNUP } from 'state/ipad-signup';
import Spinner from 'react-spinkit';
class IpadSignup extends React.PureComponent {

  componentDidMount() {
    var { getSignupState, udid } = this.props;
    getSignupState(udid);
    this.interval = setInterval( () => {
      getSignupState(udid);
    }, 5000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  componentWillReceiveProps(newProps) {
    if(newProps.stage == SIGNUP_STAGE_DONE ) clearInterval(this.interval);
  }

  render() {

    var { show, hideIpadSignup, stage } = this.props;
    if(!show) return <div/>;
    var signupText =
      stage == SIGNUP_STAGE_DONE ? 'Congratulations! Your survey is now live. With your free plan, you can collect up to 50 survey responses per month. You can upgrade your plan at any time by going to the “organization” tab in your dashboard.' :
      stage == SIGNUP_STAGE_PENDING_SIGNUP ? 'Check your email! Follow the link to verify your account.' :
      stage == SIGNUP_STAGE_PENDING_SURVEY ? 'Go to the “Surveys” tab in your dashboard to add a survey. It will automatically show up here when it’s published.' :
      <Spinner spinnerName="three-bounce" />;

    var startButton = (stage == SIGNUP_STAGE_DONE) && <div><br/><button onClick={() => window.location.reload()} className="btn btn-turquoise btn-next">Go to survey</button></div>
    var exampleButton = (stage != SIGNUP_STAGE_DONE) && <button onClick={hideIpadSignup} className="btn btn-turquoise btn-next">Show me an example survey</button>;


    return <div className="ipadSignup">
    <div className="ipadSignupContent" >
      <div className="ipadSignupStatus">
       {signupText}
       { startButton }
      </div>
    </div>
    <div className="ipadSignupButton">
    {exampleButton}
    </div>
  </div>;
  }
};

const mapStateToProps = state => {
  return {
    show: state.ipadSignup.show,
    udid: state.channel.udid,
    stage: state.ipadSignup.stage
  };
}
const mapDispatchToProps = dispatch => bindActionCreators({ hideIpadSignup, getSignupState }, dispatch );
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IpadSignup);
