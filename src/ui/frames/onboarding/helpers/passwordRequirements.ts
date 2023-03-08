import { minLength } from "./minLength";

const lettersWithNumbers = /(?=.*[0-9])/;
const upperAndLower = /(?=.*[a-z])(?=.*[A-Z])/;

export const passwordRequirements = [
  {
    regExp: minLength(8),
    message: "Minimum 8 characters",
  },
  { regExp: lettersWithNumbers, message: "At least one number" },
  { regExp: upperAndLower, message: "One uppercase and lowercase character" },
];
