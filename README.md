# Zeplin Extension Manager

Create, test and publish Zeplin extensions with no build configuration. ⚗️🦄

## Getting started

You can run Zeplin Extension Manager directly to create an extension:

```sh
npx zem create my-extension
```

You can also use `-y` option to create package with default configuration.

```sh
npx zem create my-extension -y
```

## Overview

Extensions created using the manager have built-in scripts to ease development, build, test and publish processes. No need to setup tools like Webpack or Babel—they are preconfigured and hidden by the manager.

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

#### `npm run test`

Runs test scripts via Jest. Extension packages created using zem include a boilerplate test module. It uses Jest's snapshot testing feature to match the output of your extensions with the expected results. For example, you can take a look at our [React Native extension](https://github.com/zeplin/react-native-extension/blob/develop/src/index.test.js).

```
Usage: npm run test -- [options]
```

You can check [Jest's docs](https://jestjs.io/docs/en/cli.html) for options.

#### `npm run clean`

Cleans build directory.


#### `npm run publish`

Publish extension, sending it for review to be listed on [extensions.zeplin.io](https://extensions.zeplin.io).

```
Usage: npm run publish -- [options]

Options:

  --path <build-path>           Path for the extension build to publish (default: Path used by the build command)
```


##### Usage with access token:

Zeplin Extension Manager can authenticate using an access token instead of your Zeplin credentials which makes it easier to integrate it into your CI workflow.

1. Get a `zem` access token from your [Profile](https://app.zeplin.io/profile/connected-apps) in Zeplin.
2. Set `ZEM_ACCESS_TOKEN` environment variable in your CI.

## Tidbits

- Modules are transpiled to target Safari 9.1, as extensions are run both on the Web app and on the Mac app using JavaScriptCore, supporting macOS El Capitan.
- Add an ESLint configuration and the source code will automatically be linted before building.
- You can create `webpack.zem.js` at your root to customize webpack config. The module should export a function
that takes current webpack config as an argument and return customized webpack config. For example:

```javascript
module.exports = function({ module: { rules, ...module }, ...webpackConfig }) {
  return {
    ...webpackConfig,

    resolve: {
      extensions: [".ts"]
    },
    module: {
      ...module,
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        ...rules,
      ],
    },
  };
};
```

## Community solutions

### Zero

[baybara-pavel/zero](https://github.com/baybara-pavel/zero)

Similar to zem, Zero lets you quickly start working on a Zeplin extension with Webpack.
