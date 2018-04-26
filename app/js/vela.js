//= required jquery/dist/jquery.min.js
//= required popper.js/dist/umd/popper.min.js
//= required bootstrap/dist/js/bootstrap.min.js
//= required sticky-sidebar/dist/sticky-sidebar.min.js
//= required @fancyapps/fancybox/dist/jquery.fancybox.min.js

window.vela = window.vela || {};

vela.init = function() {
  vela.menuScroll();
  vela.docSidebar();
};

vela.menuScroll = function() {
  $('body').on('click', '.js-nav-scroll', function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000);
        return false;
      }
    }
  });
  $(vela.menuSidebarScroll);
  $(window).scroll(function() {
    $(vela.menuSidebarScroll);
  });
};

vela.menuSidebarScroll = function() {
  var centerScreen = $(document).scrollTop() + ($(window).height() / 2);
  $('.section-documentation').each(function(index) {
    var offsetTop = $(this).offset().top;
    var offsetBottom = $(this).offset().top + $(this).outerHeight(true);
    if ((offsetTop <= centerScreen) && (centerScreen <= offsetBottom)) {
      var currentId = $(this).attr('id');
      $('.js-nav-scroll').each(function() {
        $(this).removeClass('active');
        if($(this).attr('href').includes(currentId)) $(this).addClass('active');
      });
    }
  });
}

vela.docSidebar = function () {
  var docStickySidebar = new StickySidebar('.vel-sidebar', {
    containerSelector: '.page-doc__content',
    innerWrapperSelector: '.vel-sidebar__inner'
  });
};

$(document).ready(function(){
  $(vela.init);
});
