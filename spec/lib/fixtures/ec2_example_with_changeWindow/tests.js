module.exports = [
  { 'name': 'aws_instance.ec2_example',
    'description': "ensures the ec2 instance isn't destroyed",
    'count': 1,
    'changeWindow': {
      'from': '2001-01-01T01:01:01',
      'to': '2050-01-01T01:01:01'
    },
    'tests': [
      (obj, args) => {
        expect(obj.destroy).toEqual(false);
      }
    ]
  }
];
