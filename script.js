document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const chatScreen = document.getElementById('chat-screen');
    const registrationForm = document.getElementById('registration-form');
    const usernameInput = document.getElementById('username');
    const avatarUrlInput = document.getElementById('avatar-url');
    const logoutButton = document.getElementById('logout-button');
    const messagesContainer = document.getElementById('messages-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const backgroundColorPicker = document.getElementById('background-color-picker');

    let currentUser = null;
    let messages = [];

    // --- Utility Functions ---

    function saveToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getFromLocalStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    function generateUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // --- UI Functions ---

    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function renderMessage(message) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper');
        messageWrapper.dataset.id = message.id; // Store ID for deletion

        const isSent = message.senderId === currentUser.id;
        if (isSent) {
            messageWrapper.classList.add('sent');
        } else {
            messageWrapper.classList.add('received');
        }

        const avatarImg = document.createElement('img');
        avatarImg.classList.add('message-avatar');
        avatarImg.src = message.avatarUrl;
        avatarImg.alt = message.senderName;
        avatarImg.onerror = () => {
            avatarImg.src = 'https://via.placeholder.com/32?text=NA'; // Fallback avatar
        };

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');

        const messageText = document.createElement('p');
        messageText.classList.add('message-text');
        messageText.textContent = message.text;

        const messageTime = document.createElement('span');
        messageTime.classList.add('message-time');
        messageTime.textContent = message.timestamp;

        messageBubble.appendChild(messageText);
        messageBubble.appendChild(messageTime);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-message-button');
        deleteButton.innerHTML = '&times;'; // Unicode times symbol
        deleteButton.title = 'Delete Message';
        deleteButton.addEventListener('click', () => deleteMessage(message.id));

        if (isSent) {
            // For sent messages, avatar and delete button are on the right
            messageWrapper.appendChild(messageBubble);
            messageWrapper.appendChild(avatarImg);
            messageWrapper.appendChild(deleteButton);
        } else {
            // For received messages, avatar is on the left, delete button is hidden
            messageWrapper.appendChild(avatarImg);
            messageWrapper.appendChild(messageBubble);
            // Hide delete button for received messages for simplicity, could be an option
            deleteButton.style.display = 'none';
            messageWrapper.appendChild(deleteButton); // Still append but hide
        }

        messagesContainer.appendChild(messageWrapper);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll to bottom
    }

    function renderMessages() {
        messagesContainer.innerHTML = ''; // Clear existing messages
        messages.forEach(renderMessage);
    }

    function loadChat() {
        currentUser = getFromLocalStorage('dearkChatUser');
        if (currentUser) {
            messages = getFromLocalStorage('dearkChatMessages') || [];
            showScreen(chatScreen);
            renderMessages();
            applySavedBackgroundColor();
        } else {
            showScreen(loginScreen);
        }
    }

    function applySavedBackgroundColor() {
        const savedColor = getFromLocalStorage('dearkChatBackground');
        if (savedColor) {
            messagesContainer.style.backgroundColor = savedColor;
        }
    }

    // --- Event Handlers ---

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const avatarUrl = avatarUrlInput.value.trim();

        if (username && avatarUrl) {
            currentUser = {
                id: generateUniqueId(),
                name: username,
                avatar: avatarUrl
            };
            saveToLocalStorage('dearkChatUser', currentUser);
            loadChat();
        } else {
            alert('Please enter your name and avatar URL.');
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('dearkChatUser');
        localStorage.removeItem('dearkChatMessages');
        localStorage.removeItem('dearkChatBackground');
        currentUser = null;
        messages = [];
        usernameInput.value = '';
        avatarUrlInput.value = '';
        messagesContainer.style.backgroundColor = 'var(--ios-gray-light)'; // Reset background
        showScreen(loginScreen);
    });

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();

        if (messageText && currentUser) {
            const newMessage = {
                id: generateUniqueId(),
                senderId: currentUser.id,
                senderName: currentUser.name,
                avatarUrl: currentUser.avatar,
                text: messageText,
                timestamp: getCurrentTime()
            };
            messages.push(newMessage);
            saveToLocalStorage('dearkChatMessages', messages);
            renderMessage(newMessage); // Render just the new message
            messageInput.value = '';
            messageInput.style.height = 'auto'; // Reset textarea height
        }
    });

    messagesContainer.addEventListener('click', (e) => {
        // This makes message bubbles clickable for future features,
        // or to allow selection etc. Not strictly needed for core functionality.
        if (e.target.closest('.message-bubble')) {
            // console.log('Message bubble clicked:', e.target.closest('.message-bubble').textContent);
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });

    function deleteMessage(id) {
        messages = messages.filter(msg => msg.id !== id);
        saveToLocalStorage('dearkChatMessages', messages);
        renderMessages(); // Re-render all messages to reflect deletion
    }

    backgroundColorPicker.addEventListener('click', () => {
        const newColor = prompt('Enter a new background color (e.g., #f0f0f0, lightblue, rgba(0,0,0,0.1)):');
        if (newColor) {
            messagesContainer.style.backgroundColor = newColor;
            saveToLocalStorage('dearkChatBackground', newColor);
        }
    });

    // Initial load
    loadChat();
});
