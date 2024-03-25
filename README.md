# Bull pause/resume bug reproduce

A minimal-ish example demonstrating a pause/resume bug in
[Bull](https://github.com/OptimalBits/bull).

## Prerequisites

- Docker

## Usage

The bug this code is attempting to demonstrate occurs infrequently. This
repository uses [a sneaky patch on top of
`ioredis`](./patches/ioredis+5.3.2.patch) that delays the resolution of the
promise returned by the Redis cluster client's `quit()` funcion a tiny bit. This
makes the bug pop up a lot more often.

Note also that this package depends on an unofficial version of `ioredis`: It is
version `5.3.2` with [this fix](https://github.com/redis/ioredis/pull/1864)
applied. Nevertheless, the steps below apply equally well to the original
version `5.3.2` as well - all that is needed is to change the version of
`ioredis` in `package.json` to `5.3.2`, then remove `node_modules` and re-run
`npm install` before performing the steps below.

To observe the bug in action, perform the following steps:

1. Make a clone of this repository.
1. Remove `patches/bull+4.12.2.patch`.
1. Run `npm ci`.
1. Run `npm start`.

The output should look roughly like this:

```
$ npm start

> bull-pause-resume-bug@1.0.0 start
> docker compose up test-runner

[+] Running 2/2
 ✔ Container redis-cluster
 ✔ Container test-runner
Attaching to test-runner
test-runner  | Waiting 5 seconds to give the Redis cluster a moment :P
test-runner  | Creating Redis client client
test-runner  | Creating Redis client bclient
test-runner  | Creating Redis client subscriber
test-runner  | Processing jobs now
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Queue paused
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Queue resumed
test-runner  | Received a job with data { foo: 'initial bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | Received a job with data { foo: 'bar' }
test-runner  | /app/node_modules/ioredis/built/cluster/index.js:124
test-runner  |                     reject(new redis_errors_1.RedisError("Connection is aborted"));
test-runner  |                            ^
test-runner  |
test-runner  | RedisError: Connection is aborted
test-runner  |     at /app/node_modules/ioredis/built/cluster/index.js:124:28
test-runner  |
test-runner  | Node.js v20.11.1
test-runner exited with code 1
```

To see the fix in action, perform the following steps:

1. `git checkout patches/bull+4.12.2.patch`.
1. Run `npm ci`.
1. Run `npm start`.

The test runner should no longer crash as it did before.
