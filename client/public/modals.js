/* ══════════════════════════════════════════════════════════════
   PROJECT DEEP-DIVE MODAL SYSTEM
   Full-screen slide-up overlays with smart sidebar TOC
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Project data (verified against Maven Showcase) ────────── */
  const projects = {
    nashville: {
      id: 'nashville',
      badge: 'SQL',
      badgeClass: 'badge-sql',
      year: '2023',
      title: 'Cleaning Nashville Housing Property Data',
      heroStat: '56,477',
      heroStatLabel: 'Rows Cleaned',
      heroStatSub: '0 duplicates remaining after cleaning',
      keyInsight: 'Filling NULL PropertyAddress fields via self-join on matching ParcelID recovered addresses for thousands of records — bringing data completeness from ~61% to 97.3%. Splitting OwnerAddress revealed that over a third of Davidson County properties were sold as vacant land, which had been skewing raw average sale prices by nearly $40k.',
      overview: 'A SQL data cleaning project applied to a Nashville, TN housing dataset imported into Microsoft SQL Server Management Studio. The raw data arrived with inconsistent date formats, NULL-filled address fields, duplicate ParcelIDs, mixed Y/N/Yes/No values, and unsplit owner columns. Every downstream query and dashboard depends on this foundation being solid.',
      whyItMatters: 'Data cleaning is the unglamorous foundation of every reliable analysis. This project demonstrates the discipline of treating data quality as a first-class concern — a skill that transfers directly to any healthcare operations or analytics role where data accuracy is non-negotiable.',
      dataset: {
        source: 'AlexTheAnalyst/PortfolioProjects — Nashville Housing Data (GitHub)',
        rows: '56,477 (1,000 previewed as sample)',
        columns: 19,
        keyColumns: ['UniqueID','ParcelID','LandUse','PropertyAddress','SaleDate','SalePrice','LegalReference','SoldAsVacant','OwnerName','OwnerAddress','Acreage','TaxDistrict','LandValue','BuildingValue','TotalValue','YearBuilt','Bedrooms','FullBath','HalfBath'],
        timeRange: '2013 – 2023',
        format: 'Excel CSV → Microsoft SQL Server Management Studio'
      },
      methodology: [
        { tool: 'SQL Server', step: 'Standardized SaleDate from mixed VARCHAR formats to uniform DATE' },
        { tool: 'Self-Join', step: 'Populated NULL PropertyAddress by matching on ParcelID' },
        { tool: 'PARSENAME / SUBSTRING', step: 'Split PropertyAddress and OwnerAddress into City, State, Zip columns' },
        { tool: 'CASE statement', step: 'Normalized SoldAsVacant — Y/N/Yes/No → consistent Y / N' },
        { tool: 'CTE + ROW_NUMBER()', step: 'Identified and removed duplicate rows' },
        { tool: 'ALTER TABLE', step: 'Deleted redundant columns after splitting (with backup in place)' }
      ],
      toc: ['Overview', 'Key Insight', 'Dataset', 'Methodology', 'Live SQL Tool']
    },

    bmi: {
      id: 'bmi',
      badge: 'Python',
      badgeClass: 'badge-python',
      year: '2023',
      title: 'Health Data Insights: BMI & Waist-to-Hip Ratio',
      heroStat: '4',
      heroStatLabel: 'BMI Categories',
      heroStatSub: 'Underweight · Healthy Weight · Overweight · Above Obesity',
      keyInsight: 'BMI alone is a screening tool — it does not directly measure body fat. The CDC states it is "moderately correlated with more direct measures." Adding Waist-to-Hip Ratio as a second signal gives a more complete risk picture. A WHR above 0.90 (men) or 0.85 (women) indicates abdominal obesity regardless of BMI classification.',
      overview: 'A Python text-based program built in Anaconda (Jupyter Notebook) that calculates BMI using the CDC formula and optionally calculates Waist-to-Hip Ratio. The program validates inputs, classifies results into health risk categories, and presents findings in clear, accessible language. Inspired by Alex the Analyst\'s BMI Calculator tutorial.',
      whyItMatters: 'Healthcare data analysts need to understand how clinical metrics are computed before they can clean, validate, or model them. This project demonstrates Python input validation, formula implementation, conditional logic, and the translation of medical knowledge into actionable user output.',
      dataset: {
        source: 'CDC.gov, Healthline.com, WebMD.com (clinical thresholds)',
        rows: 'Real-time user input',
        columns: 4,
        keyColumns: ['Height (feet)', 'Height (inches)', 'Weight (lbs)', 'Waist circumference (in) — optional', 'Hip circumference (in) — optional'],
        timeRange: 'Real-time',
        format: 'Python CLI (Anaconda / Jupyter Notebook)'
      },
      methodology: [
        { tool: 'Python input()', step: 'Prompt user for name, gender, height (ft + in), weight (lbs)' },
        { tool: 'CDC Formula', step: 'BMI = weight(lb) / height(in)² × 703  →  rounded to 1 decimal' },
        { tool: 'if / elif', step: 'Classify: Underweight (<18.5), Healthy Weight (18.5–24.9), Overweight (25–29.9), Above Obesity (≥30)' },
        { tool: 'While loop', step: 'Prompt user yes/no for WHR — 6 attempts with guidance on 5th failure' },
        { tool: 'WHO thresholds', step: 'WHR risk: Men <0.90 Low, 0.90–0.99 Moderate, ≥1.00 High; Women <0.80 Low, 0.80–0.84 Moderate, ≥0.85 High' },
        { tool: 'round()', step: 'WHR rounded to 2 decimal places; personalized output sentence per gender' }
      ],
      toc: ['Overview', 'Key Insight', 'Dataset', 'Methodology', 'Live Python Tool']
    },

    survey: {
      id: 'survey',
      badge: 'Power BI',
      badgeClass: 'badge-powerbi',
      year: '2023',
      title: 'Analysis on a Survey of 630 Data Professionals',
      heroStat: '630',
      heroStatLabel: 'Professionals Surveyed',
      heroStatSub: 'Avg age 29.87 · 5 countries · multiple roles',
      keyInsight: 'PhD Data Scientists in the US average $206,000/year — more than double the $93,000 average for those with a Bachelor\'s degree. Yet the data also shows that a high school diploma Data Architect earns $85,000, close to a Master\'s-level Data Scientist at $104,000. Education level matters, but the role matters more.',
      overview: 'A Power BI analysis of voluntary survey data from 630 data professionals. Built with Power Query and DAX, the dashboard explores compensation by role, country, and education level — answering whether education is a key driver of success in data careers. Stakeholders wanted a clear visual narrative they could act on.',
      whyItMatters: 'Understanding compensation benchmarks, tool preferences, and satisfaction signals across the data industry is directly useful for anyone navigating a data career — or hiring for one. This project demonstrates Power BI data modeling, DAX measures, and dashboard storytelling skills.',
      dataset: {
        source: 'Alex Freberg Data Analyst Survey (2022)',
        rows: '630',
        columns: 28,
        keyColumns: ['Unique ID','Q1 – Job Role','Q3 – Salary Range','Q4 – Industry','Q5 – Favorite Language','Q6 – Satisfaction: Salary','Q7 – Satisfaction: WLB','Q11 – Country','Q12 – Age','Q13 – Education Level'],
        timeRange: '2022',
        format: 'Excel → Power BI (Power Query + DAX)'
      },
      methodology: [
        { tool: 'Power Query', step: 'Trim & clean to remove invisible characters; deleted 9 empty columns' },
        { tool: 'Power Query', step: 'Standardized Q1 (Role): split by delimiter, renamed edge cases to "Did not select"' },
        { tool: 'DAX', step: 'Q3 Salary: split text ranges (e.g. "100k–125k") → calculated numeric Average Salary column' },
        { tool: 'Power Query', step: 'Q11 Country: split by delimiter, filtered to 5 preselected countries + Other' },
        { tool: 'Power BI', step: 'Built 5 visuals: KPI cards, stacked column, funnel, stacked bar ×2' },
        { tool: 'Power BI', step: 'Dashboard layout: dark theme, Segoe UI, light-blue header, interactive cross-filtering' }
      ],
      toc: ['Overview', 'Key Insight', 'Dataset', 'Methodology', 'Live Power BI Dashboard']
    },

    airbnb: {
      id: 'airbnb',
      badge: 'Tableau',
      badgeClass: 'badge-tableau',
      year: '2023',
      title: 'Airbnb Analysis of Seattle Residential Areas — 2016',
      heroStat: '$2.1M',
      heroStatLabel: 'Peak Weekly Revenue',
      heroStatSub: 'Week of Dec 25th, 2016',
      keyInsight: 'Zip code 98134 commands the highest average nightly price in Seattle. December 25th generated the single highest revenue week of 2016 at $2,110,350. The spring season (May–June) and holiday season consistently outperform the rest of the year — a clear signal for hosts planning availability and pricing strategy.',
      overview: 'A Tableau Public analysis of 2016 Seattle Airbnb data across three joined worksheets: Listings, Reviews, and Calendar. The project surfaces pricing by zip code, bedroom count, and seasonal revenue trends across all 52 weeks of 2016 — turning geographic and temporal data into a clear stakeholder narrative.',
      whyItMatters: 'Geospatial + time series analysis on Tableau is a core skill for any operations or healthcare analyst. The same methodology — segmenting by geography, identifying seasonal variance, building prescriptive findings — applies directly to patient flow, facility utilization, and market expansion.',
      dataset: {
        source: 'Kaggle — Inside Airbnb Seattle 2016',
        rows: '323,346 entries (3 worksheets joined)',
        columns: 12,
        keyColumns: ['id (Listings)','zipcode','bedrooms','price','weekly_price','neighbourhood_cleansed','listing_id (Calendar)','date','price (Calendar)','listing_id (Reviews)'],
        timeRange: 'Full year 2016 (52 weeks)',
        format: 'Excel CSV → Tableau Public (inner join on listing_id → 1,048,575 rows)'
      },
      methodology: [
        { tool: 'Excel', step: 'Created Working Sheet – Listings; filtered zipcode column for NULLs; found and filled 7 missing zip codes via neighborhood cross-reference' },
        { tool: 'Tableau', step: 'Joined 3 tables: Working Sheet – Listings + Calendar (inner join on listing_id) → 1,048,575 rows' },
        { tool: 'Sheet 1', step: 'Bar chart: Advertised Average Home Price by Zip Code (filtered by zip)' },
        { tool: 'Sheet 2', step: 'World map: Average Home Price by Zip Code (lat/long)' },
        { tool: 'Sheet 3', step: 'Line chart: Yearly Revenue for 2016 by week — blue density color coding' },
        { tool: 'Sheet 4 + 5', step: 'Avg Price by Bedroom count + Number of Homes by Bedroom (CNTD id)' }
      ],
      toc: ['Overview', 'Key Insight', 'Dataset', 'Methodology', 'Live Tableau Dashboard']
    },

    bikes: {
      id: 'bikes',
      badge: 'Excel',
      badgeClass: 'badge-excel',
      year: '2023',
      title: 'Bike Sales Business Insights',
      heroStat: '48.3%',
      heroStatLabel: 'Overall Purchase Rate',
      heroStatSub: '495 of 1,026 customers converted',
      keyInsight: 'The Pacific Region has the highest profit margins in Bike Sales. Middle-aged homeowners in management roles in the Pacific average $90,000 income — the highest of any segment. Commute distance is a powerful conversion predictor: customers commuting 0–1 miles convert at 55%, while 10+ mile commuters convert at only 29%.',
      overview: 'An Excel analysis of bike purchase survey data from 1,026 customers across Europe, North America, and the Pacific region. Built with PivotTables, PivotCharts, and Slicers, the dashboard lets stakeholders dynamically filter by gender, marital status, education, home ownership, and region to identify the most profitable target segments.',
      whyItMatters: 'Excel is the most widely used analytics tool in healthcare operations. This project demonstrates PivotTables, dynamic charts, nested IF formulas, Find & Replace cleaning, and dashboard design — skills that transfer directly to financial reporting, staffing analytics, and operational performance tracking.',
      dataset: {
        source: 'AlexTheAnalyst/Excel-Tutorial — Excel Project Dataset.xlsx (GitHub)',
        rows: '1,026 (after removing 25 duplicates from 13,351 raw entries)',
        columns: 13,
        keyColumns: ['ID','Marital Status','Gender','Income','Children','Education','Occupation','Home Owner','Cars','Commute Distance','Region','Age','Purchased Bike'],
        timeRange: 'Cross-sectional survey',
        format: 'Microsoft Excel (.xlsx) — PivotTables, PivotCharts, Slicers'
      },
      methodology: [
        { tool: 'Excel', step: 'Find & Replace: Marital Status M→Married / S→Single; Gender M→Male / F→Female' },
        { tool: 'Excel', step: 'Currency column: removed 2 decimal places ($40,000 instead of $40,000.00)' },
        { tool: 'Nested IF', step: '=IF(L2>54,"Old",IF(L2>=31,"Middle Age",IF(L2<31,"Adolescent","Invalid"))) → Age Bracket column' },
        { tool: 'PivotTable ×4', step: 'Avg Income Per Purchase · Customer Commute · Age Brackets · Bikes by Occupation + Cars' },
        { tool: 'PivotChart ×4', step: 'Bar chart (income) · Line charts (commute, age) · Stacked bar (occupation + cars)' },
        { tool: 'Slicers ×5', step: 'Gender · Marital Status · Home Owner · Education · Region — cross-filter all charts simultaneously' }
      ],
      toc: ['Overview', 'Key Insight', 'Dataset', 'Methodology', 'Live Excel Dashboard']
    }
  };

  /* ─── Build modal HTML ─────────────────────────────────────── */
  function buildModal(p) {
    const tocItems = p.toc.map((label, i) =>
      `<button class="pdm-toc-btn${i === 0 ? ' active' : ''}" data-section="${i}">${label}</button>`
    ).join('');

    const datasetRows = p.dataset.keyColumns.map(col =>
      `<div class="pdm-schema-row"><span class="pdm-schema-col">${col}</span></div>`
    ).join('');

    const methodologySteps = p.methodology.map((m, i) =>
      `<div class="pdm-method-step">
        <div class="pdm-method-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="pdm-method-content">
          <div class="pdm-method-tool">${m.tool}</div>
          <div class="pdm-method-desc">${m.step}</div>
        </div>
      </div>`
    ).join('');

    const liveToolRef = {
      nashville: 'proj-nashville',
      bmi: 'proj-bmi',
      survey: 'proj-survey',
      airbnb: 'proj-airbnb',
      bikes: 'proj-bikes'
    }[p.id];

    return `
    <div class="pdm-overlay" id="pdm-${p.id}" role="dialog" aria-modal="true" aria-label="${p.title}" hidden>
      <div class="pdm-sheet">
        <div class="pdm-header">
          <div class="pdm-header-left">
            <span class="proj-badge ${p.badgeClass}">${p.badge}</span>
            <span class="pdm-header-year">${p.year}</span>
          </div>
          <button class="pdm-close" aria-label="Close">&times;</button>
        </div>
        <div class="pdm-body">
          <nav class="pdm-sidebar" aria-label="Project sections">
            <div class="pdm-sidebar-title">Contents</div>
            <div class="pdm-toc">${tocItems}</div>
            <div class="pdm-sidebar-stat">
              <div class="pdm-sidebar-stat-n">${p.heroStat}</div>
              <div class="pdm-sidebar-stat-l">${p.heroStatLabel}</div>
              <div class="pdm-sidebar-stat-sub">${p.heroStatSub}</div>
            </div>
          </nav>
          <div class="pdm-content" id="pdm-content-${p.id}">

            <!-- Section 0: Overview -->
            <section class="pdm-section" data-section="0" id="pdm-${p.id}-s0">
              <div class="pdm-section-eyebrow">Overview</div>
              <h2 class="pdm-section-heading">${p.title}</h2>
              <div class="pdm-overview-hero">
                <div class="pdm-hero-stat-big">
                  <span class="pdm-hero-n">${p.heroStat}</span>
                  <span class="pdm-hero-l">${p.heroStatLabel}</span>
                </div>
                <p class="pdm-overview-body">${p.overview}</p>
              </div>
              <div class="pdm-why-card">
                <div class="pdm-why-label">Why it matters</div>
                <p>${p.whyItMatters}</p>
              </div>
            </section>

            <!-- Section 1: Key Insight -->
            <section class="pdm-section" data-section="1" id="pdm-${p.id}-s1">
              <div class="pdm-section-eyebrow">Key Insight</div>
              <div class="pdm-insight-card">
                <div class="pdm-insight-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.8-3.5 6l-.5 3H9l-.5-3C6.5 13.8 5 11.5 5 9a7 7 0 0 1 7-7z"/><path d="M9 21h6"/></svg>
                </div>
                <blockquote class="pdm-insight-quote">${p.keyInsight}</blockquote>
              </div>
            </section>

            <!-- Section 2: Dataset -->
            <section class="pdm-section" data-section="2" id="pdm-${p.id}-s2">
              <div class="pdm-section-eyebrow">Dataset</div>
              <h3 class="pdm-section-heading-sm">Where the data comes from</h3>
              <div class="pdm-dataset-grid">
                <div class="pdm-dataset-card"><div class="pdm-dataset-label">Source</div><div class="pdm-dataset-value">${p.dataset.source}</div></div>
                <div class="pdm-dataset-card"><div class="pdm-dataset-label">Rows</div><div class="pdm-dataset-value">${p.dataset.rows}</div></div>
                <div class="pdm-dataset-card"><div class="pdm-dataset-label">Columns</div><div class="pdm-dataset-value">${p.dataset.columns}</div></div>
                <div class="pdm-dataset-card"><div class="pdm-dataset-label">Time Range</div><div class="pdm-dataset-value">${p.dataset.timeRange}</div></div>
                <div class="pdm-dataset-card"><div class="pdm-dataset-label">Format</div><div class="pdm-dataset-value">${p.dataset.format}</div></div>
              </div>
              <div class="pdm-schema">
                <div class="pdm-schema-header">Key Columns</div>
                ${datasetRows}
              </div>
            </section>

            <!-- Section 3: Methodology -->
            <section class="pdm-section" data-section="3" id="pdm-${p.id}-s3">
              <div class="pdm-section-eyebrow">Methodology</div>
              <h3 class="pdm-section-heading-sm">How the analysis was built</h3>
              <div class="pdm-methodology">${methodologySteps}</div>
            </section>

            <!-- Section 4: Live Tool -->
            <section class="pdm-section pdm-section--tool" data-section="4" id="pdm-${p.id}-s4">
              <div class="pdm-section-eyebrow">Live Tool</div>
              <h3 class="pdm-section-heading-sm">Run it yourself</h3>
              <div class="pdm-live-tool-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                The full interactive tool is on the main page —
                <button class="pdm-goto-btn" data-target="${liveToolRef}">jump to it directly →</button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>`;
  }

  /* ─── Inject all modals ────────────────────────────────────── */
  const container = document.createElement('div');
  container.id = 'pdm-container';
  Object.values(projects).forEach(p => { container.innerHTML += buildModal(p); });
  document.body.appendChild(container);

  /* ─── Open / close ─────────────────────────────────────────── */
  let activeModal = null;
  let scrollPos = 0;

  function openModal(id) {
    const overlay = document.getElementById(`pdm-${id}`);
    if (!overlay) return;
    scrollPos = window.scrollY;
    document.body.style.overflow = 'hidden';
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('open'));
    activeModal = id;
    initScrollSpy(id);
  }

  function closeModal() {
    if (!activeModal) return;
    const overlay = document.getElementById(`pdm-${activeModal}`);
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.addEventListener('transitionend', () => {
      overlay.hidden = true;
      document.body.style.overflow = '';
      window.scrollTo(0, scrollPos);
    }, { once: true });
    activeModal = null;
  }

  /* ─── TOC scroll spy ───────────────────────────────────────── */
  function initScrollSpy(id) {
    const content = document.getElementById(`pdm-content-${id}`);
    const sections = content.querySelectorAll('.pdm-section');
    const overlay = document.getElementById(`pdm-${id}`);
    const tocBtns = overlay.querySelectorAll('.pdm-toc-btn');

    tocBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.section);
        if (sections[idx]) content.scrollTo({ top: sections[idx].offsetTop - 24, behavior: 'smooth' });
      });
    });

    let ticking = false;
    content.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        let active = 0;
        sections.forEach((sec, i) => { if (sec.offsetTop - content.scrollTop <= 80) active = i; });
        tocBtns.forEach((btn, i) => btn.classList.toggle('active', i === active));
        ticking = false;
      });
    }, { passive: true });
  }

  /* ─── Wire explore buttons ─────────────────────────────────── */
  document.querySelectorAll('[data-explore]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.explore));
  });

  document.getElementById('pdm-container').addEventListener('click', e => {
    if (e.target.classList.contains('pdm-overlay') || e.target.classList.contains('pdm-close')) closeModal();
    if (e.target.classList.contains('pdm-goto-btn')) {
      closeModal();
      setTimeout(() => {
        const target = document.getElementById(e.target.dataset.target);
        if (target) {
          const headerH = document.getElementById('header')?.offsetHeight || 64;
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH - 8, behavior: 'smooth' });
        }
      }, 350);
    }
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && activeModal) closeModal(); });

})();
