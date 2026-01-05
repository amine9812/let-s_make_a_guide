// Playground: mix HTML + CSS + JS in one card.
function initPlayground() {
  const card = $('#profile-card');
  if (!card) return;

  // Keep state in one object so updates are easy to track.
  const state = {
    name: 'Alex Kim',
    bio: 'Curious student who loves friendly code.',
    links: ['Docs', 'Music', 'Snacks'],
    color: '#4b8df8',
    pad: 16,
    radius: 14,
    dark: false,
    likes: 0
  };

  const els = {
    name: $('[data-slot="name"]', card),
    bio: $('[data-slot="bio"]', card),
    links: $('[data-slot="links"]', card),
    likes: $('[data-slot="likes"]', card),
    avatar: $('.avatar', card)
  };

  // Render writes the state values into the DOM.
  const render = () => {
    els.name.textContent = state.name;
    els.bio.textContent = state.bio;
    els.likes.textContent = state.likes;
    // Avatar shows the first letter of the name.
    els.avatar.textContent = state.name.charAt(0).toUpperCase() || 'A';

    // Build link chips from the links array.
    els.links.innerHTML = '';
    state.links.forEach((label) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.role = 'button';
      a.textContent = label;
      li.appendChild(a);
      els.links.appendChild(li);
    });

    // Apply CSS custom properties to control style.
    card.style.setProperty('--profile-color', state.color);
    card.style.setProperty('--profile-pad', `${state.pad}px`);
    card.style.setProperty('--profile-radius', `${state.radius}px`);

    // Toggle dark mode class.
    card.classList.toggle('dark', state.dark);
  };

  // Update state when inputs change.
  $$('[data-profile]').forEach((input) => {
    const key = input.dataset.profile;
    if (key === 'dark') {
      input.addEventListener('change', () => {
        state.dark = input.checked;
        render();
      });
      return;
    }

    if (key === 'like') {
      // Button in the control panel.
      input.addEventListener('click', () => {
        state.likes += 1;
        render();
      });
      return;
    }

    input.addEventListener('input', () => {
      if (key === 'name' || key === 'bio') {
        state[key] = input.value;
      } else if (key === 'links') {
        // Split on commas and trim spaces.
        state.links = input.value.split(',').map((item) => item.trim()).filter(Boolean);
      } else if (key === 'color') {
        state.color = input.value;
      } else if (key === 'pad' || key === 'radius') {
        state[key] = Number(input.value);
      }
      render();
    });
  });

  // Buttons inside the card also reuse the same state.
  $('[data-profile="like-display"]', card)?.addEventListener('click', () => {
    state.likes += 1;
    render();
  });

  $('[data-profile="dark-display"]', card)?.addEventListener('click', () => {
    state.dark = !state.dark;
    // Keep the control checkbox in sync.
    const darkToggle = $('[data-profile="dark"]');
    if (darkToggle) darkToggle.checked = state.dark;
    render();
  });

  // Reset button returns sliders and text to defaults.
  const resetButtons = $$('[data-reset]');
  resetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.name = 'Alex Kim';
      state.bio = 'Curious student who loves friendly code.';
      state.links = ['Docs', 'Music', 'Snacks'];
      state.color = '#4b8df8';
      state.pad = 16;
      state.radius = 14;
      state.dark = false;
      state.likes = 0;

      // Put controls back to match state.
      $$('[data-profile]').forEach((input) => {
        const key = input.dataset.profile;
        if (key in state && typeof state[key] === 'boolean') {
          input.checked = state[key];
        } else if (key === 'links') {
          input.value = state.links.join(',');
        } else if (key === 'pad' || key === 'radius') {
          input.value = state[key];
        } else if (key === 'color') {
          input.value = state.color;
        } else if (key === 'name' || key === 'bio') {
          input.value = state[key];
        }
      });

      render();
    });
  });

  render();
}

// Run after main app init to reuse helpers.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayground);
} else {
  initPlayground();
}
