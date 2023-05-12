import _fs from "fs";
import _path from "path";

export type Fs = {
  existsSync: (path: _fs.PathLike) => boolean,
  mkdirSync(
    path: _fs.PathLike,
    options: _fs.MakeDirectoryOptions & {
        recursive: true;
    }
  ): string | undefined,
  readFileSync: (
    path: _fs.PathOrFileDescriptor,
    options:
        | {
              encoding: BufferEncoding;
              flag?: string | undefined;
          }
        | BufferEncoding
  ) => string,
  writeFileSync: (
    file: _fs.PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    options?: _fs.WriteFileOptions,
  ) => void,
};

export type Path = {
  join: (...paths: string[]) => string,
};
