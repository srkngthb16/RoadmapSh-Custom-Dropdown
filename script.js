(() => {
  const dropdown = document.getElementById('my-dropdown');
  const button = dropdown.querySelector('.dropdown__button');
  const label = dropdown.querySelector('.dropdown__label');
  const list = dropdown.querySelector('.dropdown__list');
  const items = Array.from(dropdown.querySelectorAll('.dropdown__item'));

  let selectedIndex = -1; // none

  function open() {
    dropdown.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    // move focus into list to allow keyboard navigation
    list.focus();
  }

  function close() {
    dropdown.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.focus();
  }

  function toggle() {
    if (dropdown.classList.contains('open')) close(); else open();
  }

  function selectItem(index) {
    if (selectedIndex >= 0) {
      items[selectedIndex].classList.remove('selected');
      items[selectedIndex].setAttribute('aria-selected', 'false');
    }
    selectedIndex = index;
    const it = items[index];
    it.classList.add('selected');
    it.setAttribute('aria-selected', 'true');
    label.textContent = it.textContent;
    // add check mark element if not present
    if (!it.querySelector('.check')) {
      const chk = document.createElement('span');
      chk.className = 'check';
      chk.textContent = '✓';
      it.appendChild(chk);
    }
    close();
  }

  // Click handlers
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  items.forEach((it, idx) => {
    it.addEventListener('click', (e) => {
      e.stopPropagation();
      selectItem(idx);
    });
    it.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectItem(idx);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (idx + 1) % items.length;
        items[next].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (idx - 1 + items.length) % items.length;
        items[prev].focus();
      }
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) close();
  });

  // keyboard on button
  button.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      open();
      // focus first item
      items[0].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      open();
      items[items.length - 1].focus();
    }
  });

  // close on Escape when open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      e.preventDefault();
      close();
    }
  });

  // initialize aria-selected
  items.forEach((it) => it.setAttribute('aria-selected', 'false'));

  // small helper: allow pressing space on button to toggle
  button.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  });

})();
