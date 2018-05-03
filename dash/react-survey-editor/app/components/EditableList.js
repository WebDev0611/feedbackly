import React, { Component, PropTypes } from 'react';
import { DragDropContext } from 'react-dnd';
import _ from 'lodash';
import HTML5Backend from 'react-dnd-html5-backend';
import EditableListItem from './EditableListItem';

export default class EditableList extends Component {
  static propTypes = {
    elements: PropTypes.array.isRequired,
    selectedKey: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    onMoveEnd: PropTypes.func.isRequired,
  };

  onToggle(key) {
    const { onSelect, selectedKey } = this.props;
    if (selectedKey === key) onSelect(null);
    else onSelect(key);
  }

  render() {
    const { elements, selectedKey, onSelect, onMove, onMoveEnd, clear, id } = this.props;
    return (
      <div className="collapsible" style={{ marginTop: '0px' }}>
        {elements.map((elem, index) =>
          (<EditableListItem
            key={elem.key}
            index={index}
            id={elem.key}
            moveItem={(row) => {
              if (!_.isUndefined(row)) onMove(elem.key, row);
            }}
            moveEnd={() => onMoveEnd()}
            clear={clear}
            isOpened={elem.key === selectedKey}
            onToggle={() => this.onToggle(elem.key)}
            item={elem}
          />),
        )}
      </div>
    );
  }
}
