import React from 'react';
import { connect } from 'react-redux';

import Question from '../question';
import Card from '../card';
import EndScreen from '../end-screen';

import { activeCardSelector } from '../../selectors/active-card';

const ActiveCard = ({ card }) => {
  let content;

  const isQuestion = card.question_type !== undefined;
  const isEnd = card.end;

  const withCard = props => contents =>
    (<Card {...props}>
      {contents}
    </Card>);

  if (isQuestion) {
    content = withCard({ id: `question-card-${card._id}` })(<Question question={card} />);
  } else if (isEnd) {
    content = withCard({ id: 'end-screen' })(<EndScreen />);
  }

  return (
    <div id="survey-active-card">
      {content}
    </div>
  );
};

const mapStateToProps = state => ({
  card: activeCardSelector(state),
});

export default connect(mapStateToProps)(ActiveCard);
