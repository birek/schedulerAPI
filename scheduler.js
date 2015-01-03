var express = require('express')
var exec = require('child_process').exec,
    child;
var app = express()

function getDiskParamValue(path,paramName,callback)
{
        }
function getDiskParams(disk,path,paramNames,callback)
{
	params = []
	paramNames.forEach(function(paramName)
	{
		exec('cat '+path+'/'+paramName,function(err,stdout,stderr) {
			param = { "id":paramName,"value":stdout}
			params.push(param)
			if(params.length == paramNames.length)
				callback(params)
                })
	})
} 
function getDeviceDetails(devices,diskName,callback)
{
	PATH_SYSFS="/sys/block/"+diskName+"/queue"
	exec('find '+PATH_SYSFS+' -type f -printf "%P "',function(err,stdout,stderr)
	{
		disk = { "name":diskName,"params":[] }
		listOfTunables = stdout.split(' ')	
			getDiskParams(disk,PATH_SYSFS,listOfTunables,function(params) {
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
			console.log(disk)
			devices.push(disk)
   			callback(devices)
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

var server = app.listen(8888, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})

