const fs = require('fs');

const files = [];

function findHtml(dir) {
    const items = fs.readdirSync(dir);
    for (let item of items) {
        if (item.includes('node_modules') || item.includes('.git') || item.includes('backend')) continue;
        const path = dir + '/' + item;
        if (fs.statSync(path).isDirectory()) {
            findHtml(path);
        } else if (item.endsWith('.html')) {
            files.push(path);
        }
    }
}

findHtml('.');

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;

    const googleHtmlLogin = `
                <div class="google-auth-separator" style="text-align: center; margin: 20px 0; position: relative;">
                    <hr style="position: absolute; top: 50%; left: 0; right: 0; margin: 0; border: none; border-top: 1px solid #ddd; z-index: 0;">
                    <span style="background: white; padding: 0 10px; color: #666; font-size: 14px; position: relative; z-index: 1;">or continue with</span>
                </div>
                <!-- Google Sign-In Button Container -->
                <div id="googleSignInBtnLogin" style="display: flex; justify-content: center; margin-bottom: 20px;"></div>
                `;

    const googleHtmlSignup = `
                <div class="google-auth-separator" style="text-align: center; margin: 20px 0; position: relative;">
                    <hr style="position: absolute; top: 50%; left: 0; right: 0; margin: 0; border: none; border-top: 1px solid #ddd; z-index: 0;">
                    <span style="background: white; padding: 0 10px; color: #666; font-size: 14px; position: relative; z-index: 1;">or sign up with</span>
                </div>
                <!-- Google Sign-Up Button Container -->
                <div id="googleSignInBtnSignup" style="display: flex; justify-content: center; margin-bottom: 20px;"></div>
                `;

    // Update login modal
    if (content.match(/<form id="loginForm"[\s\S]*?<\/form>/)) {
        // Insert after logic
        if (!content.includes('id="googleSignInBtnLogin"')) {
            content = content.replace(/(<form id="loginForm"[^>]*>)/, (match) => {
                changed = true;
                return match + `\n                <div id="googleSignInBtnLogin" style="display: flex; justify-content: center; margin: 15px 0;"></div>\n                <div class="google-auth-separator" style="text-align: center; margin: 15px 0; position: relative;">\n                    <hr style="position: absolute; top: 50%; left: 0; right: 0; margin: 0; border: none; border-top: 1px solid #ddd; z-index: 0;">\n                    <span style="background: white; padding: 0 10px; color: #666; font-size: 14px; position: relative; z-index: 1;">or continue with email</span>\n                </div>`;
            });
        }
    }

    // Update signup modal
    if (content.match(/<form id="signupForm"[\s\S]*?<\/form>/)) {
        if (!content.includes('id="googleSignInBtnSignup"')) {
            content = content.replace(/(<form id="signupForm"[^>]*>)/, (match) => {
                changed = true;
                return match + `\n                <div id="googleSignInBtnSignup" style="display: flex; justify-content: center; margin: 15px 0;"></div>\n                <div class="google-auth-separator" style="text-align: center; margin: 15px 0; position: relative;">\n                    <hr style="position: absolute; top: 50%; left: 0; right: 0; margin: 0; border: none; border-top: 1px solid #ddd; z-index: 0;">\n                    <span style="background: white; padding: 0 10px; color: #666; font-size: 14px; position: relative; z-index: 1;">or sign up with email</span>\n                </div>`;
            });
        }
    }

    // Add script to head
    if (content.includes('</head>') && !content.includes('accounts.google.com/gsi/client')) {
        content = content.replace('</head>', '    <script src="https://accounts.google.com/gsi/client" async defer></script>\n</head>');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(f, content);
        console.log('Updated: ' + f);
    }
});
