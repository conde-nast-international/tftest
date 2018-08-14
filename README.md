# tftest

## How test are executed

For example, a test on `cnid-infrastructure/src/account_453746000463/services/eu-central-1/polaroid-mongo-replica-set` would execute in the following manner.
- `terraform init`
- `terraform plan -out=/tmp/output.plan`
- tftest
- - `tftest -t infra -p /tmp/output.plan`
- - tftest now looks for `tests.js` in the current working directory to discover modules that are being used, and their "prefix"
- - tftest will now examine `.terraform/modules/modules.json` to detect any modules that contain a `tests.js` file.
- - tftest executes the tests against the plan file, if any tests fail the return code is non-zero.

## Usage

` Usage: tftest [options]

  Options:

    -V, --version                 output the version number
    -t, --terraformFolder <path>  Path of terraform modules folder <path> (default: /home/user/projects/infra)
    -p, --terraformPlan <path>    Path of terraform modules plan <path> (default: /home/user/projects/infra/output.plan)
    -s, --show <type>             Path of terraform plan <path> to print json (default: /home/user/projects/infra/output.plan)
    -j, --gettfjson <os>          Get tfjson for <os> (default: linux,darwin,windows)
    -h, --help                    output usage information`
