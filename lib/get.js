import os from 'os';

var platformToMethod = {
  darwin: 'ps',
  sunos: 'ps',
  freebsd: 'ps',
  netbsd: 'ps',
  win: 'wmic',
  linux: 'ps',
  aix: 'ps',
};

var methodToRequireFn = {
  ps: async () => (await import('./ps.js')).ps,
  wmic: async () => (await import('./wmic.js')).wmic,
};

var platform = os.platform();
if (platform.startsWith('win')) {
  platform = 'win';
}

var method = platformToMethod[platform];

/**
 * Gets the list of all the pids of the system.
 * @param  {Function} callback Called when the list is ready.
 */
export async function get(callback) {
  if (method === undefined) {
    callback(
      new Error(
        os.platform() +
          ' is not supported yet, please open an issue (https://github.com/simonepri/pidtree)'
      )
    );
  }

  var list = await methodToRequireFn[method]();
  list(callback);
}
