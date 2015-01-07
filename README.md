wget http://nodejs.org/dist/v0.10.35/node-v0.10.35-linux-x64.tar.gz

tar -zxvf node-v0.10.35-linux-x64.tar.gz -C /opt

export PATH=$PATH:/opt/node-v0.10.35-linux-x64/bin/

#in project's workspace
npm install

sudo node scheduler.js



#Examples

1. List all disks and params
http://YOUR_IP:8888/disks/

2. Check params of sda drive
http://YOUR_IP:8888/disks/sda/

3. Check scheduler for sda drive
http://YOUR_IP:8888/disks/sda/scheduler/

4. Set "noop" scheduler for sda drive
curl -X PUT http://localhost:8080/disks/sda/scheduler/noop


You can use firefox plugin for making HTTP request and verifing response
https://addons.mozilla.org/pl/firefox/addon/httprequester/
