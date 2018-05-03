function pubsub() {
  var events = {};

  function subscribe(event, subscription) {
    events[event.toString()] = events[event.toString()] || [];

    events[event.toString()].push(subscription);
  }

  function unsubscribeEvents(events) {
    for(var event in events) {
      delete events[event];
    }
  }

  function unsubscribeAll() {
    events = {};
  }

  function publish(event, data) {
    var subscriptions = events[event.toString()];
    if(subscriptions !== undefined) {
      subscriptions.forEach(function(subscription) {
        subscription(data);
      });
    }
  }

  return {
    subscribe,
    publish,
    unsubscribeEvents,
    unsubscribeAll
  }
}

module.exports = pubsub;
