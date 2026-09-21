const MAX_WORDS = 3000;

const synth = window.speechSynthesis;

let voices = [];
let selectedVoice = null;

const $ = (id) => document.getElementById(id);

const textInput = $("textInput");
const wordCount = $("wordCount");
const charCount = $("charCount");
const warning = $("limitWarning");
const voiceList = $("voiceList");
const voiceSearch = $("voiceSearch");
const languageFilter = $("languageFilter");
const genderFilter = $("genderFilter");


// ===============================
// WORD & CHARACTER COUNTER
// ===============================

function countWords(text) {
    return text.trim()
        ? text.trim().split(/\s+/).length
        : 0;
}

function updateCounts() {
    const words = countWords(textInput.value);

    wordCount.textContent = words.toLocaleString();

    charCount.textContent =
        `${textInput.value.length.toLocaleString()} characters`;

    warning.classList.toggle(
        "hidden",
        words <= MAX_WORDS
    );

    wordCount.style.color =
        words > MAX_WORDS
            ? "#ff6b7a"
            : "";
}


// ===============================
// VOICE DETECTION
// ===============================

function looksFemale(name) {
    return /female|woman|zira|samantha|victoria|susan|karen|moira|fiona|ava|aria|emma|sara|sally|joanna|olivia|allison|hazel|serena|linda|kate/i
        .test(name);
}

function looksMale(name) {
    return /male|man|david|daniel|alex|george|james|mark|fred|tom|john|michael|arthur|oliver|ryan/i
        .test(name);
}


// ===============================
// HTML SECURITY
// ===============================

function escapeHtml(value) {
    return String(value).replace(
        /[&<>"']/g,
        (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character])
    );
}


// ===============================
// LOAD BROWSER VOICES
// ===============================

function loadVoices() {

    voices = synth
        ? synth.getVoices()
        : [];

    // Display number of available voices
    $("voiceCount").textContent =
        Math.min(2000, voices.length).toLocaleString();


    // Create language list
    const languages = [
        ...new Set(
            voices
                .map(voice => voice.lang)
                .filter(Boolean)
        )
    ].sort();


    languageFilter.innerHTML =
        `<option value="all">All languages</option>` +
        languages
            .map(
                language =>
                    `<option value="${escapeHtml(language)}">
                        ${escapeHtml(language)}
                    </option>`
            )
            .join("");


    // Select first voice automatically
    if (!selectedVoice && voices.length) {
        selectedVoice = voices[0];
    }


    renderVoices();

    updateSelectedVoice();
}


// ===============================
// FILTER VOICES
// ===============================

function filteredVoices() {

    const search =
        voiceSearch.value
            .toLowerCase()
            .trim();

    const language =
        languageFilter.value;

    const gender =
        genderFilter.value;


    return voices
        .filter(voice => {

            const searchableText =
                `${voice.name} ${voice.lang}`
                    .toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(search);


            const matchesLanguage =
                language === "all" ||
                voice.lang === language;


            const matchesGender =
                gender === "all" ||

                (
                    gender === "female" &&
                    looksFemale(voice.name)
                ) ||

                (
                    gender === "male" &&
                    looksMale(voice.name)
                );


            return (
                matchesSearch &&
                matchesLanguage &&
                matchesGender
            );
        })

        // Maximum of 2,000 voices shown
        .slice(0, 2000);
}


// ===============================
// DISPLAY VOICES
// ===============================

function renderVoices() {

    const list = filteredVoices();


    if (!list.length) {

        voiceList.innerHTML = `
            <div class="empty-state">
                No matching voices found on this device.
            </div>
        `;

        return;
    }


    voiceList.innerHTML = list
        .map(voice => {

            const index =
                voices.indexOf(voice);

            return `
                <div
                    class="voice-item ${
                        selectedVoice === voice
                            ? "selected"
                            : ""
                    }"
                    data-index="${index}"
                >

                    <div>

                        <div class="voice-name">
                            ${escapeHtml(voice.name)}
                        </div>

                        <div class="voice-lang">
                            ${escapeHtml(voice.lang)}
                        </div>

                    </div>

                    <span class="voice-tag">
                        ${
                            voice.localService
                                ? "Local"
                                : "Online"
                        }
                    </span>

                </div>
            `;
        })
        .join("");


    // Voice selection
    voiceList
        .querySelectorAll(".voice-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    selectedVoice =
                        voices[
                            Number(
                                item.dataset.index
                            )
                        ];


                    renderVoices();

                    updateSelectedVoice();

                }
            );

        });
}


// ===============================
// SELECTED VOICE DISPLAY
// ===============================

