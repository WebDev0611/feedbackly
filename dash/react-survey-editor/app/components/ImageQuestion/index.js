import React, { Component } from 'react';
import TextInput from '../TextInput';
import _ from 'lodash';
import style from './style.scss';
import LogicButton from '../../containers/LogicButton';
import { Popover, Menu, MenuItem, RaisedButton } from 'material-ui';
import FAB from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';
import DnDWrapper from '../../utils/DnDWrapper';
import ImageDialog from './ImageDialog';
import { getFallbackText } from '../../utils';
import tr from '../../utils/translate';
import classNames from 'classnames';
import AddButton from '../AddButton';

class Img extends Component {
  render() {
    const { id, text, imageUrl, onChange, inputId, onRemove, isDragging, placeholder, questionId } = this.props;
    return <div className={style.wrapper} style={{ opacity: isDragging ? 0.2 : 1}}>
      <div style={{position: 'relative', display: 'inline-block', width: '200px', height: '200px'}}>
      <LogicButton
        className={style.logic}
        questionId={questionId}
        id={id} />
        <img src={imageUrl} className={style.image} />
        <FAB mini className={style.delete} backgroundColor="#fe767c" onClick={() => onRemove()}  >
          <FontIcon className="material-icons">delete</FontIcon>
        </FAB>

      </div>
      <TextInput id={inputId} value={text} onChange={onChange} placeholder={placeholder} />
    </div>
  }
}

let DNDImg = DnDWrapper(Img, 'Img');

export default class ImageQuestion extends Component {


  render() {
    const { question, activeLanguage, languages, showImageDialog, clear, closeImageDialog,
         imageDialog, addImage, moveImage, changeImage, removeImage } = this.props;

    let canAdd = question.choices.length < 10;
    const addButton = canAdd && <AddButton text={tr('Add image')} onClick={showImageDialog}/>;
      return <div className={classNames(style.main)}>
        <div className="row">
          {question.choices.map(c => <div className={'col s4 m3'} key={c.id}>
            <div className={style.relative}>
            <DNDImg
              id={c.id}
              inputId={question.questionId + '-' + c.id}
              imageUrl={c.url}
              questionId={question.questionId}
              text={c.text[activeLanguage] || ''}
              placeholder={getFallbackText(c.text, languages)}
              onChange={(val) => changeImage(question.questionId, c.id, activeLanguage, val)} clear={clear}
              onRemove={() => removeImage(question.questionId, c.id)}
              moveItem={(dragId, targetId) => _.isUndefined(targetId) || moveImage(question.questionId, dragId, targetId)}
              dragTitle={c.text[activeLanguage] || ''}
              activeLanguage={activeLanguage}
              languages={languages}
            />
            </div>
          </div>)}
        </div>
        <div className='center-align'>
          { addButton }

          {imageDialog && <ImageDialog onClose={() => closeImageDialog()}
            onUpload={(url) => {
              closeImageDialog();
              addImage(question.questionId, { url });
            } } />}
        </div>
      </div>;
  }
}
