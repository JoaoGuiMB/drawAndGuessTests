import { Socket as ClientSocket } from "socket.io-client";

export default function waitFor(emitter: ClientSocket, event: string) {
  return new Promise<any>((resolve) => {
    emitter.once(event, resolve);
  });
}
