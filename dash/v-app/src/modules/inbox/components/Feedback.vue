<template>
  <v-flex justify-start xs12 sm10 md9 class="text-xs-left">
    <div class="feedback">
      <div v-for="(feedback, j) in event.feedback" v-bind:key="j">
        <p class="mb-2 mt-3">
          <strong>{{j+1}}.{{feedback.title}}</strong>
        </p>
        <div v-if="feedback.question_type === 'Button'">
          <ButtonQuestion style="height: 45px; width: 45px;" :opts="feedback.opts" :value="feedback.data" />
        </div>

        <div v-if="feedback.question_type === 'NPS'">
          <NPS class="medium" :value="feedback.data"></NPS>
        </div>

        <div v-if="feedback.question_type === 'Word'">
          <Word :values="feedback.data" />
        </div>

        <div v-if="feedback.question_type === 'Image'">
          <Image-question :value="feedback.data" />
        </div>

        <div v-if="feedback.question_type === 'Text'">
          <Text-question :value="feedback.data" />
        </div>

        <div v-if="feedback.question_type === 'Slider'">
          <Slider-question :values="feedback.data" />
        </div>

        <div v-if="feedback.question_type === 'Contact'">
          <Contact :values="feedback.data" />
        </div>
      </div>

      <div v-if="event.metadata" v-for="(meta,i) in event.metadata" :key="i" class="teal-dark mt-2">
        {{meta.key}}: <strong>{{meta.val}}</strong>
      </div>
      <div class="timestamp pt-3"> {{event.created_at | date}} {{event.survey.name}} {{event.channel.name}}</div>

      </div>

  </v-flex>
</template>
<script>
import ButtonQuestion from "@/components/questionTypes/ButtonQuestion";
import Contact from "@/components/questionTypes/Contact";
import ImageQuestion from "@/components/questionTypes/ImageQuestion";
import NPS from "@/components/questionTypes/NPS";
import SliderQuestion from "@/components/questionTypes/SliderQuestion";
import TextQuestion from "@/components/questionTypes/TextQuestion";
import Word from "@/components/questionTypes/Word";

import { date } from "@/utils/filters";
export default {
  props: ["event"],
  components: {
    ButtonQuestion,
    Contact,
    ImageQuestion,
    NPS,
    SliderQuestion,
    TextQuestion,
    Word
  },
  filters: { date }
};
</script>

<style lang="stylus" scoped>
@import '../../../stylus/colors';

.teal-dark{
  color: $teal-dark;
}

p strong {
  color: #2fbca4;
}

.feedback {
  background-color: #f0f9fd;
  padding: 1em;
  border-radius: 1em;
  display: inline-block;
}

.timestamp {
  text-align: right;
  font-size: 0.8em;
}
</style>

