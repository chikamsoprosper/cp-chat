// Notification permission
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}
function showNotification(title, body) {
    if ("Notification" in window &&
        Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: "images/cp-logo.jpeg"
        });
    }
}
let replyMessage = "";
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
// Login Page
let loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
    loginBtn.addEventListener("click", function () {
        window.location.href = "home.html";
    });
}
// Chat Page
let backBtn = document.getElementById("backBtn");
let sendBtn = document.getElementById("sendBtn");
let messageInput = document.getElementById("messageInput");
let forwarded = localStorage.getItem("forwardMessage");
if (forwarded && messageInput) {
    messageInput.value = forwarded;
    localStorage.removeItem("forwardMessage");
}
let messages = document.getElementById("messages");
let socket;
if (messages) {
    socket = io("https://cp-chat.onrender.com");
	console.log("socket created:", socket);
    socket.on("chat message", function (text) {
        let newMessage = document.createElement("div");
        newMessage.className = "received";
        newMessage.innerHTML = `
            <div class="message-text">${text}</div>
        `;
		messages.appendChild(newMessage);
        messages.scrollTop = messages.scrollHeight;
    });
}
if (backBtn) {
    backBtn.addEventListener("click", function () {
        window.location.href = "home.html";
    });
}
if (sendBtn) {
    sendBtn.addEventListener("click", function () {
        let text = messageInput.value.trim();
        if (text === "") {
            return;
        }
        let newMessage = document.createElement("div");
        newMessage.className = "sent";
		let pressTimer;
let now = new Date();
let hours = now.getHours();
let minutes = now.getMinutes().toString().padStart(2,"0");
let period = hours >= 12 ? "PM" : "AM";
hours = hours % 12;
if (hours === 0) {
    hours = 12;
}
newMessage.innerHTML =
    `
	${replyMessage ?  `<div
	class="reply-box">${replyMessage}</div>` : ""}
    <div class="message-text">${text}</div>
    <div class="message-info">
        ${hours}:${minutes} ${period}
        <span class="tick">✓</span>
    </div>
    <div class="reaction"></div>
    `;
	newMessage.addEventListener("dblclick", function () {
    let emoji = prompt("Choose a reaction:\n❤️ 😂 👍 😮 😢 😡");
    if (emoji) {
        newMessage.querySelector(".reaction").textContent = emoji;
    }
});
newMessage.addEventListener("click", function (event) {
    if (!event.shiftKey) return; 
        if (newMessage.classList.contains("starred")) {
            newMessage.classList.remove("starred");
            let star = newMessage.querySelector(".star");
            if (star) {
                star.remove();
            }
        } else {
            newMessage.classList.add("starred");
            let star = document.createElement("span");
            star.className = "star";
            star.textContent = "⭐";
            newMessage.appendChild(star);
        }
});
newMessage.addEventListener("mousedown", function () {
    pressTimer = setTimeout(function () {
        let option = prompt(
            "Choose:\n1 = Edit\n2 = Delete\n3 = Copy\n4 = Forward"
        );
        if (option === "1") {
            let messageText = newMessage.querySelector(".message-text");
            let edited = prompt("Edit message:", messageText.textContent);
            if (edited !== null && edited.trim() !== "") {
                messageText.textContent = edited;
            }
        }
        if (option === "2") {
            if (confirm("Delete this message?")) {
                newMessage.remove();
            }
        }
        if (option === "3") {
            let messageText = newMessage.querySelector(".message-text").textContent;
            navigator.clipboard.writeText(messageText);
            alert("Message copied!");
        }
        if (option === "4") {
            let messageText = newMessage.querySelector(".message-text").textContent;
            localStorage.setItem("forwardMessage", messageText);
            alert("Message forwarded!");
        }
    }, 700);
});
newMessage.addEventListener("mouseup", function () {
    clearTimeout(pressTimer);
});
newMessage.addEventListener("mouseleave", function () {
    clearTimeout(pressTimer);
});
newMessage.addEventListener("touchstart", function () {
    pressTimer = setTimeout(function () {
        let option = prompt(
            "Choose:\n1 = Reply\n2 = Edit\n3 = Delete\n4 = Copy\n5 = Forward"
        );
		if (option === "1") {
    replyMessage = newMessage.querySelector(".message-text").textContent;
    alert("Replying to: " + replyMessage);
    }
        if (option === "2") {
            let messageText = newMessage.querySelector(".message-text");
            let edited = prompt("Edit message:", messageText.textContent);
            if (edited !== null && edited.trim() !== "") {
                messageText.textContent = edited;
            }
        }
        if (option === "3") {
            if (confirm("Delete this message?")) {
                newMessage.remove();
            }
        }
        if (option === "4") {
            let messageText = newMessage.querySelector(".message-text").textContent;
            navigator.clipboard.writeText(messageText);
            alert("Message copied!");
        }
        if (option === "5") {
            let messageText = newMessage.querySelector(".message-text").textContent;
            localStorage.setItem("forwardMessage", messageText);
            alert("Message forwarded!");
        }
    }, 700);
});
newMessage.addEventListener("touchend", function () {
    clearTimeout(pressTimer);
});
newMessage.addEventListener("mousedown", function (event) {
    if (event.ctrlKey) {
        newMessage.classList.toggle("selected");
    }
});
newMessage.addEventListener("click", function (event) {
    if (event.shiftKey) return; // Don't show info when starring
    let tick = newMessage.querySelector(".tick").textContent;
    let status = tick === "✓"
        ? "Sent"
        : tick === "✓✓"
        ? "Delivered"
        : "Read";
    alert(
        "Message Info\n\n" +
        "Time: " + hours + ":" + minutes + " " + period +
        "\nStatus: " + status
    );
});
    socket.emit("chat message", text);
		chatHistory.push({
    type: "text",
    text: text,
    time: `${hours}:${minutes} ${period}`
});
localStorage.setItem(
    "chatHistory",
    JSON.stringify(chatHistory)
);
		showNotification("cp chat", text);
		let tick = newMessage.querySelector(".tick");
setTimeout(function () {
    tick.textContent = "✓✓";
}, 1000);
setTimeout(function () {
    tick.textContent = "✓✓";
    tick.style.color = "#34B7F1";
}, 3000);
        messages.scrollTop = messages.scrollHeight;
        messageInput.value = "";
    });
}
let emojiBtn = document.getElementById("emojiBtn");
let emojiPicker = document.getElementById("emojiPicker");
if (emojiPicker && messageInput) {
    emojiPicker.querySelectorAll("span").forEach(function (emoji) {
        emoji.addEventListener("click", function () {
            messageInput.value += emoji.textContent;
            messageInput.focus();
            emojiPicker.classList.remove("show");
        });
    });
}
let attachBtn = document.getElementById("attachBtn");
let attachInput = document.getElementById("attachInput");
let cameraBtn = document.getElementById("cameraBtn");
if (emojiBtn && emojiPicker) {
    emojiBtn.addEventListener("click", function () {
emojiPicker.classList.toggle("show");
	});
}
if (attachBtn && attachInput) {
    attachBtn.addEventListener("click", function () {
        attachInput.click();
    });
}
const users = [
    {
        name: "Alex Johnson",
        username: "@alex",
        phone: "08012345678"
    },
    {
        name: "John Smith",
        username: "@john",
        phone: "08123456789"
    },
    {
        name: "Jane Wilson",
        username: "@jane",
        phone: "09012345678"
    }
];
let alexChat = document.getElementById("alexChat");
let johnChat = document.getElementById("johnChat");
if (alexChat) {
    alexChat.addEventListener("click", function (event) {
        if (event.button !== 0) return;
        window.location.href = "chat.html";
    });
}
if (johnChat) {
    johnChat.addEventListener("click", function (event) {
		if (event.button !== 0) return;
        window.location.href = "chat.html";
    });
}
let continueBtn = document.getElementById("continueBtn");
if (continueBtn) {
    continueBtn.addEventListener("click", function () {
        window.location.href = "home.html";
    });
}
let backHome = document.getElementById("backHome");
let searchUser = document.getElementById("searchUser");
let userList = document.getElementById("userList");
if (backHome) {
    backHome.addEventListener("click", function () {
        window.location.href = "home.html";
    });
}
function displayUsers(list) {
    userList.innerHTML = "";
    list.forEach(function(user) {
        let card = document.createElement("div");
        card.className = "user-card";
        card.innerHTML = `
            <img src="images/cp-logo.jpeg" class="user-photo" alt="Profile">
            <div class="user-details">
                <h3 style="color:black;">${user.name}</h3>
                <p style="color:#555;">${user.username}</p>
                <small style="color:#888;">${user.phone}</small>
            </div>
            <button class="add-btn">Add</button>
        `;
        let addButton = card.querySelector(".add-btn");
		card.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-btn")) {
        return;
    }
    localStorage.setItem("chatName", user.name);
localStorage.setItem("chatUsername", user.username);
window.location.href = "chat.html";
});
addButton.addEventListener("click", function () {
    addButton.textContent = "Added";
    addButton.style.background = "green";
    addButton.disabled = true;
});
        userList.appendChild(card);
    });
}
if(searchUser){
    displayUsers(users);
    searchUser.addEventListener("input",function(){
        let text = searchUser.value.toLowerCase();
        let result = users.filter(function(user){
            return user.name.toLowerCase().includes(text) ||
            user.username.toLowerCase().includes(text) ||
            user.phone.includes(text);
        });
        displayUsers(result);
    });
}
let chatName = document.getElementById("chatName");
let chatUsername = document.getElementById("chatUsername");
if (chatName && chatUsername) {
    chatName.textContent = localStorage.getItem("chatName") || "Unknown User";
    chatUsername.textContent = localStorage.getItem("chatUsername") || "@unknown";
}
let profileBtn = document.getElementById("profileBtn");
if (profileBtn) {
    profileBtn.addEventListener("click", function () {
        window.location.href = "profile.html";
    });
}
let editProfileBtn = document.getElementById("editProfileBtn");
if (editProfileBtn) {
    editProfileBtn.addEventListener("click", function () {
        window.location.href = "editprofile.html";
    });
}
let saveProfileBtn = document.getElementById("saveProfileBtn");
let profileImage = document.getElementById("profileImage");
let backProfile = document.getElementById("backProfile");
if (backProfile) {
    backProfile.addEventListener("click", function () {
        window.location.href = "profile.html";
    });
}
if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", function () {
        let newName = document.getElementById("newName").value;
        let newUsername = document.getElementById("newUsername").value;
        if (newName !== "") {
            localStorage.setItem("profileName", newName);
        }
        if (newUsername !== "") {
            localStorage.setItem("profileUsername", newUsername);
        }
        if (profileImage && profileImage.files.length > 0) {
            let reader = new FileReader();
            reader.onload = function () {
                localStorage.setItem("profileImage", reader.result);
                window.location.href = "profile.html";
            };
            reader.readAsDataURL(profileImage.files[0]);
            return;
        }
        window.location.href = "profile.html";
    });
}
let profileName = document.getElementById("profileName");
let profileUsername = document.getElementById("profileUsername");
if (profileName) {
    profileName.textContent =
        localStorage.getItem("profileName") || "Chikamso Prosper";
}
if (profileUsername) {
    profileUsername.textContent =
        localStorage.getItem("profileUsername") || "@chikamsopro";
}
let profilePhoto = document.querySelector(".profile-photo");
if (profilePhoto) {
    let savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
        profilePhoto.src = savedImage;
    }
}
let settingsBtn = document.getElementById("settingsBtn");
let backSettings = document.getElementById("backSettings");
let profileSetting = document.getElementById("profileSetting");
if (settingsBtn) {
    settingsBtn.addEventListener("click", function () {
        window.location.href = "settings.html";
    });
}
if (backSettings) {
    backSettings.addEventListener("click", function () {
        window.location.href = "home.html";
    });
}
if (profileSetting) {
    profileSetting.addEventListener("click", function () {
        window.location.href = "profile.html";
    });
}
let notificationsBtn = document.getElementById("notificationsBtn");
let backNotifications = document.getElementById("backNotifications");
if (notificationsBtn) {
    notificationsBtn.addEventListener("click", function () {
        window.location.href = "notifications.html";
    });
}
if (backNotifications) {
    backNotifications.addEventListener("click", function () {
        window.location.href = "settings.html";
    });
}
let aboutBtn = document.getElementById("aboutBtn");
let backAbout = document.getElementById("backAbout");
if (aboutBtn) {
    aboutBtn.addEventListener("click", function () {
        window.location.href = "about.html";
    });
}
if (backAbout) {
    backAbout.addEventListener("click", function () {
        window.location.href = "settings.html";
    });
}
let privacyBtn = document.getElementById("privacyBtn");
let backPrivacy = document.getElementById("backPrivacy");
if (privacyBtn) {
    privacyBtn.addEventListener("click", function () {
        window.location.href = "privacy.html";
    });
}
if (backPrivacy) {
    backPrivacy.addEventListener("click", function () {
        window.location.href = "settings.html";
    });
}
let callsBtn = document.getElementById("callsBtn");
let backCalls = document.getElementById("backCalls");
if (callsBtn) {
    callsBtn.addEventListener("click", function () {
        window.location.href = "calls.html";
    });
}
let contactsBtn = document.getElementById("contactsBtn");
if (contactsBtn) {
    contactsBtn.addEventListener("click", function () {
        window.location.href = "contacts.html";
    });
}
if (backCalls) {
    backCalls.addEventListener("click", function () {
        window.location.href = "home.html";
    });
}
let darkModeBtn = document.getElementById("darkModeBtn");
if (darkModeBtn) {
    darkModeBtn.addEventListener("click", function () {

        if (localStorage.getItem("theme") === "dark") {
            localStorage.setItem("theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
        }
        location.reload();
    });
}
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}
let endCallBtn = document.getElementById("endCallBtn");
if (endCallBtn) {
    endCallBtn.addEventListener("click", function () {
        window.location.href = "chat.html";
    });
}
let endVideoCallBtn = document.getElementById("endVideoCallBtn");
if (endVideoCallBtn) {
    endVideoCallBtn.addEventListener("click", function () {
        window.location.href = "chat.html";
    });
}
let voiceCallBtn = document.getElementById("voiceCallBtn");
let videoCallBtn = document.getElementById("videoCallBtn");
if (voiceCallBtn) {
    voiceCallBtn.addEventListener("click", function () {
        window.location.href = "voicecall.html";
    });
}
if (videoCallBtn) {
    videoCallBtn.addEventListener("click", function () {
        window.location.href = "videocall.html";
    });
}
let searchMessage = document.getElementById("searchMessage");
if (searchMessage) {
    searchMessage.addEventListener("input", function () {
        let text = searchMessage.value.toLowerCase();
        let allMessages = document.querySelectorAll(".sent, .received");
        allMessages.forEach(function(message){
            if(message.textContent.toLowerCase().includes(text)){
                message.style.display = "block";
            }else{
                message.style.display = "none";
            }
        });
    });
}
let chatItems = document.querySelectorAll(".chat-item");
console.log(chatItems.length);
chatItems.forEach(function(chat){
    chat.addEventListener("contextmenu", function(event){
        event.preventDefault();
        if(chat.classList.contains("pinned")){
            chat.classList.remove("pinned");
            let pin = chat.querySelector(".pin-icon");
            if(pin){
                pin.remove();
            }
        }else{
            chat.classList.add("pinned");
            let icon = document.createElement("span");
            icon.className = "pin-icon";
            icon.textContent = "📌";
            chat.appendChild(icon);
            let parent = chat.parentNode;
            parent.insertBefore(chat, parent.firstChild);
        }
    });
});
let typingStatus = document.getElementById("typingStatus");
if (messageInput && typingStatus) {
    messageInput.addEventListener("input", function () {
        typingStatus.textContent = "You are typing...";
        clearTimeout(window.typingTimer);
        window.typingTimer = setTimeout(function () {
            typingStatus.textContent = "";
        }, 1000);
    });
}
window.onload = function () {
    const chatPage = document.querySelector(".chat-page");
    if (chatPage) {
        chatPage.style.backgroundImage = "url('./wallpapers/wall2.jpg')";
        chatPage.style.backgroundSize = "cover";
        chatPage.style.backgroundPosition = "center";
        chatPage.style.backgroundRepeat = "no-repeat";
    }
};
let voiceBtn = document.getElementById("voiceBtn");
let mediaRecorder;
let audioChunks = [];
let recording = false;
if (voiceBtn) {
    voiceBtn.addEventListener("click", async function () {
        if (!recording) {
		let stream;
		try {
             stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
		}
		catch(error){
			alert("Microphone permission denied");
			return;
		}
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.ondataavailable = function (event) {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = function () {
                const audioBlob = new Blob(audioChunks, {
                    type: "audio/webm"
                });
                const audioURL = URL.createObjectURL(audioBlob);
                let audio = document.createElement("audio");
                audio.controls = true;
                audio.src = audioURL;
                let message = document.createElement("div");
                message.className = "sent";
                message.appendChild(audio);
                messages.appendChild(message);
            };
            mediaRecorder.start();
            recording = true;
            voiceBtn.textContent = "⏹";
        } else {
            mediaRecorder.stop();
            recording = false;
            voiceBtn.textContent = "🎤";
        }
    });
}
// ================= CAMERA FEATURE =================
let cameraInput = document.getElementById("cameraInput");
let preview = document.getElementById("imagePreview");
let previewImg = document.getElementById("previewImg");
let sendImageBtn = document.getElementById("sendImage");
let cancelImageBtn = document.getElementById("cancelImage");
let selectedImage = "";
// ===== Load forwarded image =====
let forwardedImage = localStorage.getItem("forwardImage");
if (forwardedImage) {
    selectedImage = forwardedImage;
    if (preview && previewImg) {
        previewImg.src = selectedImage;
        preview.classList.remove("hidden");
    }
    localStorage.removeItem("forwardImage");
}
if (attachInput) {
    attachInput.addEventListener("change", function () {
        let file = attachInput.files[0];
        if (!file) return;
        let fileMessage = document.createElement("div");
        fileMessage.className = "sent";
        let now = new Date();
        let hours = now.getHours() % 12 || 12;
        let minutes = now.getMinutes().toString().padStart(2, "0");
        let period = now.getHours() >= 12 ? "PM" : "AM";
        fileMessage.innerHTML = `
            <div class="file-message">
                📄 <strong>${file.name}</strong><br>
                ${(file.size / 1024).toFixed(1)} KB
            </div>
            <div class="message-info">
                ${hours}:${minutes} ${period}
                <span class="tick">✓</span>
            </div>
        `;
        messages.appendChild(fileMessage);
        messages.scrollTop = messages.scrollHeight;
        attachInput.value = "";
        let tick = fileMessage.querySelector(".tick");
        setTimeout(() => tick.textContent = "✓✓", 1000);
        setTimeout(() => {
            tick.textContent = "✓✓";
            tick.style.color = "#34B7F1";
        }, 3000);
        showNotification("CP Chat", "File sent");
    });
}
// Open camera
if (cameraBtn && cameraInput) {
    cameraBtn.addEventListener("click", function () {
        cameraInput.click();
    });
}
// Preview image
if (cameraInput) {
cameraInput.addEventListener("change", function () {
        let file = cameraInput.files[0];
        if (!file) return;
        let reader = new FileReader();
        reader.onload = function (event) {
            selectedImage = event.target.result;
		if (preview && previewImg) {
            previewImg.src = selectedImage;
            preview.classList.remove("hidden");
        };
	};
        reader.readAsDataURL(file);
    });
}
// Cancel preview
if (cancelImageBtn) {
    cancelImageBtn.addEventListener("click", function () {
	if (preview && previewImg) {
        preview.classList.add("hidden");
        previewImg.src = "";
	}
        cameraInput.value = "";
        selectedImage = "";
    });
}
// Send Image
if (sendImageBtn) {
    sendImageBtn.addEventListener("click", function () {
        if (selectedImage === "") return;
        let imageMessage = document.createElement("div");
        imageMessage.className = "sent";
        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes().toString().padStart(2, "0");
        let period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        if (hours === 0) {
            hours = 12;
        }
        imageMessage.innerHTML = `
            <img src="${selectedImage}" class="chat-image">
            <div class="message-info">
                ${hours}:${minutes} ${period}
                <span class="tick">✓</span>
            </div>
            <div class="reaction"></div>
        `;
		addImageActions(imageMessage);
		addExtraImageFeatures(imageMessage);
        messages.appendChild(imageMessage);
		showNotification("cp chat", "Image sent");
        messages.scrollTop = messages.scrollHeight;
		// Clear forwarded image after sending
localStorage.removeItem("forwardImage");
selectedImage = "";
        preview.classList.add("hidden");
        previewImg.src = "";
        cameraInput.value = "";
        selectedImage = "";
        let tick = imageMessage.querySelector(".tick");
});
}
// ================= IMAGE ACTIONS =================
function addImageActions(imageMessage){
    // React
    imageMessage.addEventListener("dblclick",function(){
        let emoji = prompt("Choose a reaction:\n❤️ 😂 👍 😮 😢 😡");
        if(emoji){
            imageMessage.querySelector(".reaction").textContent = emoji;
        }
    });
    // Star
    imageMessage.addEventListener("click",function(event){
        if(!event.shiftKey) return;
        if(imageMessage.classList.contains("starred")){
            imageMessage.classList.remove("starred");
            let star = imageMessage.querySelector(".star");
            if(star){
                star.remove();
            }
        }else{
            imageMessage.classList.add("starred");
            let star = document.createElement("span");
            star.className = "star";
            star.textContent = "⭐";
            imageMessage.appendChild(star);
        }
    });
    // Menu
    imageMessage.addEventListener("contextmenu",function(event){
        event.preventDefault();
        let option = prompt(
`Choose
1 = Delete
2 = Save
3 = Forward`
        );
        // Delete
        if(option==="1"){
            if(confirm("Delete image?")){
                imageMessage.remove();
            }
        }
        // Save
        if(option==="2"){
            let img=imageMessage.querySelector("img");
            let link=document.createElement("a");
            link.href=img.src;
            link.download="image.jpg";
            link.click();
        }
        // Forward
        if(option==="3"){
            localStorage.setItem(
                "forwardImage",
                imageMessage.querySelector("img").src
            );
            alert("Image forwarded!");
        }
    });
}
// ================= IMAGE REPLY + INFO + PIN =================
function addExtraImageFeatures(imageMessage){
    // Reply
    imageMessage.addEventListener("dblclick",function(event){
        if(event.altKey){
            replyMessage = "[📷 Photo]";
            alert("Replying to image");
        }
    });
    // Message Info
    imageMessage.addEventListener("click",function(){
        let tick = imageMessage.querySelector(".tick").textContent;
        let status = "";
        if(tick==="✓"){
            status="Sent";
        }else if(tick==="✓✓"){
            status="Delivered";
        }else{
            status="Read";
        }
        alert(
            "Image Info\n\nStatus: "+status
        );
    });
    // Pin Image
    imageMessage.addEventListener("mousedown",function(event){
        if(event.ctrlKey){
            imageMessage.classList.toggle("pinned");
        }
    });
}
let updatesBtn = document.getElementById("updatesBtn");
if (updatesBtn) {
    updatesBtn.addEventListener("click", function () {
        window.location.href = "updates.html";
    });
}	
let backupdates = document.getElementById("backupdates");
if (backupdates) {
    backupdates.addEventListener("click", function () {
        window.location.href = "home.html";
    });
}
let myStatus = document.querySelector(".my-status");
let statusInput = document.getElementById("statusInput");
if (myStatus && statusInput) {
    myStatus.addEventListener("click", function () {
        statusInput.click();
    });
}
let addContactBtn = document.getElementById("addContactBtn");
if (addContactBtn) {
    addContactBtn.addEventListener("click", function () {
        window.location.href = "addcontact.html";
    });
}
if (statusInput) {
statusInput.addEventListener("change", function () {
    let file = statusInput.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function () {
        localStorage.setItem("myStatus", reader.result);
        let statusImage = document.getElementById("statusImage");
        if (statusImage) {
            statusImage.src = reader.result;
            statusImage.style.display = "block";
        }
        alert("Status added successfully!");
    };
    reader.readAsDataURL(file);
});
};
let newChatBtn = document.getElementById("newChatBtn");
if (newChatBtn) {
    newChatBtn.addEventListener("click", function () {
        window.location.href = "contacts.html";
    });
}
const menuBtn = document.getElementById("menuBtn");
const moreMenu = document.getElementById("moreMenu");
if (menuBtn && moreMenu) {
menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (moreMenu.style.display === "block") {
        moreMenu.style.display = "none";
    } else {
        moreMenu.style.display = "block";
    }
});
};
// Close menu when clicking outside
document.addEventListener("click", () => {
    if(moreMenu){
        moreMenu.style.display = "none";
    };
});
// Menu Actions
const newGroupBtn =
document.getElementById("newGroupBtn");
if(newGroupBtn){
	newGroupBtn.onclick = function(){
    alert("New Group coming soon!");
};
};
const broadcastBtn = document.getElementById("broadcastBtn");
if (broadcastBtn) {
    broadcastBtn.onclick = () => {
        alert("Broadcast feature coming soon!");
    };
}

