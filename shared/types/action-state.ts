export type ActionState = {
  success: boolean;
  message: string;
};

export const INITIAL_ACTION_STATE: ActionState = {
  success: false,
  message: "",
};
