export const validatePassword = (password: string) => {
    return {
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      minLength: password.length >= 8,
    };
  };