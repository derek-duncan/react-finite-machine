/**
 * @describe Implements statechart outlined here https://statecharts.github.io/on-off-statechart.html
 */

import React from 'react';
import { Machine } from 'xstate';
import FiniteMachine from 'react-finite-machine';

const lightMachine = Machine({
  initial: 'off',
  states: {
    off: {
      on: {
        FLICK: 'on',
      },
      initial: 'a',
      states: {
        a: {
          on: {
            FLICK: 'a',
            UNBLOCK: 'b',
          },
          onEntry: { type: 'startUnblockTimer', delay: 2000 },
          onExit: { type: 'cancelUnblockTimer' },
        },
        b: {},
      },
    },
    on: {
      on: {
        FLICK: 'off',
      },
      initial: 'c',
      states: {
        c: {
          on: {
            FLICK: 'c',
            UNBLOCK: 'd',
          },
          onEntry: { type: 'startUnblockTimer', delay: 500 },
          onExit: { type: 'cancelUnblockTimer' },
        },
        d: {
          initial: 'e',
          states: {
            e: {
              on: {
                FLICK: 'e',
                UNBLOCK: 'f',
              },
              onEntry: { type: 'startUnblockTimer', delay: 500 },
              onExit: { type: 'cancelUnblockTimer' },
            },
            f: {},
          },
          onEntry: { type: 'turnOn' },
          onExit: { type: 'turnOff' },
        },
      },
    },
  },
});

class LightSwitch extends React.Component {
  /**
   * The reducer allows the FiniteMachine component to respond to actions in the state machine.
   * It is called every time a transition occurs in the state machine. It follows the
   * ReactReason reducer API where we explicitly return a state update with or without
   * side effects.
   */
  reducer = ({ machineState, state, transition }, action) => {
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
        machine={lightMachine}
        initialData={{
          on: false,
          blocked: false,
        }}
        reducer={this.reducer}
        render={({ machineState, data, transition }) => {
          const { on, blocked } = data;
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
                transition('FLICK');
              }}
            >
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
          );
        }}
      />
    );
  }
}

export default LightSwitch;
