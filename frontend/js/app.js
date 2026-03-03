// app.js — Global utilities: API helper, toast, modal, sidebar
'use strict';

/* ── Configuration ─────────────────────────────────────────── */
const API_BASE = window.location.origin + '/api';

/* ── API Helper ────────────────────────────────────────────── */
const api = {
    async get(path) {
        const res = await fetch(API_BASE + path);
        if (!res.ok) throw new Error((await res.json()).error || res.statusText);
        return res.json();
    },
    async post(path, body) {
        const res = await fetch(API_BASE + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || res.statusText);
        return res.json();
    },
    async put(path, body) {
        const res = await fetch(API_BASE + path, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || res.statusText);
        return res.json();
    },
};

/* ── Toast Notifications ───────────────────────────────────── */
function toast(msg, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container') || (() => {
        const c = document.createElement('div');
        c.id = 'toast-container';
        document.body.appendChild(c);
        return c;
    })();
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => {
        el.classList.add('hide');
        setTimeout(() => el.remove(), 300);
    }, duration);
}

/* ── Modal System ──────────────────────────────────────────── */
function openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('show'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('show'); document.body.style.overflow = ''; }
}
// Close on overlay click
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
        document.body.style.overflow = '';
    }
});

/* ── Sidebar Mobile Toggle ─────────────────────────────────── */
function initSidebar() {
    const toggle  = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay && overlay.classList.toggle('show');
    });
    overlay && overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });
}

/* ── Highlight Active Nav Item ─────────────────────────────── */
function setActiveNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(el => {
        const href = el.getAttribute('href') || '';
        if (href === page || (page === '' && href === 'index.html')) {
            el.classList.add('active');
        }
    });
}

/* ── Animated Counter ──────────────────────────────────────── */
function animateCounter(el, target, duration = 1500) {
    const start = performance.now();
    const from  = parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0;
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = from + (target - from) * ease;
        el.textContent = target >= 1000
            ? Math.round(value).toLocaleString()
            : value.toFixed(target % 1 !== 0 ? 2 : 0);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ── Format Helpers ────────────────────────────────────────── */
function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtCurrency(n) {
    if (!n) return '৳0';
    return '৳' + Number(n).toLocaleString('en-BD');
}
function timeAgo(d) {
    const diff = Date.now() - new Date(d).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
}

/* ── Badge HTML helpers ────────────────────────────────────── */
function statusBadge(status) {
    if (!status) return '—';
    const map = {
        'Active':      '<span class="badge badge-active"><span class="pulse-dot"></span>Active</span>',
        'Contained':   '<span class="badge badge-contained">Contained</span>',
        'Resolved':    '<span class="badge badge-resolved">Resolved</span>',
        'Open':        '<span class="badge badge-open">Open</span>',
        'Full':        '<span class="badge badge-full">Full</span>',
        'Closed':      '<span class="badge badge-closed">Closed</span>',
        'Safe':        '<span class="badge badge-safe">Safe</span>',
        'Missing':     '<span class="badge badge-missing"><span class="pulse-dot"></span>Missing</span>',
        'Injured':     '<span class="badge badge-injured">Injured</span>',
        'Critical':    '<span class="badge badge-critical"><span class="pulse-dot"></span>Critical</span>',
        'Deceased':    '<span class="badge badge-closed">Deceased</span>',
        'Available':   '<span class="badge badge-available">Available</span>',
        'Deployed':    '<span class="badge badge-deployed">Deployed</span>',
        'Unavailable': '<span class="badge badge-unavailable">Unavailable</span>',
    };
    return map[status] || `<span class="badge">${status}</span>`;
}
function severityBadge(s) {
    if (!s) return '—';
    return `<span class="badge badge-${s.toLowerCase()}">${s}</span>`;
}
function zoneBadge(t) {
    if (!t) return '—';
    return `<span class="badge badge-${t.toLowerCase()}">${t}</span>`;
}
function verifiedBadge(v) {
    return v ? '<span class="badge badge-verified">✅ Verified</span>' : '<span class="badge badge-pending">⏳ Pending</span>';
}
function skillTags(skills) {
    if (!skills) return '—';
    return skills.split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('');
}

/* ── Skeleton Rows ─────────────────────────────────────────── */
function skeletonRows(tbody, cols, rows = 5) {
    tbody.innerHTML = Array(rows).fill(
        `<tr>${Array(cols).fill('<td><div class="skeleton" style="height:14px;border-radius:4px"></div></td>').join('')}</tr>`
    ).join('');
}

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    setActiveNav();
});
