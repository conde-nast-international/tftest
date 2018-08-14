module.exports = [
  { 'name': 'aws_vpc.myvpc',
    'description': "ensures the my vpc isn't destroyed",
    'count': 1,
    'args': {},
    'tests': [
      function (obj, args) {
        expect(obj.destroy).toEqual(false);
      }
    ]
  }
];
