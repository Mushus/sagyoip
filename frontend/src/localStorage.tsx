import React, { useMemo, useState, ReactNode, createContext, useContext, useCallback } from 'react';
import { DefaultFps, DefaultResolutions } from './consts';

const localStorageKey = 'userData';

interface State {
  name: string;
  frameRates: number;
  resolution: string;
}

interface Dispatch {
  updateName: (name: string) => void;
  updateFrameRates: (fps: number) => void;
  updateResolution: (resolution: string) => void;
}

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

const initialValue = loadLocalStorage({
  name: '',
  frameRates: DefaultFps,
  resolution: DefaultResolutions,
});

const LocalStorageContext = createContext<[State, Dispatch] | undefined>(undefined);

export const useLocalStorage = () => {
  const value = useContext(LocalStorageContext);
  if (value == null) throw new Error('invalid value');
  return value;
};

interface Props {
  children: ReactNode;
}

export const LocalStorageProvider = ({ children }: Props) => {
  const [state, dispatch] = useState(initialValue);

  const updateState = useCallback((state: State) => {
    dispatch(state);
    const json = JSON.stringify(state);
    localStorage.setItem(localStorageKey, json);
  }, []);

  const providedValue = useMemo<[State, Dispatch]>(
    () => [
      state,
      {
        updateName: (name: string) => updateState({ ...state, name }),
        updateFrameRates: (frameRates: number) => updateState({ ...state, frameRates }),
        updateResolution: (resolution: string) => updateState({ ...state, resolution }),
      },
    ],
    [state],
  );

  return <LocalStorageContext.Provider value={providedValue}>{children}</LocalStorageContext.Provider>;
};
