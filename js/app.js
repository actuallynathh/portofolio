const $ = function(s) { return document.querySelector(s); };
function esc(s) { return String(s).replace(/[&<>"]/g, function(c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }

if ($("#chromaGrid")) {
    const grid = $("#chromaGrid");

    // 1. Tentukan warna aksen glow untuk tiap proyek secara manual (opsional, jika tidak ada di data)
    const getAccentColor = (id) => {
        const accents = {
            "xpvest": "#22c55e",
            "web-security": "#3fb8ff",
            "flight-ticket": "#a98bff",
            "spot": "#ffd23f",
            "learnpath": "#ff7eb6",
            "budget-explorer": "#ff5a36"
        };
        return accents[id] || "#00ff87"; // Warna default hijau neon
    };

    // 2. Render Struktur HTML Kartu
    grid.innerHTML = PROJ.map(function(p) {
        const accent = p.accent || getAccentColor(p.id || p.t.toLowerCase().replace(/\s+/g, '-'));
        const imgSrc = p.posterImg || p.image || 'assets/project-placeholder.svg';
        
        return `
            <a class="chroma-card" href="${p.link && p.link !== '#' ? p.link : '#projects'}"${p.link && p.link !== '#' ? ' target="_blank" rel="noopener noreferrer"' : ''} style="--chroma-accent: ${accent};">
                <span class="chroma-wash" aria-hidden="true"></span>
                <div class="chroma-media">
                    <img class="chroma-mono" src="${imgSrc}" alt="${esc(p.t)}" loading="lazy" />
                    <img class="chroma-color" src="${imgSrc}" alt="" aria-hidden="true" loading="lazy" />
                    <span class="chroma-media-rim" aria-hidden="true"></span>
                </div>
                <div class="chroma-info">
                    <h3>${esc(p.t)}</h3>
                    <p>${esc(p.d)}</p>
                </div>
                <span class="chroma-card-rim" aria-hidden="true"></span>
                <span class="chroma-card-glow" aria-hidden="true"></span>
            </a>
        `;
    }).join("");

    // 3. Logika Spotlight Animation (RequestAnimationFrame)
    const state = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0, primed: false };
    let raf = 0;

    // Kalkulasi jarak absolut tiap kartu dari kontainer grid
    const calculateOffsets = () => {
        const box = grid.getBoundingClientRect();
        grid.querySelectorAll('.chroma-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--chroma-ox', `${rect.left - box.left}px`);
            card.style.setProperty('--chroma-oy', `${rect.top - box.top}px`);
        });
    };

    // Animasi pergerakan kursor yang mulus (Lerp)
    const frame = () => {
        const damping = 0.25; 
        state.x += (state.tx - state.x) * damping;
        state.y += (state.ty - state.y) * damping;
        state.power += (state.target - state.power) * 0.15;

        grid.style.setProperty('--chroma-x', `${state.x}px`);
        grid.style.setProperty('--chroma-y', `${state.y}px`);
        grid.style.setProperty('--chroma-power', state.power.toFixed(4));

        const settled = Math.abs(state.tx - state.x) < 0.5 && Math.abs(state.target - state.power) < 0.01;
        if (!settled) {
            raf = requestAnimationFrame(frame);
        } else {
            raf = 0;
        }
    };

    const wake = () => {
        if (!raf) raf = requestAnimationFrame(frame);
    };

    // Deteksi Kursor
    const onMove = (e) => {
        const box = grid.getBoundingClientRect();
        state.tx = e.clientX - box.left;
        state.ty = e.clientY - box.top;
        if (!state.primed || state.power < 0.05) {
            state.x = state.tx;
            state.y = state.ty;
            state.primed = true;
        }
        state.target = 1;
        wake();
    };

    const onLeave = () => {
        state.target = 0;
        wake();
    };

    // Inisialisasi Event Listener
    grid.addEventListener('mousemove', onMove);
    grid.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', calculateOffsets);
    
    // Kalkulasi pertama kali setelah render
    setTimeout(calculateOffsets, 100);
}


