export interface RegistrationProgressProps {
  totalPoints: number;
  action: string | null;
  getPoints: number;
  percent: number;
}

export interface RegistrationProgressContextValue {
  progress: RegistrationProgressProps;
  setProgress: (progress: RegistrationProgressProps) => void;
}
