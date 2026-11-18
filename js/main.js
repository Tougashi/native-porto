const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
}

// Theme: light / dark (system preference until user clicks toggle; choice is saved)
const THEME_KEY = "porto-theme";
const root = document.documentElement;

function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
}

function setTheme(value, save) {
    root.setAttribute("data-theme", value);
    if (save) localStorage.setItem(THEME_KEY, value);
}

function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initTheme() {
    const stored = getStoredTheme();
    if (stored === "light" || stored === "dark") {
        setTheme(stored, false);
    } else {
        setTheme(getSystemTheme(), false);
    }
}

function toggleTheme() {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next, true);
}

initTheme();

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!getStoredTheme()) setTheme(getSystemTheme(), false);
});

// Interactive Project Carousel
function initCarousels() {
    const carousels = document.querySelectorAll("[data-carousel]");
    carousels.forEach((carousel) => {
        const track = carousel.querySelector(".carousel-track");
        const slides = carousel.querySelectorAll(".carousel-slide");
        const prevBtn = carousel.querySelector(".carousel-btn.prev");
        const nextBtn = carousel.querySelector(".carousel-btn.next");
        const dots = carousel.querySelectorAll(".carousel-indicators .dot");

        if (!track || slides.length === 0) return;

        let currentIndex = 0;
        let autoPlayTimer = null;

        function updateCarousel(index) {
            currentIndex = (index + slides.length) % slides.length;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === currentIndex);
            });
        }

        function nextSlide() {
            updateCarousel(currentIndex + 1);
        }

        function prevSlide() {
            updateCarousel(currentIndex - 1);
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
                resetAutoPlay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
                resetAutoPlay();
            });
        }

        dots.forEach((dot) => {
            dot.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(dot.getAttribute("data-index"), 10);
                if (!isNaN(index)) {
                    updateCarousel(index);
                    resetAutoPlay();
                }
            });
        });

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayTimer = setInterval(nextSlide, 4500);
        }

        function stopAutoPlay() {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
            }
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        carousel.addEventListener("mouseenter", stopAutoPlay);
        carousel.addEventListener("mouseleave", startAutoPlay);

        // Touch/swipe navigation for mobile
        let startX = 0;
        carousel.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
            stopAutoPlay();
        }, { passive: true });

        carousel.addEventListener("touchend", (e) => {
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            if (Math.abs(diffX) > 40) {
                if (diffX > 0) nextSlide();
                else prevSlide();
            }
            startAutoPlay();
        }, { passive: true });

        startAutoPlay();
    });
}

initCarousels();

