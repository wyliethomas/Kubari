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

/*
 *  Number
 */

/*
 *  Date
 */

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
    var t = iso2date(timestamp);

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

  // from http://delete.me.uk/2005/03/iso8601.html
  var iso2date = function(string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
    "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
    "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
      offset = (Number(d[16]) * 60) + Number(d[17]);
      offset *= ((d[15] === '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    var time = (Number(date) + (offset * 60 * 1000));
    var result = new Date();
    result.setTime(Number(time));
    return result;
  };
