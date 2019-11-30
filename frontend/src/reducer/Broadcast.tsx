import React, { createContext, useReducer, Dispatch, ReactElement, useContext } from 'react';

interface State {
  displayStream: MediaStream | null;
  userStream: MediaStream | null;
  isOpenSetting: boolean;
  isOpenDrawer: boolean;
}

type Action =
  | {
      type: 'updateDisplayStream';
      payload: MediaStream | null;
    }
  | {
      type: 'updateUserStream';
      payload: MediaStream | null;
    }
  | {
      type: 'openSettings';
    }
  | {
      type: 'closeSettings';
    }
  | {
      type: 'openDrawer';
    }
  | {
      type: 'closeDrawer';
    };

const initialState: State = {
  displayStream: null,
  userStream: null,
  isOpenSetting: false,
  isOpenDrawer: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'updateDisplayStream': {
      return {
        ...state,
        displayStream: action.payload,
      };
    }
    case 'updateUserStream': {
      return {
        ...state,
        userStream: action.payload,
      };
    }
    case 'openSettings': {
      return {
        ...state,
        isOpenSetting: true,
      };
    }
    case 'closeSettings': {
      return {
        ...state,
        isOpenSetting: false,
      };
    }
    case 'openDrawer': {
      return {
        ...state,
        isOpenDrawer: true,
      };
    }
    case 'closeDrawer': {
      return {
        ...state,
        isOpenDrawer: false,
      };
    }
    default:
      throw new Error(`invalid action: ${action}`);
  }
};

const StateContext = createContext<State>(null as any);
const DispatchContext = createContext<Dispatch<Action>>(null as any);

interface Props {
  children: ReactElement;
}

export const BroadcastProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export const useBroadcastContext = (): [State, Dispatch<Action>] => {
  const value = [useContext(StateContext), useContext(DispatchContext)] as [State, Dispatch<Action>];
  return value;
};