function updateSelectedVoice() {

    $("selectedVoice").textContent =
        selectedVoice
            ? `${selectedVoice.name} · ${selectedVoice.lang}`
            : "No voice detected";
}


// ===============================
// SPEECH GENERATION
// ===============================

function speak(text) {

    // Browser compatibility
    if (!synth) {

        alert(
            "Speech synthesis is not supported by this browser."
        );

        return;
    }


    // Empty text
    if (!text.trim()) {

        alert(
            "Please enter some text first."
        );

        return;
    }


    // 3,000 word limit
    if (countWords(text) > MAX_WORDS) {

        warning.classList.remove(
            "hidden"
        );

        alert(
            "Your script is over the 3,000-word limit."
        );

        return;
    }


    // Stop previous speech
    synth.cancel();


    // Create speech
    const utterance =
        new SpeechSynthesisUtterance(text);


    // Apply selected voice
    if (selectedVoice) {
        utterance.voice =
            selectedVoice;
    }


    // Speed
    utterance.rate =
        Number($("rate").value);


    // Pitch
    utterance.pitch =
        Number($("pitch").value);


    // Volume
    utterance.volume =
        Number($("volume").value);


    // Start speech
    synth.speak(utterance);
}


// ===============================
// GENERATE SPEECH BUTTON
// ===============================

$("speakBtn").addEventListener(
    "click",
    () => {

        speak(
            textInput.value
        );

    }
);


// ===============================
// PREVIEW BUTTON
// ===============================

$("previewBtn").addEventListener(
    "click",
    () => {

        if (!textInput.value.trim()) {

            alert(
                "Please enter some text first."
            );

            return;
        }


        // Preview first 450 characters
        const previewText =
            textInput.value
                .trim()
                .slice(0, 450);


        speak(previewText);

    }
);


// ===============================
// PAUSE / RESUME
// ===============================

$("pauseBtn").addEventListener(
    "click",
    () => {

        if (!synth) return;


        if (synth.paused) {

            synth.resume();

        } else {

            synth.pause();

        }

    }
);


// ===============================
// STOP SPEECH
// ===============================

$("stopBtn").addEventListener(
    "click",
    () => {

        if (synth) {

            synth.cancel();

        }

    }
);


// ===============================
// TEXT INPUT
// ===============================

textInput.addEventListener(
    "input",
    updateCounts
);


// ===============================
// SAMPLE TEXT
// ===============================

$("sampleBtn").addEventListener(
    "click",
    () => {

        textInput.value =
            "Welcome to VoxForge, a modern text-to-speech studio designed for creators, students, developers, and storytellers. Choose a voice, adjust the speed and pitch, then generate a natural spoken preview directly in your browser. Your script can contain up to 3,000 words per generation.";

        updateCounts();

    }
);


// ===============================
// CLEAR TEXT
// ===============================

$("clearBtn").addEventListener(
    "click",
    () => {

        textInput.value = "";

        updateCounts();

        textInput.focus();

    }
);


// ===============================
// VOICE SEARCH
// ===============================

voiceSearch.addEventListener(
    "input",
    renderVoices
);


// ===============================
// LANGUAGE FILTER
// ===============================

languageFilter.addEventListener(
    "change",
    renderVoices
);


// ===============================
// GENDER FILTER
// ===============================

genderFilter.addEventListener(
    "change",
    renderVoices
);


// ===============================
// SPEED / PITCH / VOLUME
// ===============================

[
    [
        "rate",
        "rateValue",
        value =>
            `${Number(value).toFixed(1)}×`
    ],

    [
        "pitch",
        "pitchValue",
        value =>
            Number(value).toFixed(1)
    ],

    [
        "volume",
        "volumeValue",
        value =>
            `${Math.round(
                Number(value) * 100
            )}%`
    ]

].forEach(
    ([inputId, outputId, formatter]) => {

        $(inputId).addEventListener(
            "input",
            event => {

                $(outputId).textContent =
                    formatter(
                        event.target.value
                    );

            }
        );

    }
);


// ===============================
// DARK / LIGHT MODE
// ===============================

$("themeBtn").addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );


        $("themeBtn").textContent =
            document.body.classList.contains(
                "light"
            )
                ? "☾"
                : "☼";

    }
);


// ===============================
// INITIALIZE VOICES
// ===============================

if (synth) {

    loadVoices();


    // Some browsers load voices asynchronously
    synth.onvoiceschanged =
        loadVoices;

} else {

    voiceList.innerHTML = `
        <div class="empty-state">
            Speech synthesis is not supported
            in this browser.
        </div>
    `;
}


// ===============================
// INITIAL COUNTERS
// ===============================

updateCounts();
