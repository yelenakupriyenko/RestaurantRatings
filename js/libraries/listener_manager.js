/**
 * Partly adapted from
 * http://www.dofactory.com/javascript/observer-design-pattern
 * (Book: JavaScript + jQuery Design Pattern Framework)
 *
 * Usage Listener Concept:
 * 1) define listener - it will automatically be assigned to a listenerMap
 *      // var listener = new SH.Listener("testListener");
 * 2) define handler method and add it to listener
 *      // var handler = function(e) {... code goes here...}
 *      // listener.subscribe(handler);
 * 2.1) OR access listener via identifier
 *      // SH.listenerMap['testListener'].subscribe(handler);
 * 3) Fire event, event can be any kind of type/object
 *      // listener.fire({x: 'xCoordinateExample});
 * 3.1) OR use access via identifier to access it from somewhere else
 *      // SH.listenerMap['testListener'].fire({x: 'xCoordinateExample});
 */

var SH = {}; // static object identifier

SH.listenerMap = {
    removeListener: function (identifier) {
        delete SH.listenerMap[identifier];
    }
};

SH.Listener = function (identifier) {
    SH.listenerMap[identifier] = this; // register this listener
    this.handlers = [];
};

SH.Listener.prototype = {
    subscribe: function (fn) {
        this.handlers.push(fn);
    },
    unsubscribe: function (fn) {
        this.handlers = this.handlers.filter(
            function (item) {
                if (item !== fn) {
                    return item;
                }
            });
    },
    fire: function (o, thisObj) {
        var scope = thisObj || window;
        this.handlers.forEach(function (item) {
            item.call(scope, o);
        });
    }
};