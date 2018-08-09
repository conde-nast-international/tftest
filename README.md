# tftest

## How test are executed

For example, a test on `cnid-infrastructure/src/account_453746000463/services/eu-central-1/polaroid-mongo-replica-set` would execute in the following manner.
- `terraform init`
- `terraform plan -out=/tmp/plan.out`
- tftest
- - `tftest test /tmp/plan.out`
- - tftest now looks for `tests.js` in the current working directory to discover modules that are being used, and their "prefix"
- - tftest will now examine `.terraform/modules/modules.json` to detect any modules that contain a `tests.js` file.
- - tftest executes the tests against the plan file, if any tests fail the return code is non-zero.
