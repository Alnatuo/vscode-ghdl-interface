<h1 align="center"> GHDL Interface </h1>
This extension is an fix and update to the GHDL Interface extension. Install the GHDL Interface extension in VS Code and navigate to %USERPOFILE$\johannesbonk.ghdl-interface-1.1.2 and replace the files package.json, src/ghdlInterface.js and src/settings/Settings.js with the corresponding files from this repository.

## Requirements 
You will need to have [GHDL](https://github.com/ghdl/ghdl/releases) and [GTKWave](http://gtkwave.sourceforge.net/) installed on your system. Furthermore both must be set in your environment variables. 

## Usage 
**GHDL**
At present it is possible to invoke the following GHDL functions by either rightclicking at the editor or at the explorer on the specific file and then selecting the desired funtion. 

| Editor Option  | GHDL Function                  |
| -------------- | :----------------------------- |
| ghdl import    | `ghdl -i [import files]`       |
| ghdl analyze   | `ghdl -a [File]`               |
| ghdl elaborate | `ghdl -e [Unit]`               |
| ghdl make      | `ghdl -m [Unit]`               |
| ghdl run       | `ghdl -r [Unit] [export file]` |
| ghdl clear     | `ghdl -c`                      |
| ghdl remove    | `ghdl -r`                      |

In addition to that the GHDL analyze function offers you error highlighting in the editor. 

**GTKWave** 
To open your simulation files with GTKWave, simply rightclick on them (.ghw or .vcd file required) in the explorer and then select `gtkwave` 
## Keybindings 
It is also possible to invoke the GHDL functions via the following keybindings.

| Editor Option  | Windows          | Linux             | MacOS             |
| -------------- | :--------------- | :---------------- | :---------------- |
| ghdl import    | `ctrl + alt + i` | `shift + alt + i` | `shift + cmd + i` |
| ghdl analyze   | `ctrl + alt + a` | `shift + alt + a` | `shift + cmd + a` |
| ghdl elaborate | `ctrl + alt + l` | `shift + alt + e` | `shift + cmd + e` |
| ghdl make      | `ctrl + alt + m` | `shift + alt + m` | `shift + cmd + m` |
| ghdl run       | `ctrl + alt + r` | `shift + alt + r` | `shift + cmd + r` |
| ghdl quick run | `ctrl + alt + q` | `shift + alt + q` | `shift + cmd + q` |
| ghdl clear     | `ctrl + alt + c` | `shift + alt + c` | `shift + cmd + c` |
| ghdl remove    | `ctrl + alt + d` | `shift + alt + d` | `shift + cmd + d` |

## License
The extension is [licensed](LICENSE "license") under the MIT license.

