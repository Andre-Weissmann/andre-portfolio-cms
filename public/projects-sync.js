/* Shared project catalog → resume + All Projects grid.
   Source of truth: projects-catalog.json
   When you add a portfolio project:
     1) Add/update the entry in projects-catalog.json (tier, resume bullet, order)
     2) Add the interactive HTML block in portfolio.html if needed
     3) Rebuild/publish — resume.html picks up the catalog automatically
*/
(function () {
  'use strict';

  var CATALOG_URL = 'projects-catalog.json';
  var cache = null;

  function published(list) {
    return (list || []).filter(function (p) {
      return (p.status || 'published') === 'published';
    });
  }

  function byResumeOrder(a, b) {
    return (a.resumeOrder || 99) - (b.resumeOrder || 99);
  }

  function byFeaturedOrder(a, b) {
    return (a.featuredOrder || 99) - (b.featuredOrder || 99);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function projectHref(base, p) {
    return base.replace(/\/$/, '') + '/#' + p.anchor;
  }

  function loadCatalog() {
    if (cache) return Promise.resolve(cache);
    return fetch(CATALOG_URL, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('catalog ' + r.status);
        return r.json();
      })
      .then(function (data) {
        cache = data;
        return data;
      });
  }

  function renderResumeProjects(data) {
    var root = document.getElementById('resume-projects');
    if (!root) return;

    var base = data.portfolioBaseUrl || '';
    var projects = published(data.projects).sort(byResumeOrder);

    var linkEl = document.getElementById('resume-portfolio-link');
    if (linkEl) {
      linkEl.href = base;
      linkEl.textContent = base.replace(/^https?:\/\//, '');
    }

    root.innerHTML = projects.map(function (p) {
      var href = projectHref(base, p);
      return (
        '<div class="project" data-project-id="' + escapeHtml(p.id) + '">' +
          '<div class="project-title">' +
            '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener">' +
              '<span class="tool-tag">' + escapeHtml(p.tool) + '</span> ' +
              escapeHtml(p.resumeTitle) +
            '</a>' +
          '</div>' +
          '<div class="project-bullet">' + escapeHtml(p.resumeBullet) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function buildCopyText(data) {
    var base = (data.portfolioBaseUrl || '').replace(/^https?:\/\//, '');
    var projects = published(data.projects).sort(byResumeOrder);
    var lines = projects.map(function (p) {
      return p.tool + ' | ' + p.resumeTitle + '\n- ' + p.resumeBullet;
    });
    return {
      base: base,
      projectsBlock: lines.join('\n\n')
    };
  }

  function wireCopyResume(data) {
    var meta = buildCopyText(data);
    window.__resumeProjectsText = meta;

    // Replace global copyResume if present so projects always match catalog
    window.copyResume = function () {
      var text =
        'ANDRE WEISSMANN\n' +
        'Data Analyst | Healthcare Operations and Analytics\n' +
        'Chicago, IL | andre_weissmann@icloud.com | ' + meta.base +
        ' | linkedin.com/in/andre-weissmann | github.com/Andre-Weissmann\n\n' +
        'PROFESSIONAL SUMMARY\n' +
        'Data Analyst with 5+ years embedded inside EMS medical billing and healthcare operations, building technical solutions to real workflow problems. Hands-on with revenue cycle processes, claims analytics, and EHR documentation. Self-built a full analytics toolkit across SQL, Python, Power BI, Tableau, Excel, and VBA. Automated daily billing workflows using Excel macros, cutting manual processing time by 40%. Brings a rare combination of healthcare domain knowledge and analytical execution to every dataset.\n\n' +
        'CORE SKILLS\n' +
        'Languages and Analytics: SQL, Python, R, Visual Basic (VBA), Microsoft Excel (Power Query, Power Pivot, DAX, Macros)\n' +
        'Visualization and BI: Power BI, Tableau, Microsoft Excel, Exploratory Data Analysis (EDA), Data Cleaning and Validation\n' +
        'Healthcare Domain: Revenue Cycle, Claims Analytics, Medical Billing, ICD-10, CPT Codes, Denial Management, Accounts Receivable, Prior Authorization, HIPAA, EHR/EMR, HL7, FHIR, EDI 837/835\n' +
        'AI and Automation: Microsoft Copilot, Prompt Engineering, AI-Assisted Debugging, GitHub\n\n' +
        'DATA ANALYTICS PROJECTS\n' +
        'Full portfolio: ' + meta.base + '\n\n' +
        meta.projectsBlock + '\n\n' +
        'WORK EXPERIENCE\n\n' +
        'Mailroom Specialist (Billing and Claims Operations) | EMS Management and Consultants | Arlington Heights, IL\n' +
        'February 2021 to Present\n' +
        '- Processed approximately 1,200 insurance claims and payment documents per week, sorting, scanning, and logging PHI documents into billing systems with HIPAA-compliant handling across all patient records.\n' +
        '- Reconciled incoming insurance checks against billing records using Excel, counting and logging daily payment totals to ensure accurate intake reporting for the billing team.\n' +
        '- Built VBA macros in Excel automating daily tape runs and claim validation workflows, cutting manual processing time ~40% and eliminating a class of keying errors.\n' +
        '- Maintained HIPAA-compliant EHR/EMR documentation for thousands of patient accounts with zero PHI findings; sustained billing continuity through a full company acquisition in 2024.\n' +
        '- Used Microsoft Copilot and prompt engineering to debug VBA macro runtime errors, reducing development cycle time.\n\n' +
        'Stock Associate | Walmart | Palatine, IL\n' +
        'April 2020 to February 2021\n' +
        '- Maintained inventory accuracy across high-volume daily stock cycles; applied the same data verification and reconciliation discipline that carried into healthcare claims processing.\n\n' +
        'Team Member | Goodwill Industries International | Palatine, IL\n' +
        'April 2017 to April 2020\n' +
        '- Processed and tracked donated goods inventory across intake, categorization, and disposition workflows, maintaining accuracy across high daily item volume.\n\n' +
        'EDUCATION\n' +
        'Bachelor of Arts, Information Technology | Southern New Hampshire University | 2022 to 2024\n' +
        'Associate of Science, Health Information Technology | Harper College | 2003 to 2007\n' +
        'Continuing Education: Maven Analytics Lifetime Membership | SQL, Python, Power BI, Tableau, Excel';

      function done() {
        var btn = document.getElementById('copyBtn');
        if (!btn) return;
        btn.classList.add('copied');
        var span = btn.querySelector('span');
        if (span) span.textContent = 'Copied!';
        setTimeout(function () {
          btn.classList.remove('copied');
          if (span) span.textContent = 'Copy as text';
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text);
          done();
        });
      } else {
        fallbackCopy(text);
        done();
      }
    };
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function renderAllProjectsGrid(data) {
    var root = document.getElementById('all-projects-grid');
    if (!root) return;

    var projects = published(data.projects).slice().sort(function (a, b) {
      // Featured first, then resume order
      var ta = a.tier === 'featured' ? 0 : 1;
      var tb = b.tier === 'featured' ? 0 : 1;
      if (ta !== tb) return ta - tb;
      if (a.tier === 'featured') return byFeaturedOrder(a, b);
      return byResumeOrder(a, b);
    });

    root.innerHTML = projects.map(function (p) {
      var tierLabel = p.tier === 'featured' ? 'Featured' : 'In this portfolio';
      return (
        '<a class="all-proj-card" href="#' + escapeHtml(p.anchor) + '" data-project-id="' + escapeHtml(p.id) + '">' +
          '<div class="all-proj-card-top">' +
            '<span class="proj-badge ' + escapeHtml(p.badgeClass || '') + '">' + escapeHtml(p.tool) + '</span>' +
            '<span class="all-proj-tier">' + tierLabel + '</span>' +
          '</div>' +
          '<h3 class="all-proj-title">' + escapeHtml(p.resumeTitle) + '</h3>' +
          '<p class="all-proj-blurb">' + escapeHtml(p.cardBlurb || '') + '</p>' +
          '<span class="all-proj-go">Jump to project →</span>' +
        '</a>'
      );
    }).join('');
  }

  function applyPortfolioTiers(data) {
    // Catalog drives resume + optional grid. Project blocks stay in HTML order
    // with no extra chrome so the page keeps the clean selected-work layout.
    var projects = published(data.projects);
    projects.forEach(function (p) {
      var el = document.getElementById(p.anchor);
      if (!el) return;
      el.setAttribute('data-tier', p.tier || 'catalog');
      el.setAttribute('data-project-id', p.id);
    });
  }

  function boot() {
    loadCatalog()
      .then(function (data) {
        renderResumeProjects(data);
        wireCopyResume(data);
        renderAllProjectsGrid(data);
        applyPortfolioTiers(data);
        document.documentElement.setAttribute('data-catalog-ready', '1');
      })
      .catch(function (err) {
        console.warn('projects-catalog failed to load', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.ProjectsCatalog = {
    load: loadCatalog,
    reload: function () {
      cache = null;
      return loadCatalog().then(function (data) {
        renderResumeProjects(data);
        wireCopyResume(data);
        renderAllProjectsGrid(data);
        applyPortfolioTiers(data);
        return data;
      });
    }
  };
})();
