(function($) {
  $.extend(Fr.plugin.methods,{
    init: function(app_name,app_root) {
      Fr[app_name] = this; // keep the context of the framework
      this.data('AppRoot',app_root);
      this.data('AppName',app_name);

      // load the views into the framework
      this.data('_views',{});
      this.framework("_loadViews_");

      // initialize the controllers
      this.framework('_loadControllers_',app_name);

      // render the entry point view
      this.framework('views',"layouts/application",function(view) {
        Fr[app_name].framework('renderAsLayout',view,{keep: '.movieContainer'},function() {

          // set history helping var for detecting back and forward browser chrome clicks
          var old_len = 0;
          var old_hash = { hash: null, len: old_len }
          var old_hash2 = old_hash;

          // hook-up the routes with history
          if ($.history) $.history.init(function(hash) {
            //console.log(window.history.length,window.history[window.history.length-1]);
            var backward;

            if (window.history) { // we can try to detect back and foward chrome clicks if we have window.history
              var len = window.history.length;
              var new_old_hash;
              
              if (len == old_len) {
                // did we flip direction
                backward = (old_hash.len < old_hash2.len);

                if (hash == old_hash2.hash) { // flip
                  backward = !backward;
                }

                if (backward) {
                  new_old_hash = { hash: hash, len: (old_hash.len-1)};
                } else {
                  new_old_hash = { hash: hash, len: (old_hash.len+1)};
                }
              }
              
              old_hash2 = old_hash;
              old_hash = new_old_hash || { hash: hash, len: len };
              old_len = len;
              new_old_hash = null;
            }

            if (hash == '') {
              route.run('/root',{backward: backward});
            } else {
              route.run('/'+hash,{backward: backward});
            }
          },{unescape: ',/'});

        });
      });
    }
  });
  //$(function() { $(document).framework('init','app_name','app_root'); }); // example init call
})(jQuery);
