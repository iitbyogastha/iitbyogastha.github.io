$(function() {
  $('.collapse').on('show.bs.collapse', function () {
    $(this).siblings('.panel-heading').addClass('active');
  })
});

$(function() {
  $('.collapse').on('hide.bs.collapse', function () {
    $(this).siblings('.panel-heading').removeClass('active');
  })
});

