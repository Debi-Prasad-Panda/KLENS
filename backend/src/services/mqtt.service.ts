import mqtt from 'mqtt';
import { pool } from '../config/database.js';
import { WebSocketServer } from 'ws';

let client: mqtt.MqttClient;
let wss: WebSocketServer;

export function initMQTT(wsServer: WebSocketServer) {
  wss = wsServer;
  client = mqtt.connect(process.env.MQTT_BROKER_URL!);

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('sensors/#');
  });

  client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());
    
    await pool.query(
      'INSERT INTO iot_readings (sensor_id, reading_type, value, unit) VALUES ($1, $2, $3, $4)',
      [data.sensorId, data.type, data.value, data.unit]
    );

    const sensor = await pool.query('SELECT * FROM iot_sensors WHERE sensor_id = $1', [data.sensorId]);
    if (sensor.rows[0]) {
      const thresholds = sensor.rows[0].thresholds;
      if (thresholds && data.value > thresholds[data.type]) {
        broadcastAlert({
          sensorId: data.sensorId,
          type: data.type,
          value: data.value,
          threshold: thresholds[data.type],
          message: `${data.type} exceeds threshold`
        });
      }
    }

    broadcastReading(data);
  });
}

function broadcastReading(data: any) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'reading', data }));
    }
  });
}

function broadcastAlert(alert: any) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'alert', data: alert }));
    }
  });
}

export function publishReading(sensorId: string, type: string, value: number, unit: string) {
  client.publish(`sensors/${sensorId}`, JSON.stringify({ sensorId, type, value, unit }));
}
