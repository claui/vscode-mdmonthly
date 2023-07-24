# mdmonthly

Simple journal. One month, one Markdown file.

## What it does

This library creates a blank journal entry in the user’s filesystem.

It accepts a fixed project root directory and an ISO date. Given
those, the library creates a Markdown file for the given month.  
It also returns a template for the day’s entry.

## File structure

The given project root directory contains a set of subdirectories:

- `2023`
- `2024`
- and so on.

Each subdirectory contains Markdown files:

- `2023-02.md`
- `2023-03.md`
- and so on.

## Detailed description

The library will make sure that the Markdown file corresponding to
the given day exists.

The function returns an object which includes:

- the absolute path to the Markdown file;

- a Markdown snippet for a level-2 header that contains the given
  ISO date followed by two newlines; and

- the line and character numbers of the Markdown file where the
  level-2 header a are supposed to be inserted.

## How to install

Using the npm CLI:

```shell
npm install md-monthly
```

Using Yarn:

```shell
yarn add md-monthly
```

## License

Copyright (c) 2023 Claudia Pellegrino

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
For a copy of the License, see [LICENSE](LICENSE).
