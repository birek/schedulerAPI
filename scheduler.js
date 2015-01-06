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
    if(stderr!=null) callback(stderr)
    callback("Scheduler changed to "+scheduler)
    })
}
function getDiskParamsValues(disk, paramsNames, callback) {
  path = PATH_SYSFS + disk.name + "/queue"
  params = {}
  paramsNames.forEach(function(paramName) {
    exec('cat ' + path + '/' + paramName, function(err, stdout, stderr) {
      if (paramName==null || stdout==null) { callback(params) }
      else {
        stdou = stdout.replace(/\s/g, '')
        if(paramName == "scheduler"){
          pattern = /\[\w*\]/
          params[paramName] = pattern.exec(stdout)[0]
          //console.log(pattern.exec(stdout))
        }
        else if(paramName.split('/').length > 1)
        {
          nestedParamsGroup = paramName.split('/')
          nestedParamName = nestedParamsGroup[1]
          param = {}
          param[nestedParamName] = stdout
          if(!params[nestedParamsGroup[0]]) params[nestedParamsGroup[0]] = []
          params[nestedParamsGroup[0]].push(param)
        }
        else  params[paramName] = stdout
      }
      })
    })
  }

  function getDiskParamsNames(name, callback) {
    path = PATH_SYSFS + name + "/queue/"
    exec('find ' + path + ' -type f -printf "%P\\n"', function(err, stdout, stderr) {
      disk = {
        "name": name,
        "params" : null
      }
      paramsNames = stdout.split('\n')
      paramsNames.push(null)
      getDiskParamsValues(disk, paramsNames, function(params) {
        //console.log("calling cb for adding disk ")
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
        //console.log('exec error: ' + error);
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
    param = []
    param.push(req.params.param)
    param.push(null)
    getDiskParamsValues({"name": req.params.id}, param, function(output) {
      res.send(output)
    })
  })
  app.put('/disks/:id/:param/:value', function (req, res) {
  //  res.send('Got a PUT request at /disk/'+req.params.id+' for setting '+req.params.param + ' to '+req.params.value);
   setScheduler(req.params.id,req.params.value,function(output)
   {
     res.send(output)
   })
  })
/*  app.put('/disks/:id',urlencodedParser,function(res,req){
    if (!req.body) return res.sendStatus(400)
      res.send('welcome, ' + req.body)
  })*/
  var server = app.listen(8888, function() {

    var host = server.address().address
    var port = server.address().port

    console.log('Scheduler API is available at http://%s:%s', host, port)

  })
