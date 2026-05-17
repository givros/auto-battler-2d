(function (AB) {
  class StateMachine {
    constructor(initialState, transitions) {
      this.state = initialState;
      this.transitions = transitions;
    }

    can(nextState) {
      return (this.transitions[this.state] || []).includes(nextState);
    }

    transition(nextState) {
      if (!this.can(nextState)) {
        throw new Error(`Invalid transition from ${this.state} to ${nextState}`);
      }
      this.state = nextState;
      return this.state;
    }
  }

  AB.StateMachine = StateMachine;
})(window.AutoBattler = window.AutoBattler || {});
