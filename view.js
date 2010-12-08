(function($) {
  var loading = {};
  var waiting = {};

  $.extend(Fr.plugin.methods,{

    // context for this chould be the app root. IE: Fr.yourappname.framework('views',key,callback)
    views: function(key,callback) {
      var self = this;
      var _views = this.data('_views');
      if (_views[key]) {
        callback( _views[key] );
      } else if (loading[key]) {
        waiting[key].push( callback );
      } else {
        waiting[key] = [];
        loading[key] = true;
        // see if we can load it
        var cache_killer = '?' + (new Date()).getTime();
        $.get(this.data('AppRoot')+'/views/'+key+'.html.ejs'+cache_killer,function(raw_view_html) {
          view = self.framework('_loadView_',key,$('<div>'+ raw_view_html.replace(/<%/g,'&lt;%').replace(/%>/g,'%&gt;') +'</div>'));
          callback( view );
          $.each(waiting[key],function(i,cb) {
            cb( view );
          });
        },'html');
      }
    },

    _loadViews_: function() {
      var self = this;
      $("#_framework-views",this).detach().children().each(function() {
        self.framework('_loadView_',this.id,this);
      });
    },

    _loadView_: function(key,view_elem) {
      var _views = this.data('_views');
      
      _views[key] = view_elem.detach();
      _views[key].data('render', function(view_data) {
        return new EJS({text: this.html().replace(/&lt;%/g,'<%').replace(/%&gt;/g,'%>') }).render(view_data);
      })
      return _views[key];
    },

    /*
     *  This assumes the 'this' is the app root.
     *  for example:
     *  Fr.yourapp.framework('views','some/view',function(view) {
     *    view.renderAsLayout();
     *  })
     */
    renderAsLayout: function(view) {
      this.framework('renderTo',view,'body');
    },

    renderTo: function(view,element,view_data) {
      var self = this;
      var arq = [];

      if (!(element instanceof jQuery)) {
        element = $(element,this);
      }
      self.framework('render',view,view_data,arq,function($html) {
        element.empty().append( $html );

        // trigger the afterRender
        if (view.data('controller')) {
          $.proxy(view.data('controller').afterRender ,view)( $html );
        }

        // trigger the afterRenderQueue
        var cb = null;
        while(cb = arq.shift()) { cb(); }
      });
    },

    /*
     *  This assumes the 'this' is the app root.
     *  @param data  represents the data to be made available to the view.
     */
    render: function(view,data,arq,callback) {
      var self = this;
      var _views = this.data('_views');
      var done = false;
      var view_data = data || {};

      // run the actual render
      var run = function() {
        var rendered_html = view.data('render').call(view, $.extend(view_data,{
          yield: function(view_id, local_data) {
            var sub_arq = [];
            local_data = local_data || {};
            // generate placeholder
            var placeholder_id = Fr.rand(10);

            self.framework('views',view_id,function(view) {
              var handle_view = function() {
                self.framework('render',view,local_data,sub_arq,function(partial) {
                  var tmp = $('#'+placeholder_id,self).replaceWith( partial );
                  var controller = view.data('controller');
                  if (controller) {
                    $.proxy( controller.afterRender ,view)( partial );
                  }

                  // trigger the sub_arq
                  var cb = null;
                  while(cb = sub_arq.shift()) { cb(); }
                });
              };

              if (!done) {
                arq.push( handle_view );
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
      var controller = view.data('controller');
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

  // make the common 'get view and render to' easier to use
  $.fn.renderViewTo = $.NewPlugin({
    init: function(params) {
      var self = this;
      this.framework('views',params.view,function(view) {
        self.framework('renderTo',view,params.target);
      });
    }
  });

})(jQuery);
