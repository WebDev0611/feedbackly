<template>
  <div class="outerwrapper">
    <v-card>
      <v-layout column :style="`max-height: ${parentHeight}; position:relative`">
        <v-flex>
          <v-card-title primary-title class="border-bottom" ref="header">
            <h5 v-translate>Feedback</h5>
            <div class="float-right">
              {{ firstEventDate() | date }}
              <div v-if="!INBOX_DETAILS.surveyDetails.processed" class="unprocessed"></div>
            </div>
          </v-card-title>
        </v-flex>
        <v-flex class="scrollable" :style="`${replyWindowSize > 0 ? 'max-height:' + (feedbackcontainerSize-replyWindowSize) + 'px' : ''}`" ref="feedbackcontainer">
          <v-card-text>
            <div class="pt-1 pb-2" v-for="(event,i) in INBOX_DETAILS.surveyDetails.events" :key="i">
              <Feedback v-if="event.type==='feedback'" :event="event"></Feedback>
              <Message v-if="event.type==='message'" :event="event"></Message>
              <Processing v-if="event.type == 'process' || event.type == 'unprocess'" :event="event" />
            </div>
          </v-card-text>
        </v-flex>
        <v-flex>
          <v-card-actions class="actions" ref="actions">
            <v-btn color="primary" flat @click="toggleProcessed({clientId:$route.params.clientId, processed: !INBOX_DETAILS.surveyDetails.processed})" class="left">
              <v-icon>sync</v-icon> &nbsp;
              <span v-if="!INBOX_DETAILS.surveyDetails.processed" v-translate>Process feedback</span>
              <span v-if="INBOX_DETAILS.surveyDetails.processed" v-translate>Unprocess feedback</span>
            </v-btn>

            <v-btn v-if="INBOX_DETAILS.surveyDetails.contact && INBOX_DETAILS.surveyDetails.contact.phone && userDetails.availableFeatures.indexOf(FEATURES.SMS_MESSAGES) > -1" flat @click="() => toggleReply('sms')" :class="reply.type == 'sms' ? 'active' : 'inactive'">
              <v-icon>message</v-icon> &nbsp;
              <translate>SMS Reply</translate>
            </v-btn>
            <v-btn v-if="INBOX_DETAILS.surveyDetails.contact && INBOX_DETAILS.surveyDetails.contact.email" flat @click="() => toggleReply('email')" :class="reply.type == 'email' ? 'active' : 'inactive'">
              <v-icon>email</v-icon> &nbsp;
              <translate>E-mail Reply</translate>
            </v-btn>

            <v-btn flat @click="() => toggleReply('note')" :class="reply.type == 'note' ? 'active' : 'inactive'">
              <v-icon>note</v-icon> &nbsp;
              <translate>Add Note</translate>
            </v-btn>

          </v-card-actions>
        </v-flex>
        <transition name="fade">
          <div v-if="reply.show" class="reply-field-container" ref="replyfield" :style="`bottom: -${replyWindowSize}px`">
            <v-card>
              <Reply-message :id="this.INBOX_DETAILS.id" :type="reply.type" :POST_REPLY="postReply" :contact="INBOX_DETAILS.surveyDetails.contact"></Reply-message>
            </v-card>
          </div>
        </transition>
      </v-layout>
    </v-card>

  </div>
</template>

<script>
// @flow
import { mapActions, mapState } from "vuex";
import { get } from "lodash";
import { date } from "@/utils/filters";
import { NAMESPACE, FETCH_INBOX_DETAILS, TOGGLE_PROCESSED, POST_REPLY } from "./constants";
import { GET_USER_DETAILS } from "@/constants/main";
import FEATURES from "@/constants/features";

import Feedback from "./components/Feedback";
import Message from "./components/Message";
import Processing from "./components/Processing";
import ReplyMessage from "./components/Reply-message";
import scrollTo from "@/utils/scrollTo";

const initialReplyData = { show: false, type: null };

