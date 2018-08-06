# tftest

## How test are executed

For example, a test on cnid-infrastructure/src/account_123/services/eu-central-1/polaroid-mongodb would execute in the following manner.
- terraform init
- terraform plan -out=/tmp/plan.out
- tftest
- - tftest test /tmp/plan.out
- - tftest will now examine .terraform/modules to detect any modules that contain a `tests.js` file.
- - tftest executes the tests against the plan file, if any tests fail the return code is non-zero.
