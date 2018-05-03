import React from 'react';
import Toggle from 'material-ui/Toggle';

export default ({ toggles }) =>
  (<span>
    {toggles.map((opt, i) =>
      (<Toggle
        key={i}
        labelPosition="right"
        label={opt.label || (opt.toggled ? opt.onLabel : opt.offLabel)}
        toggled={opt.toggled}
        onToggle={() => opt.onToggle(!opt.toggled)}
        style={{ width: 'auto', minWidth: '190px', display: 'inline-block' }}
      />),
    )}
  </span>);
