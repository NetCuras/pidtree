import test from 'ava';
import sinon from 'sinon';

import pify from 'pify';

import mocks from './helpers/mocks.js';

// to be mocked by sinon:
import child_process from 'child_process';
import os from 'os';

let sandbox;

test.beforeEach(() => {
  sandbox = sinon.createSandbox();
  sandbox.stub(os, 'EOL').returns('\n');
  sandbox.stub(os, 'type').returns('type');
  sandbox.stub(os, 'release').returns('release');
});

test.afterEach.always(t => {
  sandbox.restore();
});

test.serial('should parse ps output on Darwin', async t => {
  const stdout =
    'PPID   PID\n' +
    '   1   430\n' +
    ' 430   432\n' +
    '   1   727\n' +
    '   1  7166\n';

  sandbox.stub(child_process, 'spawn').callsFake(() => mocks.spawn(stdout, '', null, 0, null));
  sandbox.stub(os, 'platform').returns('darwin');

  const ps = (await import('../lib/ps.js')).ps;

  const result = await pify(ps)();
  t.deepEqual(result, [[1, 430], [430, 432], [1, 727], [1, 7166]]);
});

test.serial('should parse ps output on *nix', async t => {
  const stdout =
    'PPID   PID\n' +
    '   1   430\n' +
    ' 430   432\n' +
    '   1   727\n' +
    '   1  7166\n';

  sandbox.stub(child_process, 'spawn').callsFake(() => mocks.spawn(stdout, '', null, 0, null));
  sandbox.stub(os, 'platform').returns('linux');

  const ps = (await import('../lib/ps.js')).ps;

  const result = await pify(ps)();
  t.deepEqual(result, [[1, 430], [430, 432], [1, 727], [1, 7166]]);
});

test.serial('should throw if stderr contains an error', async t => {
  const stdout =
    'PPID   PID\n' +
    '   1   430\n' +
    ' 430   432\n' +
    '   1   727\n' +
    '   1  7166\n';

  sandbox.stub(child_process, 'spawn').callsFake(() => mocks.spawn(stdout, 'Some error', null, 0, null));
  sandbox.stub(os, 'platform').returns('linux');

  const ps = (await import('../lib/ps.js')).ps;

  await t.throwsAsync(pify(ps));
});

test.serial('should not throw if stderr contains the "bogus screen" error message', async t => {
  const stdout =
    'PPID   PID\n' +
    '   1   430\n' +
    ' 430   432\n' +
    '   1   727\n' +
    '   1  7166\n';

  sandbox.stub(child_process, 'spawn').callsFake(
    () => mocks.spawn(stdout, 'your 131072x1 screen size is bogus. expect trouble', null, 0, null)
  );
  sandbox.stub(os, 'platform').returns('linux');

  const ps = (await import('../lib/ps.js')).ps;

  const result = await pify(ps)();
  t.deepEqual(result, [[1, 430], [430, 432], [1, 727], [1, 7166]]);
});
