interface State {
  user: {
    name: string;
  };
}

const initialState: State = {
  user: {
    name: '',
  },
};

type Actions = {
  type: 'updateUserName';
  payload: {
    name: string;
  };
};

const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case 'updateUserName':
      return {
        ...state,
        user: {
          ...state.user,
          name,
        },
      };
  }
};
