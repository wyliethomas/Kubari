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
      var cache_killer = '?' + (new Date()).getTime();
      $.get(AppRoot+'/views/'+key+'.html.ejs'+cache_killer,function(raw_view_html) {
        $('<div>'+ raw_view_html.replace(/<%/g,'&lt;%').replace(/%>/g,'%&gt;') +'</div>').framework('_loadView_',key);
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
      var self = this;
      if (!(element instanceof jQuery)) {
        element = $(element);
      }
      self.framework('render',view_data,function($html) {
        element.empty().append( $html );

        // trigger the afterRender
        if (self.data('controller')) {
          $.proxy(self.data('controller').afterRender ,self)( $html );
        }

        // trigger the afterRenderQueue
        $.each(afterRenderQueue,function(i,cb) { cb(); });
      });
    },

    /*
     *  This assumes the 'this' is the view to be rendered.
     *  @param data  represents the data to be made available to the view.
     */
    render: function(data,callback) {
      var self = this;
      var done = false;
      var view_data = data || {};

      // run the actual render
      var run = function() {
        var rendered_html = self.data('render').call(self, $.extend(view_data,{
          yield: function(view_id, local_data) {
            local_data = local_data || {};
            // generate placeholder
            var placeholder_id = Fr.rand(10);

            Fr.views(view_id,function(view) {

              var handle_view = function() {
                view.framework('render',local_data,function(partial) {
                  var tmp = $('#'+placeholder_id).replaceWith( partial );
                  var controller = view.data('controller');
                  if (controller) {
                    $.proxy( controller.afterRender ,view)( partial );
                  }
                });
              };

              if (!done) {
                afterRenderQueue.push( handle_view );
              } else {
                handle_view();
              }
            });

            return '<div id="'+placeholder_id+'" style="display: none;"></div>';
          }
        }) );

        done = true;

        callback( $(rendered_html) );
      };

      // run the controller
      var controller = self.data('controller');
      if (controller) {
        if ( controller.beforeFilter() === false ) {
          // TODO: bail on the rendering process
          console.log('bail');
        } else {
          controller.render(function(data_from_controller) {
            $.extend(view_data,data_from_controller); // add the results of the controller to the view_data
            run();
          });
        }
      } else {
        run();
      }
    }

  });

})(jQuery);
