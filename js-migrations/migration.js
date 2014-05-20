var async = require('async'),
    semver = require('semver');

/**
 * @typedef Migration
 * @type {object}
 * @property {string} version Must be a valid semver:
 *     http://semver.org/
 * @property {function} up Function to apply when migrating
 *     up to this version.
 * @property {function} down Function to apply when migrating 
 *     down from this version
 */

/**
 * @typedef Options
 * @type {object}
 * @property {string} [from] The version to migrate from.
 *      Must be a valid semver: http://semver.org/
 * @property {string} [to] The version to migrate to.
 *      Must be a valid semver: http://semver.org/
 */

/**
 * Migrate the given obj
 * 
 * @public
 * @param {object} obj The object to migrate
 * @param {Migration[]} migrations The migrations to apply
 *     if required
 * @param {Options} [options]
 * @param {function} cb Callback function
 */
exports.migrate = function(obj, migrations, options, cb) {

  if (!cb) {
    cb = options;
    options = {};
  }
  if (!obj || !migrations) {
    return cb(null, obj);
  }

  var from = options.from;
  var to = options.to;

  if (from && !semver.valid(from)) {
    return cb('Invalid from version provided');
  }
  if (to && !semver.valid(to)) {
    return cb('Invalid to version provided');
  }

  var up = !from || !to || semver.lte(from, to);

  async.reduce(
    _sort(migrations),
    obj,
    function(_memo, _migration, _cb) {
      if (!_migration.version) {
        _cb('A migration is missing the required version property');
      } else if (!semver.valid(_migration.version)) {
        _cb('A migration has an invalid version property');
      } else {
        if (up && _migration.up && _apply(from, to, _migration)) {
          _migration.up(_memo, _cb);
        } else if (!up && _migration.down && _apply(to, from, _migration)) {
          _migration.down(_memo, _cb);
        } else {
          _cb(null, _memo);
        }
      }
    },
    cb
  );

};

var _sort = function(migrations) {
  return migrations.sort(function(_lhs, _rhs) {
    return semver.compare(_lhs.version, _rhs.version);
  });
};

var _apply = function(from, to, migration) {
  return (!from || semver.gt(migration.version, from))
      && (!to || semver.lte(migration.version, to));
};
