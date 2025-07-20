// Get references to DOM elements
const scanButton = document.getElementById('scanButton');
const messageDiv = document.getElementById('message');
const nfcDataDiv = document.getElementById('nfcData');

/**
 * Displays a message in the message div.
 * @param {string} msg - The message to display.
 * @param {string} type - The type of message (e.g., 'info', 'error', 'success').
 */
function displayMessage(msg, type = 'info') {
    messageDiv.innerHTML = `<p>${msg}</p>`;
    messageDiv.className = 'message-box'; // Reset classes

    if (type === 'error') {
        messageDiv.classList.add('bg-red-100', 'border-red-500', 'text-red-700');
    } else if (type === 'success') {
        messageDiv.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
    } else { // info or default
        messageDiv.classList.add('bg-blue-100', 'border-blue-500', 'text-blue-700');
    }
}

/**
 * Displays the NFC data in the data display div.
 * @param {string} data - The NFC data to display.
 */
function displayNfcData(data) {
    nfcDataDiv.innerHTML = `<pre>${data}</pre>`;
}

/**
 * Handles the click event for the scan button.
 */
scanButton.addEventListener('click', async () => {
    // Check if Web NFC API is supported by the browser
    if ('NDEFReader' in window) {
        displayMessage('NFC API supported. Tap an NFC tag to your device.', 'info');
        try {
            // Create a new NDEFReader instance
            const ndef = new NDEFReader();

            // Start scanning for NFC tags
            await ndef.scan();
            displayMessage('Scanning for NFC tags...', 'info');

            // Event listener for when an NDEF message is read
            ndef.onreading = event => {
                const message = event.message;
                let nfcContent = 'NFC Data Read:\n';
                nfcContent += `  Serial Number: ${event.serialNumber || 'N/A'}\n`;
                nfcContent += `  Records (${message.records.length}):\n`;

                // Iterate through each record in the NDEF message
                for (const record of message.records) {
                    nfcContent += `    Type: ${record.recordType}\n`;
                    nfcContent += `    Data (Text): ${new TextDecoder().decode(record.data)}\n`;
                    nfcContent += `    ID: ${record.id || 'N/A'}\n`;
                    nfcContent += `    Encoding: ${record.encoding || 'N/A'}\n`;
                    nfcContent += `    Language: ${record.lang || 'N/A'}\n`;
                    nfcContent += `    Media Type: ${record.mediaType || 'N/A'}\n`;
                    nfcContent += '    ---\n';
                }
                displayNfcData(nfcContent);
                displayMessage('NFC tag successfully read!', 'success');
            };

            // Event listener for errors during scanning
            ndef.onreadingerror = () => {
                displayMessage('Error reading NFC tag. Please try again or ensure the tag is compatible.', 'error');
            };

        } catch (error) {
            // Handle various errors that might occur
            if (error.name === 'NotAllowedError') {
                displayMessage('NFC permission denied. Please grant permission to access NFC.', 'error');
            } else if (error.name === 'NotFoundError') {
                displayMessage('No NFC adapter found or enabled. Please ensure NFC is turned on.', 'error');
            } else if (error.name === 'AbortError') {
                displayMessage('NFC scan aborted.', 'info');
            } else {
                displayMessage(`An unexpected error occurred: ${error.message}`, 'error');
                console.error('NFC Error:', error);
            }
        }
    } else {
        // Display message if Web NFC API is not supported
        displayMessage('Web NFC API is not supported on this browser or device. Please use a compatible browser (e.g., Chrome on Android) and ensure your device has NFC.', 'error');
        scanButton.disabled = true; // Disable button if not supported
    }
});

// Initial check for NFC API support on page load
window.onload = () => {
    if (!('NDEFReader' in window)) {
        displayMessage('Web NFC API is not supported on this browser or device. Please use a compatible browser (e.g., Chrome on Android) and ensure your device has NFC.', 'error');
        scanButton.disabled = true;
        scanButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
};
