import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { findDOMNode } from 'react-dom';
import Collapse from 'react-collapse';
import { DragSource, DropTarget } from 'react-dnd';
import style from './styles/EditableList.scss';
const itemSource = {
  beginDrag(props, monitor, component) {
    props.clear('ALL');
    const item = { id: props.id };

    return item;
  },

  canDrag(props, monitor) {
    const { id } = props;
    return id !== 'end';
  },

  endDrag(props, monitor) {
    const { moveEnd } = props;
    moveEnd();

  },
};

const itemTarget = {
  hover(props, monitor, component) {
    const dragId = monitor.getItem().id;
    const hoverId = props.id;
    if (hoverId === 'end') return;
    // Don't replace items with themselves
    if (dragId === hoverId) return;

    props.moveItem(dragId, hoverId);
  },
};

@DropTarget('item', itemTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource('item', itemSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))
export default class EditableListItem extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    moveItem: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
  };

  render() {
    const { text, isDragging, connectDragSource, connectDropTarget, connectDragPreview,
      children, item, onToggle, isOpened } = this.props;
    const opacity = isDragging ? 0 : 1;

    return <div style={{ opacity }} >
      {connectDragPreview(connectDropTarget(connectDragSource(
        <div onClick = {onToggle} className={style.header}>{item.header}</div>
      )))}
      <Collapse isOpened={isOpened}>
        {item.content}
      </Collapse>
      {children}
    </div>

  }
}
