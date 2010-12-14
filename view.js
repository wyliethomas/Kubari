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
      _views[key].data('id', key);
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

      // trigger the cleanUp
      Fr.plugin.methods._cleanUp.call(self,element);

      self.framework('render',view,view_data,arq,function($html) {
        element.empty().append( $html );
        element.attr('data-view',view.data('id'));

        // trigger the afterRender
        if (view.data('controller')) {
          view.data('controller').afterRender.call(view,$html);
        }

        // trigger the afterRenderQueue
        var cb = null;
        while(cb = arq.shift()) { cb(); }
      });
    },

    transitionTo: function(view, element, transition, view_data, callback) {
      var self = this;
      var arq = [];

      if (!(element instanceof jQuery)) {
        element = $(element,this);
      }

      // trigger the cleanUp
      Fr.plugin.methods._cleanUp.call(self,element);

      var width = element.width();
      var height = element.height();
      var old_overflow = element.css('overflow');
      var old_width = element.css('width');
      var old_height = element.css('height');
      var old_trans = null;
      var new_trans = null;

      element
        .css('height',height)
        .css('width',width)
        .css('overflow','hidden');

      element.wrapInner( '<div id="_fr_transition_" style="position: absolute; width: '+width+'px; height: '+height+'px;"></div>' );
      switch(transition) {
      case 'slide-left':
        old_trans = {left: -width};
        new_trans = {right: 0};
        element.append('<div id="_fr_transition_new_conten_" style="position: absolute; right: -'+width+'px; width: '+width+'px; height: '+height+'px;""></div>');
        break;
      case 'slide-right':
        old_trans = {right: -width};
        new_trans = {left: 0};
        element.append('<div id="_fr_transition_new_conten_" style="position: relative; left: -'+width+'px; width: '+width+'px; height: '+height+'px;""></div>');
        break;
      }
      var old_content_wrap = element.find('#_fr_transition_');
      var new_content_wrap = element.find('#_fr_transition_new_conten_');

      self.framework('render',view,view_data,arq,function($html) {
        old_content_wrap.animate(old_trans ,300, 'linear', function() {
          old_content_wrap.remove();
        });
        new_content_wrap.append($html).animate(new_trans,300,'linear',function() {
          new_content_wrap.detach().children().detach().appendTo(element);
          element
            .css('height',old_height)
            .css('width',old_width)
            .css('overflow',old_overflow);
          if ($.isFunction(callback)) callback.call(element);
        });
        element.attr('data-view',view.data('id'));

        // trigger the afterRender
        if (view.data('controller')) {
          view.data('controller').afterRender.call(view,$html);
        }

        // trigger the afterRenderQueue
        var cb = null;
        while(cb = arq.shift()) { cb(); }
      });
    },

    _cleanUp: function(element) {
      var self = this;
      element.find('[data-view]').each(function() {
        var old_view = $(this);
        self.framework('views',old_view.attr('data-view'),function(view) {
          if (view.data('controller')) {
            view.data('controller').cleanUp.call(old_view);
          }
        });
      });
      if (element.attr('data-view')) {
        self.framework('views',element.attr('data-view'),function(view) {
          if (view.data('controller')) {
            view.data('controller').cleanUp.call(element);
          }
        })
      }
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

            self.framework('views',view_id,function(view2) {
              var handle_view = function() {
                self.framework('render',view2,local_data,sub_arq,function(partial) {
                  var tmp = $('#'+placeholder_id,self).replaceWith( partial );
                  var controller = view2.data('controller');
                  if (controller) {
                    $.proxy( controller.afterRender ,view2)( partial );
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

            return '<span id="'+placeholder_id+'" style="display: none;"></span>';
          }
        }) );

        done = true;

        callback( $('<span data-view="'+view.data('id')+'">'+rendered_html+'</span>') );
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
        if (params['transition']) {
          self.framework('transitionTo', view, params.target, params.transition, params['callback']);
        } else {
          self.framework('renderTo',view,params.target);
        }
      });
    }
  });

})(jQuery);
