/*! Touch Draggable - v0.0.1 - 2012-08-12
* https://github.com/royriojas/touch-draggable
* Copyright (c) 2012 Roy Riojas; Licensed MIT, GPL */

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
;(function ($, r3m, window) {
  var touch = r3m.support.touch;
  var pEnabled = r3m.support.pointerEnabled;

  $.getOriginalEvent = function (e) {
    var evt = e.originalEvent;
    evt.preventDefault();
    if (touch) {
      evt = evt.touches[0];
    }
    if (pEnabled) {
      //TODO: investigate how to get the pointerList for the IE10 case
      return evt;
    }
    return evt;
  };

  $.getTransformString = function (ele) {
    //TODO handle the IE10 case
    return window.getComputedStyle(ele).webkitTransform;
  };

  $.getMatrix = function (transformString) {
    //TODO handle the IE10 case
    return new WebKitCSSMatrix(transformString);
  };

})(jQuery, window.r3m, window);
;(function($, r3m, window, undefined) {
  'use strict';
  var events = r3m.pointer,
    pDown = events.down,
    pUp = events.up,
    pMove = events.move,
    $doc = $(document),
    debounce = r3m.debounce,
    getOriginalEvent = $.getOriginalEvent,
    format = r3m.format,
    transformProp = r3m.css.transform,
    getTransformString = $.getTransformString,
    getMatrix = $.getMatrix,
    draggableInstance = 0,
    now = r3m.now;



  $.widget('r3m.touchDraggable', {
    /**
     * Creates the ui and initialize dependencies
     */
    _create:function () {
      var me = this,
        $target = me.element;
      if ($target.length == 0) return;

      var opts = me.options,
        helper = opts.helper,
        curId = me.id = format('{0}_{1}', draggableInstance++, now()),
        instanceNS = me.instanceNS = format('.td_{0}', curId),
        ele = $target[0],
        addClasses = opts.addClasses && $.trim(opts.draggableClass) !== '';

      addClasses && $target.addClass(opts.draggableClass);
      //borrowed from the original jquery ui draggable
      if (helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css("position"))) {
        $target.css('position', 'relative');
      }

      me._processPMove = debounce(me._processPMove,0, me);

      $target.on(format('{0}.touchdraggable',pDown), function (e) {
        me._processPDown(e, $target, ele, opts);
        $doc.on(format('{0}{1}', pMove, instanceNS),function (e) {
          me._processPMove(e, $target, ele,  opts);
        }).on(format('{0}{1}', pUp, instanceNS), function (e) {
          me._processPUp(e, $target, ele, opts);
          $doc.off(instanceNS);
        });
      });
    },

    _processPUp : function (e, $target, ele, opts) {
      var me = this,
        addClasses = opts.addClasses && $.trim(opts.draggingClass) !== '';
      me.isDragging = false;
      me.lastX = null;
      me.lastY = null;
      if (me.dragHappen == true && me.startPosition) {
        var css = me.startPosition;
        console.log('startpos' , me.startPosition.left, me.startPosition.top);
        var transform = getTransformString(ele);
        var matrix, x, y;
        if (transform != 'none') {
          matrix = getMatrix(transform);
          x = matrix.e;
          y = matrix.f;
        }
        else {
          x = 0;
          y = 0;
        }

        css.left += x;
        css.top += y;

        if (css) {
          css[transformProp] = '';
          $target.css(css);
        }

        me.startPosition = null;
      }
      me._trigger('stop', {});
      if (me.firstMoveHappen) {
        me.firstMoveHappen = false;
        addClasses && $target.removeClass(opts.draggingClass);
      }
      me.dragHappen = false;
    },

    _processPMove : function (e, $target,ele, opts) {
      var me = this,
        addClasses = opts.addClasses && $.trim(opts.draggingClass) !== '';
      try {
        if (!me.isDragging)
          return;
        if (!ele)
          return;
        var evt = getOriginalEvent(e);

        me.x = evt.clientX;
        me.y = evt.clientY;

        var lastX = me.lastX || me.x,
          lastY = me.lastY || me.y,
          dx = lastX - me.x,
          dy = lastY - me.y;


        var transform = getTransformString(ele);
        var matrix, x, y;
        if (transform != 'none') {
          matrix = getMatrix(transform);
          matrix.e -= dx;
          matrix.f -= dy;
          x = matrix.e;
          y = matrix.f;
        }
        else {
          x = 0;
          y = 0;
        }

        $target.css(transformProp, format('translate3d({0}px,{1}px,0)', x, y));

        me.lastX = me.x;
        me.lastY = me.y;
        me.dragHappen = true;
        if (!me.firstMoveHappen) {
          me.firstMoveHappen = true;
          addClasses && $target.addClass(opts.draggingClass);
        }
        me._trigger('drag', {});
      }
      catch (e) {
        //console.error('move', e.message);
      }
    },
    _processPDown : function (e, $target, ele, opts) {
      if (e.which > 1) return;
      var me = this,
        handle = $.trim(opts.handle);

      if (handle == '' || $(e.target).closest(handle).length > 0) {
        var style = ele.style;
        me.startPosition = $target.position();

        if (!(/(fixed|absolute)/).test($target.css("position"))) {

          if ($.trim(style.top) === '') {
            me.startPosition = {
              top:0,
              left:0
            };
          }
          else {
            me.startPosition = {
              top: parseInt(style.top, 10),
              left: parseInt(style.left, 10)
            }
          }
        }

        $target.css(me.startPosition);
        me._trigger('start', {});
        me.isDragging = true;
        e.stopPropagation();
      }
    },
    destroy:function () {
      this.element.off('.touchdraggable');
      $doc.off(this.instanceNS);
    },
    /* defaults */
    options:{
      handle : null,
      helper : 'original',
      addClasses : true,
      draggableClass : 'ui-draggable',
      draggingClass : 'ui-draggable-dragging'
    }
  });


})(jQuery, window.r3m, window);
