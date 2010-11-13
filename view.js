(function($) {
  var afterRenderQueue = [];

  Fr._views = {}; // define the views container
  var loading = {};
  var waiting = {};
  Fr.views = function(key,callback) { // define the views container
    if (Fr._views[key]) {
      callback( Fr._views[key] );
    } else if (loading[key]) {
      waiting[key].push(callback);
    } else {
      waiting[key] = [];
      loading[key] = true;
      // see if we can load it
      $.get(AppRoot+'/views/'+key+'.html.ejs',function(raw_view_html) {
        $('<div>'+raw_view_html+'</div>').framework('_loadView_',key);
        callback( Fr._views[key] );
        $.each(waiting[key],function(i,cb) {
          cb( Fr._views[key] );
        });
      },'html');
    }
  };

  $.extend(Fr.plugin.methods,{

    _loadViews_: function() {
      this.detach().children().each(function() {
        $(this).framework('_loadView_',this.id);
      });
    },

    _loadView_: function(key) {
      Fr._views[key] = this.detach();
      Fr._views[key].data('render', function(view_data) {
        return new EJS({text: this.html().replace(/&lt;%/g,'<%').replace(/%&gt;/g,'%>') }).render(view_data);
      })
    },

    /*
     *  This assumes the 'this' is the view to be rendered.
     *  for example:  Fr.view['some/view'].renderAsLayout()
     */
    renderAsLayout: function() {
      this.framework('renderTo','body');
    },

    renderTo: function(element,view_data) {
      if (!(element instanceof jQuery)) {
        element = $(element);
      }
      var $html = $( this.framework('render',view_data) );
      element.empty().append( $html );

      // trigger the afterRenderQueue
      $.each(afterRenderQueue,function(i,view_id) {
        Fr.views(view_id,function(view) {
          var controller = view.data('controller');
          if (controller) {
            controller.afterRender.apply( view );
          }
        });
      });

      // trigger the afterRender
      if (this.data('controller')) {
        this.data('controller').afterRender.apply(this);
      }
    },

    /*
     *  This assumes the 'this' is the view to be rendered.
     *  @param data  represents the data to be made available to the view.
     */
    render: function(data) {
      var done = false;
      var nested_callbacks = [];
      var view_data = data || {};

      // run the controller
      var controller = this.data('controller');
      if (controller) {
        if ( controller.beforeFilter() === false ) {
          // TODO: bail on the rendering process
          console.log('bail');
        } else {
          $.extend(view_data, controller.html()); // add the results of the controller to the view_data
        }
      }

      var html = this.data('render').apply(this, [$.extend(view_data,{
        yield: function(view_id) {
          // generate placeholder
          var placeholder_id = Fr.rand(10);

          Fr.views(view_id,function(view) {

            var handle_view = function(context) {
              var partial = view.framework('render');
              $('#'+placeholder_id,context).replaceWith( partial );
              var controller = view.data('controller');
              if (controller) {
                $.proxy( controller.afterRender ,view)();
              }
            };

            if (!done) {
              nested_callbacks.push( handle_view );
            } else {
              handle_view($('body'));
            }
          });

          return '<div id="'+placeholder_id+'" style="display: none;"></div>';
        }
      })] );

      var $html = $('<div>'+html+'</div>');

      $.each(nested_callbacks, function(i,cb) { cb($html); });

      done = true;
      return $html.html();
    }

  });

})(jQuery);
