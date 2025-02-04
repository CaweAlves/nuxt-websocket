<script setup>
import { ref } from 'vue';
import { useNuxtApp } from '#app';

if (typeof globalThis === 'undefined') {
  const global = globalThis;
  global.global = global;
}

const username = ref('');
const isChatting = ref(false);
const messages = ref([]);
const newMessage = ref('');
const connecting = ref(false);

const { $stompClient } = useNuxtApp();
function connect(event) {
    console.log('Formulário conectando:', event)
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    
    if (!username.value.trim()) {
        console.warn('Username é obrigatório');
        return;
    }

    $stompClient.onConnect = () => {
        connecting.value = false;
        $stompClient.subscribe('/topic/public', (msg) => {
            messages.value.push(JSON.parse(msg.body));
            console.log(JSON.parse(msg.body));
        });
    };
    
    $stompClient.onStompError = (error) => {
        console.error('STOMP error: ', error);
        connecting.value = false;
    };
    
    $stompClient.activate();
    
    const chatMessage = {
        sender: username.value,
        content: `${username.value} joined the chat`,
        type: 'JOIN'
    };
    
    $stompClient.publish({
        destination: '/app/addUser',
        body: JSON.stringify(chatMessage),
    });
    
    isChatting.value = true;
    connecting.value = true;
};

const sendMessage = () => {
    if (newMessage.value.trim() && $stompClient.active) {
        const chatMessage = {
            sender: username.value,
            content: newMessage.value,
            type: 'CHAT',
        };

        $stompClient.publish({
            destination: '/app/sendMessage',
            body: JSON.stringify(chatMessage),
        });

        newMessage.value = '';
    }
};
</script>

<template>
    <div>
        <div v-if="!isChatting">
            <h1>Digite seu nome de usuário para entrar na sala de bate-papo</h1>
            <div id="a">
                <form @submit.prevent.stop="connect($event)">
                    <input v-model="username" type="text" placeholder="Nome de usuário" autocomplete="off"
                        class="form-control" />
                    <button type="submit" class="accent username-submit">Começar a conversar</button>
                </form>
            </div>
        </div>
        <div v-else>
            <div>
                <h2>Spring WebSocket Chat Demo</h2>
            </div>
            <div v-if="connecting">Conectando...</div>
            <ul>
                <li v-for="(msg, index) in messages" :key="index">{{ msg.content }}</li>
            </ul>
            <form v-on:submit.prevent="sendMessage">
                <input v-model="newMessage" type="text" placeholder="Digite uma mensagem..." autocomplete="off"
                    class="form-control" />
                <button type="submit" class="primary">Enviar</button>
            </form>
        </div>
    </div>
</template>


<style scoped>
.form-control {
    width: 100%;
    padding: 8px;
    margin-bottom: 8px;
}

button {
    padding: 8px 16px;
    margin-top: 8px;
    cursor: pointer;
}

ul {
    list-style: none;
    padding: 0;
}

.hidden {
    display: none;
}
</style>