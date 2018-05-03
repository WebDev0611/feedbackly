import { createSelector } from 'reselect';

export const activeCardIndexSelector = state => state.activeCard.activeIndex;
export const cardsSelector = state => state.activeCard.cards;

export const activeCardSelector = createSelector(
  activeCardIndexSelector,
  cardsSelector,
  (activeIndex, cards) => cards[activeIndex]
);

export const isEndSelector = createSelector(
  activeCardIndexSelector,
  cardsSelector,
  (activeIndex, cards) => activeIndex === cards.length - 1
);
