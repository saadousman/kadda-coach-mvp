document.addEventListener('DOMContentLoaded', () => {
    fetch('assets/work_game1.json')
        .then(response => response.json())
        .then(data => {
            const chatContainer = document.getElementById('conversation-dialogue');
            document.getElementById('conversation-title').innerText = data.title;
            data.messages.forEach((message, index) => {
                const userBubble = document.createElement('div');
                userBubble.className = 'dialogue-bubble user-bubble';
                userBubble.innerText = message.user;
                chatContainer.appendChild(userBubble);

                const appBubble = document.createElement('div');
                appBubble.className = 'dialogue-bubble app-bubble';
                appBubble.innerText = message.app;
                chatContainer.appendChild(appBubble);
            });
        });

    document.getElementById('start-recording').addEventListener('click', startRecording);
    document.getElementById('stop-recording').addEventListener('click', stopRecording);
});

let recognition;
let mediaRecorder;
let recordedChunks = [];
let currentDialogueIndex = 0;
let isSpeaking = false;
let isListening = false;

function startRecording() {
    document.getElementById('start-recording').style.display = 'none';
    document.getElementById('stop-recording').style.display = 'block';
    currentDialogueIndex = 0;

    const userBubbles = document.getElementsByClassName('user-bubble');
    const appBubbles = document.getElementsByClassName('app-bubble');

    if (!('webkitSpeechRecognition' in window) || !navigator.mediaDevices) {
        alert('Your browser does not support the necessary Web APIs');
        return;
    }

    // Initialize MediaRecorder for voice recording
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(recordedChunks, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const recordedAudio = document.getElementById('recorded-audio');
                recordedAudio.src = audioUrl;
                recordedAudio.style.display = 'block'; // Show the audio player

                // Create a download link
                const downloadLink = document.createElement('a');
                downloadLink.href = audioUrl;
                downloadLink.download = 'conversation_recording.mp3';
                downloadLink.textContent = 'Download Recording';
                downloadLink.className = 'btn btn-success mt-4';
                document.body.appendChild(downloadLink);
            };
            mediaRecorder.start();
        });

    // Initialize SpeechRecognition for voice recognition
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = event => {
        if (!isSpeaking && currentDialogueIndex < userBubbles.length) {
            userBubbles[currentDialogueIndex].classList.remove('highlighted');
            currentDialogueIndex++;
            if (currentDialogueIndex < userBubbles.length) {
                appBubbles[currentDialogueIndex - 1].classList.add('highlighted');
                speak(appBubbles[currentDialogueIndex - 1].innerText).then(() => {
                    if (currentDialogueIndex < userBubbles.length) {
                        userBubbles[currentDialogueIndex].classList.add('highlighted');
                        recognition.start();
                    } else {
                        stopRecording();
                    }
                });
            } else if (currentDialogueIndex === userBubbles.length) {
                appBubbles[currentDialogueIndex - 1].classList.add('highlighted');
                speak(appBubbles[currentDialogueIndex - 1].innerText).then(() => {
                    stopRecording();
                });
            }
        }
    };

    recognition.onerror = event => {
        console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
        if (!isSpeaking && currentDialogueIndex < userBubbles.length) {
            if (!isListening) {
                recognition.start();
            }
        }
    };

    // Start the conversation with the user's first dialogue
    userBubbles[currentDialogueIndex].classList.add('highlighted');
    recognition.start();
}

function stopRecording() {
    if (recognition) {
        recognition.stop();
    }
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
    document.getElementById('stop-recording').style.display = 'none';
}

function speak(text) {
    return new Promise((resolve, reject) => {
        recognition.stop(); // Stop recognition while speaking
        isSpeaking = true;
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'en-US';
        msg.onend = () => {
            isSpeaking = false;
            resolve();
        };
        msg.onerror = (event) => {
            isSpeaking = false;
            console.error('Speech synthesis error:', event.error);
            reject(event.error);
        };
        window.speechSynthesis.speak(msg);
    });
}
