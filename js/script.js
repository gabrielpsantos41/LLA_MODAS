/* ============================================================
   L.L.A MODAS — script.js
   Funcionalidades: navbar dinâmica, back-to-top, formulário,
   filtros de produto, lazy loading, smooth scroll
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Inicialização após DOM pronto ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initBackToTop();
    initFormContact();
    initLazyImages();
    initProductFilter();
    initAOS();
    highlightActiveNav();

    // Atualiza ano automaticamente
document.querySelectorAll('.footer-year').forEach(function(el) {
  el.textContent = new Date().getFullYear();
});
  });

  /* --------------------------------------------------------
     1. NAVBAR — transparente no topo, vermelha no scroll
  -------------------------------------------------------- */
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    function toggleNavbar() {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', toggleNavbar, { passive: true });
    toggleNavbar(); // estado inicial

    // Fecha menu mobile ao clicar em link
    var links = navbar.querySelectorAll('.nav-link');
    var toggler = navbar.querySelector('.navbar-collapse');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        if (toggler && toggler.classList.contains('show')) {
          var bsCollapse = bootstrap.Collapse.getInstance(toggler);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  /* --------------------------------------------------------
     2. ACTIVE NAV — marca link ativo conforme scroll
  -------------------------------------------------------- */
  function highlightActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('#navbar .nav-link[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    function setActive() {
      var scrollPos = window.scrollY + 100;
      sections.forEach(function (section) {
        if (scrollPos >= section.offsetTop &&
            scrollPos < section.offsetTop + section.offsetHeight) {
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + section.id) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', setActive, { passive: true });
  }

  /* --------------------------------------------------------
     3. VOLTAR AO TOPO
  -------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------
     4. FORMULÁRIO DE CONTATO — StaticForms
  -------------------------------------------------------- */
  function initFormContact() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var successMsg = document.getElementById('form-success');
    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Feedback visual de envio
      var originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Enviando...';
      submitBtn.disabled = true;

      var formData = new FormData(form);

      fetch('https://api.staticforms.xyz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessKey: 'SUA_ACCESS_KEY_STATICFORMS', // substitua pela chave real
          name:    formData.get('name'),
          phone:   formData.get('phone'),
          email:   formData.get('email'),
          message: formData.get('message'),
          replyTo: formData.get('email'),
          subject: 'Contato via site — L.L.A Modas'
        })
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          form.reset();
          if (successMsg) {
            successMsg.style.display = 'flex';
            setTimeout(function () {
              successMsg.style.display = 'none';
            }, 6000);
          }
        } else {
          alert('Não foi possível enviar a mensagem. Tente novamente.');
        }
      })
      .catch(function () {
        alert('Erro de conexão. Por favor, tente novamente.');
      })
      .finally(function () {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
    });
  }

  /* --------------------------------------------------------
     5. LAZY LOADING — imagens com data-src
  -------------------------------------------------------- */
  function initLazyImages() {
    var lazyImgs = document.querySelectorAll('img[data-src]');
    if (!lazyImgs.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '0px 0px 200px 0px' });

      lazyImgs.forEach(function (img) { observer.observe(img); });
    } else {
      // Fallback para browsers antigos
      lazyImgs.forEach(function (img) {
        img.src = img.dataset.src;
      });
    }
  }

  /* --------------------------------------------------------
     6. FILTRO DE PRODUTOS (produtos.html)
  -------------------------------------------------------- */
  function initProductFilter() {
    var filterBtns = document.querySelectorAll('.cat-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Atualiza botão ativo
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.dataset.filter;

        // Mostra/oculta seções de categoria
        var sections = document.querySelectorAll('.cat-section');
        sections.forEach(function (sec) {
          if (filter === 'todos' || sec.dataset.cat === filter) {
            sec.style.display = '';
          } else {
            sec.style.display = 'none';
          }
        });

        // Re-trigger AOS para elementos recém-exibidos
        if (window.AOS) { AOS.refresh(); }
      });
    });
  }

  /* --------------------------------------------------------
     7. AOS — inicia animações scroll
  -------------------------------------------------------- */
  function initAOS() {
    if (window.AOS) {
      AOS.init({
        duration: 650,
        easing: 'ease-out-quad',
        once: true,
        offset: 60
      });
    }
  }

  /* --------------------------------------------------------
     8. WhatsApp — link helper
  -------------------------------------------------------- */
  window.abrirWhatsApp = function (mensagem) {
    var msg = mensagem || 'Olá! Gostaria de conhecer as roupas da L.L.A Modas.';
    var link = 'https://wa.me/5511971359114?text=' + encodeURIComponent(msg);
    window.open(link, '_blank');
  };

})();
