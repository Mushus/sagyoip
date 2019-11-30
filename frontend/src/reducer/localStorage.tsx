import React, { ReactNode, createContext, useContext, useReducer, Dispatch, useEffect } from 'react';
import { DefaultFrameRate, DefaultResolutions } from '../consts';

const localStorageKey = 'userData';

interface State {
  name: string;
  frameRate: number;
  resolution: string;
}

type Action =
  | {
      type: 'updateName';
      payload: string;
    }
  | {
      type: 'updateSettings';
      payload: {
        frameRate: number;
        resolution: string;
      };
    };

const loadLocalStorage = (initialValue: State): State => {
  try {
    const unserialised = localStorage.getItem(localStorageKey);
    if (unserialised) {
      const obj = JSON.parse(unserialised);
      return { ...initialValue, ...obj };
    }
  } catch (e) {}
  return initialValue;
};

const initialState = loadLocalStorage({
  name: '',
  frameRate: DefaultFrameRate,
  resolution: DefaultResolutions,
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'updateName': {
      return {
        ...state,
        name: action.payload,
      };
    }
    case 'updateSettings': {
      return {
        ...state,
        ...action.payload,
      };
    }
  }
  return state;
};

const StateContext = createContext<State>(null as any);
const ActionContext = createContext<Dispatch<Action>>(null as any);

export const useLocalStorage = (): [State, Dispatch<Action>] => {
  const state = useContext(StateContext);
  const dispatch = useContext(ActionContext);
  return [state, dispatch];
};

interface Props {
  children: ReactNode;
}

export const LocalStorageProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [state]);

  return (
    <StateContext.Provider value={state}>
      <ActionContext.Provider value={dispatch}>{children}</ActionContext.Provider>
    </StateContext.Provider>
  );
};
