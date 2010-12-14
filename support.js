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
