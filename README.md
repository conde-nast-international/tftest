# tftest

## How to implement tests
 WIP - This should be done after spec and test module are implemented

## Install using npm
- `npm install @condenast/tftest -g`

## Install for dev
- `git clone git@github.com:conde-nast-international/tftest.git`
- `cd tftest`
- `npm install`

## How test are executed

- `cd cnid-infrastructure/...<to-be-tested>`
- `terraform init`
- `terraform plan -out=output.plan`
- `tftest -t cnid-infrastructure/...<to-be-tested> -p output.plan`

## Usage
```
$ tftest -h

  Usage: tftest [options] [command]

  Options:

    -V, --version   output the version number
    -h, --help      output usage information

  Commands:

    test [options]  test
    show [options]  show
    gettfjson       gettfjson

```

```
$ tftest test -h

  Usage: test [options]

  test

  Options:

    -t, --terraformFolder <terraformFolder>  Path of terraform modules folder <terraformFolder> (Default: /home/user/infra)
    -p, --terraformPlan <terraformPlan>      Path of terraform modules plan <terraformPlan> (Default: /home/user/infra/output.plan )
    -h, --help                               output usage information

```

```
tftest show -h

  Usage: show [options]

  show

  Options:

    -p, --terraformPlan <terraformPlan>  Path of terraform modules plan <terraformPlan> (Default: /home/user/infra/output.plan )
    -h, --help                           output usage information

```

## How it works

- tftest now looks for `tests.js` in the current working directory to discover modules that are being used, and their "prefix"
- tftest will now examine `.terraform/modules/modules.json` to detect any modules that contain a `tests.js` file.
- tftest executes the tests against the plan file, if any tests fail the return code is non-zero.

## How to debug

This program uses [debug](https://www.npmjs.com/package/debug) to be able to debug use environment variable `DEBUG`
Example:
`$ ENV DEBUG=tftest,generic bin/tftest show -p spec/lib/fixtures/simple-create.plan`

It's possible to combine multiple files names using `,`.
Value should be name of file that you want to debug.

Available values for `DEBUG`:
- tftest
- filesystem
- generic
- plan
- runner
