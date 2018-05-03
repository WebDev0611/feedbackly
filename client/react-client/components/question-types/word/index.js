import React from "react";
import zepto from "npm-zepto";
import filter from "lodash/filter";
import get from "lodash/get";
import { onTap } from "utils/events";
import NextButton from "components/next-button";
import WordButton from "./word-button";
import FlexGrid from "../../../components/flex-grid";

class WordQuestion extends React.Component {
  _onWordClick(wordId) {
    const id = this.props.question._id;
    const isMultipleChoice  = get(this, 'props.question.opts.isMultipleChoice');

    if (isMultipleChoice) {
      this.props.onWordSelection(wordId);
    } else if (this.props.feedbacksMap === undefined || this.props.feedbacksMap[id] === undefined) {
      this.props.onFbevent({ data: [wordId] });
      this.props.onNext([wordId]);
    }
  }
  saveMultipleChoiceToDB() {
    const wordsSelected = this.props.wordSelected;
    if(wordsSelected && wordsSelected.length > 0) {
      this.props.onFbevent({ data: wordsSelected });
      this.props.onNext([wordsSelected[wordsSelected.length-1]]);
    } else this.props.onNext([])

    
  }
  render() {
    const { language, question, wordSelected } = this.props;
    const isMultipleChoice  = get(this, 'props.question.opts.isMultipleChoice');
    const amountOfWords = question.choices.length;
    let columns = 1;
    if (amountOfWords > 6 && amountOfWords <= 14) columns = 2;
    if (amountOfWords > 14 && amountOfWords < 22) columns = 3;
    if (amountOfWords >= 22) columns = 4;

    const textFillOptions = {
      maxFontPixels: this.props.decorators.PLUGIN || this.props.decorators.MOBILE ? 10 : 16,
    };
    const words = filter(question.choices, (w) => {
      if (!w.hidden) return w;
    }).map((word, index) =>
      (<WordButton
        isMultipleChoice={isMultipleChoice}
        isWordSelected={wordSelected.indexOf(word.id) !== -1}
        onTap={() => this._onWordClick(word.id)}
        index={index}
        word={word.text[language]}
        columns={columns}
        decorators={this.props.decorators}
        key={word.id}
        id={word.id}
      />),
    );

    return (
      <div className={'word-question-wrapper'} ref="container">
        <FlexGrid
          maxItemsPerRow={columns}
          itemMinWidth={220}
          itemMaxWidth={600}
          margin={5}
          textFillOptions={textFillOptions}
        >
          {words}
        </FlexGrid>

        {isMultipleChoice ? (
          <NextButton {...onTap(this.saveMultipleChoiceToDB.bind(this))} />
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default WordQuestion;
