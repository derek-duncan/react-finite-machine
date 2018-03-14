import * as React from 'react';
import * as xstate from 'xstate';
import * as xstateTypes from 'xstate/lib/types';
import MachineState from 'xstate/lib/state';

export { xstate, xstateTypes };

export type Props = {
  initialState: StateProp;
  machine: xstateTypes.MachineConfig | xstateTypes.ParallelMachineConfig;
  reducer: (
    bag: Bag,
    action: xstateTypes.ActionObject,
    event: xstateTypes.EventObject
  ) =>
    | ReducerNoUpdate
    | ReducerUpdate
    | ReducerSideEffects
    | ReducerUpdateWithSideEffects;
  render?: (bag: Bag) => React.ReactNode;
  children?: (bag: Bag) => React.ReactNode;
};

export type State = {
  machine: xstate.State;
  state: StateProp;
};

export type StateProp = Object;

export type SideEffect = (event: xstateTypes.EventObject) => void;

export type Bag = {
  transition: (event: xstateTypes.Event, extendedState?: any) => void;
  state: StateProp;
  machine: xstate.State;
};

export type ReducerUpdate = {
  type: '@FiniteMachine/UPDATE';
  nextState: StateProp;
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
  nextState: StateProp;
  sideEffect: SideEffect;
};

export class FiniteMachine extends React.Component<Props, State> {
  private machine = xstate.Machine(this.props.machine);

  state: State = {
    machine: this.machine.initialState,
    state: this.props.initialState,
  };

  componentDidMount() {
    const { machine } = this.state;
    this.applyPendingActionsToState(machine, { type: '@@INIT' });
  }

  /**
   * A state machine transition may be triggered by an event. If the event
   * is valid for the current state, the machine will transition. Any actions
   * will also be dispatched through the reducer during the transition.
   */
  transition = (event: xstateTypes.Event) => {
    const { machine, state } = this.state;

    const eventObj: xstateTypes.EventObject =
      typeof event === 'string' || typeof event === 'number'
        ? { type: event }
        : event;

    const nextMachine = this.machine.transition(machine, eventObj, state);
    this.applyPendingActionsToState(nextMachine, eventObj);
  };

  applyPendingActionsToState(
    machine: xstate.State,
    event: xstateTypes.EventObject
  ) {
    const { reducer } = this.props;
    const { state: extState } = this.state;

    /**
     * Collect the side effects from the reducer results so they can be run
     * after the state updates have completed.
     */
    let nextSideEffects: SideEffect[] = [];
    this.setState(
      () => {
        let nextExtendedState = extState;

        for (let action of machine.actions) {
          const actionObj: xstateTypes.ActionObject =
            typeof action === 'string' || typeof action === 'number'
              ? { type: action }
              : action;

          const { nextState, sideEffect } = reducer(
            this.makeBag(machine),
            actionObj,
            event
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
          machine,
          state: nextExtendedState,
        };
      },
      () => {
        nextSideEffects.forEach(sideEffect => sideEffect(event));
      }
    );
  }

  makeBag(machine: xstate.State): Bag {
    return {
      transition: this.transition,
      machine,
      state: this.state.state,
    };
  }

  static NoUpdate(): ReducerNoUpdate {
    return { type: '@FiniteMachine/NO_UPDATE' };
  }

  static Update(nextState: StateProp): ReducerUpdate {
    return { nextState, type: '@FiniteMachine/UPDATE' };
  }

  static SideEffects(sideEffect: SideEffect): ReducerSideEffects {
    return { sideEffect, type: '@FiniteMachine/SIDE_EFFECTS' };
  }

  static UpdateWithSideEffects(
    nextState: StateProp,
    sideEffect: SideEffect
  ): ReducerUpdateWithSideEffects {
    return {
      nextState,
      sideEffect,
      type: '@FiniteMachine/UPDATE_WITH_SIDE_EFFECTS',
    };
  }

  render() {
    const { children, render } = this.props;
    const { machine } = this.state;

    if (typeof render === 'function') {
      return render(this.makeBag(machine));
    }
    if (typeof children === 'function') {
      return children(this.makeBag(machine));
    }
    return null;
  }
}