// Theme Toggle
const root = document.documentElement;
function dark() { let t = root.getAttribute("data-theme"); return t ? t === "dark" : matchMedia("(prefers-color-scheme:dark)").matches; }
if ($("#tbtn")) $("#tbtn").onclick = function() { root.setAttribute("data-theme", dark() ? "light" : "dark"); };

// Search Logic
let IDX = [];
EXP.forEach(function(x) { IDX.push({ k: "Experience", t: x.t, s: x.o, tags: x.tags.concat(x.l || []), href: "#experience" }); });
PROJ.forEach(function(p) { IDX.push({ k: "Project", t: p.t, s: p.d, tags: p.tags, href: "#projects" }); });
ACH.forEach(function(a) { IDX.push({ k: "Achievement", t: a.t, s: a.o, tags: a.tags, href: "#experience" }); });
INT.forEach(function(i) { IDX.push({ k: "Interest", t: i, s: "", tags: [i], href: "#interests" }); });

const CH = ["Governance", "CodeIgniter", "Hackathon", "Cybersecurity", "Fintech", "Leadership"];
if ($("#chips")) $("#chips").innerHTML = CH.map(function(c) { return '<button data-q="' + c + '">' + c + '</button>'; }).join("");

function run() {
    let q = $("#q").value.trim().toLowerCase(), r = $("#res");
    if (!r) return;
    let list = IDX.filter(function(i) { return !q || (i.t + " " + i.s + " " + i.tags.join(" ") + " " + i.k).toLowerCase().indexOf(q) > -1; });
    
    r.innerHTML = list.length ? list.map(function(i) { 
        let clickEvent = i.oc ? ' onclick="' + i.oc + '"' : '';
        return '<a href="' + i.href + '"' + clickEvent + '><b><em>' + i.k + '</em>' + esc(i.t) + '</b>' + (i.s ? '<span>' + esc(i.s) + '</span>' : '') + '</a>'; 
    }).join("") : '<div class="none">Nothing matches “' + esc(q) + '”. Try a broader word like “IT” or “app”.</div>';
}
function openS() { if ($("#srch")) $("#srch").classList.add("on"); if ($("#q")) $("#q").value = ""; run(); setTimeout(function() { if ($("#q")) $("#q").focus(); }, 30); }
function closeS() { if ($("#srch")) $("#srch").classList.remove("on"); }

if ($("#sbtn")) $("#sbtn").onclick = openS; 
if ($("#sx")) $("#sx").onclick = closeS; 
if ($("#q")) $("#q").oninput = run;
if ($("#res")) $("#res").onclick = closeS;
if ($("#srch")) $("#srch").onclick = function(e) { if (e.target === this) closeS(); };

document.addEventListener("click", function(e) {
    let d = e.target.closest("[data-q]"); if (!d) return;
    if ($("#srch") && !$("#srch").classList.contains("on")) openS();
    if ($("#q")) { $("#q").value = d.getAttribute("data-q"); run(); $("#q").focus(); }
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        closeS();
    }
    if (e.key === "/" && !(document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName))) { e.preventDefault(); openS(); }
});

// Typewriter Effect
const phrases = ["Hi, I'm Michiko"];
let phraseIdx = 0, charIdx = 0, isDeleting = false;

function typeEffect() {
    const el = document.getElementById("typewriter");
    if (!el) return;
    const current = phrases[phraseIdx];

    if (isDeleting) {
        el.textContent = current.substring(0, charIdx - 1);
        charIdx--;
    } else {
        el.textContent = current.substring(0, charIdx + 1);
        charIdx++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIdx === current.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        speed = 300;
    }

    setTimeout(typeEffect, speed);
}

// Scroll Reveal Observer
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal-section").forEach(el => observer.observe(el));
}


