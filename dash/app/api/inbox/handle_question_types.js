const _ = require("lodash");
const decrypt = require("../../lib/encryption").decrypt;

function makeBase(question, data, language) {
  return {
    question_type: data.question_type,
    title:
      question.heading[language] ||
      question.heading[_.keys(question.heading)[0]]
  };
}
function handleChoices(valueId, valueData, questionChoices, language, data) {
  try {
    const choice = _.find(questionChoices, { id: valueId });
    const type = choice.subtype || choice.type;
    const url = choice.url;
    const choiceText =
      choice.text[language] || choice.text[_.keys(choice.text)[0]];
    const dataValue = data.crypted ? decrypt(valueData) : valueData;

    return { choice, type, choiceText, dataValue, url };
  } catch (e) {
    console.log(e);
    return {};
  }
}

function handleButton(question, data, language) {
  const returnable = makeBase(question, data, language);
  returnable.opts = Object.assign(
    { buttonCount: question.choices.length },
    question.opts
  );
  returnable.data = data.value;
  return returnable;
}

function handleWord(question, data, language) {
  const returnable = makeBase(question, data, language);
  data.value = _.isArray(data.value) ? data.value : [data.value];
  returnable.data = data.value.map(val => {
    const { choiceText, dataValue, type } = handleChoices(
      val,
      "",
      question.choices,
      language,
      data
    );
    return choiceText;
  });

  return returnable;
}

function handleNPS(question, data, language) {
  const returnable = makeBase(question, data, language);
  returnable.data = data.value * 10;
  return returnable;
}

function handleContact(question, data, language) {
  const returnable = makeBase(question, data, language);

  returnable.data = data.value.map(val => {
    const { choiceText, dataValue, type } = handleChoices(
      val.id,
      val.data,
      question.choices,
      language,
      data
    );
    return { label: choiceText, data: dataValue, type };
  });

  return returnable;
}

function handleText(question, data, language) {
  const returnable = makeBase(question, data, language);
  returnable.data = data.crypted ? decrypt(data.value) : data.value;
  return returnable;
}

function handleSlider(question, data, language) {
  // remember smallScale

  const returnable = makeBase(question, data, language);

  returnable.data = data.value.map(val => {
    const { choiceText, dataValue, type } = handleChoices(
      val.id,
      val.data,
      question.choices,
      language,
      data
    );
    const dv = question.opts.smallScale
      ? Math.round(dataValue / 2 * 10)
      : dataValue * 10;
    return {
      label: choiceText,
      data: dv,
      type,
      scale: question.opts.smallScale ? 5 : 10
    };
  });

  return returnable;
}

function handleImage(question, data, language) {
  const returnable = makeBase(question, data, language);

  const { choiceText, url } = handleChoices(
    data.value,
    "",
    question.choices,
    language,
    data
  );
  returnable.data = { url, label: choiceText };

  return returnable;
}

function handleUpsell(question, data, language) {
  const returnable = makeBase(question, data, language);

  returnable.data = data.value.map(val => {
    const { choiceText, dataValue, type } = handleChoices(
      val.id,
      val.data,
      question.choices,
      language,
      data
    );
    return { label: choiceText, data: decrypt(dataValue), type };
  });

  return returnable;
}

function handleQuestionTypes(question, data, language) {
  if (data.question_type == "Button")
    return handleButton(question, data, language);
  if (data.question_type == "Word") return handleWord(question, data, language);
  if (data.question_type == "NPS") return handleNPS(question, data, language);
  if (data.question_type == "Contact")
    return handleContact(question, data, language);
  if (data.question_type == "Text") return handleText(question, data, language);
  if (data.question_type == "Slider")
    return handleSlider(question, data, language);
  if (data.question_type == "Image")
    return handleImage(question, data, language);
  if (data.question_type == "Upsell")
    return handleUpsell(question, data, language);
}

module.exports = { handleQuestionTypes };
