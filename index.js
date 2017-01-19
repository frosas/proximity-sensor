const noble = require('noble');
const Events = require('events');

const FITBIT_UUID = 'c271946d54da47799404a52e2eb38fb6';

class Peripheral {
    constructor(uuid) {
        this.events = new Events;
        
        noble.on('stateChange', state => {
            if (state === 'poweredOn') noble.startScanning();
        });
        
        noble.on('discover', peripheral => {
            if (peripheral.uuid !== uuid) return;
            this.events.emit('discover');
            peripheral.on('warning', message => console.log('warning', message));
            peripheral.connect(error => {
                if (error) return console.error(error)
                this.events.emit('connect');
                const updateRssiRepeatedly = () => {
                    peripheral.updateRssi((error, rssi) => {
                        updateRssiRepeatedly();
                        if (error) return console.error(error)
                        this.events.emit('rssi', rssi);
                    });
                };
                updateRssiRepeatedly();
            });
        });
    }
}

const fitbit = new Peripheral(FITBIT_UUID);
fitbit.events.on('discover', () => console.log('discovered'));
fitbit.events.on('connect', () => console.log('connected'));
fitbit.events.on('rssi', rssi => console.log('rssi', rssi));
