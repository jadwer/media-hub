/**
 * @fileoverview Navigation system for switching between app sections
 * Handles sidebar menu and content section switching
 */

/**
 * Initializes navigation system
 */
export function initNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const sections = document.querySelectorAll('.content-section');

  // Add click event to each sidebar item
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionName = item.dataset.section;
      switchSection(sectionName);
    });
  });

  // Load saved section from localStorage or default to 'browse'
  const savedSection = localStorage.getItem('currentSection') || 'browse';
  switchSection(savedSection);
}

/**
 * Switches to a different section
 * @param {string} sectionName - Name of section to switch to ('browse', 'manage', 'playlists')
 */
export function switchSection(sectionName) {
  // Update sidebar active state
  document.querySelectorAll('.sidebar-item').forEach(item => {
    if (item.dataset.section === sectionName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update content sections
  document.querySelectorAll('.content-section').forEach(section => {
    if (section.id === `section-${sectionName}`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // Save to localStorage
  localStorage.setItem('currentSection', sectionName);
}
