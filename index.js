const {exec} = require('child_process');
const {promisify} = require('util');
const deviceModule = require('aws-iot-device-sdk').device;

const config = require('./config');

const device = deviceModule({
   keyPath: 'raspberrypi.private.key',
   certPath: 'raspberrypi.cert.pem',
   caPath: 'root-CA.crt',
   clientId: config.clientId,
   baseReconnectTimeMs: 4000,
   keepalive: 300,
   protocol: 'mqtts',
   host: config.hostName
});

var timeout;
var count = 0;
const minimumDelay = 250;

device.subscribe('topic_2');

timeout = setInterval(async () => {
  const {stdout, stderr} = await promisify(exec)('vcgencmd measure_temp');
  const temp = parseFloat(stdout.replace(/temp=([0-9\.]*)'C/, '$1'));
  device.publish('topic_2', JSON.stringify({
    temprature: temp
  }));
}, 5000);

device
  .on('connect', function() {
    console.log('connect');
  });
device
  .on('close', function() {
    console.log('close');
  });
device
  .on('reconnect', function() {
    console.log('reconnect');
  });
device
  .on('offline', function() {
    console.log('offline');
  });
device
  .on('error', function(error) {
    console.log('error', error);
  });
device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });
