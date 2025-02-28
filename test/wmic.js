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
});

test.afterEach.always(t => {
  sandbox.restore();
});

test('should parse wmic output on Windows', async t => {
  const stdout =
    `ParentProcessId  ProcessId\r\r\n` +
    `0                777      \r\r\n` +
    `777              778      \r\r\n` +
    `0                779      \r\r\n\r\r\n`;

  sandbox.stub(child_process, 'spawn').callsFake(() => mocks.spawn(stdout, '', null, 0, null));
  sandbox.stub(os, 'EOL').returns('\n');
  sandbox.stub(os, 'platform').returns('linux');
  sandbox.stub(os, 'type').returns('type');
  sandbox.stub(os, 'release').returns('release');

  const wmic = (await import('../lib/wmic.js')).wmic;

  const result = await pify(wmic)();
  t.deepEqual(result, [[0, 777], [777, 778], [0, 779]]);
});
