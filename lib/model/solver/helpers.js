/**
 * @fileOverview <p>{@link hotdrink.model.Solver}</p>
 * @author Wonseok Kim
 * @author John Freeman
 */

//provides("hotdrink.model.Solver");

(function () {

  var Solver = hotdrink.model.Solver;

  /***************************************************************/

  /**
   * Helpers and constants for dealing with integer strengths for
   * $hotdrink.model.Solver.Constraint.
   *
   * The strongest strength value is 0 and weaker strengths have higher
   * values.
   * @namespace Strength
   * @memberOf hotdrink.model.Solver
   */
  var Strength = {
    /**
     * @constant REQUIRED
     * @memberOf hotdrink.model.Solver.Strength
     * @type {Integer}
     */
    REQUIRED : 0,                // required (strongest) strength
    /**
     * @constant WEAKEST
     * @memberOf hotdrink.model.Solver.Strength
     * @type {Integer}
     */
    WEAKEST  : Number.MAX_VALUE, // weakest strength

    /**
     * @function isWeaker
     * @memberOf hotdrink.model.Solver.Strength
     * @param a {Integer}
     * @param b {Integer}
     * @returns {Boolean} True if `a` is weaker than `b`.
     */
    isWeaker : function isWeaker(a, b) { return a > b; },
    /**
     * @function isStronger
     * @memberOf hotdrink.model.Solver.Strength
     * @param a {Integer}
     * @param b {Integer}
     * @returns {Boolean} True if `a` is stronger than `b`.
     */
    isStronger : function isStronger(a, b) { return a < b; },
    /**
     * @function pickStronger
     * @memberOf hotdrink.model.Solver.Strength
     * @param a {Integer}
     * @param b {Integer}
     * @returns {Integer} The stronger of `a` and `b`.
     */
    pickStronger : Math.min,
    /**
     * @function pickWeaker
     * @memberOf hotdrink.model.Solver.Strength
     * @param a {Integer}
     * @param b {Integer}
     * @returns {Integer} The weaker of `a` and `b`.
     */
    pickWeaker : Math.max,

    /**
     * Removes and returns the strongest constraint in the queue.
     * @function popStrongest
     * @memberOf hotdrink.model.Solver.Strength
     * @param cnsQueue {[Constraint]}
     * @returns {Constraint}
     */
    popStrongest : function popStrongest(cnsQueue) {
      return extractMin(cnsQueue, function (ccc) {
        return ccc.strength;
      });
    },

    /**
     * Removes and returns the weakest constraint in the queue.
     * @function popWeakest
     * @memberOf hotdrink.model.Solver.Strength
     * @param cnsQueue {[Constraint]}
     * @returns {Constraint}
     */
    popWeakest : function popWeakest(cnsQueue) {
      return extractMax(cnsQueue, function (ccc) {
        return ccc.strength;
      });
    }
  };

  /***************************************************************/
  /* Mark. */

  /* Marks keep track of visited variables and constraints. */
  var Mark = function Mark() {
    this.upstream = Mark.INITIAL_UPSTREAM;
    this.downstream = Mark.INITIAL_DOWNSTREAM;
  };

  Mark.UKNOWN = 0;
  Mark.POTENTIALLY_UNDETERMINED = 1;
  Mark.INITIAL_UPSTREAM = 2;
  Mark.INITIAL_DOWNSTREAM = -1;

  Mark.prototype.nextUpstream = function nextUpstream() {
    if (this.upstream === Number.MAX_VALUE)
      this.upstream = Mark.INITIAL_UPSTREAM;
    return ++this.upstream;
  };

  Mark.prototype.nextDownstream = function nextDownstream() {
    if (this.downstream === -Number.MAX_VALUE)
      this.downstream = Mark.INITIAL_DOWNSTREAM;
    return --this.downstream;
  };

  /***************************************************************/
  /* Exports. */

  Solver.Strength = Strength;
  Solver.Mark     = Mark;

}());

