const fs = require('fs');
const file = 'js/services/api.js';

let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ Token management[\s\S]*?isValid: \(\) => {/m;
const replacement = \// Token management
const isAdminPath = typeof window !== 'undefined' && window.location.pathname.includes('/admin');

const TokenManager = {
    get: () => {
        if (isAdminPath) {
            return localStorage.getItem('adminToken') || localStorage.getItem('accessToken') || localStorage.getItem('token');
        }
        return localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('jwt_token');
    },
    set: (token) => {
        if (isAdminPath) {
            localStorage.setItem('adminToken', token);
        } else {
            localStorage.setItem('accessToken', token);
            localStorage.setItem('token', token);
            localStorage.setItem('jwt_token', token);
        }
    },
    remove: () => {
        if (isAdminPath) {
            localStorage.removeItem('adminToken');
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('jwt_token');
        }
    },
    isValid: () => {\;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Fixed api.js');
