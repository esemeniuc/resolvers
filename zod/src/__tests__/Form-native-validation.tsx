import React from 'react';
import { useForm } from 'react-hook-form';
import { act, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import * as Zod from 'zod';
import { zodResolver } from '..';

const USERNAME_REQUIRED_MESSAGE = 'username field is required';
const PASSWORD_REQUIRED_MESSAGE = 'password field is required';

const schema = Zod.object({
  username: Zod.string().nonempty({ message: USERNAME_REQUIRED_MESSAGE }),
  password: Zod.string().nonempty({ message: PASSWORD_REQUIRED_MESSAGE }),
});

type FormData = Zod.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
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

test("form's native validation with Zod", async () => {
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
  expect(passwordField.validationMessage).toBe(PASSWORD_REQUIRED_MESSAGE);
});
