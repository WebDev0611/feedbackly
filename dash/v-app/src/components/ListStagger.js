/* eslint-disable */
import Vue from 'vue';

export default Vue.component('list-stagger', {
  functional: true,
  render: function (createElement, context) {
    var data = {
      props: {
        name: 'staggered-fade'
      },
      on: {
        beforeEnter: function (el) {
          el.style.opacity = 0
          el.style.height = 0
        },
        enter: function (el, done) {
          var delay = el.dataset.index * 150
          setTimeout(function () {
            Velocity(
              el,
              { opacity: 1, height: context.props.height || '1.6em' },
              { complete: done }
            )
          }, delay)
        },
        leave: function (el, done) {
          var delay = el.dataset.index * 150
          setTimeout(function () {
            Velocity(
              el,
              { opacity: 0, height: 0 },
              { complete: done }
            )
          }, delay)
        }
      }
    }
    return createElement('transition-group', data, context.children)
  }
})


