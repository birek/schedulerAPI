#How does it work?

it uses "lsblk" command to determine disks in system

it prints content of files in /sys/block/$disk/queue

for scheduler change it echoes given value to /sys/block/$disk/queue/scheduler

#How set env

wget http://nodejs.org/dist/v0.10.35/node-v0.10.35-linux-x64.tar.gz

tar -zxvf node-v0.10.35-linux-x64.tar.gz -C /opt

export PATH=$PATH:/opt/node-v0.10.35-linux-x64/bin/

#in project's workspace
npm install

sudo node scheduler.js



#Examples

PUT uses singular (scheduler)

GET uses plural (schedulers)

1. List all disks and params

  http://YOUR_IP:8888/disks/

2. Check params of sda drive

  http://YOUR_IP:8888/disks/sda/

  OUTPUT:
  {
    "fifo_batch": "16",
    "front_merges": "1",
    "writes_starved": "2",
    "write_expire": "5000",
    "read_expire": "500",
    "schedulers": [
    {
      "name": "noop",
      "status": "non-active"
      },
      {
        "name": "anticipatory",
        "status": "non-active"
        },
        {
          "name": "[deadline]",
          "status": "active"
          },
          {
            "name": "cfq",
            "status": "non-active"
          }
          ],
          "undefined": ""
  }

3. Check ALL available schedulers for sda drive

  http://YOUR_IP:8888/disks/sda/schedulers/

4. Set "noop" scheduler for sda drive. Do notice that request use singular form "scheduler" not "schedulers"

  curl -X PUT http://localhost:8888/disks/sda/scheduler/noop

  [maciek@localhost ~]$ curl -X PUT http://localhost:8888/disks/sda/scheduler/noop
  Scheduler changed to noop
  [maciek@localhost ~]$ cat /sys/block/sda/queue/scheduler
  [noop] anticipatory deadline cfq

You can use firefox plugin for making HTTP request and verifing response
https://addons.mozilla.org/pl/firefox/addon/httprequester/
