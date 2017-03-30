# On-Air
XMPP activated call light

![Web Interface](https://s3.amazonaws.com/bdm-files/On-Air/On-Air.png "On-Air Web Interface")

![On-Air Light](https://s3.amazonaws.com/bdm-files/On-Air/On-Air-light.jpg "On-Air Light")

**Requirements**
* Raspberry Pi
* Relay
* Busy Light
* two XMPP accounts
  * One for monitoring
  * Address of the account you want to monitor

**System Prep:**

Before installing this repo the following things must be done on the Pi

I have tested this on the Pi 2 and Pi 3. It runs 10x better on the Pi 3. This install guide assumes you already have SSH access enabled to your Pi.

* sudo su
* Next we are going to download the latest node bianaries for ARM.
  * For Pi 2:
    * ``` wget https://nodejs.org/dist/v7.8.0/node-v7.8.0-linux-armv6l.tar.xz ```
  * For Pi 3: 
    * ``` wget https://nodejs.org/dist/v7.8.0/node-v7.8.0-linux-armv7l.tar.xz ```
* Extract all the files to home directory
``` bash
tar -xvf node-v7.8.0-linux-armv7l.tar.xz (or the file you downloaded)
```
* Next copy the files into /usr/local/
``` bash
cp -R * /usr/local/
```
* We will be using GPIO PIN 17 to trigger the light. Set the PIN for output
``` bash
gpio export 17 out
```
* Create a directory for the project.
``` bash
cd /usr/local/
mkdir node
cd node
```
* Clone this repo into the node directory.
``` bash
git clone https://github.com/bdm1981/onair.git
```
* Install all the node modules
``` bash
cd onair
npm install
```
* Start the node process
``` bash
pm2 start process.json
```
* Now that everything is installed and running, we will configure PM2 to start On-Air when the Pi boots up.
``` bash
pm2 startup
pm2 save
```
**Usuage Instructions:**

Once On-Air is running, it needs to be configured with your XMPP settings.

1. Navigate to http://<IP Address>:3000/setup
2. Enter the username/password of the user that will be **monitoring** along with the XMPP server
3. Enter the XMPP address that will be **monitored**
4. Modify the keywords to your liking
5. Once the settings are saved, PM2 will restart the node process with the new settings.

**Wiring up the Light:**

_todo_

Thats it! Changing the status of your user to something containing one of your keywords, should trigger the light.

