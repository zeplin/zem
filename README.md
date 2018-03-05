# Zeplin Extension Manager
Creates Zeplin extensions with no build configuration 🎉

## Create Extension
If you use npm 5.2+, you can create an extension without installing Zeplin Extension Manager globally to your Node.js environment:
```
npx zeplin-extension-manager create my-extension
```

Otherwise, you need to install it first, then you can create an extension:
```
npm install -g zeplin-extension-manager
zeplin-extension-manager create my-extension
```

## Usage
Extensions created using Zeplin Extension Manager have some built-in scripts that ease development, build, and test of your extension:

### `npm start`
Starts local server, serving the extension (at http://localhost:7070 by default). Hostname, port and the list of hosts allowed to access the local server can be provided as command-line options.

You can take a look at [this tutorial](https://github.com/zeplin/zeplin-extension-documentation/blob/master/tutorial.md) for instructions to add local extensions to Zeplin.
```
  Usage: zeplin-extension-manager start [options]

  Options:

    -h --host <host>                    Host name (default: localhost)
    -p --port <port>                    Port (default: 7070)
    -a --allowed-hosts <allowed-hosts>  Allowed hosts
```

### `npm run build`
Builds extension source and create resources targeting production environment.
```
  Usage: zeplin-extension-manager build [options]

  Options:

    -d --dev  Target development environment
```

### `npm run exec`
Executes extension function(s) with sample data.
```
  Usage: zeplin-extension-manager exec [function-name] [options]

  Options:

    --no-build                    Use existing build.
    --defaults <default-options>  Set default extension option values (e.g, flag=false,prefix=\"pre\")
```

### `npm run clean`
Clears output directory.

### Notes
* It uses Webpack with Babel loader to transpile ES modules targeting Safari 9.1 environment.
* If any applicable ESLint configuration is found in your codebase, source code is automatically linted before building.