var Rtern = {}; // define the Rtern namespace

(function($) {
  var last_event_id = 0;
  var access_id = 0;
  var ajax_url = "";
  var ajax_type = "json";

  Rtern.init = function(url,type) {
    ajax_url = url;
    ajax_type = type;

    setTimeout(function() {
      poll(); // start the long poller
    },1000);
  };
  Rtern.setAccessID = function(id) {
    access_id = id;
  };

  var poll = function() {
    var post_data = { evt_id: last_event_id, access_id: access_id };
    $.ajax({ url: 'http://mj.localhost:8124', type: 'GET', data: post_data, dataType: 'jsonp', success: function(new_event) {
      console.log(new_event);
      $(document).trigger( 'rtern.'+new_event.type, new_event.evt );
      poll();
    } });
  };
})(jQuery);
