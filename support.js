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
