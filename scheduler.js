var express = require('express')
var exec = require('child_process').exec,
    child;
var app = express()

var output
function getJSONfromSYSFS(param,callback)
{
	exec('cat '+PATH_SYSFS,function(err,stdout,stderr) {
		properties = stdout.split('\/')
		schedulersJSON = JSON.stringify(schedulers)
		callback({properties: { 'name':param,
				   'scheduler':schedulersJSON } })
	})
}
function getTunablesValues(param,callback)
{
	output = []
	for(i=0;i<param.lenght;i++)
		getJSONfromSYSFS(param[i],callback)
}
function getDeviceDetails(param,callback)
{
	PATH_SYSFS="/sys/block/"+param
	exec('find '+PATH_SYSFS+' -type f -printf "%P\n"',function(err,stdout,stderr)
	{
		listOfTunables = stdout.split('\n')	
		getTunablesValues(listOfTunables,callback)
	})

}
function getDevices(param,callback)
{ 
    exec(param,function (error, stdout, stderr) {
	devices = stdout.split('\n')
	for(i=0;i<devices.length;i++)
	{
		if(devices[i]!='')
		getDeviceDetails(devices[i],callback)
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

