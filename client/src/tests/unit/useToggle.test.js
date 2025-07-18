import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useToggle from '../../hooks/useToggle';

const ToggleTestComponent = () => {
  const [value, toggle] = useToggle();

  return (
    <div>
      <p data-testid="value">{value ? 'true' : 'false'}</p>
      <button onClick={toggle}>Toggle</button>
    </div>
  );
};

describe('useToggle', () => {
  it('should toggle the value', async () => {
    render(<ToggleTestComponent />);

    const valueElement = screen.getByTestId('value');
    const toggleButton = screen.getByText('Toggle');

    expect(valueElement.textContent).toBe('false');

    await userEvent.click(toggleButton);
    expect(valueElement.textContent).toBe('true');

    await userEvent.click(toggleButton);
    expect(valueElement.textContent).toBe('false');
  });
});
