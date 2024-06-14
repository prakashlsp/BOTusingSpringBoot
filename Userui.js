var stompClient = null;
var privateChats = new Map();
var publicChats = [];
var tab = "CHATROOM";
var userData = {
    username: '',
    receivername: '',
    connected: false,
    message: ''
};

function connect() {
    let Sock = new SockJS('http://10.10.10.126:8080/ws');
    stompClient = Stomp.over(Sock);
    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    userData.connected = true;
    document.getElementById('register').style.display = 'none';
    document.getElementById('chat-box').style.display = 'flex';
    stompClient.subscribe('/chatroom/public', onMessageReceived);
    stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
    userJoin();
    notifyUserJoin();
}

function userJoin() {
    var chatMessage = {
        senderName: userData.username,
        status: "JOIN"
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
}

function onMessageReceived(payload) {
    var payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
        case "JOIN":
            break;
        case "MESSAGE":
            publicChats.push(payloadData);
            updateChatMessages();
            break;
    }
}

function onPrivateMessage(payload) {
    var payloadData = JSON.parse(payload.body);
    console.log("Private message received: ", payloadData);
    if (payloadData.senderName !== userData.username) {
        if (!privateChats.has(payloadData.senderName)) {
            privateChats.set(payloadData.senderName, []);
        }
        privateChats.get(payloadData.senderName).push(payloadData);
        if (tab === payloadData.senderName) {
            updateChatMessages();
        }
        updateMemberList();
    }
}

function onError(err) {
    console.error("Connection error: ", err);
}

function handleMessage(event) {
    userData.message = event.target.value;
}

function sendMessage() {
    if (stompClient) {
        var chatMessage = {
            senderName: userData.username,
            message: userData.message,
            status: "MESSAGE"
        };
        if (tab === "CHATROOM") {
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
        } else {
            chatMessage.receiverName = tab;
            privateChats.get(tab).push(chatMessage);
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
        }
        userData.message = '';
        document.getElementById('message-input').value = '';
        updateChatMessages();
    }
}

function setTab(newTab) {
    tab = newTab;
    document.querySelectorAll('.member').forEach(el => el.classList.remove('active'));
    document.getElementById(tab + '-tab').classList.add('active');
    updateChatMessages();
}

function updateChatMessages() {
    var messages = tab === "CHATROOM" ? publicChats : privateChats.get(tab) || [];
    var chatMessagesElem = document.getElementById('chat-messages');
    chatMessagesElem.innerHTML = '';
    messages.forEach(chat => {
        var messageElem = document.createElement('div');
        messageElem.className = `message ${chat.senderName === userData.username ? 'self' : ''}`;
        messageElem.innerHTML = `
            ${chat.senderName !== userData.username ? `<div class="avatar">${chat.senderName}</div>` : ''}
            <div class="message-data">${chat.message}</div>
            ${chat.senderName === userData.username ? `<div class="avatar self">${chat.senderName}</div>` : ''}
        `;
        chatMessagesElem.appendChild(messageElem);
    });
    chatMessagesElem.scrollTop = chatMessagesElem.scrollHeight;
}

function updateMemberList() {
    var memberListElem = document.getElementById('member-list');
    memberListElem.innerHTML = '';
    privateChats.forEach((_, name) => {
        memberListElem.innerHTML += `<li onclick="setTab('${name}')" class="member" id="${name}-tab">${name}</li>`;
    });
}

function registerUser() {
    userData.username = document.getElementById('username').value.trim();
    if (userData.username) {
        connect();
    }
}
function notifyUserJoin() {
var joinMessage = {
senderName: userData.username,
receiverName: userData.username,
status: "JOIN"
};
stompClient.send("/app/user-join", {}, JSON.stringify(joinMessage));
}

document.getElementById('message-input').addEventListener('input', handleMessage);