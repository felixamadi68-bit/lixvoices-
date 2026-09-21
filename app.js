const scriptInput = document.getElementById("script");
const voiceSelect = document.getElementById("voiceSelect");

const speed = document.getElementById("speed");
const pitch = document.getElementById("pitch");

const speedValue = document.getElementById("speedValue");
const pitchValue = document.getElementById("pitchValue");

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


// -----------------------------------
// LOAD AVAILABLE VOICES
// -----------------------------------

function loadVoices() {

    voices = window.speechSynthesis.getVoices();

    voiceSelect.innerHTML = "";

    if (voices.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No voices detected";
        voiceSelect.appendChild(option);
        voiceCount.textContent = "0";
        return;
    }

    voiceCount.textContent = voices.length;

    voices.forEach((voice, index) => {

        const option = document.createElement("option");

        option.value = index;

        option.textContent =
            `${voice.name} — ${voice.lang}`;

        voiceSelect.appendChild(option);
    });


    // Prefer an English voice if available

    const englishIndex = voices.findIndex(
        voice => voice.lang.toLowerCase().startsWith("en")
    );

    if (englishIndex !== -1) {
        voiceSelect.value = englishIndex;
    }
}


// Some browsers load voices after the page loads.
window.speechSynthesis.onvoiceschanged = loadVoices;

loadVoices();


// -----------------------------------
// WORD COUNTER
// -----------------------------------

function updateCounters() {

    const text = scriptInput.value.trim();

    const words = text === ""
        ? []
        : text.split(/\s+/);

    const count = words.length;

    wordCount.textContent =
        `${count.toLocaleString()} / 3,000 words`;

    charCount.textContent =
        `${scriptInput.value.length.toLocaleString()} characters`;

    if (count > 3000) {
        wordCount.style.color = "#ff6b6b";
    } else {
        wordCount.style.color = "";
    }
}

scriptInput.addEventListener("input", updateCounters);

updateCounters();


// -----------------------------------
// SPEED
// -----------------------------------

speed.addEventListener("input", () => {

    speedValue.textContent =
        `${Number(speed.value).toFixed(1)}x`;
});


// -----------------------------------
// PITCH
// -----------------------------------

pitch.addEventListener("input", () => {

    pitchValue.textContent =
        Number(pitch.value).toFixed(1);
});


// -----------------------------------
// GENERATE SPEECH
// -----------------------------------

speakBtn.addEventListener("click", () => {

    const text = scriptInput.value.trim();

    if (!text) {

        status.textContent =
            "Please enter some text first.";

        return;
    }


    const words = text.split(/\s+/);

    if (words.length > 3000) {

        status.textContent =
            "Your script is over the 3,000-word limit.";

        return;
    }


    // Stop anything currently speaking

    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(text);


    const selectedIndex =
        Number(voiceSelect.value);


    if (voices[selectedIndex]) {

        utterance.voice =
            voices[selectedIndex];
    }


    utterance.rate =
        Number(speed.value);


    utterance.pitch =
        Number(pitch.value);


    utterance.volume = 1;


    utterance.onstart = () => {

        status.textContent =
            "Speaking your script...";
    };


    utterance.onend = () => {

        status.textContent =
            "Speech generation finished.";
    };


    utterance.onerror = () => {

        status.textContent =
            "Something went wrong while generating speech.";
    };


    window.speechSynthesis.speak(utterance);
});


// -----------------------------------
// PAUSE / RESUME
// -----------------------------------

pauseBtn.addEventListener("click", () => {

    if (window.speechSynthesis.speaking) {

        if (window.speechSynthesis.paused) {

            window.speechSynthesis.resume();

            pauseBtn.textContent =
                "⏸ Pause";

            status.textContent =
                "Speech resumed.";

        } else {

            window.speechSynthesis.pause();

            pauseBtn.textContent =
                "▶ Resume";

            status.textContent =
                "Speech paused.";
        }
    }
});


// -----------------------------------
// STOP
// -----------------------------------

stopBtn.addEventListener("click", () => {

    window.speechSynthesis.cancel();

    pauseBtn.textContent =
        "⏸ Pause";

    status.textContent =
        "Speech stopped.";
});


// -----------------------------------
// CLEAR
// -----------------------------------

clearBtn.addEventListener("click", () => {

    window.speechSynthesis.cancel();

    scriptInput.value = "";

    updateCounters();

    status.textContent =
        "Script cleared.";
});


// -----------------------------------
// THEME
// -----------------------------------

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {

        themeBtn.textContent = "☾";

    } else {

        themeBtn.textContent = "☼";
    }
});
