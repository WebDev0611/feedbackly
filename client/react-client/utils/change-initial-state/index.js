export default function changeInitialState(initialStateFromServer){

  const initialState = {...{}, ...initialStateFromServer}

  // set the first card index

  const nextCardWithMaxProbability = initialState.activeCard.cards
  .map((card, index)=>{
    if (card.displayProbability === undefined) return index;    
    if (card.displayProbability >= Math.random()) return index
  })
  .filter(index=> index >= 0 && index !== undefined);
  
  initialState.activeCard.activeIndex = nextCardWithMaxProbability[0] || 0

  if(initialState.activeCard.activeIndex === initialState.activeCard.cards.length - 1){
    initialState.activeCard.activeIndex = 
      initialState.activeCard.cards.length - 2 > -1
      ? initialState.activeCard.cards.length - 2
      : 0
  }

  return initialState;
}
