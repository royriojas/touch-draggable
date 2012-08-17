;(function ($) {
  $(function () {
    var $boxesNew = $('.drag .box.touch');
    $boxesNew.touchDraggable();
    var disableScroll = false;
    var $boxesOld = $('.box.old');
    $boxesOld.draggable({
       start : function () {
         disableScroll = true;
       },
       stop : function () {
         disableScroll = false;
       }
    });

    document.addEventListener("touchmove", function (e) {
      if (disableScroll) { e.preventDefault(); }
    });

    //Bonus, manipulation of elements using CSS3 and Javascript
    r3m.zAndD('.zoom .box.touch');
  });
})(jQuery);