function initFolderFloat() {
    const folder = document.getElementById("folderFloat");
    const container = document.getElementById("folderItems");
    const subLabel = document.getElementById("folderSub");
    const trigger = document.getElementById("folderTrigger");

    if (!folder || !container) return;

    const items = typeof INT !== "undefined" ? INT : ['IT Governance', 'Fintech', 'Gamification', 'Web Development', 'UI/UX Design'];
    if (subLabel) subLabel.textContent = `${items.length} topics`;

    // Balanced positions keep all focus-area labels readable around the folder.
    const positions = [
        { x: -112, y: -48, r: -3 },
        { x: 8,    y: -82, r: 2 },
        { x: 102,  y: -48, r: 3 },
        { x: -76,  y: -120, r: -2 },
        { x: 62,   y: -120, r: 2 }
    ];

    container.innerHTML = items.map((item, i) => {
        const p = positions[i % positions.length];
        return `
            <button type="button" class="folder-float__item" style="--i: ${i}; --x: ${p.x}px; --y: ${p.y}px; --r: ${p.r}deg;">
                <span class="folder-float__drift">${esc(item)}</span>
            </button>
        `;
    }).join("");

    let isOpen = false;
    function setOpen(open) {
        isOpen = open;
        if (isOpen) {
            folder.setAttribute("data-open", "");
        } else {
            folder.removeAttribute("data-open");
        }
        if (trigger) trigger.setAttribute("aria-expanded", String(isOpen));
    }

    folder.addEventListener("mouseenter", () => {
        if (window.matchMedia("(hover: hover)").matches) setOpen(true);
    });
    folder.addEventListener("mouseleave", () => {
        if (window.matchMedia("(hover: hover)").matches) setOpen(false);
    });
    if (trigger) {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            setOpen(!isOpen);
        });
        trigger.addEventListener("keydown", (e) => {
            if (e.key === "Escape") setOpen(false);
        });
    }
}

// ==========================================
// REFLECTIVE PROFILE CARD
// Vanilla JavaScript — no React required
// ==========================================

