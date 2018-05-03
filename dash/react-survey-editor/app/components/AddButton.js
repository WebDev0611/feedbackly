import React, { PureComponent, PropTypes } from 'react';

import style from './styles/AddButton.scss';
import { RaisedButton, FontIcon, FAB } from 'material-ui';


export default class AddButton extends PureComponent {
  render() {
    const { text, icon, onClick } = this.props;
    let content = text || <FontIcon className="material-icons" >{icon}</FontIcon>;

    return <div className={style.main}>
      <RaisedButton onClick={onClick}  label={`\uff0b `+text}

        backgroundColor="#2980b9"
        labelColor="white"
      />
    </div>;
  }
}
