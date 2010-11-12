(function($) {
  var afterRenderQueue = [];

  $.extend(Fr.plugin.methods,{

    _loadViews_: function() {
      $(this).detach().children().each(function() {
        Fr.views[this.id] = $(this).detach();
        Fr.views[this.id].data('render', function(view_data) {
          return new EJS({text: this.html().replace(/&lt;%/g,'<%').replace(/%&gt;/g,'%>') }).render(view_data);
        });
      });
    },

    /*
     *  This assumes the 'this' is the view to be rendered.
     *  for example:  Fr.view['some/view'].renderAsLayout()
     */
    renderAsLayout: function() {
      Fr.plugin.methods.renderTo.apply(this,['body']);
    },

    renderTo: function(element,view_data) {
      if (!(element instanceof jQuery)) {
        element = $(element);
      }
      var $html = $( Fr.plugin.methods.render.apply(this,[view_data]) );
      element.empty().append( $html );

      // trigger the afterRenderQueue
      $.each(afterRenderQueue,function(i,view_id) {
        var controller = Fr.views[view_id].data('controller');
        if (controller) {
          controller.afterRender.apply(Fr.views[view_id]);
        }
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
        render: function(view_id) {
          // queue for afterRenderQueue triggers
          afterRenderQueue.push(view_id);
          return Fr.plugin.methods.render.apply(Fr.views[view_id]);
        }
      })] );

      return html;
    }

  });

})(jQuery);
