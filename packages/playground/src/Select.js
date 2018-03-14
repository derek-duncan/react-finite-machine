import React from 'react';
import FiniteMachine from 'react-finite-machine';

let inputRef = null;
function Select() {
  const selectMachine = {
    initial: 'View',
    states: {
      View: {
        on: { EDIT: 'Edit' },
      },
      Edit: {
        initial: 'Open',
        states: {
          Open: {
            onEntry: ['openDropdown'],
            onExit: ['closeDropdown'],
            on: {
              CLOSE: 'Close',
            },
          },
          Close: {
            on: {
              OPEN: 'Open',
            },
          },
        },
        on: {
          VIEW: 'View',
          SELECT: { View: { actions: ['selectOption'] } },
          FILTER: { Edit: { actions: ['filterOptions'] } },
          CLEAR: { Edit: { actions: ['clearOption'] } },
        },
        onEntry: ['displayEdit'],
        onExit: ['clearFilters', 'displayView'],
      },
    },
  };

  return (
    <FiniteMachine
      initialState={{
        isOpen: false,
        query: '',
        activeItem: 0,
        option: null,
      }}
      machine={selectMachine}
      reducer={({ machine, state, transition }, action, event) => {
        switch (action.type) {
          case 'openDropdown':
            return FiniteMachine.Update({
              isOpen: true,
            });
          case 'closeDropdown':
            return FiniteMachine.Update({
              isOpen: false,
            });
          case 'clearFilters':
            return FiniteMachine.Update({
              query: '',
            });
          case 'clearOption':
            return FiniteMachine.UpdateWithSideEffects(
              {
                option: null,
              },
              () => {
                if (inputRef) inputRef.focus();
              }
            );
          case 'filterOptions':
            return FiniteMachine.Update({
              query: event.query,
            });
          case 'selectOption':
            return FiniteMachine.Update({
              option: event.option,
            });
          default:
            return FiniteMachine.NoUpdate();
        }
      }}
    >
      {({ state, transition }) => {
        const options = [
          'Apples',
          'Bananas',
          'Pears',
          'Oranges',
          'Kiwis',
          'Mangos',
          'Grapes',
          'Strawberries',
        ];

        return (
          <div style={{ maxWidth: '500px' }}>
            <h3>Requirements</h3>
            <ul>
              <li>[X] When focused, the input dropdown options should open.</li>
              <li>
                [X] Entering text should open the dropdown and filter the
                dropdown options.
              </li>
              <li>
                [X] If ESC is pressed while editing, the dropdown options should
                close.
              </li>
              <li>
                [X] If Down Arrow is pressed while the dropdown options are
                closed, the dropdown options should reopen.
              </li>
              <li>
                [X] In the dropdown options, any selected items should be
                indicated.
              </li>
              <li>
                [X] When a dropdown option is clicked, the dropdown options
                should close and the input placeholder should change to the
                selected option.
              </li>
              <li>
                [X] When a dropdown option is selected, a clear button should
                appear that allows the user to reset any selected option. After
                resetting, the input should be refocused.
              </li>
            </ul>
            <h3>Demo</h3>
            <div
              onBlur={e => {
                const container = e.currentTarget;
                /** Wait for DOM events to progate */
                setTimeout(() => {
                  if (!container.contains(document.activeElement)) {
                    transition('VIEW');
                  }
                }, 0);
              }}
              onFocus={() => {
                transition('EDIT');
              }}
              onKeyDown={e => {
                switch (e.key) {
                  case 'Escape':
                    transition('CLOSE');
                    break;
                  case 'ArrowDown':
                    transition('OPEN');
                    break;
                  default:
                    break;
                }
              }}
            >
              <label
                htmlFor="select"
                style={{
                  display: 'inline-block',
                  fontWeight: 'bolder',
                  marginBottom: '3px',
                }}
              >
                Select a Fruit
              </label>
              <br />
              <div style={{ display: 'flex' }}>
                <input
                  ref={ref => {
                    inputRef = ref;
                  }}
                  placeholder={state.option || 'Type to search'}
                  id="select"
                  value={state.query}
                  onChange={e => {
                    const value = e.currentTarget.value;
                    transition({ type: 'FILTER', query: value });
                  }}
                />
                {state.option ? (
                  <button
                    onClick={() => {
                      transition('CLEAR');
                    }}
                  >
                    X
                  </button>
                ) : null}
              </div>
              {state.isOpen ? (
                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                  {options
                    .filter(option =>
                      option.toLowerCase().includes(state.query.toLowerCase())
                    )
                    .map(option => (
                      <button
                        key={option}
                        onClick={() => transition({ type: 'SELECT', option })}
                        style={{
                          fontWeight: state.option === option ? '600' : '400',
                        }}
                      >
                        {option}
                      </button>
                    ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      }}
    </FiniteMachine>
  );
}

export default Select;
