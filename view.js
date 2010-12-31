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
      });
      _views[key].data('afterRender', function() {
        if (_views[key].data('controller')) {
          _views[key].data('controller').afterRender.call(_views[key]);
        }
      });
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

    appendTo: function(view, element, view_data) {
      var self = this;
      var arq = [];

      self.framework('render',view,view_data,arq,function($html) {
        element.append( $html );
        view.data('afterRender')();
        var cb = null;
        while(cb = arq.shift()) { cb(); }
      });
    },
    prependTo: function(view, element, view_data) {
      var self = this;
      var arq = [];

      self.framework('render',view,view_data,arq,function($html) {
        element.prepend( $html );
        view.data('afterRender')();
        var cb = null;
        while(cb = arq.shift()) { cb(); }
      });
    },

    renderTo: function(view, element, view_data) {
      var self = this;
      var arq = [];

      if (!(element instanceof jQuery)) {
        element = $(element,this);
      }

      // trigger the cleanUp
      Fr.plugin.methods._cleanUp.call(self,element,function(delay) {
        self.framework('render',view,view_data,arq,function($html) {
          var kids_to_remove = element.children();
          setTimeout(function() {
            kids_to_remove.remove();
          },delay);
          element.append( $html );
          //element.attr('data-view',view.data('id'));

          // trigger the afterRender
          view.data('afterRender')();

          // trigger the afterRenderQueue
          var cb = null;
          while(cb = arq.shift()) { cb(); }
        });
      });
    },

    transitionTo: function(view, element, view_data, transition, callback,replace_wh) {
      var self = this;
      var arq = [];

      if (!(element instanceof jQuery)) {
        element = $(element,this);
      }

      // trigger the cleanUp
      Fr.plugin.methods._cleanUp.call(self,element,function() {
        var width = element.width();
        var height = element.height();
        var old_overflow = element.css('overflow');
        var old_height = element.css('height');
        var old_width = element.css('width');
        var old_trans = null;

        element
          .css('height',height)
          .css('width',width)
          .css('overflow','hidden')
          .css('-webkit-transition','all 0.5s ease-in-out');

        var trans_wrap = null;
        switch(transition) {
        case 'slide-left':
          element.wrapInner( '<div id="_fr_transition_old_conten_" style="position: absolute; left: 0; width: '+width+'px; height: '+height+'px;"></div>' );
          element.wrapInner( '<div id="_fr_transition_" style="-webkit-transition: all 0.5s ease-in-out; position: absolute; width: '+(width*2)+'px; height: '+height+'px;"></div>' );
          trans_wrap = element.find('#_fr_transition_');
          old_trans = {left: (-width).toString()+"px"};
          trans_wrap.append('<div id="_fr_transition_new_conten_" style="position: absolute; right: 0; width: '+width+'px; height: '+height+'px;""></div>');
          break;
        case 'slide-right':
          element.wrapInner( '<div id="_fr_transition_old_conten_" style="position: absolute; right: 0; width: '+width+'px; height: '+height+'px;"></div>' );
          element.wrapInner( '<div id="_fr_transition_" style="-webkit-transition: all 0.5s ease-in-out; position: absolute; width: '+(width*2)+'px; height: '+height+'px;"></div>' );
          trans_wrap = element.find('#_fr_transition_');
          old_trans = {right: (-width).toString()+"px"};
          trans_wrap.append('<div id="_fr_transition_new_conten_" style="position: relative; left: 0; width: '+width+'px; height: '+height+'px;""></div>');
          break;
        }
        var old_content_wrap = element.find('#_fr_transition_old_conten_');
        var new_content_wrap = element.find('#_fr_transition_new_conten_');

        self.framework('render',view,view_data,arq,function($html) {
          setTimeout(function() {
            for (var key in old_trans) {
              console.log(key,old_trans[key]);
              trans_wrap.get(0).style[key] = old_trans[key];
            }
          },1);
          new_content_wrap.append($html);
          setTimeout(function() {
            new_content_wrap.detach().children().detach().appendTo(element);
            trans_wrap.remove();
            if (replace_wh) {
              element.css({height: old_height, width: old_width, overflow: old_overflow});
            } else {
              element.css({height: '', width: '', overflow: old_overflow});
            }
            if ($.isFunction(callback)) callback.call(element);
          },500);
          element.attr('data-view',view.data('id'));

          // trigger the afterRender
          view.data('afterRender')();

          // trigger the afterRenderQueue
          var cb = null;
          while(cb = arq.shift()) { cb(); }
        });
      });
    },

    _cleanUp: function(element,callback) {
      var self = this;
      var max_delay = 0;

      if (element.is('span') && element.attr('data-view')) {
        self.framework('views',element.attr('data-view'),function(view) {
          if (view.data('controller')) {
            var delay = view.data('controller').cleanUp.call(element);
            if (delay > max_delay) max_delay = delay;
          }
          Fr.plugin.methods._cache(element,view);
        });
      }
      element.find('span[data-view]').each(function() {
        var delay = Fr.plugin.methods._cleanUp.call(self,$(this));
        if (delay > max_delay) max_delay = delay;
      });
      if ($.isFunction(callback)) callback(max_delay);
      return max_delay;
    },

    _cache: function(element,view) {
      // check to see if we should cache the old view
      if (view.data('use_cache') && !view.data('cache')) {
        view.data('cache',element.children());
      }
    },

    _getCache: function(view,arq,noCache) {
      var self = this;
      if (view.data('use_cache') && view.data('cache')) {
        view.data('cache').find('[data-view]').each(function() {
          var view_id = $(this).attr('data-view');
          arq.push(function() {
            self.framework('views',view_id,function(view2) {
              view2.data('afterRender')();
            });
          });
        });
        return view.data('cache');
      } else {
        return noCache();
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
        var view_functions = {
          yield: function(view_id, local_data) {
            var sub_arq = [];
            local_data = local_data || {};
            // generate placeholder
            var placeholder_id = Fr.rand(10);

            self.framework('views',view_id,function(view2) {
              var handle_view = function() {
                self.framework('render',view2,local_data,sub_arq,function(partial) {
                  var tmp = $('#'+placeholder_id,self).replaceWith( partial );
                  view2.data('afterRender')();

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
        };
        //var rendered_html = view.data('render').call(view, $.extend(view_data,view_functions));
        var rendered_html = Fr.plugin.methods._getCache.call(self,view,arq,function() {
          var tmp = view.data('render').call(view, $.extend(view_data,view_functions));
          return $('<span data-view="'+view.data('id')+'">'+tmp+'</span>') 
        });

        done = true;

        callback( rendered_html );
      };

      // run the controller
      var controller = view.data('controller');
      if (controller && !view.data('cache')) {
        if ( controller.beforeFilter() === false ) {
          // TODO: bail on the rendering process
          console.log('bail');
        } else {
          controller.render(function(data_from_controller) {
            $.extend(view_data,data_from_controller); // add the results of the controller to the view_data
            run();
          },data);
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
          self.framework('transitionTo', view, params.target, params['args'], params.transition, params['callback'],params['replace_wh']);
        } else {
          self.framework('renderTo', view, params.target, params['args']);
        }
      });
    }
  });

})(jQuery);
