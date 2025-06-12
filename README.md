# @bussin/context-logger

[![NPM Version](https://img.shields.io/npm/v/@bussin/context-logger)](https://npmjs.com/package/@bussin/context-logger) [![NPM Version](https://img.shields.io/npm/dw/@bussin/context-logger)](https://npmjs.com/package/@bussin/context-logger) [![NPM Version](https://img.shields.io/bundlephobia/min/@bussin/context-logger)](https://npmjs.com/package/@bussin/context-logger)

Additional functionality for the @sinclair/typebox library.

License: [MIT](https://opensource.org/licenses/MIT)

## Installation

```bash
    npm install @bussin/context-logger
```

## Quick Start

```TypeScript
import { createLogger, IContextLogger } from '@bussin/context-logger';

const logger: IContextLogger = createLogger({ level: 'debug' });

await logger.addContext({ traceId: 1234 }, async context => {
  logger.info("log will contain traceId in log's json");
});

```

## Metadata

```TypeScript
import { createLogger, IContextLogger } from '@bussin/context-logger';

const logger: IContextLogger = createLogger({ level: 'debug' });

await logger.addContext({ traceId: 1234 }, async context => {
  logger.info("log will contain traceId and metadata". { metadata: "test", other: 1234 });
});

```

## Errors

```TypeScript
import { createLogger, IContextLogger } from '@bussin/context-logger';

const logger: IContextLogger = createLogger({ level: 'debug' });

await logger.addContext({ traceId: 1234 }, async context => {
  try {
    throw new Error("test error 123");
  } catch (error) {
    logger.error(error, { additionalInfo: "error thrown in method X" }); // log will contain traceId
  }
});

```

## Contributing

To contribute, all PRs should target the `develop` branch. Feature branches must be rebased onto the latest `develop` commit before merging to keep a linear git history.

## Publishing

Package releases are started by manually triggering the [Bump Version](https://github.com/bussin-io/context-logger/actions/workflows/bump-version.yml) GitHub Action. The Bump Version action will create a release commit with the version bump and an associated git tag, and automatically start the [Build and Publish](https://github.com/bussin-io/context-logger/actions/workflows/build-and-publish.yml) GitHub Action. The Build and Publish action requires a manual approval step from a repository admin. Once approved, the package will be published to the NPM registry.

## Support

Please create a PR if you find any missing functionality that you's like to add. For bugs, please use the [issues tracker](https://github.com/bussin-io/context-logger/issues). I'd be happy to help you!
