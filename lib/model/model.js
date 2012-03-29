/**
 * Base classes for variables, methods, and constraints.
 * @author John Freeman
 */

(function () {

  /************************************/
  /* Helpers. */

  var idNo = 0;

  var makeName = function makeName(kind) {
    if (idNo === Number.MAX_VALUE) idNo = 0;
    return "__" + kind + (idNo++);
  };

  /************************************/

  /**
   * A variable in the model.
   * @class Variable
   * @memberOf hotdrink.model
   */
  /**
   * @constructor Variable
   * @memberOf hotdrink.model
   * @param cellType {CellType}
   *   We need the cellType at construction time so that behaviors can
   *   differentiate variables.
   * @param initialValue {Value}
   *   It is a good practice to intialize every variable. If this variable is
   *   part of a constraint, however, it may be overwritten during the first
   *   update.
   *
   *   If this is a function, then the variable will have a function value.
   */
  var Variable = function Variable(cellType, initialValue) {
    this.orderNo = idNo;
    this.id = makeName("variable");
    this.cellType = cellType;
    this.valuePrev = undefined;
    this.value = initialValue;
    /* TODO: Do we want to track this for resetting purposes? */
    //this.initialValue = initialValue;
    this.hasBeenEdited = false;
    this.usedBy = [];

    publisher.initialize(this);
  };

  var toId = function toId() { return this.id; };

  /**
   * @method toString
   * @memberOf hotdrink.model.Variable
   * @returns {String}
   *   Shows name and abbreviated $CellType.
   */
  Variable.prototype.toString = function () {
    return this.id + " (" + this.cellType.slice(0, 3) + ")";
  };

  /**
   * @method toJSON
   * @memberOf hotdrink.model.Variable
   * @returns {Object}
   *   A simplified object with just the fields to be JSONified.
   */
  Variable.prototype.toJSON = function () {
    return Object.extract(this, ["id", "cellType"]);
  };

  publisher.mixin(Variable);

  /**
   * @method toProxy
   * @memberOf hotdrink.model.Variable
   * @param {hotdrink.model.Runtime} runtime
   * @returns {Proxy}
   */
  Variable.prototype.toProxy = function toProxy(runtime) {
    var vv = this;

    if (this.cellType === "interface" || this.cellType === "logic") {
      var proxy = function () {
        if (arguments.length > 0) {
          runtime.set(vv, arguments[0]);
        } else {
          return runtime.getVariable(vv);
        }
      };

    } else if (this.cellType === "output") {
      /* Same dangers in calling this as in accessing computed variables:
       * better to wait until the model is updated. */
      var proxy = function () {
        return runtime.getCommand(vv, this, arguments);
      };

    } else {
      ERROR("no proxy available for " + this.cellType + " variables");
    }

    return finishProxy(vv, proxy);
  };

  var finishProxy = function finishProxy(vv, proxy) {
    proxy.hotdrink = vv;
    proxy.getMore = function getMore() { return vv; };
    proxy.subscribe
      = function () { return vv.subscribe.apply(vv, arguments); };

    return proxy;
  };

  /**
   * @method is
   * @memberOf hotdrink.model.Variable
   * @param {Unknown} proxy
   * @returns {Boolean} True if the argument is a $Proxy.
   */
  Variable.is = function is(proxy) {
    return (typeof proxy === "function") && (proxy.hotdrink);
  };

  /**
   * @extends hotdrink
   */
  namespace.extend("hotdrink", {

    /**
     * @function isVariable
     * @memberOf hotdrink
     * @param {Unknown} getter
     * @returns {Boolean}
     *   True if the argument is a $concept.model.Proxy for a
     *   $hotdrink.model.Variable that is not a $Command.
     */
    isVariable : function isVariable(getter) {
      return Variable.is(getter) && (getter.hotdrink.cellType !== "output");
    },

    /**
     * @function isCommand
     * @memberOf hotdrink
     * @param {Unknown} getter
     * @returns {Boolean}
     *   True if the argument is a $Proxy for a $hotdrink.model.Variable that is
     *   a $Command.
     */
    isCommand : function isCommand(getter) {
      return Variable.is(getter) && (getter.hotdrink.cellType === "output");
    }

  });

  /************************************/

  /**
   * A method in the model.
   * @class Method
   * @memberOf hotdrink.model
   */
  /**
   * @constructor Method
   * @memberOf hotdrink.model
   * @param outputs {[hotdrink.model.Variable]}
   * @param fn {Function :: () -> [Value]}
   *   The function that computes new values for the variables.
   *
   *   Methods may not set values for any variable in their function body; such
   *   values must be returned by the method, in the order matching that given
   *   for the outputs parameter.
   *
   *   Methods may use 'this' to access variables defined in their $Model.
   */
  var Method = function Method(outputs, fn) {
    this.id = makeName("method");
    this.outputs = outputs;
    this.fn = fn;
    this.inputsUsed = [];
    this.inputsUsedPrev = [];
  };

  /**
   * @method toString
   * @memberOf hotdrink.model.Method
   * @returns {String} Shows inputs and outputs.
   */
  Method.prototype.toString = function () {
    return "[" + this.inputsUsed + "] -> [" + this.outputs + "]";
  };

  /**
   * @method toJSON
   * @memberOf hotdrink.model.Method
   * @returns {Object}
   *   A simplified object with just the fields to be JSONified.
   */
  Method.prototype.toJSON = function () {
    return Object.extract(this, ["id", "outputs"]);
  };

  /************************************/

  /**
   * A constraint in the model.
   * @class Constraint
   * @memberOf hotdrink.model
   */
  /**
   * @constructor Constraint
   * @memberOf hotdrink.model
   * @param methods {[hotdrink.model.Method]}
   */
  var Constraint = function Constraint(methods) {
    this.id = makeName("constraint");
    this.methods = methods;
  };

  /**
   * @method toString
   * @memberOf hotdrink.model.Constraint
   * @returns {String} Shows the name.
   */
  Constraint.prototype.toString = toId;

  /**
   * @method toJSON
   * @memberOf hotdrink.model.Constraint
   * @returns {Object}
   *   A simplified object with just the fields to be JSONified.
   */
  Constraint.prototype.toJSON = function () {
    return Object.extract(this, ["id", "methods"]);
  }

  /**
   * For model data structures and algorithms.
   * @namespace hotdrink.model
   */
  namespace.extend("hotdrink.model", {
    Variable : Variable,
    Method : Method,
    Constraint : Constraint
  });

}());

