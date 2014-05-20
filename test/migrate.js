var migration = require('../js-migrations/migration');

var _migrations = {
  hoursToMinutes: {
    version: '1.0.0',
    up: function(doc, cb) {
      if (!doc.hours) {
        cb('Hours is required')
      } else {
        doc.minutes = doc.hours * 60;
        delete doc.hours;
        cb(null, doc);
      }
    },
    down: function(doc, cb) {
      doc.hours = doc.minutes / 60;
      delete doc.minutes;
      cb(null, doc);
    }
  },
  minutesToHoursAndMinutes: {
    version: '1.0.2',
    up: function(doc, cb) {
      doc.hours = Math.floor(doc.minutes / 60);
      doc.minutes = doc.minutes % 60;
      cb(null, doc);
    },
    down: function(doc, cb) {
      doc.minutes = doc.hours * 60 + doc.minutes;
      delete doc.hours;
      cb(null, doc);
    }
  },
  roundMinutesToNearestTen: {
    version: '1.1.0',
    up: function(doc, cb) {
      doc.minutes = Math.round(doc.minutes / 10) * 10;
      cb(null, doc);
    }
  },
  missingVersion: {
    up: function(doc, cb) {
      cb(null, doc);
    }
  },
  invalidVersion: {
    version: 'banana',
    up: function(doc, cb) {
      cb(null, doc);
    }
  }
};

exports['simple migration'] = function(test) {
  test.expect(2);
  var migrations = [
    _migrations.hoursToMinutes
  ];
  migration.migrate({ hours: 2 }, migrations, function(err, result) {
    test.ok(!err);
    test.deepEqual(result, { minutes: 120 });
    test.done();
  });
};

exports['multiple migrations'] = function(test) {
  test.expect(2);
  var migrations = [
    _migrations.hoursToMinutes,
    _migrations.minutesToHoursAndMinutes
  ];
  migration.migrate({ hours: 2.25 }, migrations, function(err, result) {
    test.ok(!err);
    test.deepEqual(result, { hours: 2, minutes: 15 });
    test.done();
  });
};

exports['migration order is based on version'] = function(test) {
  test.expect(2);
  var migrations = [
    _migrations.minutesToHoursAndMinutes,
    _migrations.hoursToMinutes
  ];
  migration.migrate({ hours: 2.25 }, migrations, function(err, result) {
    test.ok(!err);
    test.deepEqual(result, { hours: 2, minutes: 15 });
    test.done();
  });
};

exports['migration start is based on from'] = function(test) {
  test.expect(2);
  var migrations = [
    _migrations.minutesToHoursAndMinutes,
    _migrations.hoursToMinutes,
    _migrations.roundMinutesToNearestTen
  ];
  migration.migrate({ minutes: 135 }, migrations, { from: '1.0.0' }, function(err, result) {
    test.ok(!err);
    test.deepEqual(result, { hours: 2, minutes: 20 });
    test.done();
  });
};

exports['migration end is based on to'] = function(test) {
  test.expect(2);
  var migrations = [
    _migrations.minutesToHoursAndMinutes,
    _migrations.hoursToMinutes,
    _migrations.roundMinutesToNearestTen
  ];
  migration.migrate({ minutes: 135 }, migrations, { from: '1.0.0', to: '1.0.2' }, function(err, result) {
    test.ok(!err);
    test.deepEqual(result, { hours: 2, minutes: 15 });
    test.done();
  });
};

exports['migration down'] = function(test) {
  test.expect(2);
  var migrations = [
    _migrations.minutesToHoursAndMinutes,
    _migrations.hoursToMinutes,
    _migrations.roundMinutesToNearestTen
  ];
  migration.migrate({ hours: 2, minutes: 20 }, migrations, { from: '1.1.0', to: '1.0.0' }, function(err, result) {
    test.ok(!err);
    test.deepEqual(result, { minutes: 140 });
    test.done();
  });
};

exports['missing migrations does nothing'] = function(test) {
  test.expect(2);
  migration.migrate({ hours: 2, minutes: 20 }, undefined, function(err, result) {
    test.ok(!err);
    test.deepEqual(result, { hours: 2, minutes: 20 });
    test.done();
  });
};

exports['missing migrations does nothing'] = function(test) {
  test.expect(2);
  migration.migrate({ hours: 2, minutes: 20 }, undefined, function(err, result) {
    test.ok(!err);
    test.deepEqual(result, { hours: 2, minutes: 20 });
    test.done();
  });
};

exports['migration returns error'] = function(test) {
  test.expect(1);
  var migrations = [
    _migrations.hoursToMinutes
  ];
  migration.migrate({ minutes: 200 }, migrations, function(err, result) {
    test.equal(err, 'Hours is required');
    test.done();
  });
};

exports['missing doc'] = function(test) {
  test.expect(2);
  var migrations = [
    _migrations.hoursToMinutes
  ];
  migration.migrate(undefined, migrations, function(err, result) {
    test.ok(!err);
    test.equal(result, undefined);
    test.done();
  });
};

exports['migration missing version'] = function(test) {
  test.expect(1);
  var migrations = [
    _migrations.missingVersion
  ];
  migration.migrate({}, migrations, function(err, result) {
    test.equal(err, 'A migration is missing the required version property');
    test.done();
  });
};

exports['migration invalid version'] = function(test) {
  test.expect(1);
  var migrations = [
    _migrations.invalidVersion
  ];
  migration.migrate({}, migrations, function(err, result) {
    test.equal(err, 'A migration has an invalid version property');
    test.done();
  });
};

exports['invalid from version'] = function(test) {
  test.expect(1);
  migration.migrate({}, [], { from: 'inversion' }, function(err, result) {
    test.equal(err, 'Invalid from version provided');
    test.done();
  });
};

exports['invalid to version'] = function(test) {
  test.expect(1);
  migration.migrate({}, [], { to: '1.x' }, function(err, result) {
    test.equal(err, 'Invalid to version provided');
    test.done();
  });
};

// TODO invalid from and to