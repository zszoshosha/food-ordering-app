export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionFailure = {
  success: false;
  error: string;
  validationErrors?: Record<string, string[]>;
};

export type ActionResponse<T> = ActionSuccess<T> | ActionFailure;

export const actionSuccess = <T>(data: T): ActionSuccess<T> => ({
  success: true,
  data,
});

export const actionError = (
  error: string,
  validationErrors?: Record<string, string[]>,
): ActionFailure => ({
  success: false,
  error,
  validationErrors,
});
