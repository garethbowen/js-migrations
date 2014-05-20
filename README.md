JavaScript Migrations
=====================

Installation
-------------------

`npm install js-migrations` or [kanso](http://kan.so/packages/details/js-migrations)

Defining Migrations
-------------------

A migration is an object with a `version` and one or both of `up` and `down` functions, which migrate up to, or down from this version respectively. For example:

```
var myMigration = {
  version: '1.2.5',
  up: function(obj, callback) {
    obj.a = parseInt(obj.a);
    callback(null, obj);
  },
  down: function(obj, callback) {
    obj.a = obj.a + '';
    callback(null, obj);
  }
};
```

Version should be unique between migrations or there will be no way to tell which set of migrations have been run.

Running Migrations
------------------

```
var migration = require('js-migrations');
migration.migrate(
  { a: '42' },
  [myMigration],
  { from: '1.1.5', to: '2.1.3' },
  function(err, result) {
    // do something...
  }
);
```

If `from` or `to` is omitted above there will be no lower or upper limit respectively. If both are omitted all migrations will be run. If `from` is greater than `to` then the down migrations are run.

All versions must follow the [semver](http://semver.org/) format.

Build Status
------------

[![Build Status](https://travis-ci.org/garethbowen/js-migrations.png?branch=master)](https://travis-ci.org/garethbowen/js-migrations)