const starredBtn = document.getElementById("starredBtn");
if (starredBtn) {
    starredBtn.onclick = () => {
        window.location.href = "starred.html";
    };
}
const linkedBtn = document.getElementById("linkedBtn");
if (linkedBtn) {
    linkedBtn.onclick = () => {
        window.location.href = "linked.html";
    };
}
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("loggedIn");
            window.location.href = "login.html";
        }
    };
}
const cameraTopBtn = document.getElementById("cameraTopBtn");
if (cameraTopBtn) {
cameraTopBtn.addEventListener("click", () => {
    window.location.href = "camera.html";
});
};
const chatMenuBtn = document.getElementById("chatMenuBtn");
const chatMenu = document.getElementById("chatMenu");
if (chatMenuBtn && chatMenu) {
    chatMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (chatMenu.style.display === "block") {
            chatMenu.style.display = "none";
        } else {
            chatMenu.style.display = "block";
        }
    });
    document.addEventListener("click", () => {
        chatMenu.style.display = "none";
    });
    chatMenu.addEventListener("click", (e) => {
        e.stopPropagation();
    });
}
const contactInfoBtn = document.getElementById("contactInfoBtn");
if (contactInfoBtn) {
    contactInfoBtn.onclick = function() {
        window.location.href =
"contact-info.html";
    };
}
