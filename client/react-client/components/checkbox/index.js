import React from 'react';
import className from 'classnames';

import { onTap } from 'utils/events';

import TextFill from 'components/text-fill';

export default class Checkbox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isChecked: props.checked
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.checked !== this.state.isChecked) {
      this.setState({
        isChecked: nextProps.checked
      });
    }
  }

  _onChange() {
    const newIsChecked = !this.state.isChecked;

    this.setState({
      isChecked: newIsChecked
    });

    this.props.onChange(newIsChecked);
  }

  render() {
    const classes = className({ 'checkbox-checked': this.state.isChecked }, 'checkbox-container');

    return (
      <div className={classes} {...onTap(this._onChange.bind(this))}>

      <table>
        <tr>
          <td className="checkbox-td">
          <div className="parent">
          <div className="checkbox-wrapper">
            <div className="checkbox-indicator">
              <i className="material-icons">&#xE876;</i>
            </div>
          </div>
          </div>
          </td>
          <td>
            <div className="checkbox-label">
                {this.props.children}
            </div>
          </td>
        </tr>
      </table>


      </div>
    )
  }
}

Checkbox.defaultProps = {
  checked: false,
  onChange: () => {}
}

Checkbox.propTypes = {
  onChange: React.PropTypes.func,
  checked: React.PropTypes.bool
}
