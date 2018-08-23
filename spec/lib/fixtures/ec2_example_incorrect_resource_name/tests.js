module.exports = [
  { 'name': 'aws_instance.ec2_incorrect',
    'description': "ensures the ec2 instance isn't destroyed, but allow tags.Name to be updated.",
    'count': 1,
    'tests': [
      (obj, args) => {
        expect(obj.destroy).toEqual(false);
        if (obj.has_changes) {
          let changedFields = Object.keys(obj.new);
          expect(changedFields).toEqual(['tags.Name']);
        }
      }
    ]
  }
];
