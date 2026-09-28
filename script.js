(() => {
  const header = document.querySelector('#site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const dialog = document.querySelector('#info-dialog');

  document.querySelector('#year').textContent = new Date().getFullYear();

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    nav.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-32% 0px -58% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  const showDialog = (title, copy) => {
    document.querySelector('#dialog-title').textContent = title;
    document.querySelector('#dialog-copy').textContent = copy;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else window.alert(`${title}\n\n${copy}`);
  };
  document.querySelectorAll('[data-service]').forEach(button => {
    button.addEventListener('click', () => showDialog(
      `${button.dataset.service} options`,
      'This is a general dental care category, not a confirmed service at this location. Call (833) 567-5851 to ask the team about availability.'
    ));
  });
  document.querySelectorAll('[data-legal]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const title = link.textContent.trim();
      showDialog(title, link.dataset.legal);
    });
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  const appointmentForm = document.querySelector('#appointment-form');
  const formStatus = document.querySelector('#form-status');
  const dateInput = appointmentForm.elements.date;
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  appointmentForm.addEventListener('submit', event => {
    event.preventDefault();
    formStatus.textContent = '';
    appointmentForm.querySelectorAll('.field-error').forEach(item => { item.textContent = ''; });
    appointmentForm.querySelectorAll('[aria-invalid="true"]').forEach(item => item.removeAttribute('aria-invalid'));

    const requiredFields = [...appointmentForm.querySelectorAll('[required]')];
    let firstInvalid = null;
    requiredFields.forEach(field => {
      let message = '';
      if (!field.value.trim()) message = 'Please complete this field.';
      else if (field.name === 'name' && field.value.trim().length < 2) message = 'Please enter your full name.';
      else if (field.name === 'phone' && field.value.replace(/\D/g, '').length < 7) message = 'Please enter a valid phone number.';
      else if (field.name === 'email' && !field.validity.valid) message = 'Please enter a valid email address.';

      if (message) {
        field.setAttribute('aria-invalid', 'true');
        field.closest('.field').querySelector('.field-error').textContent = message;
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (dateInput.value && dateInput.value < dateInput.min) {
      dateInput.setAttribute('aria-invalid', 'true');
      dateInput.closest('.field').querySelector('.field-error').textContent = 'Choose today or a future date.';
      if (!firstInvalid) firstInvalid = dateInput;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      formStatus.textContent = 'Please review the highlighted fields.';
      return;
    }
    formStatus.textContent = 'Your details look ready. This preview does not send or store requests. Please call (833) 567-5851 to complete your appointment request.';
  });

  appointmentForm.querySelectorAll('input,select,textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        field.removeAttribute('aria-invalid');
        field.closest('.field').querySelector('.field-error').textContent = '';
      }
    });
  });
})();
