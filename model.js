var Model = function() {};
Model.prototype = {
  id: null,
  data: null,
  model_name: null,
  _resource_url: null
}

function createModel( model_name ) {
  var tmp = function() {
    this.model_name = model_name;
  }
  tmp.inheritsFrom( Model );
  return tmp;
}

