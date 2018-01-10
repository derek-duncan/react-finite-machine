/**
 * @describe Implements statechart outlined here https://statecharts.github.io/on-off-statechart.html
 */

import React from 'react';
import { Machine } from 'xstate';
import FSM from 'react-finite-machine';

const lightMachine = Machine({
  initial: 'off',
  states: {
    off: {
      initial: 'blocked',
      on: {
        flick: 'on',
      },
      states: {
        blocked: {
          on: {
            flick: 'blocked',
            unblock: 'unblocked',
          },
          onEntry: { type: 'startUnblockTimer', delay: 2000 },
          onExit: { type: 'cancelUnblockTimer' },
        },
        unblocked: {},
      },
    },
    on: {
      initial: 'blocked',
      on: {
        flick: 'off',
      },
      states: {
        blocked: {
          on: {
            flick: 'blocked',
            unblock: 'unblocked',
          },
          onEntry: { type: 'startUnblockTimer', delay: 500 },
          onExit: { type: 'cancelUnblockTimer' },
        },
        unblocked: {
          initial: 'blocked',
          states: {
            blocked: {
              on: {
                flick: 'blocked',
                unblock: 'unblocked',
              },
              onEntry: { type: 'startUnblockTimer', delay: 500 },
              onExit: { type: 'cancelUnblockTimer' },
            },
            unblocked: {},
          },
          onEntry: { type: 'turnOn' },
          onExit: { type: 'turnOff' },
        },
      },
    },
  },
});

class Light extends React.Component {
  /**
   * The reducer allows the FSM component to respond to actions in the state machine.
   * It is called every time a transition occurs in the state machine. It follows the
   * ReactReason reducer API where we explicitly return a state update with or without
   * side effects.
   */
  reducer = ({ machineState, state, transition }, action) => {
    switch (action.type) {
      case 'startUnblockTimer':
        return FSM.UpdateWithSideEffects({ blocked: true }, () => {
          this.unblockTimer = setTimeout(
            transition.bind(this, 'unblock'),
            action.delay
          );
        });
      case 'cancelUnblockTimer':
        return FSM.UpdateWithSideEffects({ blocked: false }, () => {
          clearTimeout(this.unblockTimer);
        });
      case 'turnOn':
        return FSM.Update({ on: true });
      case 'turnOff':
        return FSM.Update({ on: false });
      default:
        return FSM.NoUpdate();
    }
  };

  render() {
    return (
      <FSM
        machine={lightMachine}
        initialState={{
          on: false,
          blocked: false,
        }}
        reducer={this.reducer}
        render={({ machineState, state: { on, blocked }, transition }) => {
          return (
            <button
              style={{
                position: 'relative',
                height: '100%',
                width: '100%',
                padding: '20px',
                display: 'flex',
                flexFlow: 'column',
                alignItems: 'center',
                fontSize: 'inherit',
                justifyContent: 'center',
                transition:
                  'color 300ms ease-in, background-color 300ms ease-in',
                border: 'none',
                backgroundColor: on ? '#f5f5f5' : '#333',
                color: on ? '#333' : '#f5f5f5',
              }}
              onClick={() => {
                transition('flick');
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'monospace',
                    textDecoration: blocked ? 'line-through' : 'none',
                    paddingRight: '10px',
                    userSelect: 'none',
                  }}
                >
                  Switch
                </span>
                <input
                  id="switch"
                  type="checkbox"
                  blocked={blocked}
                  checked={on}
                  onChange={() => {
                    transition('flick');
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  padding: '20px',
                  opacity: blocked ? 1 : 0,
                  transition: 'opacity 300ms',
                  position: 'absolute',
                  top: '0',
                  left: '0',
                }}
              >
                [BLOCKED]
              </div>
            </button>
          );
        }}
      />
    );
  }
}

export default Light;
