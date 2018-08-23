module.exports = [
  { 'name': 'aws_vpc.main',
    'description': "ensures the main vpc isn't destroyed",
    'count': 1,
    'args': {},
    'tests': [
      function (obj, args) {
        expect(obj.requires_new).toEqual(true);
        expect(obj.destroy).toEqual(false);
      }
    ]
  }
];
