;(function ($, r3m) {

  var $doc = $(document);

  var eventsAdded = false,
    validSelectors = [],
    processingGesture = false,
    css = r3m.css ,
    gesture = r3m.gesture,
    support = r3m.support,
    transition = r3m.transition,
    GESTURE_START = gesture.start,
    GESTURE_CHANGE = gesture.change,
    GESTURE_END = gesture.end,
    TRANSFORM_PROP = css.transform,
    pEnabled = support.pointerEnabled,
    TRANSITION_END = transition.end,
    format = r3m.format,
    THRESHOLD_TO_DEBOUNCE = 30,
    debounce = r3m.debounce,
    pMove = r3m.pointer.move;

  function enableZoomAndDrag(selector) {
    selector = selector || '.znd-enabled';
    validSelectors.push(selector);

    if (eventsAdded) return;
    eventsAdded = true;

    $doc.on(GESTURE_START, function(e) {

      if (validSelectors.length == 0) return;
      if (processingGesture) {
        processingGesture = false;
        return;
      }

      var $box = $(e.target).closest(validSelectors.join(', '));
      if($box.length == 0)
        return;

      processingGesture = true;
      $doc.triggerHandler('zoomdragstart');

      $box.addClass('zoom-drag');

      var oE = e.originalEvent;

      var _lastX = oE.pageX,
        _lastY = oE.pageY,
        _lastScale = 1,
        _lastRotate = 0,
        _lastX1 = 0,
        _lastY1 = 0;

      $doc.on(pMove + '.znd', function (e) {
        return false;
      });

      var ongesturechange = debounce(function(e) {

        var oE = e.originalEvent,
          x = oE.pageX,
          y = oE.pageY,
          lastX = _lastX || x,
          lastY = _lastY || y,
          dx = lastX - x,
          dy = lastY - y,
          x1 = -dx,
          y1 = -dy;


          _lastScale = oE.scale;
          _lastRotate = pEnabled ? (oE.rotation * 180 / Math.PI) : (oE.rotation % 180 - 15);

          _lastX1 = pEnabled ? oE.translationX : x1 / 2;
          _lastY1 = pEnabled ? oE.translationY : y1 / 2;

        var prop = format('scale({0}) rotate({1}deg) translate3d({2}px, {3}px, 1px)'
          , _lastScale
          , _lastRotate
          , _lastX1
          , _lastY1);

        $box.css(TRANSFORM_PROP, prop);
      }, THRESHOLD_TO_DEBOUNCE);

      $doc.on(format('{0}.znd', GESTURE_CHANGE), function(e) {

        ongesturechange(e);
      }).on(format('{0}.znd', GESTURE_END), function(e) {

          processingGesture = false;
          var args = {
            $item : $box,
            snapBack : true,
            lastScale : _lastScale,
            lastRotate : _lastRotate,
            lastX : _lastX1,
            lastY : _lastY1
          };
          $box.removeClass('zoom-drag');
          $doc.off('.znd');
          if(_lastScale > 1.5) {
            $doc.triggerHandler('pinchout', args);
            $box.triggerHandler('elementpinchout');
          }
          if (_lastScale < 0.5) {
            $doc.triggerHandler('pinchin', args);
            $box.triggerHandler('elementpinchin');
          }
          $doc.triggerHandler('zoomdragend');

          if(!args.snapBack)
            return;

          $box.one(TRANSITION_END, function (e) {
            $box.css(TRANSFORM_PROP, '');
          }).css(TRANSFORM_PROP, 'scale(1) rotate(0deg) translate3d(0,0,0)');

        });
    });
  }

  r3m.zAndD = enableZoomAndDrag;


})(jQuery, window.r3m);