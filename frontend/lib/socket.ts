import io from "socket.io-client";

let socket: any = null;

export function initSocket(token: string) {
  if (!socket) {
    socket = io(`http://localhost:4000`, {
      auth: {
        token,
      },
    });
  }
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}