// ==========================================
// Discord Real-Time Presence via Lanyard
// ==========================================
const DISCORD_USER_ID = "627121036181110814";

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderDiscordPresence(data) {
    if (!data) return;
    const user = data.discord_user;
    const status = data.discord_status || "offline";
    const statusDot = document.getElementById("discord-status-dot");
    const statusText = document.getElementById("discord-status-text");
    const avatarEl = document.getElementById("discord-avatar");
    const displayNameEl = document.getElementById("discord-display-name");
    const usernameEl = document.getElementById("discord-username");
    const actContainer = document.getElementById("discord-activity-container");

    // Profile & Avatar
    if (user) {
        if (avatarEl && user.avatar) {
            const ext = user.avatar.startsWith("a_") ? "gif" : "png";
            avatarEl.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
        }
        if (displayNameEl) {
            displayNameEl.textContent = user.global_name || user.display_name || user.username;
        }
        if (usernameEl) {
            usernameEl.textContent = `@${user.username}`;
        }
    }

    // Status Indicator
    if (statusDot) {
        statusDot.className = `discord-status-dot ${status}`;
        statusDot.title = status.toUpperCase();
    }
    if (statusText) {
        const statusMap = {
            online: "Online",
            idle: "Idle / Away",
            dnd: "Do Not Disturb",
            offline: "Offline"
        };
        statusText.textContent = statusMap[status] || status;
    }

    if (!actContainer) return;

    // 1. Spotify
    if (data.listening_to_spotify && data.spotify) {
        const s = data.spotify;
        actContainer.innerHTML = `
            <div class="discord-act-card">
                <div class="discord-act-img-wrap">
                    <img src="${s.album_art_url}" alt="${escapeHtml(s.album)}" class="discord-act-img" />
                    <span class="discord-act-small-img" style="background:#1db954;display:grid;place-items:center;color:#ffffff;font-size:11px;font-weight:bold;">♫</span>
                </div>
                <div class="discord-act-details">
                    <span class="discord-act-header" style="color:#1db954;">Listening to Spotify</span>
                    <span class="discord-act-title"><a href="https://open.spotify.com/track/${s.track_id}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.song)}</a></span>
                    <span class="discord-act-subtitle">by ${escapeHtml(s.artist)}</span>
                    <span class="discord-act-state">on ${escapeHtml(s.album)}</span>
                </div>
            </div>
        `;
        return;
    }

    // 2. Main Activity (Game, VS Code, Apps - type != 4)
    const mainActivity = (data.activities || []).find((a) => a.type !== 4);
    const customStatus = (data.activities || []).find((a) => a.type === 4);

    if (mainActivity) {
        let largeImgUrl = "";
        if (mainActivity.assets && mainActivity.assets.large_image) {
            const lImg = mainActivity.assets.large_image;
            if (lImg.startsWith("mp:external/")) {
                largeImgUrl = `https://media.discordapp.net/external/${lImg.replace("mp:external/", "")}`;
            } else {
                largeImgUrl = `https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${lImg}.png`;
            }
        }

        let smallImgUrl = "";
        if (mainActivity.assets && mainActivity.assets.small_image) {
            const sImg = mainActivity.assets.small_image;
            if (sImg.startsWith("mp:external/")) {
                smallImgUrl = `https://media.discordapp.net/external/${sImg.replace("mp:external/", "")}`;
            } else {
                smallImgUrl = `https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${sImg}.png`;
            }
        }

        let timeStr = "";
        if (mainActivity.timestamps && mainActivity.timestamps.start) {
            const elapsed = Math.floor((Date.now() - mainActivity.timestamps.start) / 1000);
            if (elapsed > 0) {
                const hrs = Math.floor(elapsed / 3600);
                const mins = Math.floor((elapsed % 3600) / 60);
                timeStr = hrs > 0 ? `${hrs}h ${mins}m elapsed` : `${mins}m elapsed`;
            }
        }

        actContainer.innerHTML = `
            <div class="discord-act-card">
                ${largeImgUrl ? `
                    <div class="discord-act-img-wrap">
                        <img src="${largeImgUrl}" alt="${escapeHtml(mainActivity.name)}" class="discord-act-img" />
                        ${smallImgUrl ? `<img src="${smallImgUrl}" alt="" class="discord-act-small-img" />` : ''}
                    </div>
                ` : ''}
                <div class="discord-act-details">
                    <span class="discord-act-header">Playing / Active</span>
                    <span class="discord-act-title">${escapeHtml(mainActivity.name)}</span>
                    ${mainActivity.details ? `<span class="discord-act-subtitle">${escapeHtml(mainActivity.details)}</span>` : ''}
                    ${mainActivity.state ? `<span class="discord-act-state">${escapeHtml(mainActivity.state)}</span>` : ''}
                    ${timeStr ? `<span class="discord-act-time">${timeStr}</span>` : ''}
                </div>
            </div>
        `;
        return;
    }

    // 3. Custom Status
    if (customStatus && (customStatus.state || customStatus.emoji)) {
        actContainer.innerHTML = `
            <div class="discord-custom-status">
                ${customStatus.emoji && customStatus.emoji.id ? `
                    <img src="https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.png?size=32" alt="${customStatus.emoji.name}" style="width:20px;height:20px;" />
                ` : (customStatus.emoji ? `<span>${customStatus.emoji.name}</span>` : '')}
                <span>"${escapeHtml(customStatus.state || '')}"</span>
            </div>
        `;
        return;
    }

    // 4. Idle / No activity
    actContainer.innerHTML = `
        <div class="discord-idle-state">
            <span>☕ No active game or app · Currently chilling</span>
        </div>
    `;
}

function initDiscordPresence() {
    // 1. Initial REST fetch for instant rendering
    fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
        .then((res) => res.json())
        .then((body) => {
            if (body && body.success) {
                renderDiscordPresence(body.data);
            }
        })
        .catch(() => {});

    // 2. Real-time WebSocket connection
    let heartbeatTimer = null;
    let ws = null;

    function connectSocket() {
        try {
            ws = new WebSocket("wss://api.lanyard.rest/socket");
        } catch (e) {
            return;
        }

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const { op, t, d } = message;

                if (op === 1) {
                    // Hello: start heartbeat & subscribe to user presence
                    const interval = d.heartbeat_interval;
                    if (heartbeatTimer) clearInterval(heartbeatTimer);
                    heartbeatTimer = setInterval(() => {
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ op: 3 }));
                        }
                    }, interval);

                    ws.send(JSON.stringify({
                        op: 2,
                        d: { subscribe_to_id: DISCORD_USER_ID }
                    }));
                } else if (op === 0) {
                    if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
                        renderDiscordPresence(d);
                    }
                }
            } catch (err) {}
        };

        ws.onclose = () => {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            setTimeout(connectSocket, 5000);
        };

        ws.onerror = () => {
            ws.close();
        };
    }

    connectSocket();
}

initDiscordPresence();
