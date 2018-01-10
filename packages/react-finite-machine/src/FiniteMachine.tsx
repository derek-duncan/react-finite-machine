import * as React from 'react';
import { State as MachineState } from 'xstate';
import { StandardMachine, Action } from 'xstate/lib/types';

export type Props = {
  initialData: Data;
  machine: StandardMachine;
  reducer: (
    bag: Bag,
    action: Action
  ) =>
    | ReducerNoUpdate
    | ReducerUpdate
    | ReducerSideEffects
    | ReducerUpdateWithSideEffects;
  render: (bag: Bag) => React.ReactNode;
};

export type State = {
  machineState: MachineState;
  data: Data;
};

export type Data = Object;

export type SideEffect = () => void;

export type Bag = {
  transition: (eventName: string) => void;
  data: Data;
  machineState: MachineState;
};

export type ReducerUpdate = {
  type: '@FiniteMachine/UPDATE';
  nextState: Data;
  sideEffect?: void;
};

export type ReducerNoUpdate = {
  type: '@FiniteMachine/NO_UPDATE';
  nextState?: void;
  sideEffect?: void;
};

export type ReducerSideEffects = {
  type: '@FiniteMachine/SIDE_EFFECTS';
  nextState?: void;
  sideEffect: SideEffect;
};

export type ReducerUpdateWithSideEffects = {
  type: '@FiniteMachine/UPDATE_WITH_SIDE_EFFECTS';
  nextState: Data;
  sideEffect: SideEffect;
};

export class FiniteMachine extends React.Component<Props, State> {
  state: State = {
    machineState: this.props.machine.initialState,
    data: this.props.initialData,
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
    const { data } = this.state;

    /**
     * Collect the side effects from the reducer results so they can be run
     * after the state updates have completed.
     */
    let nextSideEffects: SideEffect[] = [];
    this.setState(
      () => {
        let nextExtendedState = data;

        for (let actionName of machineState.actions) {
          const { nextState, sideEffect } = reducer(
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

          if (sideEffect) {
            nextSideEffects = nextSideEffects.concat(sideEffect);
          }
        }

        return {
          machineState,
          data: nextExtendedState,
        };
      },
      () => {
        nextSideEffects.forEach(sideEffect => sideEffect());
      }
    );
  }

  makeBag(machineState: MachineState): Bag {
    return {
      transition: this.transition,
      machineState,
      data: this.state.data,
    };
  }

  static NoUpdate(): ReducerNoUpdate {
    return { type: '@FiniteMachine/NO_UPDATE' };
  }

  static Update(nextState: Data): ReducerUpdate {
    return { nextState, type: '@FiniteMachine/UPDATE' };
  }

  static SideEffects(sideEffect: SideEffect): ReducerSideEffects {
    return { sideEffect, type: '@FiniteMachine/SIDE_EFFECTS' };
  }

  static UpdateWithSideEffects(
    nextState: Data,
    sideEffect: SideEffect
  ): ReducerUpdateWithSideEffects {
    return {
      nextState,
      sideEffect,
      type: '@FiniteMachine/UPDATE_WITH_SIDE_EFFECTS',
    };
  }

  render() {
    const { render } = this.props;
    const { machineState } = this.state;

    return render(this.makeBag(machineState));
  }
}
