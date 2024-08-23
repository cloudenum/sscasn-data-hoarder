# sscasn-data-hoarder
CLI Tool to fetch data from bkn

```
$ export MONGODB_CONNECTION_STRING=<connection_string>
$ sdh --help
Usage: sdh [options]

Options:
  --kode-pendidikan <kode>   Kode/ID Pendidikan/Jurusan
  --instansi-id <id>         ID Instansi
  -u, --username <username>  MongoDB Username, password will be prompted
  -d, --database <name>      Database Name (default: "cpns")
  --with-details             Get details for each Formasi (default: false)
  -h, --help                 display help for command
```
