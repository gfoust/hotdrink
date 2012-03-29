/**
 * @author John Freeman
 */

//provides("hotdrink");

//requires("hotdrink.model.Model");

(function () {

  /**
   * Default runtime.
   *
   * Supported behaviors:
   *
   *  - hotdrink.model.behavior.Precondition
   *  - hotdrink.model.behavior.Enablement
   *
   * @namespace hd
   * @type hotdrink.model.Factory
   */
  window.hd = new hotdrink.model.Factory();

  /* Default behaviors. */
  hd.behavior(new hotdrink.model.behavior.Precondition());
  hd.behavior(new hotdrink.model.behavior.Enablement());

  /* Default binders. */
  var bindController = new hotdrink.bindings.Controller();
  hotdrink.bindings.html.extend(bindController.binders);

  /**
   * Binds the `context` to the `model`.
   * @function bind
   * @memberOf hotdrink
   * @param model {Model}
   * @param context {View}
   *   These take our parameters in the wrong conceptual order because we have a
   *   default for the context.
   * @default context {View} $("body")
   */
  var bind = function bind(model, context) {
    if (!context) context = $("body");

    /* Bind each view in the context. */
    var views = $("*[data-bind]", context);
    LOG("Binding " + views.length + " elements");
    views.each(function () {
      bindController.bind(this, model);
    });
  };

  /**
   * Top-level library namespace.
   * @namespace hotdrink
   */
  namespace.extend("hotdrink", {
    bind : bind,
    /* Expose the binders dictionary for extension. */
    binders : bindController.binders
  });

}());