function initReflectiveCard() {
    const card = document.getElementById("profileCard");

    if (!card) return;

    const body = card.querySelector(".reflective-card__body");
    const photo = card.querySelector(".reflective-card__photo");

    // Read configurable values from the HTML data attributes.
    const readNumber = (name, fallback) => {
        const value = Number(card.dataset[name]);

        return Number.isFinite(value) ? value : fallback;
    };

    const tiltStrength = readNumber("tiltStrength", 12);

    const glareStrength = Math.max(
        0,
        Math.min(1, readNumber("glare", 0.5))
    );

    const shineStrength = Math.max(
        0,
        Math.min(1, readNumber("shine", 1))
    );

    const grayscale = Math.max(
        0,
        Math.min(1, readNumber("grayscale", 0))
    );

    const warp = Math.max(
        0,
        readNumber("warp", 0.6)
    );

    const bevel = Math.max(
        0,
        readNumber("bevel", 3)
    );

    const radius = Math.max(
        0,
        readNumber("radius", 24)
    );

    // Apply configuration to CSS custom properties.
    card.style.setProperty(
        "--profile-radius",
        `${radius}px`
    );

    card.style.setProperty(
        "--profile-bevel",
        `${bevel}px`
    );

    card.style.setProperty(
        "--profile-shine",
        shineStrength
    );

    card.style.setProperty(
        "--profile-glare",
        glareStrength
    );

    // 0 = full color, 1 = grayscale.
    if (photo) {
        photo.style.filter = `grayscale(${grayscale})`;
    }

    // Optional entrance animation.
    if (card.dataset.intro === "true") {
        card.classList.add("profile-card-intro");
    }

    // Reset the card when the pointer leaves.
    const reset = () => {
        if (body) {
            body.style.transform =
                "perspective(1000px) " +
                "rotateX(0deg) " +
                "rotateY(0deg) " +
                "scale3d(1, 1, 1)";
        }

        card.style.setProperty("--glare-x", "50%");
        card.style.setProperty("--glare-y", "50%");
        card.style.setProperty("--glare-opacity", "0");
        card.style.setProperty("--warp-x", "0px");
        card.style.setProperty("--warp-y", "0px");
    };

    // Update tilt and reflection as the pointer moves.
    const onMove = (event) => {
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const noHover = window.matchMedia(
            "(hover: none)"
        ).matches;

        if (reducedMotion || noHover) return;

        const rect = card.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        // Normalize pointer coordinates to a range of 0–1.
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        // Calculate 3D rotation.
        const rotateX = (0.5 - y) * tiltStrength;
        const rotateY = (x - 0.5) * tiltStrength;

        // Calculate subtle positional distortion.
        const warpX = (x - 0.5) * warp * 10;
        const warpY = (y - 0.5) * warp * 10;

        if (body) {
            body.style.transform =
                `perspective(1000px) ` +
                `rotateX(${rotateX}deg) ` +
                `rotateY(${rotateY}deg) ` +
                `translate3d(${warpX}px, ${warpY}px, ${shineStrength * 5}px) ` +
                `scale3d(1.015, 1.015, 1.015)`;
        }

        // Move the reflection with the pointer.
        card.style.setProperty(
            "--glare-x",
            `${x * 100}%`
        );

        card.style.setProperty(
            "--glare-y",
            `${y * 100}%`
        );

        card.style.setProperty(
            "--glare-opacity",
            String(glareStrength)
        );

        card.style.setProperty("--warp-x", `${warpX}px`);
        card.style.setProperty("--warp-y", `${warpY}px`);
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", reset);
    card.addEventListener("pointercancel", reset);
}

function initColorBends() {
   const container = document.getElementById("bgCanvas");
    if (!container || typeof THREE === "undefined") return;

    const MAX_COLORS = 8;

    const vert = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    const frag = `
        #define MAX_COLORS ${MAX_COLORS}
        uniform vec2 uCanvas;
        uniform float uTime;
        uniform float uSpeed;
        uniform vec2 uRot;
        uniform int uColorCount;
        uniform vec3 uColors[MAX_COLORS];
        uniform int uTransparent;
        uniform float uScale;
        uniform float uFrequency;
        uniform float uWarpStrength;
        uniform vec2 uPointer;
        uniform float uMouseInfluence;
        uniform float uParallax;
        uniform float uNoise;
        uniform int uIterations;
        uniform float uIntensity;
        uniform float uBandWidth;
        varying vec2 vUv;

        void main() {
            float t = uTime * uSpeed;
            vec2 p = vUv * 2.0 - 1.0;
            p += uPointer * uParallax * 0.1;
            vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
            vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
            q /= max(uScale, 0.0001);
            q /= 0.5 + 0.2 * dot(q, q);
            q += 0.2 * cos(t) - 7.56;
            vec2 toward = (uPointer - rp);
            q += toward * uMouseInfluence * 0.2;

            for (int j = 0; j < 5; j++) {
                if (j >= uIterations - 1) break;
                vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
                q += (rr - q) * 0.15;
            }

            vec3 col = vec3(0.0);
            float a = 1.0;

            if (uColorCount > 0) {
                vec2 s = q;
                vec3 sumCol = vec3(0.0);
                float cover = 0.0;
                for (int i = 0; i < MAX_COLORS; ++i) {
                    if (i >= uColorCount) break;
                    s -= 0.01;
                    vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
                    float kBelow = clamp(uWarpStrength, 0.0, 1.0);
                    float kMix = pow(kBelow, 0.3);
                    float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
                    vec2 disp = (r - s) * kBelow;
                    vec2 warped = s + disp * gain;
                    float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
                    float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
                    float m = mix(m0, m1, kMix);
                    float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
                    sumCol += uColors[i] * w;
                    cover = max(cover, w);
                }
                col = clamp(sumCol, 0.0, 1.0);
                a = uTransparent > 0 ? cover : 1.0;
            }

            col *= uIntensity;

            if (uNoise > 0.0001) {
                float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
                col += (n - 0.5) * uNoise;
                col = clamp(col, 0.0, 1.0);
            }

            vec3 rgb = (uTransparent > 0) ? col * a : col;
            gl_FragColor = vec4(rgb, a);
        }
    `;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const paletteHex = ["#22c55e", "#056a4e", "#00ff87"];
    const uColorsArray = Array.from({ length: MAX_COLORS }, (_, i) => {
        if (i < paletteHex.length) {
            const c = new THREE.Color(paletteHex[i]);
            return new THREE.Vector3(c.r, c.g, c.b);
        }
        return new THREE.Vector3(0, 0, 0);
    });

    const material = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
            uCanvas: { value: new THREE.Vector2(container.offsetWidth || window.innerWidth, container.offsetHeight || 500) },
            uTime: { value: 0 },
            uSpeed: { value: 0.2 },
            uRot: { value: new THREE.Vector2(0, 1) },
            uColorCount: { value: paletteHex.length },
            uColors: { value: uColorsArray },
            uTransparent: { value: 1 },
            uScale: { value: 1.0 },
            uFrequency: { value: 1.0 },
            uWarpStrength: { value: 1.0 },
            uPointer: { value: new THREE.Vector2(0, 0) },
            uMouseInfluence: { value: 0.8 },
            uParallax: { value: 0.4 },
            uNoise: { value: 0.12 },
            uIterations: { value: 1 },
            uIntensity: { value: 1.4 },
            uBandWidth: { value: 6.0 }
        },
        transparent: true,
        premultipliedAlpha: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    
    function updateSize() {
        const w = container.offsetWidth || window.innerWidth;
        const h = container.offsetHeight || 500;
        renderer.setSize(w, h);
        material.uniforms.uCanvas.value.set(w, h);
    }
    updateSize();
    container.appendChild(renderer.domElement);

    const clock = new THREE.Clock();
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);

    window.addEventListener("pointermove", (e) => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        pointerTarget.set(x, y);
    });

    window.addEventListener("resize", updateSize);

    function animate() {
        requestAnimationFrame(animate);
        const dt = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        material.uniforms.uTime.value = elapsed;

        pointerCurrent.lerp(pointerTarget, Math.min(1, dt * 6));
        material.uniforms.uPointer.value.copy(pointerCurrent);

        renderer.render(scene, camera);
    }

    animate();
}

