// define the namespace
var Framework = {};
var Fr = Framework;

jQuery.NewPlugin = function(methods) {
  if ($.isFunction(methods)) methods = methods();

  return function(method) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }
  };
};

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

  $.fn.framework = $.NewPlugin( Fr.plugin.methods );

})(jQuery);
