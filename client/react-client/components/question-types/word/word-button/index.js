import React from 'react';
import zepto from 'npm-zepto';

import { onTap } from 'utils/events';
import { getTextFillId } from 'utils/text-fill-utils';

import TextFill from 'components/text-fill';

class WordButton extends React.Component {
  render() {
    const maxFontPixels = this.props.decorators.PLUGIN || this.props.decorators.MOBILE ? 10 : 16;
    const { isMultipleChoice, isWordSelected } = this.props;
    return (
      <div className={'word-wrapper'}>
        <div
          ref="button"
          className={`btn-word cursor-pointer ${isMultipleChoice
            ? 'highlight-on-active'
            : 'scale-on-active'} tapable`}
            {...onTap(() => this.props.onTap(), { applyActiveClass: (isMultipleChoice && !isWordSelected) || !isMultipleChoice
             /* the state will change AFTER this tap event so we need to set the active state opposite of what
             the state is now. */ })}
        >
          <TextFill
            options={{
              maxFontPixels,
            }}
            onlyOnUpdate
            id={getTextFillId(this.props.word, `word-${this.props.id}`)}
          >
            {this.props.word}
          </TextFill>
        </div>
      </div>
    );
  }

  componentDidMount() {
    zepto(this.refs.button).addClass(`fade-in stagger stagger-${this.props.index}`);
  }
}

export default WordButton;
