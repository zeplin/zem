# Zeplin Extension Manager

Create and test Zeplin extensions with no build configuration. ⚗️🦄

## Getting started

If you use npm 5.2+, you can run Zeplin Extension Manager directly to create an extension:

```sh
npx zem create my-extension
```

Otherwise, you can install Zeplin Extension Manager globally and run it right after:

```sh
npm install -g zem
zem create my-extension
```

## Overview

Extensions created using the manager have built-in scripts to ease development, build and test proceses. No need to setup tools like Webpack or Babel—they are preconfigured and hidden by the manager.

### Scripts

#### `npm start`

Starts a local server, serving the extension (by default, at http://localhost:7070). Hostname, port and the list of hosts allowed to access the local server can be provided as options.

Follow the [tutorial](https://github.com/zeplin/zeplin-extension-documentation/blob/master/tutorial.md#adding-a-local-extension) to learn how to add a local extension to a Zeplin project.

```
Usage: npm start -- [options]

Options:

  -h --host <host>                    Host name (default: localhost)
  -p --port <port>                    Port (default: 7070)
  -a --allowed-hosts <allowed-hosts>  Allowed hosts
```

#### `npm run build`

Builds extension source, creating resources targeting production environment.

```
Usage: npm run build -- [options]

Options:

  -d --dev  Target development environment
```

#### `npm run exec`

Executes extension function(s) with sample data.

This is a super useful script to debug and test your extension, without running in it Zeplin.

```
Usage: npm run exec -- [function-name] [options]

Options:

  --no-build                    Use existing build.
  --defaults <default-options>  Set default extension option values (e.g, flag=false,prefix=\"pre\")
```

#### `npm run clean`

Cleans build directory.

## Tidbits

- Modules are transpiled to target Safari 9.1, as extensions are run both on the Web app and on the Mac app using JavaScriptCore, supporting macOS El Capitan.
- Add an ESLint configuration and the source code will automatically be linted before building.

## Community solutions

### Zero

[baybara-pavel/zero](https://github.com/baybara-pavel/zero)

Similar to zem, Zero lets you quickly start working on a Zeplin extension with Webpack.
