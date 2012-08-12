/*
 * Content-Type:text/javascript
 *
 * A bridge between iPad and iPhone touch events and jquery draggable,
 * sortable etc. mouse interactions.
 * @author Oleg Slobodskoi
 *
 * modified by John Hardy to use with any touch device
 * fixed breakage caused by jquery.ui so that mouseHandled internal flag is reset
 * before each touchStart event
 *
 */
(function( $, Modernizr) {

  $.support.touch = Modernizr ? Modernizr.touch : ('ontouchstart' in window)
    || window.DocumentTouch && document instanceof DocumentTouch;

  if (!$.support.touch) {
    //no need to simulate mouse events for jQuery to work properly
    return;
  }

  function makeMouseEventFromTouch(touch, eventType) {

    var type = "";
    switch (eventType) {
      case "touchstart":
        type = "mousedown";
        break;
      case "touchmove":
        type = "mousemove";
        break;
      case "touchend":
        type = "mouseup";
        break;
      default:
        return null;
    }

    var mouseEvent = document.createEvent("MouseEvent");
    mouseEvent.initMouseEvent(type, true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0/*left*/, null);

    return mouseEvent;
  }

  function touchTranslation(event) {
    var touches = event.changedTouches;
    var first = touches[0];
    var firer = first.target;
    if (event.type == 'touchmove') {
      var cTarget = document.elementFromPoint(first.clientX, first.clientY);
      if (cTarget != null) {
        firer = cTarget;
      }
    }

    var simulatedEvent = makeMouseEventFromTouch(first, event.type);
    firer.dispatchEvent(simulatedEvent);
  }


  document.addEventListener("touchstart", touchTranslation, true);
  document.addEventListener("touchmove", touchTranslation, true);
  document.addEventListener("touchend", touchTranslation, true);
  document.addEventListener("touchcancel", touchTranslation, true);

})( jQuery, window.Modernizr);
