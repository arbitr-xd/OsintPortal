const firebaseConfig = {
    apiKey: "AIzaSyDZHQ21EdmM1LIayIsLJBaOzqydTVuOKDg",
    authDomain: "osintportal-17da8.firebaseapp.com",
    projectId: "osintportal-17da8",
    storageBucket: "osintportal-17da8.firebasestorage.app",
    messagingSenderId: "350986933756",
    appId: "1:350986933756:web:1857313ba7af47493b38e79",
    measurementId: "G-VJYTS7CYWF"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const canvas = document.getElementById('matrix-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = '01';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(0);
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(drawMatrix, 60);
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const hudTime = document.getElementById('hud-time');
    if (hudTime) hudTime.textContent = timeStr;
    const uptimeEl = document.getElementById('info-uptime');
    if (uptimeEl) {
        const uptime = Math.floor((Date.now() - (window._startTime || Date.now())) / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = uptime % 60;
        uptimeEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
}
window._startTime = Date.now();
setInterval(updateClock, 1000);
updateClock();

function updateNetStats() {
    const dl = document.getElementById('dl-speed');
    const ul = document.getElementById('ul-speed');
    const ping = document.getElementById('ping-value');
    if (dl) dl.textContent = (Math.random() * 15 + 3).toFixed(1);
    if (ul) ul.textContent = (Math.random() * 6 + 0.5).toFixed(1);
    if (ping) ping.textContent = Math.floor(Math.random() * 25 + 8);
}
setInterval(updateNetStats, 2000);
updateNetStats();

const loginBtn = document.getElementById('login-btn');
const googleBtn = document.getElementById('google-btn');
const switchLink = document.getElementById('switch-to-register');
const loginError = document.getElementById('login-error');
const loginSubtitle = document.getElementById('login-subtitle');
const passwordInput = document.getElementById('password');
const charCount = document.getElementById('char-count');
let isRegisterMode = false;

if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const len = this.value.length;
        if (charCount) { charCount.textContent = len + '/6'; charCount.className = len >= 6 ? 'char-count ready' : 'char-count'; }
        if (loginBtn) {
            if (len >= 6) { loginBtn.classList.add('ready'); loginBtn.disabled = false; }
            else { loginBtn.classList.remove('ready'); loginBtn.disabled = true; }
        }
    });
}

if (switchLink) {
    switchLink.addEventListener('click', function(e) {
        e.preventDefault();
        isRegisterMode = !isRegisterMode;
        if (loginBtn) { loginBtn.textContent = isRegisterMode ? 'Создать аккаунт' : 'Войти'; if (passwordInput && passwordInput.value.length >= 6) { loginBtn.classList.add('ready'); loginBtn.disabled = false; } }
        if (loginSubtitle) { loginSubtitle.innerHTML = isRegisterMode ? 'Есть аккаунт? <a href="#" id="switch-to-register">Войти</a>' : 'Нет аккаунта? <a href="#" id="switch-to-register">Создать</a>'; document.getElementById('switch-to-register').addEventListener('click', arguments.callee); }
        if (loginError) loginError.textContent = '';
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', function() {
        const email = document.getElementById('email').value.trim();
        const password = passwordInput ? passwordInput.value.trim() : '';
        if (loginError) loginError.textContent = '';
        if (!email || !password) { if (loginError) loginError.textContent = 'Заполни все поля'; return; }
        if (password.length < 6) { if (loginError) loginError.textContent = 'Пароль минимум 6 символов'; return; }
        loginBtn.textContent = '...'; loginBtn.disabled = true;
        const action = isRegisterMode ? auth.createUserWithEmailAndPassword(email, password) : auth.signInWithEmailAndPassword(email, password);
        action.then(() => { window.location.href = 'dashboard.html'; })
              .catch(err => {
                  if (loginError) loginError.textContent = err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' ? 'Неверный email или пароль' : err.message;
                  loginBtn.textContent = isRegisterMode ? 'Создать аккаунт' : 'Войти';
                  loginBtn.disabled = false;
                  if (passwordInput && passwordInput.value.length >= 6) loginBtn.classList.add('ready');
              });
    });
}

if (googleBtn) {
    googleBtn.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        auth.signInWithPopup(provider)
            .then(() => { window.location.href = 'dashboard.html'; })
            .catch(err => {
                if (err.code === 'auth/popup-blocked') { auth.signInWithRedirect(provider); }
                else if (loginError) { loginError.textContent = 'Ошибка входа через Google'; }
            });
    });
}

auth.onAuthStateChanged(function(user) {
    if (user) {
        const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
        const welcomeText = document.getElementById('welcome-text');
        if (welcomeText) welcomeText.textContent = 'Welcome back, ' + displayName;
        const infoUser = document.getElementById('info-user');
        if (infoUser) infoUser.textContent = displayName;
        const bootSeq = document.getElementById('boot-sequence');
        if (bootSeq) { setTimeout(() => { bootSeq.style.display = 'none'; }, 6000); }
    } else {
        const isDashboard = document.getElementById('boot-sequence');
        if (isDashboard && window.location.pathname.indexOf('dashboard') > -1) { window.location.href = 'index.html'; }
    }
});
