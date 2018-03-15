# ▸ React Finite Machine

> [WIP] Breaking changes expected.

A consistent way to manage state in React with statecharts.
Powered by [xstate](https://github.com/davidkpiano/xstate).

```javascript
yarn add react-finite-machine

import FiniteMachine from 'react-finite-machine';
```

## Usage

```javascript
<FiniteMachine
  machine={{
    initial: 'Green',
    states: {
      Green: {
        onEntry: 'setGreen',
        on: {
          TIMER: 'Yellow',
        },
      },
      Yellow: {
        onEntry: 'setYellow',
        on: {
          TIMER: 'Red',
        },
      },
      Red: {
        onEntry: 'setRed',
        on: {
          TIMER: 'Green',
        },
      },
    },
  }}
  initialState={{
    active: null,
  }}
  reducer={({ machine, state, transition }, action, event) => {
    switch (action.type) {
      case 'setYellow':
        return FiniteMachine.Update({ active: 'yellow' });
      case 'setRed':
        return FiniteMachine.Update({ active: 'red' });
      case 'setGreen':
        return FiniteMachine.Update({ active: 'green' });
      default:
        return FiniteMachine.NoUpdate();
    }
  }}
>
  {({ machine, state: { active }, transition }) => {
    const lightStyle = {
      borderRadius: '50%',
      width: '25px',
      height: '25px',
      transition: 'opacity 250ms',
    };
    return (
      <div>
        <h3>Traffic Light</h3>
        <button onClick={() => transition('TIMER')}>Cycle</button>
        <div
          style={{
            opacity: active === 'red' ? 1 : 0,
            backgroundColor: 'red',
            ...lightStyle,
          }}
        />
        <div
          style={{
            opacity: active === 'yellow' ? 1 : 0,
            backgroundColor: 'yellow',
            ...lightStyle,
          }}
        />
        <div
          style={{
            opacity: active === 'green' ? 1 : 0,
            backgroundColor: 'green',
            ...lightStyle,
          }}
        />
      </div>
    );
  }}
</FiniteMachine>
```

[![Edit react-finite-machine example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/q880qy7yx6)

## Examples

* Light Switch – [Demo](https://codesandbox.io/s/github/derek-duncan/react-finite-machine/tree/master/packages/playground?initialpath=%23select&module=%2Fsrc%2FSelect.js)
* Select – [Demo](https://codesandbox.io/s/github/derek-duncan/react-finite-machine/tree/master/packages/playground?initialpath=%23light-switch&module=%2Fsrc%2FLightSwitch.js)

## API

Exports:

* default FiniteMachine

Typescript definitions included.

### `<FiniteMachine />`

A React component that accepts a statechart and reducer to manage state.

#### Props

**- machine: StateChart**

Required object. This is a xstate statechart. Please see the [xstate docs](http://davidkpiano.github.io/xstate/docs/#/) for current documentation.

**- initialState: State**

Required object. The initial state that will be managed by FiniteMachine. The `reducer` can modify this state by responding to transition events and actions with a new state.

**- reducer: (StateBag, Action, Event) => ReducerResult**

Required function. The reducer is responsible for updating the state or calling effects based on statechart actions and events.

Arguments:

* `StateBag` is an object with the following keys.
  * `machine: xstate Machine`
  * `transition: (Event) => void`
  * `state: State`
* `Action` is an object that always has the shape of `{ type: ActionName, [key: string]: any }`. Actions are called by the statechart during transitions.
* `Event` is an object that always has the shape of `{ type: EventName, [key: string]: any }`. Events are triggered by the `transition` function, and they start a state transition if the statechart handles them.

Return:

* `ReducerResult` is a structured way to manage state updates and side effects. The only allowed return values from `reducer` are static methods on the `FiniteMachine`.
  * `FiniteMachine.NoUpdate()` The equivilent of returning void.
  * `FiniteMachine.Update(State)` Shallow merges the new state with the current state.
  * `FiniteMachine.UpdateWithSideEffect(State, SideEffect)` Merges the new state with the current state. After the state update, the `SideEffect` function is called.

This structured way of managing updates and side effects was [inspired by ReactReason](https://reasonml.github.io/reason-react/docs/en/state-actions-reducer.html).

**- children: (StateBag) => React.ReactNode**

Required function as child. A function that passes a `StateBag` (see `reducer` prop for details) and returns React elements.

**- render: (StateBag) => React.ReactNode**

Optional render prop subsitute for `children`.
