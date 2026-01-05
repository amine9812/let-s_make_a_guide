// Tiny helper to find elements. It keeps code short and readable.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

// Safe wrapper around localStorage.
// Some browsers block it in privacy modes, so we guard with try/catch.
const storage = (() => {
  try {
    const testKey = "__test";
    window.localStorage.setItem(testKey, "ok");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (err) {
    console.warn("localStorage is not available; progress will not persist.", err);
    return null;
  }
})();

const load = (key, fallback) => {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
};

const save = (key, value) => {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // If quota fails, we silently ignore to keep the app usable.
  }
};

// Progress checklist shared by all pages.
function setupChecklist(page) {
  const boxes = $$('[data-progress]');
  if (!boxes.length) return;
  const key = `progress-${page}`;
  const saved = load(key, {});

  boxes.forEach((box) => {
    const id = box.dataset.progress;
    box.checked = Boolean(saved[id]);
    box.addEventListener('change', () => {
      saved[id] = box.checked;
      save(key, saved);
    });
  });

  const resetButtons = $$('[data-reset]');
  resetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      boxes.forEach((box) => {
        box.checked = false;
      });
      save(key, {});
    });
  });
}

// HTML page live card demo.
function initHtmlPage() {
  const editor = $('#html-editor');
  const preview = $('#html-preview');
  if (!editor || !preview) return;

  const parts = {
    title: $('h3', preview),
    text: $('p', preview),
    button: $('button', preview)
  };

  const update = () => {
    $$('input[data-field]', editor).forEach((input) => {
      const key = input.dataset.field;
      const value = input.value;
      if (parts[key]) {
        parts[key].textContent = value;
      }
    });
  };

  editor.addEventListener('input', update);
  update(); // Set initial state.
}

// CSS page demos.
function initCssPage() {
  const boxPreview = $('#box-preview');
  const boxControls = $('#box-controls');
  if (boxPreview && boxControls) {
    const setVar = (name, value) => boxPreview.style.setProperty(`--${name}`, value);
    // Set defaults from the inputs.
    $$('input[data-var]', boxControls).forEach((input) => {
      const name = input.dataset.var;
      setVar(name, input.value + (name === 'hue' ? '' : 'px'));
      input.addEventListener('input', () => {
        const unit = name === 'hue' ? '' : 'px';
        setVar(name, input.value + unit);
      });
    });
  }

  const flexDemo = $('#flex-demo');
  const flexControls = $('#flex-controls');
  if (flexDemo && flexControls) {
    const applyFlex = () => {
      const justify = $('[data-flex="justify"]', flexControls).value;
      const align = $('[data-flex="align"]', flexControls).value;
      flexDemo.style.justifyContent = justify;
      flexDemo.style.alignItems = align;
    };
    flexControls.addEventListener('change', applyFlex);
    applyFlex();
  }
}

// JavaScript page demos.
function initJsPage() {
  const counter = $('#js-counter');
  if (counter) {
    let count = 0;
    const output = $('output', counter);
    const render = () => {
      output.textContent = count;
    };
    $$('button[data-change]', counter).forEach((btn) => {
      btn.addEventListener('click', () => {
        const delta = Number(btn.dataset.change);
        count += delta;
        render();
      });
    });
    render();
  }

  const charInput = $('#char-input');
  const charCount = $('#char-count');
  if (charInput && charCount) {
    const updateCount = () => {
      // .length gives the number of characters typed.
      charCount.textContent = charInput.value.length;
    };
    charInput.addEventListener('input', updateCount);
    updateCount();
  }

  // Simple todo list with localStorage.
  const todoForm = $('#todo-form');
  const todoList = $('#todo-list');
  if (todoForm && todoList) {
    const key = 'js-todos';
    let todos = load(key, []);

    const saveTodos = () => save(key, todos);

    const renderTodos = () => {
      todoList.innerHTML = '';
      todos.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${task}</span>`;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'button ghost';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
          // Remove one item and re-render.
          todos.splice(index, 1);
          saveTodos();
          renderTodos();
        });
        li.appendChild(remove);
        todoList.appendChild(li);
      });
    };

    todoForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Stop the page from reloading.
      const data = new FormData(todoForm);
      const task = (data.get('task') || '').toString().trim();
      if (!task) return;
      todos.push(task);
      saveTodos();
      renderTodos();
      todoForm.reset();
    });

    renderTodos();
  }
}

// Initialize the right page based on data-page.
function initPage() {
  const page = document.body.dataset.page || 'home';
  setupChecklist(page);

  if (page === 'html') initHtmlPage();
  if (page === 'css') initCssPage();
  if (page === 'js') initJsPage();
}

// Run after DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
