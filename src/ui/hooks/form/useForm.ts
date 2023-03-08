import { ChangeEvent, useCallback, useState } from "react";

import { validateFormValues, Validation } from "./validate";

export function useForm<T>(initialState: T, validations: Validation[] = []) {
  const validateCallback = useCallback(async (validations: Validation[] = [], newValues: T) => {
    const { isValid, errors } = await validateFormValues(validations, newValues);
    return { isValid, errors };
  }, []);

  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [isValid, setValid] = useState(false);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const changeHandler = async (event: ChangeEvent<HTMLInputElement>, value?: string | boolean | object) => {
    const newValues = {
      ...values,
      [event.target.name]: value !== undefined ? value : event.target.value,
    };
    setValues(newValues);

    const { isValid, errors } = await validateCallback(validations, newValues);
    setValid(isValid);
    setErrors(errors);
    setTouched({ ...touched, [event.target.name]: true });
  };

  const changeModelHandler = async (values: T) => {
    setValues(values);

    const { isValid, errors } = await validateCallback(validations, values);
    setValid(isValid);
    setErrors(errors);
  };

  return {
    values,
    changeHandler,
    changeModelHandler,
    isValid,
    errors,
    touched,
  };
}
