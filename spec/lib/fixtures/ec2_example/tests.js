module.exports = [
  { 'name': 'aws_instance.ec2_example',
    'description': "ensures the ec2 instance isn't destroyed",
    'count': 1,
    'args': {},
    'tests': [
      (obj, args) => {
        expect(obj.destroy).toEqual(false);
      }
    ]
  }
];
