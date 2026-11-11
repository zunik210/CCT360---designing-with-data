
// Window Interaction: Wipe the Window

// Get the HTML elements
const interactionHaze = document.getElementById("haze");
const wipeButton = document.getElementById("wipe-button");
const wipeMessage = document.getElementById("wipe-message");

// Keep track of the wipe timer
let wipeTimeout;

// Remove any previous wipe effect
function resetWipe() {
    clearTimeout(wipeTimeout);

    interactionHaze.classList.remove("wiped");

    wipeButton.disabled = false;

    wipeMessage.textContent = "Try cleaning the window.";
}

// Wipe the window when the button is clicked
wipeButton.addEventListener("click", function () {

    if (wipeButton.disabled) {
        return;
    }

    clearTimeout(wipeTimeout);

    // Temporarily remove the haze
    interactionHaze.classList.add("wiped");

    wipeButton.disabled = true;

    wipeMessage.textContent =
        "The glass is clear for a moment, but the air outside has not changed.";

    // Bring the haze back after 2.5 seconds
    wipeTimeout = setTimeout(function () {

        interactionHaze.classList.remove("wiped");

        wipeButton.disabled = false;

        wipeMessage.textContent =
            "The pollution is still outside. You cannot wipe it away.";

    }, 2500);
});

// Make reset function available to api.js
window.resetWipe = resetWipe;
