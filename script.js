const canvas = document.getElementById('particles');
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const count = 80;
    const colors = ['#e53935', '#ff5252', '#b71c1c', '#ff8a80', '#555'];

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.8 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.4 + 0.05;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(229,57,53,${0.03 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

const hackerIcon = document.getElementById('hacker-icon');
const greeting = document.getElementById('hacker-greeting');
let greetingTimeout;

if (hackerIcon) {
    hackerIcon.addEventListener('click', () => {
        hackerIcon.classList.remove('spinning');
        void hackerIcon.offsetWidth;
        hackerIcon.classList.add('spinning');
        
        if (greeting) {
            greeting.classList.add('show');
            clearTimeout(greetingTimeout);
            greetingTimeout = setTimeout(() => {
                greeting.classList.remove('show');
            }, 3000);
        }
    });
}

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

const isLoginPage = document.getElementById('login-btn');
const isDashboard = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

if (isLoginPage) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const authError = document.getElementById('auth-error');
    const authFormTitle = document.querySelector('.auth-form h2');
    const authSubtitle = document.querySelector('.auth-subtitle');
    
    let isRegisterMode = false;

    function toggleMode(e) {
        if (e) e.preventDefault();
        isRegisterMode = !isRegisterMode;
        
        if (isRegisterMode) {
            authFormTitle.textContent = 'Регистрация';
            loginBtn.textContent = 'Создать аккаунт';
            authSubtitle.innerHTML = 'Есть аккаунт? <a href="#" id="switch-link">Войти</a>';
        } else {
            authFormTitle.textContent = 'Вход';
            loginBtn.textContent = 'Войти';
            authSubtitle.innerHTML = 'Нет аккаунта? <a href="#" id="switch-link">Создать</a>';
        }
        
        document.getElementById('switch-link').addEventListener('click', toggleMode);
        authError.textContent = '';
        emailInput.value = '';
        passwordInput.value = '';
    }

    document.getElementById('switch-to-register').addEventListener('click', toggleMode);

    loginBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        authError.textContent = '';
        
        if (!email || !password) {
            authError.textContent = 'Заполни все поля';
            return;
        }
        
        if (password.length < 6) {
            authError.textContent = 'Пароль должен быть минимум 6 символов';
            return;
        }
        
        loginBtn.textContent = 'Загрузка...';
        loginBtn.disabled = true;
        
        if (isRegisterMode) {
            auth.createUserWithEmailAndPassword(email, password)
                .then(() => {
                    window.location.href = 'dashboard.html';
                })
                .catch(err => {
                    if (err.code === 'auth/email-already-in-use') {
                        authError.textContent = 'Этот email уже занят';
                    } else if (err.code === 'auth/invalid-email') {
                        authError.textContent = 'Некорректный email';
                    } else if (err.code === 'auth/weak-password') {
                        authError.textContent = 'Слишком слабый пароль';
                    } else {
                        authError.textContent = err.message;
                    }
                    loginBtn.textContent = isRegisterMode ? 'Создать аккаунт' : 'Войти';
                    loginBtn.disabled = false;
                });
        } else {
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    window.location.href = 'dashboard.html';
                })
                .catch(err => {
                    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                        authError.textContent = 'Неверный email или пароль';
                    } else if (err.code === 'auth/invalid-email') {
                        authError.textContent = 'Некорректный email';
                    } else {
                        authError.textContent = err.message;
                    }
                    loginBtn.textContent = isRegisterMode ? 'Создать аккаунт' : 'Войти';
                    loginBtn.disabled = false;
                });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.activeElement !== loginBtn) {
            loginBtn.click();
        }
    });
}

if (isDashboard || logoutBtn) {
    auth.onAuthStateChanged(user => {
        if (user) {
            if (isDashboard) {
                const displayName = user.displayName || user.email.split('@')[0];
                document.getElementById('user-name').textContent = displayName;
            }
        } else {
            window.location.href = 'index.html';
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    }
}