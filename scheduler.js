var express = require('express')
var exec = require('child_process').exec,
child;
var bodyParser = require('body-parser');

var app = express()


var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.json());


PATH_SYSFS = "/sys/block/"

function setScheduler(disk,scheduler,callback)
{
  exec('echo '+scheduler+' > /sys/block/'+disk+'/queue/scheduler', function(err, stdout, stderr) {
    if(!stderr) callback("Scheduler changed to "+scheduler)
    else callback(stderr)
   })
}
function getSchedulers(content,callback)
{
  schedulers = []
  content.trim().split(" ").forEach(function(s)
  {
    scheduler = {}
    if(s.search(/\[/) >= 0 ) { scheduler.name = s; scheduler.status='active' }
    else { scheduler.name=s; scheduler.status='non-active' }
    schedulers.push(scheduler)
  })
  callback(schedulers)

}
function getDiskParamsValues(disk, paramsNames, callback) {
  path = PATH_SYSFS + disk.name + "/queue"
  params = {}
  paramsNames.forEach(function(paramName) {
    exec('cat ' + path + '/' + paramName, function(err, stdout, stderr) {
      if (paramName==null || stdout==null) { callback(params) }
      else {
        if(paramName == "scheduler"){
          getSchedulers(stdout,function(schedulers) {
            params.schedulers = schedulers
          })
        }
        else
        {
          stdout = stdout.replace(/\s/g, '')
          iosched = paramName.split('/')
          ioschedName = iosched[1]
          params[ioschedName] = stdout
        }
      }
      })
    })
  }

  function getDiskParamsNames(name, callback) {
    path = PATH_SYSFS + name + "/queue/"
    exec('find ' + path + ' -type f -regex \'.*scheduler\\|.*\/iosched.*\' -printf "%P\\n"', function(err, stdout, stderr) {
      disk = {
        "name": name,
        "params" : null
      }
      paramsNames = stdout.split('\n')
      paramsNames.push(null)
      getDiskParamsValues(disk, paramsNames, function(params) {

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
  app.get('/disks/:id/schedulers', function(req, res) {
    param = []
    param.push("scheduler")
    param.push(null)
    getDiskParamsValues({"name": req.params.id}, param, function(output) {
      res.send(output)
    })
  })
  app.put('/disks/:id/:param/:value', function (req, res) {
   setScheduler(req.params.id,req.params.value,function(output)
   {
     res.send(output)
   })
  })

  var server = app.listen(8888, function() {

    var host = server.address().address
    var port = server.address().port

    console.log('Scheduler API is available at http://%s:%s', host, port)

  })
