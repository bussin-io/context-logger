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
    logger.info("this will contain traceId in log's json");



});

```

## Metadata

```TypeScript
import { createLogger, IContextLogger } from '@bussin/context-logger';

const logger: IContextLogger = createLogger({ level: 'debug' });

await logger.addContext({ traceId: 1234 }, async context => {
    logger.info("this will contain traceId in log's json");
});

```

## Contributing

To contribute, all PRs should target the `develop` branch. Feature branches must be rebased onto the latest `develop` commit before merging to keep a linear git history.

This repo uses the [googleapis/release-please-action](https://github.com/googleapis/release-please-action) GitHub Action which requires [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) messages. The commit messages are used to determine package versioning automatically so it is important that they are in the correct format. Incorrect commit messages will cause the build and release to fail.

## Publishing

Package releases are handled through the [Release](https://github.com/bussin-io/context-logger/actions/workflows/release.yml) GitHub Action via [googleapis/release-please-action](https://github.com/googleapis/release-please-action). A workflow run will be triggered automatically when code is merged to the `develop` branch. This creates a subsequent "release" PR, also targeting `develop`, that can optionally be merged if a release is desired. If the release PR is merged another run of the Release GitHub Action will be triggered, this time executing the "publish" job, which currently requires manual approval by [Wesley Thorsen](https://github.com/wesleythorsen1). Once approved, a GitHub Release will be created and the package will be published to NPM.

## Support

Please create a PR if you find any missing functionality that you's like to add. For bugs, please use the [issues tracker](https://github.com/bussin-io/context-logger/issues). I'd be happy to help you!
