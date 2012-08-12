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