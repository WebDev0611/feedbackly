import React from 'react';
import style from './style.scss';
import sprites from './flag-sprites.png';
import spacer from './spacer.png';
import classNames from 'classnames';
import Languages from '../../utils/Languages';

export default ({ lang, onClick, alert, small, extraSmall, plain }) => {
  const code = Languages[lang].flag;
  let containerClass = classNames(style.container, style.round, 'btn-floating', small && style.small, extraSmall && style.extraSmall);
  let flagClass = classNames(style.flag, style['flag' + code]);
  let btn = <div className={containerClass}>
    <img className={style.spacer} src={spacer} />
    <img className={flagClass} src={sprites} />
  </div>;

  if (alert) {
    btn = <div className={style.badgewrapper}> {btn} <div className={style.badge}>!</div> </div>;
  }
  var obj = {
    margin: '2px', display: 'inline-block', userSelect: 'none'
   }
   if(extraSmall) obj.margin = '0px';
//   if(extraSmall) btn = <div style={{fontSize: '12px', lineHeight: '100%', verticalAlign: 'center'}}>({btn})</div>;
   if(onClick) obj.cursor = 'pointer';
   return <div onClick={onClick} style={obj} > {btn} </div>

}
