import { Dialog, FlatButton } from 'material-ui';
import React from 'react';
import tr from '../utils/translate';

export default ({ text, onSuccess, onCancel }) => {
  const actions = [
    <FlatButton
      key={0}
      label={tr('Cancel')}
      primary
      onTouchTap={onCancel}
            />,
    <FlatButton
      key={1}
      label={tr('OK')}
      primary
      onTouchTap={onSuccess}
          />,
  ];

  return <Dialog
    actions={actions}
    modal
    open >
    {text}
  </Dialog>
}
