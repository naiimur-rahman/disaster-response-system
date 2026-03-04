// sidebar.js — Shared sidebar HTML injected into every page
(function() {
  const nav = `
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <span class="logo-icon">🌊</span>
    <div>
      <div class="logo-text">DisasterRelief BD</div>
      <div class="logo-sub">Response & Coordination</div>
    </div>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-section-title">Overview</div>
    <a href="index.html"      class="nav-item"><span class="nav-icon">📊</span>Dashboard</a>
    <a href="disasters.html"  class="nav-item"><span class="nav-icon">🌊</span>Disasters</a>
    <div class="nav-section-title" style="margin-top:8px">Response</div>
    <a href="shelters.html"   class="nav-item"><span class="nav-icon">🏠</span>Shelters</a>
    <a href="victims.html"    class="nav-item"><span class="nav-icon">👥</span>Victims</a>
    <a href="family.html"     class="nav-item"><span class="nav-icon">❤️</span>Family Reunification</a>
    <a href="volunteers.html" class="nav-item"><span class="nav-icon">🙋</span>Volunteers</a>
    <a href="rescue.html"     class="nav-item"><span class="nav-icon">🚁</span>Rescue Operations</a>
    <a href="contacts.html"   class="nav-item"><span class="nav-icon">📞</span>Emergency Contacts</a>
    <div class="nav-section-title" style="margin-top:8px">Resources</div>
    <a href="resources.html"  class="nav-item"><span class="nav-icon">📦</span>Resources</a>
    <a href="donations.html"  class="nav-item"><span class="nav-icon">💰</span>Donations</a>
    <div class="nav-section-title" style="margin-top:8px">Analytics</div>
    <a href="reports.html"    class="nav-item"><span class="nav-icon">📋</span>Reports</a>
  </nav>
  <div class="sidebar-footer">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span id="sidebarUser">👤 Guest</span>
      <a href="login.html" id="logoutLink" style="color:var(--text-muted);font-size:0.75rem">Logout</a>
    </div>
    <div id="sidebarRole" style="font-size:0.7rem;color:var(--text-muted);margin-top:4px"></div>
  </div>
</aside>
<div class="sidebar-overlay" id="sidebarOverlay"></div>`;

  // Inject sidebar at beginning of .layout
  const layout = document.querySelector('.layout');
  if (layout) layout.insertAdjacentHTML('afterbegin', nav);

  // Show user info from token
  const userEl = document.getElementById('sidebarUser');
  const roleEl = document.getElementById('sidebarRole');
  const user   = sessionStorage.getItem('drUser');
  const role   = sessionStorage.getItem('drRole');
  if (userEl && user) userEl.textContent = '👤 ' + user;
  if (roleEl && role) roleEl.textContent = role;

  // Logout handler
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.clear();
      window.location.href = 'login.html';
    });
  }
})();
