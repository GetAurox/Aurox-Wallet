import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { isStrongPassword } from "ui/common/validators";

const zeroedOptions = {
  minNumbers: 0,
  minSymbols: 0,
  minLength: 0,
  minLowercase: 0,
  minUppercase: 0,
};

export function useValidatePassword() {
  const [validations, setValidations] = useState({
    char: { value: false, label: "Minimum 8 characters" },
    min: { value: false, label: "Uppercase and lowercase characters" },
    num: { value: false, label: "Minimum 1 number" },
    match: { value: false, label: "Passwords match" },
  });

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handlePasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value), []);
  const handlePasswordConfirmChange = useCallback((event: ChangeEvent<HTMLInputElement>) => setPasswordConfirm(event.target.value), []);

  const handlePasswordClear = useCallback(() => setPassword(""), []);
  const handlePasswordConfirmClear = useCallback(() => setPasswordConfirm(""), []);

  useEffect(() => {
    setValidations(validation => ({
      char: { value: isStrongPassword(password, { ...zeroedOptions, minLength: 8 }), label: validation.char.label },
      min: { value: isStrongPassword(password, { ...zeroedOptions, minLowercase: 1, minUppercase: 1 }), label: validation.min.label },
      num: { value: isStrongPassword(password, { ...zeroedOptions, minNumbers: 1 }), label: validation.num.label },
      match: { value: Boolean(password && passwordConfirm && password === passwordConfirm), label: validation.match.label },
    }));
  }, [password, passwordConfirm]);

  return {
    validations,
    password,
    passwordConfirm,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handlePasswordClear,
    handlePasswordConfirmClear,
    passwordValid: validations.char.value && validations.min.value && validations.num.value && validations.match.value,
  };
}
