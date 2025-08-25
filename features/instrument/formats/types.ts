export type FileConfig = {
  readonly type: string;
  readonly extensions: string[];
  readonly readable: boolean;
  readonly writable: boolean;
};

export type TextConfig = {
  readonly type: string;
};
