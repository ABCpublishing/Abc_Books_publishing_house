const fs = require('fs');
const files = ['index.html', 'pages/search.html', 'pages/checkout.html', 'pages/book-detail.html', 'js/auth/user-auth.js'];

files.forEach(f => {
    if(!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');
    
    // In HTML files
    content = content.replace(/<label><i class="fas fa-phone"><\/i> Phone Number<\/label>/g, '<label><i class="fas fa-envelope"></i> Email Address</label>');
    content = content.replace(/type="tel" id="loginPhone" placeholder="Enter your phone number" required autocomplete="tel"/g, 'type="email" id="loginEmail" placeholder="Enter your email address" required autocomplete="email"');
    content = content.replace(/id="loginPhoneError"/g, 'id="loginEmailError"');
    content = content.replace(/or continue with phone number/g, 'or continue with email');
    
    // In user-auth.js
    content = content.replace(/getElementById\('loginPhone'\)/g, "getElementById('loginEmail')");
    content = content.replace(/phoneInput\.value\.trim\(\)/g, "emailInput.value.trim()");
    content = content.replace(/phoneInput\.value\.replace\([^)]*\)/g, "emailInput.value.trim()");
    content = content.replace(/phoneInput/g, "emailInput");
    content = content.replace(/showInputError\('loginPhone', '[^']*'\)/g, "showInputError('loginEmail', 'Please enter a valid email')");
    content = content.replace(/phone: emailInput\.value/g, "email: emailInput.value");

    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
});
