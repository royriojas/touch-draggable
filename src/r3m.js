;(function ($, window) {
  var Modernizr = window.Modernizr;


  var r3m = {
    now :  function () {
      var fn = Date.now;
      if (fn) {
        return Date.now();
      }
      return (new Date()).getTime();
    },

    support : {
      pointerEnabled:!!window.navigator.msPointerEnabled,
      touch : Modernizr ? Modernizr.touch : ('ontouchstart' in window)
        || window.DocumentTouch && document instanceof DocumentTouch
    },
    /**
     * debounce returns a new function than when called will
     * execute the function and prevent any other calls to be executed
     * if they happen inside the threshold
     *
     * This is useful to execute just the first call of a series of calls inside a
     * threshold
     *
     * @param {Function} f      the function to debounce
     * @param {Integer} ms      the number of miliseconds to wait. If any other call
     *                          is made before that theshold it will be discarded.
     * @param {Object} ctx      the context on which this function will be executed
     *                          (the this object inside the function wil be set to this context)
     */
    debounce: function(f, ms, ctx){
      //just return the wrapper function
      return function(){
        //if this is the first time of the sequence of calls to this function
        if (f.timer == null) {
          //store the original arguments used to call this function
          var args = arguments;
          //execute it inmediately
          (function () {
            //call the function with the ctx and the original arguments
            f.apply(ctx, args);
            //set the timer
            f.timer = setTimeout(function () {
              //to make sure the next set of calls will be executing the first call as soon as possible
              f.timer = null;
            }, ms || 1);
          })();

        }
      };
    },
    /**
     * throttle returns a new function than when called will cancel any previous not executed
     * call reseting the timer again for a new period of time.
     *
     * This is usfeful to execute only the last call of a series of call within a time interval
     *
     * @param {Object} f
     * @param {Object} ms
     * @param {Object} ctx
     */
    throttle: function(f, ms, ctx){
      return function(){
        var args = arguments;
        clearTimeout(f.timer);
        f.timer = setTimeout(function(){
          f.timer = null;
          f.apply(ctx, args);
        }, ms || 0);
      }
    },
    /**
     * define a namespace object
     * @param {Object} ns
     */
    ns: function(ns){
      if (!ns)
        return;
      var nsParts = ns.split(".");
      var root = window;
      for (var i = 0, len = nsParts.length; i < len; i++) {
        if (typeof root[nsParts[i]] == "undefined") {
          root[nsParts[i]] = {};
        }
        root = root[nsParts[i]];
      }
      return root;
    },
    isNull : function (val) {
      return typeof val == "undefined" || val == null;
    },
    /**
     * return a random number between a min and a max value
     */
    rand : function() {
      var min, max,
        args = arguments;
      //if only one argument is provided we are expecting to have a value between 0 and max
      if (args.length == 1) {
        max = args[0];
        min = 0;
      }
      //two arguments provided mean we are expecting to have a number between min and max
      if (args.length >= 2) {
        min = args[0];
        max = args[1]

        if (min > max) {
          min = args[1];
          max = args[0];
        }
      }
      return min + Math.floor(Math.random() * (max - min));
    }
  };

  var touch = r3m.support.touch,
    pEnabled = r3m.support.pointerEnabled,
    isNull = r3m.isNull,
    b = $.browser,
    isWebkit = b.webkit,
    isMoz = b.mozilla;

  $.extend(r3m, {
    format : function () {
      var pattern = /\{(\d+)\}/g;
      //safer way to convert a pseudo array to an object array
      var args = Array.prototype.slice.call(arguments);
      var s = args.shift();
      return s.replace(pattern, function(c, d) {
        var replacement = args[d] ;
        if (isNull(replacement)) {
          replacement = "";
        }
        return replacement;
      });
    },
    pointer : {
      down : touch ? 'touchstart' : pEnabled ? 'MSPointerDown' : 'mousedown',
      move : touch ? 'touchmove' : pEnabled ? 'MSPointerMove' : 'mousemove',
      up : touch ? 'touchend' : pEnabled ? 'MSPointerUp' : 'mouseup',
      cancel : touch ? 'touchcancel' : 'MSPointerCancel',
      tap : touch ? 'click' : pEnabled ? 'MSGestureTap' : 'click' //consider including the tap special event from
    },
    gesture : {
      start : touch ? 'gesturestart' : 'MSGestureStart',
      change : touch ? 'gesturechange' : 'MSGestureChange',
      end : touch ? 'gestureend' : 'MSGestureEnd'
    },
    css : {
      //TODO find a better way to detect the name of the prefixed property
      transform : isWebkit ? '-webkit-transform' : isMoz ? '-moz-transform' : pEnabled ? '-ms-transform' : 'transform'
    },
    transition : {
      end : isWebkit ? 'webkitTransitionEnd' : 'transitionend'
    },
    animation : {
      end : isWebkit ? 'webkitAnimationEnd' : 'animationend'
    }
  });

  window.r3m = r3m;

})(jQuery, window);