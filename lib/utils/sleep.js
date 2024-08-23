/**
 * Sleep for a given amount of time.
 * 
 * @param {int} ms 
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}
