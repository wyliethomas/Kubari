/*
 *  Add a bunch of supporting functions to the core data types in Javascript
 *  but only add them if they don't already exist.
 */
function _extendBaseType_(baseType, funcName, func) {
  if (typeof baseType[funcName] !== 'function') {
    baseType[funcName] = func;
  }
  return func;
}
function _extendBasePrototype_( baseType, funcName, func ) { return _extendBaseType_(baseType.prototype, funcName, func); }

/*
 *  Inheritance
 */
Function.prototype.inheritsFrom = function( parentClassOrObject ){ 
  if ( parentClassOrObject.constructor == Function ) 
  { 
    //Normal Inheritance 
    this.prototype = new parentClassOrObject;
    this.prototype.constructor = this;
    this.prototype.parent = parentClassOrObject.prototype;
  } 
  else 
  { 
    //Pure Virtual Inheritance 
    this.prototype = parentClassOrObject;
    this.prototype.constructor = this;
    this.prototype.parent = parentClassOrObject;
  } 
  return this;
}

/*
 *  String
 */
_extendBasePrototype_(String,'trim',function() {
  return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/,"$1");
});

_extendBasePrototype_(String,'toDate',function() {
  return new Date(this.toString());
});

/*
 *  Number
 */

/*
 *  Date
 */
_extendBasePrototype_(Date,'toDate',function() {
  return this;
});
_extendBasePrototype_(Date,'format',function(str) {
  switch (str) {
  case "handsom":
    return time_in_words(this);
    break;
  default:
    // parse out format string
    return this.getMonth() + "/" + this.getDay() + "/" + this.getYear();
  }
});

/*
 * Function Helpers
 */
function run_once(func) {
  var ran = false;
  return function() {
    if (!ran) {
      ran = true;
      func.apply(this,arguments);
    }
  };
}



var time_in_words = function(timestamp) {
  var c = new Date();
  var t = null;
  if (typeof(timestamp) == "string") {
    t = new Date(timestamp);
  } else {
    t = timestamp;
  }

  var d = c.getTime() - t.getTime();
  var dY = Math.floor(d / (365 * 30 * 24 * 60 * 60 * 1000));
  var dM = Math.floor(d / (30 * 24 * 60 * 60 * 1000));
  var dD = Math.floor(d / (24 * 60 * 60 * 1000));
  var dH = Math.floor(d / (60 * 60 * 1000));
  var dN = Math.floor(d / (60 * 1000));

  if (dY > 0)   { return dY === 1? "1 year ago"   : dY + " years ago"; }
  if (dM > 0)   { return dM === 1? "1 month ago"  : dM + " months ago"; }
  if (dD > 0)   { return dD === 1? "1 day ago"    : dD + " days ago"; }
  if (dH > 0)   { return dH === 1? "1 hour ago"   : dH + " hours ago"; }
  if (dN > 0)   { return dN === 1? "1 minute ago" : dN + " minutes ago"; }
  return "less than a minute ago";
};
