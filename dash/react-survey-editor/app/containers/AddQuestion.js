import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import tr from '../utils/translate';
import { createQuestion } from '../modules/questions';
import { RaisedButton, FlatButton, Dialog, FontIcon } from 'material-ui';
import style from './styles/AddQuestion.scss';
import classNames from 'classnames';
import questions from '../constants/questions';

const Card = ({ name, icon, onClick }) => {
  const className = classNames(style.card, 'card');
  const titleClassName = classNames('card-title', 'center-align', style.cardtitle);
  const iconStyle = {
    position: 'absolute',
    right: '10px',
    bottom: '10px',
    fontSize: '2.5em'
  };

  return (
    <div className="col s12 m6 l3" onClick={onClick}>
      <div className={className}>
        <span className={titleClassName}> {name} </span>
        <FontIcon className="material-icons" color="#a5a6b6" style={iconStyle}>{icon}</FontIcon>
      </div>
    </div>);

};

@connect(
  state => ({languages: state.languages, canUseUpsell: !!state.user.canUseUpsell}),
  dispatch => bindActionCreators({ createQuestion }, dispatch)
)
export default class AddQuestionButton extends Component {

  constructor(props) {
    super(props);
    this.state = { showDialog: false };
  }

  onAdd(type) {
    const { createQuestion, languages } = this.props;
    this.setState({ showDialog: false });

    createQuestion(type, languages);
  }

  renderDialog() {
    const {canUseUpsell } = this.props;
    const actions = [
      <FlatButton
        key={0}
        label={tr('Cancel')}
        primary
        onTouchTap={() => this.setState({ showDialog: false })}
      />
    ]
    return <Dialog
      modal
      open
      title={tr('Add a question')}
      actions={actions}
           >
      <div className="row">
        {questions.map((q, i) => {
          if(q.type === 'Upsell' && !canUseUpsell) return null;
            return <Card key={i} name={q.tr ? tr(q.name) : q.name} icon={q.icon} onClick={() => this.onAdd(q.type)} />
        })}

      </div>
    </Dialog>

  }

  render() {
    const { showDialog } = this.state;

    let dialog;
    if (showDialog) dialog = this.renderDialog();

    return (
      <div>
        <RaisedButton
          onTouchTap={() => {this.setState({ showDialog: true })}}
          primary
          label={tr('Add a question')}
        />
        { dialog }
      </div>
    )
  }
}
