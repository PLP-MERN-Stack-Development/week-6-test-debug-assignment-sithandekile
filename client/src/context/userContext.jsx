import { createContext, useContext, useReducer } from 'react';

export const UserContext = createContext();

const initialState = { user: null };

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN': return { user: action.payload };
    case 'LOGOUT': return { user: null };
    default: return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <UserContext.Provider value={{ ...state, dispatch }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
