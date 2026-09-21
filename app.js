const scriptInput = document.getElementById("script");
const voiceSelect = document.getElementById("voiceSelect");

const speed = document.getElementById("speed");
const pitch = document.getElementById("pitch");
const volume = document.getElementById("volume");

const speedValue = document.getElementById("speedValue");
const pitchValue = document.getElementById("pitchValue");
const volumeValue = document.getElementById("volumeValue");

const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");
const voiceCount = document.getElementById("voiceCount");

const speakBtn = document.getElementById("speakBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");

const status = document.getElementById("status");
const themeBtn = document.getElementById("themeBtn");

let voices = [];


// ================================
// LOAD VOICES
// ================================

function loadVoices() {

    voices = speechSynthesis.getVoices();

    voiceSelect.innerHTML = "";

    if (voices.length === 0) {

        const option = document.createElement("option");

        option.textContent =
            "No voices detected";

        voiceSelect.appendChild(option);

        voiceCount.textContent = "0";

        return;
    }

    voiceCount.textContent = voices.length;

    voices.forEach((voice, index) => {

        const option =
            document.createElement("option");

        option.value = index;

        option.textContent =
            `${voice.name} — ${voice.lang}`;

        voiceSelect.appendChild(option);

    });


    // Prefer English voice

    const englishVoice =
        voices.findIndex(voice =>
            voice.lang
                .toLowerCase()
                .startsWith("en")
        );

    if (englishVoice !== -1) {

        voiceSelect.value =
            englishVoice;
    }
}


speechSynthesis.onvoiceschanged =
    loadVoices;

loadVoices();


// ================================
// COUNTERS
// ================================

function updateCounters() {

    const text =
        scriptInput.value.trim();

    const words =
        text === ""
            ? []
            : text.split(/\s+/);

    const count =
        words.length;

    wordCount.textContent =
        `${count.toLocaleString()} / 3,000 words`;

    charCount.textContent =
        `${scriptInput.value.length.toLocaleString()} characters`;

    if (count > 3000) {

        wordCount.style.color =
            "#ff6b6b";

    } else {

        wordCount.style.color =
            "";
    }
}

scriptInput.addEventListener(
    "input",
    updateCounters
);

updateCounters();


// ================================
// SPEED
// ================================

speed.addEventListener(
    "input",
    () => {

        speedValue.textContent =
            `${Number(speed.value).toFixed(1)}x`;
    }
);


// ================================
// PITCH
// ================================

pitch.addEventListener(
    "input",
    () => {

        pitchValue.textContent =
            Number(pitch.value).toFixed(1);
    }
);


// ================================
// VOLUME
// ================================

volume.addEventListener(
    "input",
    () => {

        const percent =
            Math.round(
                Number(volume.value) * 100
            );

        volumeValue.textContent =
            `${percent}%`;
    }
);


// ================================
// GENERATE SPEECH
// ================================

speakBtn.addEventListener(
    "click",
    () => {

        const text =
            scriptInput.value.trim();

        if (!text) {

            status.textContent =
                "Please enter some text first.";

            return;
        }


        const words =
            text.split(/\s+/);

        if (words.length > 3000) {

            status.textContent =
                "Your script is over the 3,000-word limit.";

            return;
        }


        speechSynthesis.cancel();


        const speech =
            new SpeechSynthesisUtterance(text);


        const selectedVoice =
            Number(voiceSelect.value);


        if (voices[selectedVoice]) {

            speech.voice =
                voices[selectedVoice];
        }


        speech.rate =
            Number(speed.value);

        speech.pitch =
            Number(pitch.value);

        speech.volume =
            Number(volume.value);


        speech.onstart = () => {

            status.textContent =
                "🔊 Lixvoices is speaking...";

            speakBtn.textContent =
                "🔊 Speaking...";
        };


        speech.onend = () => {

            status.textContent =
                "✅ Speech finished.";

            speakBtn.textContent =
                "▶ Generate Speech";

            pauseBtn.textContent =
                "⏸ Pause";
        };


        speech.onerror = () => {

            status.textContent =
                "❌ Unable to generate speech.";

            speakBtn.textContent =
                "▶ Generate Speech";
        };


        speechSynthesis.speak(speech);
    }
);


// ================================
// PAUSE / RESUME
// ================================

pauseBtn.addEventListener(
    "click",
    () => {

        if (!speechSynthesis.speaking) {

            status.textContent =
                "There is no speech currently playing.";

            return;
        }


        if (speechSynthesis.paused) {

            speechSynthesis.resume();

            pauseBtn.textContent =
                "⏸ Pause";

            status.textContent =
                "▶ Speech resumed.";

        } else {

            speechSynthesis.pause();

            pauseBtn.textContent =
                "▶ Resume";

            status.textContent =
                "⏸ Speech paused.";
        }
    }
);


// ================================
// STOP
// ================================

stopBtn.addEventListener(
    "click",
    () => {

        speechSynthesis.cancel();

        pauseBtn.textContent =
            "⏸ Pause";

        speakBtn.textContent =
            "▶ Generate Speech";

        status.textContent =
            "⏹ Speech stopped.";
    }
);


// ================================
// CLEAR
// ================================

clearBtn.addEventListener(
    "click",
    () => {

        speechSynthesis.cancel();

        scriptInput.value = "";

        updateCounters();

        status.textContent =
            "Script cleared.";
    }
);


// ================================
// DARK / LIGHT MODE
// ================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light-mode"
        );


        if (
            document.body.classList.contains(
                "light-mode"
            )
        ) {

            themeBtn.textContent = "☾";

        } else {

            themeBtn.textContent = "☼";
        }
    }
);
