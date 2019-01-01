import { Device } from "device";

let dev = new Device('http://localhost:9000');

async function poll() {
  let state = await dev.getState();
  console.log('state', state);
  // fire DOM event or something
  poll();
}
