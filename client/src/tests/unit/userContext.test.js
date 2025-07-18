import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { UserProvider, useUser } from '../../context/userContext'; 

describe('UserContext', () => {
  it('should login user', () => {
    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'LOGIN', payload: { name: 'Test User' } });
    });

    expect(result.current.user).toEqual({ name: 'Test User' });
  });

  it('should logout user', () => {
    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'LOGIN', payload: { name: 'Test User' } });
    });

    act(() => {
      result.current.dispatch({ type: 'LOGOUT' });
    });

    expect(result.current.user).toBeNull();
  });
});
