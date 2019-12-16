$(function() {
    $('.need-confirm-btn').click(function() {
      if (confirm('Wanna Delete?')) {
        return true;
      }
      return false;
    });
  });
  