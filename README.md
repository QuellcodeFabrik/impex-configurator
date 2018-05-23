# Impex Generator

The Impex Generator modifies existing impex files by replacing configuration values
that are defined in a configuration file.

## Pre-requisites

To be able to execute the script a Node.js environment must be installed and configured
on the user's system. You can check if Node.js is available by executing `ǹode -v` in
a console window.

## Instructions

### Creating a configuration file

First a `parser.config` must be created in the same directory where the app.js script
is located and will be started from. In this `parser.config` you define all configuration
parameters that must be overwritten in the existing impex files. A configuration definition
looks as follows.

```
$my_paramter=My Parameter Value
```

Be aware that each parameter has to start with a $ and must have an assignment (=).

### Run the script

Before running the script the `parser.config` file and the `app.js` file must be placed
at the root directory that contains all impex files to be adapted. The impex files can
also reside in sub-folders of that root directory.

Then open a console, change to the aforementioned root directory and execute the Node.js
script.

```
$ node app
```

The script will print out the results and give an overview of what it did.