// CONTACT FORM: prepare an email draft without a third-party backend.
function initContactForm() {
    const form = document.getElementById("contactForm");
    const note = document.getElementById("contactFormNote");
    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const formData = new FormData(form);
        const name = String(formData.get("name") || "").trim();
        const senderEmail = String(formData.get("email") || "").trim();
        const reason = String(formData.get("reason") || "").trim();
        const message = String(formData.get("message") || "").trim();
        const subject = encodeURIComponent(`[Portfolio] ${reason} — ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${senderEmail}\nReason: ${reason}\n\nMessage:\n${message}`
        );

        if (note) note.textContent = "Your email app should open with a draft. Please review it and press Send.";
        window.location.href = `mailto:${CFG.email}?subject=${subject}&body=${body}`;
    });
}

// ==========================================
// PANGGIL SEMUA INISIALISASI SAAT DOM SIAP
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const resumeLink = document.getElementById("resume");
    if (resumeLink && CFG.resume) {
        resumeLink.href = CFG.resume;
        resumeLink.setAttribute("download", "Michiko-Resume.pdf");
    }
    typeEffect();
    initScrollReveal();
    initFolderFloat();
    initReflectiveCard();
    initColorBends();
    initContactForm();
});

// ==========================================
// DYNAMIC TIME-BASED GREETING LOGO
// ==========================================
function updateGreetingLogo() {
    const logoEl = document.querySelector('.logo');
    if (!logoEl) return;

    const hour = new Date().getHours();
    let greeting = "Good evening"; // Default malam (18:00 - 04:59)

    if (hour >= 5 && hour < 12) {
        greeting = "Good morning"; // Pagi (05:00 - 11:59)
    } else if (hour >= 12 && hour < 18) {
        greeting = "Good afternoon"; // Siang/Sore (12:00 - 17:59)
    }

    // Mempertahankan tag <i> jika ada styling khusus di CSS bawaan
    logoEl.innerHTML = `${greeting}<i></i>`;
}

// Panggil fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", updateGreetingLogo);
initReflectiveCard();