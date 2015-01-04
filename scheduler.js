var express = require('express')
var exec = require('child_process').exec,
    child;
var app = express()

PATH_SYSFS="/sys/block/"

function getDiskParams(disk,paramNames,callback)
{
	path = PATH_SYSFS+disk.name+"/queue"
	params = []
	paramNames.forEach(function(paramName)
	{
		exec('cat '+path+'/'+paramName,function(err,stdout,stderr) {
      if(stdout!=null) {
      param = {}
			param[paramName] = stdout.replace(/\s/g, '')
			params.push(param)
			if(params.length == paramNames.length)
				callback(params)
      }})
	})
}
function getDeviceDetails(devices,diskName,callback)
{
	path = PATH_SYSFS+diskName+"/queue/"
	exec('find '+path+' -type f -printf "%P "',function(err,stdout,stderr)
	{
		disk = { "name":diskName,"params":[] }
		listOfTunables = stdout.split(' ')

			getDiskParams(disk,listOfTunables,function(params) {
				console.log("calling cb for adding disk ")
				disk.params = params
				callback(disk)
			})
	})

}
function getDevices(param,callback)
{
    devices = []

    exec(param,function (error, stdout, stderr) {
	disks = stdout.split('\n')
	for(i=0;i<disks.length;i++)
	{
		if(disks[i]!='')
		{
			getDeviceDetails(devices,disks[i],function(disk) {
			devices.push(disk)
   			callback(JSON.stringify(devices,null,2))
			 })
		}
	}
    if (error !== null) {
      console.log('exec error: ' + error);
    }
})
}
app.get('/devices', function (req, res) {
  getDevices("lsblk -l -o TYPE,NAME | awk '/disk/  { print $2 }'",function(output){
    res.send(output)
  })
})
app.get('/devices/:id', function (req, res) {
  getDeviceDetails(null,req.params.id,function(output){
    res.send(output.params)
  })
})
app.get('/devices/:id/:param', function (req, res) {
  getDiskParams({"name":req.params.id},req.params.param,function(output){
    res.send(output.params)
  })
})
var server = app.listen(8888, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
