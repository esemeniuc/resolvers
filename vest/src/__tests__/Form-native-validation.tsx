import React from 'react';
import { render, screen, act } from '@testing-library/react';
import user from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import vest from 'vest';
import { vestResolver } from '..';

const USERNAME_REQUIRED_MESSAGE = 'username field is required';
const PASSWORD_SYMBOL_MESSAGE = 'password must contain a symbol';

interface FormData {
  username: string;
  password: string;
}

const validationSuite = vest.create('form', (data: FormData) => {
  vest.test('username', USERNAME_REQUIRED_MESSAGE, () => {
    vest.enforce(data.username).isNotEmpty();
  });

  vest.test('password', PASSWORD_SYMBOL_MESSAGE, () => {
    vest.enforce(data.password).matches(/[^A-Za-z0-9]/);
  });
});

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: vestResolver(validationSuite),
    shouldUseNativeValidation: true,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} placeholder="username" />

      <input {...register('password')} placeholder="password" />

      <button type="submit">submit</button>
    </form>
  );
}

test("form's native validation with Vest", async () => {
  const handleSubmit = jest.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  // username
  let usernameField = screen.getByPlaceholderText(
    /username/i,
  ) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(true);
  expect(usernameField.validationMessage).toBe('');

  // password
  let passwordField = screen.getByPlaceholderText(
    /password/i,
  ) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(true);
  expect(passwordField.validationMessage).toBe('');

  await act(async () => {
    user.click(screen.getByText(/submit/i));
  });

  // username
  usernameField = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(false);
  expect(usernameField.validationMessage).toBe(USERNAME_REQUIRED_MESSAGE);

  // password
  passwordField = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(false);
  expect(passwordField.validationMessage).toBe(PASSWORD_SYMBOL_MESSAGE);
});
