(function($) {
  $(function() {

    $.extend(Fr.plugin.methods,{
      init: function() {
        this.doc = this; // keep the base document

        // load the views into the framework
        $("#_framework-views",this.doc).framework("_loadViews_");

        // initialize the controllers
        Fr.Controller.init();

        // render the entry point view
        Fr.views("layouts/application",function(view) {
          view.framework('renderAsLayout');
        });
      }
    });

    //$(document).framework(); // call init

  });
})(jQuery);
