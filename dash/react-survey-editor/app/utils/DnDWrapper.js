import React, { Component, PropTypes } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import createDragPreview from './DnDPreview';
import { connect } from 'react-redux';


@connect(
  state => ({
    focusedInput: state.ui.focusedInput,
  })
)
export default function (Element, type) {
  const itemSource = {
    beginDrag(props, monitor, component) {
      props.clear();
      const item = { id: props.id };
      return item;
    },
  };

  const itemTarget = {
    hover(props, monitor, component) {
      const dragId = monitor.getItem().id;
      const hoverId = props.id;

      if (dragId === hoverId) return;
      props.moveItem(dragId, hoverId);
      //monitor.getItem().id = hoverId;
    },
  };

  @DropTarget(type, itemTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
  }))
  @DragSource(type, itemSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }))
  class DNDWrapper extends Component {

    componentDidMount() {
      const { dragTitle, connectDragPreview } = this.props;
      // handles first time dragPreview setup
      this.dragPreview = createDragPreview(dragTitle)
      this.props.connectDragPreview(this.dragPreview)
    }
    componentDidUpdate(prevProps) {
      const { dragTitle, connectDragPreview } = this.props;
      // handles updates to the dragPreview image as the dynamic numRows value changes
      this.dragPreview = createDragPreview(dragTitle, null, this.dragPreview)
    }

    render() {
      const { connectDragSource, connectDropTarget, connectDragPreview,
         moveItem, focusedInput, ...childProps } = this.props;
      if (focusedInput) return <div><Element {...childProps} /></div>;
      else return connectDragSource(connectDropTarget(<div><Element {...childProps} /></div>));
    }
  }
  return DNDWrapper;
}
