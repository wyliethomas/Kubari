// define the namespace
var Framework = {};
var Fr = Framework;

// Flesh out the framework with $ available no matter what mode jQuery is in.
(function($) {
  Fr.plugin = { methods: {} };

  Fr.rand = function(count) {
    count = count || 5; // default to 5
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < count; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  };

  $.fn.framework = function(method) {
    // Method calling logic
    if ( Fr.plugin.methods[method] ) {
      return Fr.plugin.methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return Fr.plugin.methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }
  };

})(jQuery);
