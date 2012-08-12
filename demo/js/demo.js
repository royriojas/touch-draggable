;(function ($) {
  $(function () {
    var $boxesNew = $('.drag .box.touch');
    $boxesNew.touchDraggable();

    var $boxesOld = $('.box.old');
    $boxesOld.draggable();

    document.addEventListener("touchmove", function (e) {
      e.preventDefault();
    });

    //Bonus, manipulation of elements using CSS3 and Javascript
    r3m.zAndD('.zoom .box.touch');
  });
})(jQuery);