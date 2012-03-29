/**
 * @author John Freeman
 * @author Wonseok Kim
 */

//provides("hotdrink.model.Solver");

(function () {

  var Solver   = hotdrink.model.Solver;
  var Strength = Solver.Strength;
  var Mark     = Solver.Mark;

  var toOuterId = function toOuterId() { return this.outer.id; };

  /***************************************************************/

  /**
   * Extends $hotdrink.model.Variable with $hotdrink.model.Solver-specific
   * properties and methods.
   *
   * @constructor Variable
   * @memberOf hotdrink.model.Solver
   * @param vv {hotdrink.model.Variable} The variable to be extended.
   * @param stayConstraint {hotdrink.model.Solver.Constraint}
   */
  var Variable = function Variable(vv, stayConstraint) {
    vv.inner = this;
    this.outer = vv;
    /* The constraints that may write to me. Be sure to include stay
     * constraints. */
    this.constraints = [stayConstraint];  // Array<Constraint>
    stayConstraint.variables.push(this);
    this.determinedBy = null;             // Constraint
    this.stayConstraint = stayConstraint; // Constraint

    /* These fields get reset each time solve() is called, so not important
     * to initialize them. */
    /* TODO: constraints doesn't change after initialization, but numConstraints
     * gets reset for every solve. Should we rename numConstraints to something
     * like numUnsatConstraints? */
    this.numConstraints = 0;
    this.mark = Mark.UNKNOWN;
  };

  /**
   * @method toString
   * @memberOf hotdrink.model.Solver.Variable
   * @returns {String} Shows the name.
   */
  Variable.prototype.toString = toOuterId;

  /**
   * @method isFree
   * @memberOf hotdrink.model.Solver.Variable
   * @returns {Boolean}
   *   True if the variable is attached to only one unsatisfied constraint.
   */
  Variable.prototype.isFree = function isFree() {
    return this.numConstraints === 1;
  };

  /***************************************************************/

  /**
   * @constructor Constraint
   * @memberOf hotdrink.model.Solver
   * @param cc {hotdrink.model.Constraint} The constraint to be extended.
   * @param strength {Integer} See $hotdrink.model.Solver.Strength.
   */
  var Constraint = function Constraint(cc, strength) {
    cc.inner = this;
    this.outer = cc;
    /* Variables to which I may write. */
    /* Need variable list for setting numConstraints,
     * need numConstraints for setting free variables,
     * only care about free variables that are outputs,
     * thus only need to add outputs to variable lists. */
    this.variables = [];          // Array<Variable>
    /* TODO: Expose strength in cc. */
    this.strength = strength;
    cc.selectedMethod = null;     // Method
    cc.selectedMethodPrev = null; // Method

    /* These fields get reset each time solve() is called, so not important
     * to initialize them. */
    this.mark = Mark.INITIAL_UPSTREAM;
  };

  /**
   * @method toString
   * @memberOf hotdrink.model.Solver.Constraint
   * @returns {String} Shows the name.
   */
  Constraint.prototype.toString = toOuterId;

  /**
   * A required constraint must be satisfied in a valid solution.
   * @method isRequired
   * @memberOf hotdrink.model.Solver.Constraint
   * @returns {Boolean}
   */
  Constraint.prototype.isRequired = function isRequired() {
    return this.strength === Strength.REQUIRED;
  };

  /**
   * A satisfied constraint has selected a method.
   * @method isSatisfied
   * @memberOf hotdrink.model.Solver.Constraint
   * @returns {Boolean}
   */
  Constraint.prototype.isSatisfied = function isSatisfied() {
    return this.outer.selectedMethod !== null;
  };

  /***************************************************************/
  /* Exports. */

  Solver.Variable   = Variable;
  Solver.Constraint = Constraint;

}());