export default {
  data() {
    return {
      reply: initialReplyData,
      replyWindowSize: 0,
      feedbackcontainerSize: 0,
      FEATURES
    };
  },
  created() {
    this.fetchDetails();
    this[GET_USER_DETAILS]({ fields: ["availableFeatures", ""] });
  },

  props: ["parentHeight"],
  components: { Feedback, Message, Processing, ReplyMessage },
  computed: {
    ...mapState(NAMESPACE, {
      INBOX_DETAILS: ({ inboxDetails }) => inboxDetails
    }),
    ...mapState("route", {
      selectedId: state => state.params.clientId
    }),
    ...mapState({
      userDetails: state => state.userDetails
    })
  },

  methods: {
    ...mapActions(NAMESPACE, {
      TOGGLE_PROCESSED,
      FETCH_INBOX_DETAILS,
      POST_REPLY
    }),

    ...mapActions([GET_USER_DETAILS]),

    fetchDetails() {
      this.FETCH_INBOX_DETAILS({
        id: this.$route.params.clientId,
        processed: this.$route.query.processed
      }).then(() => {
        this.setReplyWindowSize();
      });
      this.$set(this, "reply", { ...initialReplyData });
    },
    firstEventDate() {
      return get(this.INBOX_DETAILS, "surveyDetails.events[0].created_at");
    },
    setReplyWindowSize() {
      let feedbackcontainerSize = get(this, "$refs.feedbackcontainer.clientHeight") || 0;
      let replyWindowSize = get(this, "$refs.replyfield.scrollHeight") || 0;
      let actionBar = get(this, "$refs.actions.scrollHeight") || 0;

      if (window.innerHeight > replyWindowSize + feedbackcontainerSize + actionBar) {
        feedbackcontainerSize = window.innerHeight - replyWindowSize - actionBar;
      }
      this.$set(this, "replyWindowSize", replyWindowSize);
      this.$set(this, "feedbackcontainerSize", feedbackcontainerSize);
    },
    postReply(params) {
      this.POST_REPLY(params);
      if (this.reply.type && this.reply.show) this.toggleReply(this.reply.type);
      scrollTo(this.$refs.feedbackcontainer, this.$refs.feedbackcontainer.scrollHeight, 300);
    },
    toggleReply(type) {
      const self = this;
      if (this.reply.show && this.reply.type === type) this.$set(this, "reply", { show: false, type: null });
      else if (this.reply.show && this.reply.type !== type) {
        this.$set(this.reply, "show", false);
        setTimeout(function() {
          self.$set(self.reply, "show", true);
          self.$set(self.reply, "type", type);
          setTimeout(self.setReplyWindowSize, 0);
        }, 300);
      } else {
        this.$set(this.reply, "show", !this.reply.show);
        this.$set(this.reply, "type", type);
      }
      setTimeout(self.setReplyWindowSize, 0);
      setTimeout(() => {
        scrollTo(this.$refs.feedbackcontainer, this.$refs.feedbackcontainer.scrollHeight, 300);
      }, 300);
    },
    toggleProcessed(params) {
      this[TOGGLE_PROCESSED](params).then(() => this.fetchDetails());
    }
  },

  filters: { date },

  watch: {
    selectedId: "fetchDetails"
  }
};
</script>

<style lang="stylus" scoped>
@import '../../stylus/colors';

$border = 1px solid #f1f1f1;

.border-bottom {
  border-bottom: $border;
}

.float-right {
  position: absolute;
  right: 0;
  padding-bottom: 1.5em;
  padding-right: 1em;
}

.unprocessed {
  margin-left: 10px;
  height: 8px;
  width: 8px;
  background-color: red;
  border-radius: 100%;
  display: inline-block;
}

.btn-right {
  position: absolute;
  right: 0;
}

.actions {
  border-top: $border;
  text-align: right;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.4s;
}

.fade-enter, .fade-leave-to { /* .fade-leave-active below version 2.1.8 */
  opacity: 0;
  transform: translateY(300px);
  flex-grow: 0.001;
}

.active {
  color: $teal-dark;
}

.inactive {
  color: #546e7a;
}

.reply-field-container {
  position: absolute;
  width: 100%;
}

.scrollable {
  overflow-y: scroll;
  transition: all 0.4s;
  max-height: 100vh;
}
</style>




