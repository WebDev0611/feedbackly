import React from 'react';
import { connect } from 'react-redux';


let Translate = ({ language, getText, isIpad }) => {
  var string = getText(language).split("\n").join("<br/>");
  
  if(isIpad){
    const temp = document.createElement("div");
    temp.innerHTML = string;
    string = temp.textContent || temp.innerText;
  }

  return (
    <span dangerouslySetInnerHTML={{__html: string }} />
  );
}

Translate.propTypes = {
  getText: React.PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    language: state.language
  }
}

export default connect(
  mapStateToProps
)(Translate);
