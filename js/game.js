document.addEventListener('DOMContentLoaded', () => {
    const startRecordingBtn = document.getElementById('start-recording');
    const stopRecordingBtn = document.getElementById('stop-recording');
    const audioPlayerContainer = document.getElementById('audio-player-container');
    const audioPlayer = document.getElementById('audio-player');
    
    let mediaRecorder;
    let audioChunks = [];

    startRecordingBtn.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    audioPlayer.src = audioUrl;
                    audioPlayerContainer.classList.remove('d-none');
                };

                audioChunks = [];
                startRecordingBtn.classList.add('d-none');
                stopRecordingBtn.classList.remove('d-none');
                
                // Start the conversation
                startConversation();
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });
    });

    stopRecordingBtn.addEventListener('click', () => {
        mediaRecorder.stop();
        stopRecordingBtn.classList.add('d-none');
        startRecordingBtn.classList.remove('d-none');
    });

    function startConversation() {
        const userMessages = document.querySelectorAll('[id^="user-message"]');
        const appMessages = document.querySelectorAll('[id^="app-message"]');
        
        let currentIndex = 0;

        function handleUserSpeak() {
            if (currentIndex < userMessages.length) {
                const currentMessage = userMessages[currentIndex];
                currentMessage.classList.add('highlight');

                const recognition = new webkitSpeechRecognition();
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.onresult = event => {
                    const speechResult = event.results[0][0].transcript;
                    console.log(`Result: ${speechResult}`);
                    currentMessage.classList.remove('highlight');
                    currentIndex++;
                    handleAppSpeak();
                };

                recognition.start();
            } else {
                stopRecordingBtn.classList.remove('d-none');
            }
        }

        function handleAppSpeak() {
            if (currentIndex < appMessages.length) {
                const currentMessage = appMessages[currentIndex];
                const utterance = new SpeechSynthesisUtterance(currentMessage.textContent);
                utterance.onend = () => {
                    handleUserSpeak();
                };
                window.speechSynthesis.speak(utterance);
            } else {
                stopRecordingBtn.classList.remove('d-none');
            }
        }

        handleUserSpeak();
    }
});
