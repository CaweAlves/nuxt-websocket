import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default defineNuxtPlugin((nuxtApp) => {
  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    connectHeaders: {
      login: 'user',
      passcode: 'password'
    },
    debug: (str) => console.log(str),
    reconnectDelay: 1000, // Reduzido para primeira tentativa
    maxReconnectAttempts: 5,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('✅ Conexão estabelecida com sucesso');
    },
    onDisconnect: (frame) => {
      console.log('❌ Conexão perdida:', frame);
    }
  });

  let reconnectAttempts = 0;
  client.onStompError = (frame) => {
    reconnectAttempts++;
    if (reconnectAttempts <= client.maxReconnectAttempts) {
      const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000);
      setTimeout(() => client.activate(), delay);
    } else {
      console.error('⚠️ Máximo de tentativas de reconexão alcançado');
    }
  };

  client.activate();
  nuxtApp.provide('stompClient', client);
});