import React from 'react';
import zepto from 'npm-zepto';
import { connect } from 'react-redux';


import { updateTextFillOnElements } from 'utils/text-fill-utils';

class FlexGrid extends React.Component {
  constructor(props) {
    super(props);

    this._update = this._update.bind(this);
  }

  _addBindings() {
    zepto(window)
      .on('resize', this._update);
  }

  _removeBindings() {
    zepto(window)
      .off('resize', this._update);
  }

  _update() {
    const grid = zepto(this.refs.grid);
    const margin = this.props.margin;
    const itemMaxWidth = this.props.itemMaxWidth;
    const itemsFitting = Math.floor(grid.width() / this.props.itemMinWidth);

    const items = Math.min(this.props.maxItemsPerRow, itemsFitting);
    const isFloating = React.Children.count(this.props.children) > this.props.maxItemsPerRow && this.props.maxItemsPerRow > 1;

    grid.find('.flex-grid__item')
      .each(function(index) {
        const elem = zepto(this);
        const paddingRight = ((index + 1) % items === 0 && index !== 0) || items === 1 ? '0px' : `${margin}px`;

        elem.css({
          'width': `${100/items}%`,
          'padding-right': paddingRight
        });

        if(itemMaxWidth !== undefined) {
          elem.css('max-width', `${itemMaxWidth}px`);
        }

        if(isFloating) {
          elem.addClass('flex-grid__item--floating');
        } else {
          elem.removeClass('flex-grid__item--floating');
        }
      });

    if(this.props.useTextFill) {
      this._updateTextFill();
    }
  }

  _updateTextFill() {
    const textFills = zepto(this.refs.grid).find('.text-fill-span');
    const textFillOptions = Object.assign({},{textFillEnabled: this.props.textFillEnabled}, this.props.textFillOptions )

    updateTextFillOnElements(textFills, textFillOptions);
  }

  componentDidMount() {
    this._addBindings();
    this._update();
  }

  componentWillUnmount() {
    this._removeBindings();
  }

  render() {
    const children = React.Children.map(this.props.children, (child, index) => {
      const style = {
        paddingBottom: `${this.props.margin}px`
      }

      return (
        <div className="flex-grid__item" style={style}>
          {child}
        </div>
      )
    });

    return (
      <div className="flex-grid" ref="grid">
        {children}
      </div>
    )
  }
}

FlexGrid.propTypes = {
  maxItemsPerRow: React.PropTypes.number,
  itemMinWidth: React.PropTypes.number,
  itemMaxWidth: React.PropTypes.number,
  margin: React.PropTypes.number,
  useTextFill: React.PropTypes.bool,
  textFillOptions: React.PropTypes.object
}

FlexGrid.defaultProps = {
  useTextFill: true,
  textFillOptions: {}
}

const mapStateToProps = (state, props) => {
  return {
    textFillEnabled: state.view.textFillEnabled
  }
}

export default connect(
  mapStateToProps
)(FlexGrid);
