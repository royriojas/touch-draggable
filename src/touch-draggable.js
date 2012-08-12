/*
 * touch-draggable
 * https://github.com/royriojas/touch-draggable
 *
 * Copyright (c) 2012 Roy Riojas
 * Licensed under the MIT, GPL licenses.
 */

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
