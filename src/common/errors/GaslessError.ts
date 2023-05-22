/** Error specific to gasless transaction service */
export interface ZodIssue {
  code: string;
  message?: string;
  path: string | number;
}

/** Error specific to gasless transaction service */
export interface MinimalZodError {
  issues: ZodIssue[];
  name: "ZodError";
  stack: string;
}
