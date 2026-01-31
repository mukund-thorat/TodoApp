const inputs = document.querySelectorAll('.otp-input');

inputs.forEach((input, index) => {
    // Handle input
    input.addEventListener('input', (e) => {
        // Check if input is a number
        if (!/^[0-9]$/.test(e.data) && e.inputType !== 'deleteContentBackward') {
            input.value = ''; // clear invalid input
            return;
        }

        if (e.data && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    // Handle backspace/navigation
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            if (input.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputs[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    // Handle paste
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, ''); // only numbers

        if (pasteData) {
            const chars = pasteData.split('');
            let currentIndex = index;

            chars.forEach(char => {
                if (currentIndex < inputs.length) {
                    inputs[currentIndex].value = char;
                    currentIndex++;
                }
            });

            // Focus the next empty input or the last one
            if (currentIndex < inputs.length) {
                inputs[currentIndex].focus();
            } else {
                inputs[inputs.length - 1].focus();
            }
        }
    });
});