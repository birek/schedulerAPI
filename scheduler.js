var express = require('express')
var exec = require('child_process').exec,
child;
var app = express()

PATH_SYSFS = "/sys/block/"


function getDiskParamsValues(disk, paramNames, callback) {
  path = PATH_SYSFS + disk.name + "/queue"
  params = []
  paramNames.forEach(function(paramName) {
    exec('cat ' + path + '/' + paramName, function(err, stdout, stderr) {
      if (stdout != null) {
        param = {}
        param[paramName] = stdout.replace(/\s/g, '')
        params.push(param)
      }
      if (params.length == paramNames.length) callback(params)
      })
    })
  }

  function getDiskParamsNames(name, callback) {
    path = PATH_SYSFS + name + "/queue/"
    exec('find ' + path + ' -type f -printf "%P "', function(err, stdout, stderr) {
      disk = {
        "name": name,
        "params": []
      }
      paramsNames = stdout.split(' ')
      getDiskParamsValues(disk, paramsNames, function(params) {
        console.log("calling cb for adding disk ")
        disk.params = params
        callback(disk)
      })
    })

  }

  function getDisksNames(cmd, callback) {
    disks = []

    exec(cmd, function(error, stdout, stderr) {
      disksInOs = stdout.split('\n')
      for (i = 0; i < disksInOs.length; i++) {
        if (disksInOs[i] != '') {
          getDiskParamsNames(disksInOs[i], function(disk) {
            disks.push(disk)
            callback(JSON.stringify(disks, null, 2))
          })
        }
      }
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    })
  }
  app.get('/disks', function(req, res) {
    getDisksNames("lsblk -l -o TYPE,NAME | awk '/disk/  { print $2 }'", function(output) {
      res.send(output)
    })
  })
  app.get('/disks/:id', function(req, res) {
    getDiskParamsNames(req.params.id, function(output) {
      res.send(output.params)
    })
  })
  app.get('/disks/:id/:param', function(req, res) {
    params = []
    params.push(req.params.param)
    getDiskParamsValues({
      "name": req.params.id
    }, params, function(output) {
      res.send(output)
    })
  })
  var server = app.listen(8888, function() {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

  })
