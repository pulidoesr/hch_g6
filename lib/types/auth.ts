export type FieldErrors = Partial<Record<"email" | "password", string>>;

type Base = {
  formError?: string;
  fieldErrors?: FieldErrors;
};

export type SignInResult =
  | ({ ok: true; redirect?: string } & Base)
  | ({ ok: false } & Base);
