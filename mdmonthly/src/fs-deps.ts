export type Fs = {
  existsSync: (path: string) => boolean,
  mkdirSync(path: string, options: { recursive: true; }): void,
  readFileSync: (path: string, options: BufferEncoding) => string,
  writeFileSync: (file: string, data: string) => void,
};
