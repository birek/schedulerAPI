wget http://nodejs.org/dist/v0.10.35/node-v0.10.35-linux-x64.tar.gz
tar -zxvf node-v0.10.35-linux-x64.tar.gz -C /opt

export PATH=$PATH:/opt/node-v0.10.35-linux-x64/bin/

npm install

node scheduler.js
