/**
 * @fileOverview <p>{@link hotdrink.bindings.Controller}</p>
 * @author John Freeman
 */

//provides("hotdrink.bindings.Controller");

(function () {

  var Controller = function Controller() {
    this.binders = {};
  };

  /* A binder takes a DOM element, a model, and some options. */
  /* @param binders Map from names to binders. */
  Controller.prototype.extend = function extend(newBinders) {
    Object.extend(this.binders, newBinders);
  };

  /* Views in all contexts should be considered of unknown type, but eligible as
   * an argument for $(). */
  Controller.prototype.bind = function bind(views, model) {
    var self = this;
    views = $(views);

    /* For each bound view, ... */
    views.each(function () {
      LOG("Trying to bind #" + $(this).attr("id"));

      /* Parse its bindings string. */
      var bindingString = $(this).attr("data-bind");

      /* Credit to Knockout.js for this. */
      var functionBody = "with (model) { return ({ " + bindingString + " }); } ";
      LOG("functionBody = " + functionBody);
      try {
        var bindingMonad = new Function("model", functionBody);
      } catch (e) {
        ERROR("expected execution (not construction) of function to throw");
      }

      /* bindings is an object mapping a name of a binder to the value of its
       * options. In the context of the options:
       *
       * - Constants and expressions have already been evaluated.
       * - A variable reference (as opposed to value) will be represented by
       *   its getter-setter from the model.
       * - This means we cannot yet bind to an expression. To do so will
       *   require parsing the bindingString ourselves, or (like Knockout)
       *   storing the bindingMonad for re-evaluation whenever the model
       *   changes.
       */
      try {
        var bindings = bindingMonad(model);
      } catch (e) {
        var id = $(this).attr("id");
        ERROR("cannot parse bindings on " +
              (id ? ("#" + id) : "(unidentified element)") + ":\n  \"" +
              bindingString + "\"\n  " +
              e);
        return;
      }

      /* For each binding, call the named binder. */
      var elt = this;
      Object.keys(bindings).forEach(function (binderName) {
        var binder = self.binders[binderName];
        if (!binder) {
          ERROR("No binder for " + binderName);
          return;
        }
        binder(elt, model, bindings[binderName]);
      });
    });
  };

  namespace.open("hotdrink.bindings").Controller = Controller;

}());
