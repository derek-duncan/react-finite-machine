/**
 * @describe Implements statechart outlined here https://statecharts.github.io/on-off-statechart.html
 */

import React from 'react';
import FiniteMachine from 'react-finite-machine';

const lightSwitchMachine = {
  initial: 'Off',
  states: {
    Off: {
      on: {
        FLICK: 'On',
      },
      initial: 'A',
      states: {
        A: {
          on: {
            FLICK: 'A',
            UNBLOCK: 'B',
          },
          onEntry: { type: 'startUnblockTimer', delay: 2000 },
          onExit: { type: 'cancelUnblockTimer' },
        },
        B: {},
      },
    },
    On: {
      on: {
        FLICK: 'Off',
      },
      initial: 'C',
      states: {
        C: {
          on: {
            UNBLOCK: 'D',
          },
          onEntry: { type: 'startUnblockTimer', delay: 500 },
          onExit: { type: 'cancelUnblockTimer' },
        },
        D: {
          initial: 'E',
          states: {
            E: {
              on: {
                UNBLOCK: 'F',
              },
              onEntry: { type: 'startUnblockTimer', delay: 500 },
              onExit: { type: 'cancelUnblockTimer' },
              initial: 'G',
              states: {
                G: {
                  on: {
                    FLICK: 'G',
                  },
                },
              },
            },
            F: {},
          },
          onEntry: { type: 'turnOn' },
          onExit: { type: 'turnOff' },
        },
      },
    },
  },
};

class LightSwitch extends React.Component {
  /**
   * The reducer allows the FiniteMachine component to respond to actions in the state machine.
   * It is called every time a transition occurs in the state machine. It follows the
   * ReactReason reducer API where we explicitly return a state update with or without
   * side effects.
   */
  reducer = ({ machine, state, transition }, action) => {
    switch (action.type) {
      case 'turnOn':
        return FiniteMachine.Update({ on: true });
      case 'turnOff':
        return FiniteMachine.Update({ on: false });
      case 'startUnblockTimer':
        return FiniteMachine.UpdateWithSideEffects({ blocked: true }, () => {
          this.unblockTimer = setTimeout(
            () => transition('UNBLOCK'),
            action.delay
          );
        });
      case 'cancelUnblockTimer':
        return FiniteMachine.UpdateWithSideEffects({ blocked: false }, () => {
          clearTimeout(this.unblockTimer);
        });
      default:
        return FiniteMachine.NoUpdate();
    }
  };

  render() {
    return (
      <FiniteMachine
        machine={lightSwitchMachine}
        initialState={{
          on: false,
          blocked: false,
        }}
        reducer={this.reducer}
        render={({ machine, state, transition }) => {
          const { on, blocked } = state;
          return (
            <div>
              <h3>Demo</h3>
              <button
                style={{
                  position: 'relative',
                  height: '400px',
                  width: '250px',
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
                  transition('FLICK');
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '20px',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                  }}
                >
                  <span
                    style={{
                      opacity: blocked ? 1 : 0,
                      transition: 'opacity 300ms',
                    }}
                  >
                    [BLOCKED]
                  </span>
                  <span>{machine.toString()}</span>
                </div>
                <span
                  style={{
                    fontFamily: 'monospace',
                    textDecoration: blocked ? 'line-through' : 'none',
                    paddingBottom: '10px',
                    userSelect: 'none',
                  }}
                >
                  Switch
                </span>
                <input id="switch" type="checkbox" checked={on} />
              </button>
              <h3>Requirements</h3>
              <a href="https://statecharts.github.io/on-off-statechart.html">
                https://statecharts.github.io/on-off-statechart.html
              </a>
            </div>
          );
        }}
      />
    );
  }
}

export default LightSwitch;
