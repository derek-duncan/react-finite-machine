import * as React from 'react';
import { State as MachineState } from 'xstate';
import { StandardMachine, Action } from 'xstate/lib/types';

export type Props = {
  initialState: Object;
  machine: StandardMachine;
  reducer: (bag: Bag, action: Action) => any;
  render: (bag: Bag) => React.ReactNode;
};

export type State = {
  machineState: MachineState;
  extendedState: Object;
};

export type Bag = {
  transition: (eventName: string) => void;
  state: any;
  machineState: MachineState;
};

export class FiniteMachine extends React.Component<Props, State> {
  state: State = {
    machineState: this.props.machine.initialState,
    extendedState: this.props.initialState,
  };

  componentDidMount() {
    const { machineState } = this.state;
    this.applyActionsToState(machineState);
  }

  /**
   * A state machine transition may be triggered by an event. If the event
   * is valid for the current state, the machine will transition. Any actions
   * will also be dispatched through the reducer during the transition.
   */
  transition = (eventName: string) => {
    const { machine } = this.props;
    const { machineState } = this.state;

    const nextMachineState = machine.transition(machineState, eventName);
    this.applyActionsToState(nextMachineState);
  };

  applyActionsToState(machineState: MachineState) {
    const { reducer } = this.props;
    const { extendedState } = this.state;

    /**
     * Collect the side effects from the reducer results so they can be run
     * after the state updates have completed.
     */
    let nextSideEffects: Function[] = [];
    this.setState(
      () => {
        let nextExtendedState = extendedState;

        for (let actionName of machineState.actions) {
          const { nextState, sideEffects } = reducer(
            this.makeBag(machineState),
            actionName
          );

          /**
           * Merge the state updates from the reducer with the current
           * state.
           */
          nextExtendedState = {
            ...nextExtendedState,
            ...nextState,
          };

          nextSideEffects = nextSideEffects.concat(sideEffects);
        }

        return {
          machineState,
          extendedState: nextExtendedState,
        };
      },
      () => {
        nextSideEffects.forEach(sideEffect => {
          if (typeof sideEffect === 'function') {
            sideEffect();
          }
        });
      }
    );
  }

  makeBag(machineState: MachineState): Bag {
    return {
      transition: this.transition,
      machineState,
      state: this.state.extendedState,
    };
  }

  render() {
    const { render } = this.props;
    const { machineState } = this.state;

    return render(this.makeBag(machineState));
  }
}

FiniteMachine.NoUpdate = function() {
  return { type: '@FiniteMachine/NO_UPDATE' };
};

FiniteMachine.Update = function(nextState) {
  return { nextState, type: '@FiniteMachine/UPDATE' };
};

FiniteMachine.SideEffects = function(sideEffects) {
  return { sideEffects, type: '@FiniteMachine/SIDE_EFFECTS' };
};

FiniteMachine.UpdateWithSideEffects = function(nextState, sideEffects) {
  return {
    nextState,
    sideEffects,
    type: '@FiniteMachine/UPDATE_WITH_SIDE_EFFECTS',
  };
};
