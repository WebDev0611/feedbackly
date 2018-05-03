import zepto from 'npm-zepto';
import React from 'react';

import { loadImage } from 'utils/images';

class CachedImage extends React.Component {
  render() {
    const Tag = this.props.tag;

    return (
      <Tag ref="container"></Tag>
    )
  }

  componentDidMount() {
    let load;

    if(window._IMAGE_CACHE[this.props.src]) {
      load = () => Promise.resolve(window._IMAGE_CACHE[this.props.src].cloneNode());
    } else {
      load = () => loadImage(this.props.src);
    }

    load()
      .then(imageElem => {
        zepto(this.refs.container).append(imageElem);

        if(this.props.className) {
          imageElem.className = this.props.className;
        }

        if(this.props.id) {
          imageElem.id = this.props.id;
        }

        this.props.onLoad();
      });
  }
}

CachedImage.propTypes = {
  tag: React.PropTypes.string,
  onLoad: React.PropTypes.func
}

CachedImage.defaultProps = {
  tag: 'div',
  onLoad: () => {}
}

export default CachedImage;
