document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('passwordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const showPasswordToggle = document.getElementById('showPasswordToggle');
    const matchError = document.getElementById('matchError');
    const statusMessage = document.getElementById('statusMessage');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const cancelBtn = document.getElementById('cancelBtn');
    const strengthLabel = document.getElementById('strengthLabel');
    const bars = [
        document.getElementById('bar1'),
        document.getElementById('bar2'),
        document.getElementById('bar3'),
        document.getElementById('bar4')
    ];

    /**
     * Toggle password visibility for all password fields
     */
    showPasswordToggle.addEventListener('change', (e) => {
        const inputType = e.target.checked ? 'text' : 'password';
        currentPasswordInput.type = inputType;
        newPasswordInput.type = inputType;
        confirmPasswordInput.type = inputType;
    });

    /**
     * Calculate password strength score (0 to 4)
     */
    function calculateStrength(password) {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }

    /**
     * Update strength meter UI bars and label
     */
    function updateStrengthMeter() {
        const val = newPasswordInput.value;
        const score = calculateStrength(val);

        // Reset bars
        bars.forEach(bar => {
            bar.className = 'meter-bar';
        });

        if (val.length === 0) {
            strengthLabel.textContent = 'Use at least 8 characters. Mix letters, numbers, and symbols.';
            strengthLabel.className = 'strength-label';
            return;
        }

        const levels = [
            { barClass: 'bg-weak', text: 'Weak password', textClass: 'text-weak' },
            { barClass: 'bg-fair', text: 'Fair password', textClass: 'text-fair' },
            { barClass: 'bg-good', text: 'Good password', textClass: 'text-good' },
            { barClass: 'bg-strong', text: 'Strong password', textClass: 'text-strong' }
        ];

        const levelIndex = Math.max(0, score - 1);
        const currentLevel = levels[levelIndex];

        for (let i = 0; i < Math.max(1, score); i++) {
            bars[i].classList.add(currentLevel.barClass);
        }

        strengthLabel.textContent = `Password strength: ${currentLevel.text}`;
        strengthLabel.className = `strength-label ${currentLevel.textClass}`;
    }

    /**
     * Display inline status alert
     */
    function showStatus(type, message) {
        statusMessage.className = `status-alert ${type}`;

        if (type === 'error') {
            statusIcon.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
        } else if (type === 'success') {
            statusIcon.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
        } else {
            statusIcon.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
        }

        statusText.textContent = message;
    }

    newPasswordInput.addEventListener('input', () => {
        updateStrengthMeter();
        matchError.classList.add('hidden');
    });

    confirmPasswordInput.addEventListener('input', () => {
        matchError.classList.add('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        form.reset();
        updateStrengthMeter();
        matchError.classList.add('hidden');
        showStatus('info', 'Password change canceled. Form has been cleared.');
    });

    /**
     * Form validation handler
     */
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPass = currentPasswordInput.value;
        const newPass = newPasswordInput.value;
        const confirmPass = confirmPasswordInput.value;

        if (!currentPass.trim()) {
            showStatus('error', 'Please enter your current password.');
            currentPasswordInput.focus();
            return;
        }

        if (newPass.length < 8) {
            showStatus('error', 'Please enter a password with at least 8 characters.');
            newPasswordInput.focus();
            return;
        }

        if (newPass === currentPass) {
            showStatus('error', 'Your new password must be different from your current password.');
            newPasswordInput.focus();
            return;
        }

        if (newPass !== confirmPass) {
            matchError.classList.remove('hidden');
            showStatus('error', 'Passwords do not match. Please check and try again.');
            confirmPasswordInput.focus();
            return;
        }

        // Demo success feedback
        showStatus('success', 'Password updated successfully!');
        form.reset();
        updateStrengthMeter();
    });
});
