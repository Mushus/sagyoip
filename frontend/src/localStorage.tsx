import React, { useMemo, useState, ReactNode, createContext, useContext, useCallback } from 'react';

const localStorageKey = 'userData';

interface State {
  name: string;
}

interface Dispatch {
  updateName: (name: string) => void;
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
      },
    ],
    [state],
  );

  return <LocalStorageContext.Provider value={providedValue}>{children}</LocalStorageContext.Provider>;
};
