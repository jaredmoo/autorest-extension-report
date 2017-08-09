# AutoRest Report extension

AutoRest extension that outputs data that can be used to build reports.

## How to use

To use this extension, add the below configuration to your readme.md.

This only works with autorest 2.0.

``` yaml $(report)
use-extension:
  report: https://github.com/jaredmoo/autorest-extension-report
```

Then run `autorest --report.output-folder=.` .

## Pipeline

The below section defines the AutoRest pipeline for this extension.

``` yaml
pipeline:
  report: # <- name of plugin
    scope: report
    # ^ will make this plugin run only when `--report` is passed on the CLI or
    # when there is `report: true | <some object>` in the configuration file
    input: swagger-document/identity
    # ^ other pipeline step to use as a predecessor in the DAG
    # takes the outputs of that step as input to this plugin.
    # If no `input` is declared here, the plugin runs immediately and gets
    # the `input-file`s of this AutoRest call as its inputs.
    output-artifact: report-text
    # ^ tag that is assigned to files written out by this pipeline step
    # This allows other pipeline steps to conveniently refer to all the files
    # that this pipeline step wrote out.
  report/emitter: # <- 'hello-world' is arbitrary name, 'emitter' is a plugin built into AutoRest
    input: report
    # ^ predecessor to this pipeline step
    scope: scope-report/emitter
    # ^ scope that defines the inputs/outputs for the emitter plugin

scope-report/emitter:
  input-artifact: report-text
  output-uri-expr: $key.split("/output/")[1]

output-artifact:
  # Declare the names of pipeline output artifacts
  report-text
```