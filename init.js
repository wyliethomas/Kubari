(function($) {
  $(function() {

    $.extend(Fr.plugin.methods,{
      init: function(doc) {
        this.doc = doc; // keep the base document

        // load the views into the framework
        $("#_framework-views",doc).framework("_loadViews_");

        // initialize the controllers
        Fr.Controller.init();

        // render the entry point view
        Fr.views["layouts/application"].framework('renderAsLayout');
      }
    });

    setTimeout(function() {
      $(document).framework(); // call init
    },1);

  });
})(jQuery);
