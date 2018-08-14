# tftest

## How to implement tests
 WIP - This should be done after spec and test module are implemented

## How test are executed

- `cd cnid-infrastructure/...<to-be-tested>`
- `terraform init`
- `terraform plan -out=output.plan`
- `tftest -t cnid-infrastructure/...<to-be-tested> -p output.plan`

## Usage

`Usage: tftest [options]

  Options:

    -V, --version                 output the version number
    -t, --terraformFolder <path>  Path of terraform modules folder <path> (default: /home/user/projects/infra)
    -p, --terraformPlan <path>    Path of terraform modules plan <path> (default: /home/user/projects/infra/output.plan)
    -s, --show <type>             Path of terraform plan <path> to print json (default: /home/user/projects/infra/output.plan)
    -j, --gettfjson <os>          Get tfjson for <os> (default: linux,darwin,windows)
    -h, --help                    output usage information`

## How it works

- tftest now looks for `tests.js` in the current working directory to discover modules that are being used, and their "prefix"
- tftest will now examine `.terraform/modules/modules.json` to detect any modules that contain a `tests.js` file.
- tftest executes the tests against the plan file, if any tests fail the return code is non-zero.
