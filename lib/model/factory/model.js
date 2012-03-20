/**
 * @fileOverview <p>{@link hotdrink.model.Factory}</p>
 * @author John Freeman
 */

//provides("hotdrink.model.Factory");

(function () {

  /***************************************************************/
  /* Final processing. */

  var defaultOutputFn = function defaultOutputFn() {
    /* In here, we can pretend that we are a client with access to hd. */
    var data = {};
    Object.keys(this).forEach(function (v) {
      var getter = this[v];
      if (hd.isVariable(getter)) getter = getter();
      /* Reject any constants or variables that are functions. */
      if (typeof getter !== "function") data[v] = getter;
    }, this);
    var url = location.protocol + location.hostname + location.pathname;
    return hd.fn(submitForm)(url, data);
  };

  hotdrink.model.Factory.prototype.model = function model(Model) {

    //this.isGathering = true;

    //var model = new Model(/* TODO: Inputs? */);
    var model = Model;

    /* We will add a default command if the user did not. */
    var hasCommand = false;

    /* Now we can assign the name the user wanted. */
    Object.keys(model).forEach(function (v) {
      var getter = model[v];

      if (hotdrink.model.Variable.is(getter)) {
        var vv = getter.getMore();

        if (vv.cellType === "output") {
          hasCommand = true;
        }

        vv.id = v;
        if (vv.inner) {
          var ccStay = vv.inner.stayConstraint.outer;
          ccStay.id = vv.id + "_stay";
          var mmStay = ccStay.methods[0];
          mmStay.id = vv.id + "_const";
        }
      }
    });

    /* The default output variable will access every variable so that they are
     * all relevant. */
    if (!hasCommand) {
      /* Give it a name people can use, unless they wanted something else to
       * have that name. */
      var v = "submit";
      if (model.hasOwnProperty(v)) {
        v = makeName("variable");
      }

      var proxy = model[v] = this.command(defaultOutputFn);
      var vv = proxy.hotdrink;
      vv.id = v;
    }

    /* Set a sensible value for 'this' within methods. */
    /* TODO: Find a way to do this without tracking method creation. */
    this.methods.forEach(function (mm) {
      mm.context = model;
    });

    //this.variables = [];
    this.methods = [];
    //this.constraints = [];

    this.runtime.update();
    return model;
  };

}());
