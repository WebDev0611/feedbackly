const intersection = require("lodash/intersection");
const profanity = {
  lvl1: require("./level1")
    .join(" ")
    .toLowerCase()
    .split(" "),
  lvl2: require("./level2")
    .join(" ")
    .toLowerCase()
    .split(" ")
};

function filterString(string = "") {
  const stringArr = string
    .toLowerCase()
    .split(" ")
    .map(w => w.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ""));

  const level1Matches = intersection(profanity.lvl1, stringArr);
  const level2Matches = intersection(profanity.lvl2, stringArr);

  const containsProfanity =
    (level2Matches.length && level2Matches.length > 0) ||
    level1Matches.length / stringArr.length >= 0.25;
  return containsProfanity;
}

function profanityFilter(fbevent) {
  try {
    if (fbevent.profanityFilter && fbevent.question_type === "Text") {
      const string = fbevent.data[0];
      return filterString(string);
    }
  } catch (e) {
    console.log("error with profanity filter", fbevent);
    return false;
  }
}

module.exports = { profanityFilter, filterString };
