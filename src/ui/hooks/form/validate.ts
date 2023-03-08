export type Validation = (value: any) => boolean | object;
export type ValidationResult = boolean | object;

export async function validateFormValues<T>(validations: Validation[], values: T) {
  let errors: ValidationResult[] = await Promise.all(validations.map(async validation => validation(values)));
  errors = errors.filter(validation => typeof validation === "object");

  return {
    isValid: errors.length === 0,
    errors: errors.reduce((errors, error) => {
      if (typeof errors === "object" && typeof error === "object") {
        return { ...errors, ...error };
      }

      return {};
    }, {}) as Record<keyof T, string>,
  };
}
