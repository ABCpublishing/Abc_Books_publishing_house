const fs = require('fs');

try {
    let code = fs.readFileSync('js/auth/user-auth-api.js', 'utf8');

    const domInjection = `
document.addEventListener('DOMContentLoaded', () => {
    // Inject Phone into Signup
    const signupForm = document.getElementById('signupForm');
    if (signupForm && !document.getElementById('signupPhone')) {
        const phoneGroup = document.createElement('div');
        phoneGroup.className = 'form-group';
        phoneGroup.innerHTML = \`
            <label><i class="fas fa-phone"></i> Phone Number</label>
            <input type="tel" id="signupPhone" placeholder="Enter your mobile number (e.g. 9876543210)" required>
            <span class="error-message" id="signupPhoneError"></span>
        \`;
        const emailGroup = signupForm.querySelector('#signupEmail');
        if (emailGroup) {
            emailGroup.parentElement.parentElement.insertBefore(phoneGroup, emailGroup.parentElement.nextSibling);
        }
    }
    
    // Change Forgot Password to use Phone
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        const forgotInput = document.getElementById('forgotEmail');
        if (forgotInput) {
            forgotInput.type = 'tel';
            forgotInput.id = 'forgotPhone';
            forgotInput.placeholder = 'Enter your registered phone number';
            const label = forgotInput.parentElement.querySelector('label');
            if (label) label.innerHTML = '<i class="fas fa-phone"></i> Phone Number';
            const error = document.getElementById('forgotEmailError');
            if (error) error.id = 'forgotPhoneError';
        }
    }

    // Render OTP Modal
    if (!document.getElementById('otpModal')) {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.id = 'otpModal';
        modal.innerHTML = \`
            <div class="auth-modal-content">
                <button class="close-auth" onclick="closeOTPModal()"><i class="fas fa-times"></i></button>
                <div class="auth-header">
                    <i class="fas fa-comment-sms" style="font-size: 40px; color: var(--primary-color);"></i>
                    <h2>Verify OTP</h2>
                    <p>Enter the 6-digit code sent to your phone</p>
                </div>
                <form id="otpForm" onsubmit="handleOTPVerification(event)" style="padding-top:20px;">
                    <div class="form-error-banner" id="otpFormError" style="display: none; padding: 10px; background: #ffebee; color: #c62828; margin-bottom: 15px; border-radius: 5px;">
                        <i class="fas fa-exclamation-circle"></i>
                        <span></span>
                    </div>
                    <div class="form-group" style="text-align: center; margin-bottom: 25px;">
                        <input type="text" id="otpCode" placeholder="Enter 6-digit OTP" required maxlength="6" style="text-align: center; letter-spacing: 5px; font-size: 24px; font-weight: bold; width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                    <input type="hidden" id="otpContext">
                    <input type="hidden" id="otpPhone">
                    
                    <div id="otpNewPasswordGroup" style="display: none; margin-bottom: 20px;">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;"><i class="fas fa-lock"></i> New Password</label>
                            <input type="password" id="otpNewPassword" placeholder="Create new password" minlength="6" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                    </div>

                    <button type="submit" class="btn-auth" style="width: 100%; padding: 14px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer;">
                        <i class="fas fa-check-circle"></i> Verify & Proceed
                    </button>
                </form>
            </div>
        \`;
        document.body.appendChild(modal);
    }
});

function closeOTPModal() {
    const modal = document.getElementById('otpModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showOTPModal(phone, context) {
    document.getElementById('otpContext').value = context;
    document.getElementById('otpPhone').value = phone;
    document.getElementById('otpCode').value = '';
    
    if (context === 'forgot') {
        document.getElementById('otpNewPasswordGroup').style.display = 'block';
        document.getElementById('otpNewPassword').setAttribute('required', 'true');
    } else {
        document.getElementById('otpNewPasswordGroup').style.display = 'none';
        document.getElementById('otpNewPassword').removeAttribute('required');
    }

    const modal = document.getElementById('otpModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

async function handleOTPVerification(event) {
    event.preventDefault();
    const phone = document.getElementById('otpPhone').value;
    const otp = document.getElementById('otpCode').value;
    const context = document.getElementById('otpContext').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');

    setLoadingState(submitBtn, true);
    document.getElementById('otpFormError').style.display = 'none';

    try {
        if (context === 'forgot') {
            const newPassword = document.getElementById('otpNewPassword').value;
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reset password');
            
            showNotification('Password reset successful! Please log in.', 'success');
            closeOTPModal();
            showLoginModal();
        } else {
            // Verify Registration
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Verification failed');
            
            // Login user
            if (data.token) {
                if (typeof API !== 'undefined' && API.Token) {
                    API.Token.set(data.token);
                } else {
                    localStorage.setItem('accessToken', data.token);
                }
                localStorage.setItem('abc_books_current_user', JSON.stringify(data.user));
                currentUserCache = data.user;
                await updateUserUI();
                
                showNotification('Registration successful!', 'success');
                closeOTPModal();
                await processPendingAction();
            }
        }
    } catch(err) {
        document.getElementById('otpFormError').querySelector('span').textContent = err.message;
        document.getElementById('otpFormError').style.display = 'flex';
    } finally {
        setLoadingState(submitBtn, false);
    }
}
`;

    if (!code.includes('handleOTPVerification')) {
        code += "\n" + domInjection;
    }

    // Override handleSignup
    const signupRegex = /async function handleSignup\(event\) \{[\s\S]*?\}\s*(?=async function handleForgotPassword)/;
    const newSignup = `async function handleSignup(event) {
    event.preventDefault();
    const formId = 'signupForm';
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const phoneInput = document.getElementById('signupPhone');
    const passwordInput = document.getElementById('signupPassword');
    const confirmInput = document.getElementById('signupConfirmPassword');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    resetFormErrors(formId);
    let isValid = true;
    if (!nameInput.value.trim()) { showInputError('signupName', 'Required'); isValid = false; }
    if (!emailInput.value.trim()) { showInputError('signupEmail', 'Required'); isValid = false; }
    if (phoneInput && !phoneInput.value.trim()) { showInputError('signupPhone', 'Required'); isValid = false; }
    if (passwordInput.value.length < 6) { showInputError('signupPassword', 'Min 6 chars'); isValid = false; }
    if (passwordInput.value !== confirmInput.value) { showInputError('signupConfirmPassword', 'Mismatch'); isValid = false; }
    if (!isValid) return;

    setLoadingState(submitBtn, true);
    try {
        const payload = {
            name: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            phone: phoneInput ? phoneInput.value : ''
        };
        const response = await API.Auth.register(payload);
        closeSignupModal();
        showOTPModal(payload.phone, 'register');
    } catch (error) {
        showFormBannerError(formId, error.message || 'Registration failed');
    } finally {
        setLoadingState(submitBtn, false);
    }
}
`;
    if (signupRegex.test(code)) {
        code = code.replace(signupRegex, newSignup);
    }

    // Override handleForgotPassword
    const forgotRegex = /async function handleForgotPassword\(event\) \{[\s\S]*?\}\s*(?=\/\/ ===== GUEST CART SYNCHRONIZATION =====)/;
    const newForgot = `async function handleForgotPassword(event) {
    event.preventDefault();
    const formId = 'forgotForm';
    const phoneInput = document.getElementById('forgotPhone');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    resetFormErrors(formId);
    if (!phoneInput.value.trim()) {
        showInputError('forgotPhone', 'Phone number is required');
        return;
    }

    setLoadingState(submitBtn, true);
    try {
        const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneInput.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to request reset');
        
        closeForgotModal();
        showOTPModal(phoneInput.value, 'forgot');
    } catch (error) {
        showFormBannerError(formId, error.message || 'Failed to send OTP');
    } finally {
        setLoadingState(submitBtn, false);
    }
}
`;
    if (forgotRegex.test(code)) {
        code = code.replace(forgotRegex, newForgot);
    }

    // Handle RequiresOtp in handleLogin
    if (code.includes('if (response.user) {') && !code.includes('requiresOtp')) {
        code = code.replace(
            `const response = await API.Auth.login({
            email: emailInput.value,
            password: passwordInput.value
        });`,
            `let response;
        try {
            response = await API.Auth.login({
                email: emailInput.value,
                password: passwordInput.value,
                phone: emailInput.value // Pass to backend which accepts identifier
            });
        } catch(err) {
            // Check for unverified state
            if (err.response && err.response.requiresOtp) {
                closeLoginModal();
                showOTPModal(err.response.phone, 'register');
                return;
            }
            throw err;
        }`
        );
    }

    // Because API.Auth.login throws on 403, we need to inspect error in catch block directly
    // Let's replace the whole handleLogin error handling to be safe
    const catchLoginBlock = `} catch (error) {
        console.error('Login error:', error);`;
    const newCatchLogin = `} catch (error) {
        console.error('Login error:', error);
        
        // Handle unverified account OTP flow directly from error
        if (error.message.includes('Account not verified') || error.message.includes('requiresOtp')) {
            // Assuming we pass phone as emailInput.value if user typed phone
            closeLoginModal();
            showOTPModal(emailInput.value, 'register');
            return;
        }
`;
    code = code.replace(catchLoginBlock, newCatchLogin);


    fs.writeFileSync('js/auth/user-auth-api.js', code);
    console.log('Successfully patched user-auth-api.js');
} catch (e) {
    console.error('Error patching file:', e);
}
