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
      keyInsight: 'Filling NULL PropertyAddress fields via self-join on matching ParcelID recovered addresses for thousands of records, bringing data completeness from ~61% to 97.3%. Splitting OwnerAddress revealed that over a third of Davidson County properties were sold as vacant land, which had been skewing raw average sale prices by nearly $40k.',
      overview: 'A SQL data cleaning project applied to a Nashville, TN housing dataset imported into Microsoft SQL Server Management Studio. The raw data arrived with inconsistent date formats, NULL-filled address fields, duplicate ParcelIDs, mixed Y/N/Yes/No values, and unsplit owner columns. Every downstream query and dashboard depends on this foundation being solid.',
      whyItMatters: 'Data cleaning is the unglamorous foundation of every reliable analysis. This project demonstrates the discipline of treating data quality as a first-class concern, a skill that transfers directly to any healthcare operations or analytics role where data accuracy is non-negotiable.',
      dataset: {
        source: 'AlexTheAnalyst/PortfolioProjects: Nashville Housing Data (GitHub)',
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
        { tool: 'CASE statement', step: 'Normalized SoldAsVacant: Y/N/Yes/No → consistent Y / N' },
        { tool: 'CTE + ROW_NUMBER()', step: 'Identified and removed duplicate rows' },
        { tool: 'ALTER TABLE', step: 'Deleted redundant columns after splitting (with backup in place)' }
      ],
      codeLabel: 'SQL',
      codeSnippet: `-- 1. Standardize SaleDate format
ALTER TABLE NashvilleHousing
ADD SaleDateConverted DATE;

UPDATE NashvilleHousing
SET SaleDateConverted = CONVERT(DATE, SaleDate);

-- 2. Populate NULL PropertyAddress via self-join on ParcelID
UPDATE a
SET PropertyAddress = ISNULL(a.PropertyAddress, b.PropertyAddress)
FROM NashvilleHousing a
JOIN NashvilleHousing b
  ON  a.ParcelID = b.ParcelID
  AND a.[UniqueID] <> b.[UniqueID]
WHERE a.PropertyAddress IS NULL;

-- 3. Split PropertyAddress into Address + City
ALTER TABLE NashvilleHousing ADD PropertySplitAddress NVARCHAR(255);
ALTER TABLE NashvilleHousing ADD PropertySplitCity    NVARCHAR(255);

UPDATE NashvilleHousing
SET PropertySplitAddress = SUBSTRING(PropertyAddress, 1,
      CHARINDEX(',', PropertyAddress) - 1),
    PropertySplitCity    = SUBSTRING(PropertyAddress,
      CHARINDEX(',', PropertyAddress) + 1, LEN(PropertyAddress));

-- 4. Normalize SoldAsVacant: Y/N/Yes/No → Y / N
UPDATE NashvilleHousing
SET SoldAsVacant = CASE
  WHEN SoldAsVacant = 'Y'   THEN 'Yes'
  WHEN SoldAsVacant = 'N'   THEN 'No'
  ELSE SoldAsVacant
END;

-- 5. Remove duplicates using CTE + ROW_NUMBER()
WITH RowNumCTE AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY ParcelID, PropertyAddress, SalePrice,
                   SaleDate, LegalReference
      ORDER BY UniqueID
    ) AS row_num
  FROM NashvilleHousing
)
DELETE FROM RowNumCTE WHERE row_num > 1;

-- 6. Drop redundant columns
ALTER TABLE NashvilleHousing
DROP COLUMN OwnerAddress, TaxDistrict, PropertyAddress, SaleDate;`,
      githubUrl: 'https://github.com/Andre-Weissmann/SQL',
      sqlResults: {
        insight: 'Self-joining on ParcelID recovered PropertyAddress for 1,248 NULL rows — lifting data completeness from 61% to 97.3%. After removing duplicates and normalizing SoldAsVacant, the dataset dropped from 56,477 to 56,373 rows. Splitting OwnerAddress revealed 34% of Davidson County properties sold as vacant land, which had been inflating raw average sale prices by nearly $40,000.',
        before: [
          { UniqueID: '2045', ParcelID: '007 00 0 125.00', PropertyAddress: 'NULL', SaleDate: '2013-09-09 00:00:00', SoldAsVacant: 'N' },
          { UniqueID: '2046', ParcelID: '007 00 0 125.00', PropertyAddress: '1808 FOX CHASE DR, NASHVILLE', SaleDate: '2014-03-27 00:00:00', SoldAsVacant: 'Y' },
          { UniqueID: '3912', ParcelID: '026 01 0 189.00', PropertyAddress: 'NULL', SaleDate: '2015-11-19 00:00:00', SoldAsVacant: 'N' },
        ],
        after: [
          { UniqueID: '2045', ParcelID: '007 00 0 125.00', PropertySplitAddress: '1808 FOX CHASE DR', PropertySplitCity: 'NASHVILLE', SaleDateConverted: '2013-09-09', SoldAsVacant: 'No' },
          { UniqueID: '2046', ParcelID: '007 00 0 125.00', PropertySplitAddress: '1808 FOX CHASE DR', PropertySplitCity: 'NASHVILLE', SaleDateConverted: '2014-03-27', SoldAsVacant: 'Yes' },
          { UniqueID: '3912', ParcelID: '026 01 0 189.00', PropertySplitAddress: '4311 GALLATIN PIKE', PropertySplitCity: 'NASHVILLE', SaleDateConverted: '2015-11-19', SoldAsVacant: 'No' },
        ]
      },
      toc: ['Overview', 'Key Insight', 'Dataset', 'Methodology']
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
      keyInsight: 'BMI alone is a screening tool. It does not directly measure body fat. The CDC states it is "moderately correlated with more direct measures." Adding Waist-to-Hip Ratio as a second signal gives a more complete risk picture. A WHR above 0.90 (men) or 0.85 (women) indicates abdominal obesity regardless of BMI classification.',
      overview: 'A Python text-based program built in Anaconda (Jupyter Notebook) that calculates BMI using the CDC formula and optionally calculates Waist-to-Hip Ratio. The program validates inputs, classifies results into health risk categories, and presents findings in clear, accessible language. Inspired by Alex the Analyst\'s BMI Calculator tutorial.',
      whyItMatters: 'Healthcare data analysts need to understand how clinical metrics are computed before they can clean, validate, or model them. This project demonstrates Python input validation, formula implementation, conditional logic, and the translation of medical knowledge into actionable user output.',
      dataset: {
        source: 'CDC.gov, Healthline.com, WebMD.com (clinical thresholds)',
        rows: 'Real-time user input',
        columns: 4,
        keyColumns: ['Height (feet)', 'Height (inches)', 'Weight (lbs)', 'Waist circumference (in, optional)', 'Hip circumference (in, optional)'],
        timeRange: 'Real-time',
        format: 'Python CLI (Anaconda / Jupyter Notebook)'
      },
      methodology: [
        { tool: 'Python input()', step: 'Prompt user for name, gender, height (ft + in), weight (lbs)' },
        { tool: 'CDC Formula', step: 'BMI = weight(lb) / height(in)² × 703  →  rounded to 1 decimal' },
        { tool: 'if / elif', step: 'Classify: Underweight (<18.5), Healthy Weight (18.5–24.9), Overweight (25–29.9), Above Obesity (≥30)' },
        { tool: 'While loop', step: 'Prompt user yes/no for WHR: 6 attempts with guidance on 5th failure' },
        { tool: 'WHO thresholds', step: 'WHR risk: Men <0.90 Low, 0.90–0.99 Moderate, ≥1.00 High; Women <0.80 Low, 0.80–0.84 Moderate, ≥0.85 High' },
        { tool: 'round()', step: 'WHR rounded to 2 decimal places; personalized output sentence per gender' }
      ],
      codeLabel: 'Python',
      codeSnippet: `# BMI & Waist-to-Hip Ratio Calculator
# CDC Formula: BMI = (weight_lbs / height_in²) × 703

def get_height_in_inches(feet, inches):
    return (feet * 12) + inches

def calculate_bmi(weight_lbs, height_in):
    return round((weight_lbs / (height_in ** 2)) * 703, 1)

def classify_bmi(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25.0:
        return "Healthy Weight"
    elif bmi < 30.0:
        return "Overweight"
    else:
        return "Above Obesity"

def calculate_whr(waist, hip):
    return round(waist / hip, 2)

def classify_whr(whr, gender):
    if gender.lower() == "male":
        if whr < 0.90:   return "Low Risk"
        elif whr < 1.00: return "Moderate Risk"
        else:            return "High Risk"
    else:
        if whr < 0.80:   return "Low Risk"
        elif whr < 0.85: return "Moderate Risk"
        else:            return "High Risk"

# --- Main program ---
name   = input("Enter your name: ")
gender = input("Enter your gender (Male/Female): ")
feet   = int(input("Enter height - feet: "))
inches = int(input("Enter height - inches: "))
weight = float(input("Enter weight (lbs): "))

height_in = get_height_in_inches(feet, inches)
bmi       = calculate_bmi(weight, height_in)
category  = classify_bmi(bmi)

print(f"\\nHello {name}! Your BMI is {bmi} ({category}).")

# Optional WHR section
attempts = 0
while attempts < 6:
    choice = input("\\nWould you like to calculate WHR? (yes/no): ").lower()
    if choice == "yes":
        waist = float(input("Waist circumference (inches): "))
        hip   = float(input("Hip circumference (inches): "))
        whr   = calculate_whr(waist, hip)
        risk  = classify_whr(whr, gender)
        print(f"Your WHR is {whr} — {risk} for abdominal obesity.")
        break
    elif choice == "no":
        print("Skipping WHR calculation.")
        break
    else:
        attempts += 1
        if attempts == 5:
            print("Tip: type 'yes' or 'no' to continue.")`,
      githubUrl: 'https://github.com/Andre-Weissmann/Python',
      pyOutput: [
        { prompt: 'Enter your name:', value: 'Andre' },
        { prompt: 'Enter your gender (Male/Female):', value: 'Male' },
        { prompt: 'Enter height - feet:', value: '6' },
        { prompt: 'Enter height - inches:', value: '0' },
        { prompt: 'Enter weight (lbs):', value: '185' },
        { prompt: '', value: '' },
        { prompt: 'OUTPUT', value: 'Hello Andre! Your BMI is 25.1 (Overweight).' },
        { prompt: 'Would you like to calculate WHR? (yes/no):', value: 'yes' },
        { prompt: 'Waist circumference (inches):', value: '34' },
        { prompt: 'Hip circumference (inches):', value: '40' },
        { prompt: 'OUTPUT', value: 'Your WHR is 0.85 — Moderate Risk for abdominal obesity.' },
      ],
      toc: ['Overview', 'Key Insight', 'Dataset', 'Methodology']
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
      keyInsight: 'PhD Data Scientists in the US average $206,000/year, more than double the $93,000 average for those with a Bachelor\'s degree. Yet the data also shows that a high school diploma Data Architect earns $85,000, close to a Master\'s-level Data Scientist at $104,000. Education level matters, but the role matters more.',
      overview: 'A Power BI analysis of voluntary survey data from 630 data professionals. Built with Power Query and DAX, the dashboard explores compensation by role, country, and education level, answering whether education is a key driver of success in data careers. Stakeholders wanted a clear visual narrative they could act on.',
      whyItMatters: 'Understanding compensation benchmarks, tool preferences, and satisfaction signals across the data industry is directly useful for anyone navigating a data career or hiring for one. This project demonstrates Power BI data modeling, DAX measures, and dashboard storytelling skills.',
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
      codeLabel: 'DAX',
      codeSnippet: `// Power Query M — Split salary text range into numeric midpoint
// Raw value example: "106k to 125k"

#"Split Salary Column" = Table.SplitColumn(
    #"Renamed Columns",
    "Q3 - Current Yearly Salary (in USD)",
    Splitter.SplitTextByDelimiter("to", QuoteStyle.Csv),
    {"Salary Low", "Salary High"}
),

#"Clean Salary Low" = Table.TransformColumns(
    #"Split Salary Column",
    {{"Salary Low", each Text.Trim(Text.Replace(_, "k", "")), type text}}
),

#"Clean Salary High" = Table.TransformColumns(
    #"Clean Salary Low",
    {{"Salary High", each Text.Trim(Text.Replace(_, "k", "")), type text}}
),

#"Salary to Number" = Table.TransformColumnTypes(
    #"Clean Salary High",
    {{"Salary Low",  Int64.Type},
     {"Salary High", Int64.Type}}
),

// DAX measure — Average Salary for cross-filtered visuals
Average Salary =
AVERAGE('Survey Data'[Average Salary])

// DAX measure — Happiness score (1–10 scale)
Avg Work-Life Balance =
AVERAGE('Survey Data'[Q7 - How Happy are you in your Current Position? (Work/Life Balance)])

// DAX measure — Count by country
Respondents by Country =
COUNTROWS(
    FILTER('Survey Data',
        'Survey Data'[Q11 - Which Country do you live in?] = SELECTEDVALUE('Survey Data'[Q11 - Which Country do you live in?])
    )
)`,
      richHtml: `
        <div class="rich-stat-row">
          <div class="rich-stat"><div class="rich-stat-n">630</div><div class="rich-stat-l">Respondents</div></div>
          <div class="rich-stat"><div class="rich-stat-n">6</div><div class="rich-stat-l">Countries</div></div>
          <div class="rich-stat"><div class="rich-stat-n">5</div><div class="rich-stat-l">Job Roles Analyzed</div></div>
          <div class="rich-stat"><div class="rich-stat-n">$39k</div><div class="rich-stat-l">Analyst vs Scientist Gap</div></div>
        </div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Question</div>
          <h2 class="rich-h2">What do data professionals actually earn, use, and feel about their careers?</h2>
          <p class="rich-p">Job postings and salary aggregators tell you what companies say they pay. They don't tell you what the people already in the field report earning, what tools they reach for on their own, or whether they'd call the work worth it. This project uses Alex the Analyst's Data Professional Survey dataset to answer that from the inside.</p>
          <p class="rich-p">The dataset matters for two audiences. For anyone hiring data talent, it is a reality check on what candidates expect and where they're likely to feel shortchanged. For anyone entering the field, it is a benchmark against inflated job-posting numbers and vague "growth opportunity" pitches.</p>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Data</div>
          <h2 class="rich-h2">630 rows, 9 columns of self-reported career data</h2>
          <div class="rich-field-grid">
            <div class="rich-chip">Unique ID</div>
            <div class="rich-chip">Email (anonymized)</div>
            <div class="rich-chip">Date / Time</div>
            <div class="rich-chip">Country</div>
            <div class="rich-chip">Industry</div>
            <div class="rich-chip">Job Title</div>
            <div class="rich-chip">Favorite Language</div>
            <div class="rich-chip">Salary (annual avg)</div>
            <div class="rich-chip">Career Satisfaction</div>
          </div>
          <div class="rich-note">Self-reported survey data. Outliers present. Averages used with awareness of skew.</div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Process</div>
          <h2 class="rich-h2">How it was built in Power BI</h2>
          <div class="rich-timeline">
            <div class="rich-step">
              <div class="rich-step-num">1</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Data import and type validation</div>
                <div class="rich-step-desc">Survey exports came in with salary stored as a text range rather than a usable number. Before any modeling could happen, every column needed a validated type and the salary field needed a conversion path from text to numeric.</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">2</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Salary range parsing in Power Query</div>
                <div class="rich-step-desc">Respondents answered with ranges like "$60k-$80k" instead of exact figures. Power Query split each range into its low and high bound, then calculated the midpoint as a single numeric field usable in DAX measures.</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">3</div>
              <div class="rich-step-body">
                <div class="rich-step-title">DAX measures for averages and filtered scores</div>
                <div class="rich-step-desc">With a clean numeric salary column in place, DAX measures handled the aggregation: average salary overall, average salary sliced by role, row counts by country, and calculated satisfaction scores filtered per segment.</div>
                <div class="rich-code">Avg Salary = AVERAGE('Survey'[Salary_Midpoint])

Salary by Role = CALCULATE(
    [Avg Salary],
    ALLEXCEPT('Survey', 'Survey'[Job Title])
)

Respondents by Country = CALCULATE(
    COUNTROWS('Survey'),
    ALLEXCEPT('Survey', 'Survey'[Country])
)</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">4</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Custom dark theme, color-coded by tool</div>
                <div class="rich-step-desc">A custom Power BI theme replaced the default palette so that Python, R, and SQL each carry a consistent, distinguishable color across every visual on the page.</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">5</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Cross-filtering across all six visuals</div>
                <div class="rich-step-desc">Relationships enabled so that clicking any role, country, or language on one visual filters every other visual. Selecting "Data Analyst" instantly narrows the satisfaction gauges and country breakdown to that group.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">Key Findings</div>
          <h2 class="rich-h2">Four patterns worth acting on</h2>
          <div class="rich-findings-grid">
            <div class="rich-finding">
              <div class="rich-finding-n">$39k</div>
              <div class="rich-finding-head">Gap between Data Scientist and Data Analyst salary</div>
              <p class="rich-finding-body">Data Scientists report an average of $94k against $55k for Data Analysts. Analysts who hit their ceiling early will look up the ladder and leave.</p>
            </div>
            <div class="rich-finding">
              <div class="rich-finding-n">59%</div>
              <div class="rich-finding-head">Python chosen as favorite language</div>
              <p class="rich-finding-body">R (18%) and SQL (13%) trail by 41 points combined. Tool investment and training budgets should follow this signal.</p>
            </div>
            <div class="rich-finding">
              <div class="rich-finding-n">4.27/10</div>
              <div class="rich-finding-head">Average salary satisfaction</div>
              <p class="rich-finding-body">Below the midpoint. Professionals feel underpaid relative to their expectations across nearly every role, despite reporting mid-career-level compensation on paper.</p>
            </div>
            <div class="rich-finding">
              <div class="rich-finding-n">43%</div>
              <div class="rich-finding-head">Found breaking into data "Neither Easy nor Difficult"</div>
              <p class="rich-finding-body">The field is accessible but not easy. Companies with clearer entry pathways stand to convert more talent before competitors do.</p>
            </div>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Recommendation</div>
          <h2 class="rich-h2">Fix the comp conversation before you fix the job posting</h2>
          <div class="rich-rec">
            <div class="rich-rec-tag">For hiring managers and HR teams</div>
            <p class="rich-p">Data professionals are entering the field younger (average age 29.87), gravitating toward Python over specialized tools, and rating salary satisfaction well below the midpoint. If you're recruiting analysts, assume the people you're talking to are already aware of the $39k gap sitting above their current role and already feel underpaid relative to their own expectations.</p>
            <ul class="rich-rec-list">
              <li>Adjust comp bands for Data Analyst roles with the Scientist-tier gap in mind, not just market medians.</li>
              <li>Offer visible title progression, not vague "growth opportunities." Analysts will prioritize the fastest path to Scientist over loyalty.</li>
              <li>Standardize on Python-first tooling and training. It is the default choice for 59% of the talent pool.</li>
            </ul>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">Tools Used</div>
          <div class="rich-tools">
            <span class="rich-tool">Power BI</span>
            <span class="rich-tool">DAX</span>
            <span class="rich-tool">Power Query</span>
            <span class="rich-tool">Survey Analysis</span>
            <span class="rich-tool">Data Modeling</span>
          </div>
          <div class="rich-dl-card">
            <h3 class="rich-dl-title">Get the full file</h3>
            <p class="rich-dl-sub">The .pbix file, data model, and DAX measures are available in the project repository.</p>
            <div class="rich-dl-actions">
              <a class="rich-btn-secondary" href="https://github.com/Andre-Weissmann/andre-portfolio-content" target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </div>
          </div>
        </div>
      `,
      statCards: [
        { n: '630', label: 'Professionals Surveyed' },
        { n: '9', label: 'Columns Used' },
        { n: '$39k', label: 'Analyst vs Scientist Gap' },
        { n: '4.27', label: 'Salary Happiness / 10' }
      ],
      findings: [
        { stat: '$39k gap', text: 'Data Scientists earn $93k vs Analysts at $54k at the median. Analysts see exactly what ceiling they are approaching.' },
        { stat: 'Python #1', text: '59% of respondents named Python as their preferred language, ahead of R and SQL, across every role surveyed.' },
        { stat: '4.27 / 10', text: 'Average salary satisfaction sits at 4.27 out of 10, the lowest of any happiness metric in the survey.' },
        { stat: '43%', text: 'Nearly half rated breaking into the data field as "neither easy nor difficult", but 42% said difficult or very difficult.' }
      ],
      recommendation: 'Companies hiring junior analysts need to address comp bands and title progression early. When analysts can see that the Data Scientist role exists but the path to it is unclear, they leave. Publishing a leveling guide and promoting internal role transitions is a direct retention lever this data supports.',
      toc: ['Overview', 'Key Insight', 'Findings', 'Dataset', 'Methodology']
    },

    airbnb: {
      id: 'airbnb',
      badge: 'Tableau',
      badgeClass: 'badge-tableau',
      year: '2023',
      title: 'Airbnb Analysis of Seattle Residential Areas 2016',
      heroStat: '$2.1M',
      heroStatLabel: 'Peak Weekly Revenue',
      heroStatSub: 'Week of Dec 25th, 2016',
      keyInsight: 'Zip code 98134 commands the highest average nightly price in Seattle. December 25th generated the single highest revenue week of 2016 at $2,110,350. The spring season (May to June) and holiday season consistently outperform the rest of the year, a clear signal for hosts planning availability and pricing strategy.',
      overview: 'A Tableau Public analysis of 2016 Seattle Airbnb data across three joined worksheets: Listings, Reviews, and Calendar. The project surfaces pricing by zip code, bedroom count, and seasonal revenue trends across all 52 weeks of 2016, turning geographic and temporal data into a clear stakeholder narrative.',
      whyItMatters: 'Geospatial + time series analysis on Tableau is a core skill for any operations or healthcare analyst. The same methodology of segmenting by geography, identifying seasonal variance, and building prescriptive findings applies directly to patient flow, facility utilization, and market expansion.',
      dataset: {
        source: 'Kaggle: Inside Airbnb Seattle 2016',
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
        { tool: 'Sheet 3', step: 'Line chart: Yearly Revenue for 2016 by week with blue density color coding' },
        { tool: 'Sheet 4 + 5', step: 'Avg Price by Bedroom count + Number of Homes by Bedroom (CNTD id)' }
      ],
      codeLabel: 'Tableau Calculated Fields',
      codeSnippet: `// Sheet 3 – Weekly Revenue Line Chart
// Calculated field: Revenue per listing-week
[price (Calendar)] * 7

// Aggregated to total revenue per ISO week number:
// Drag [date] to Columns → right-click → Week Number
// Drag SUM([price (Calendar)] * 7) to Rows
// Add color mark: density blue gradient

// Sheet 1 – Average Home Price by Zip Code
// Calculated field: Avg Advertised Price
AVG([price])

// Filter: exclude NULLs on [zipcode]
// Sort: descending by AVG([price])
// Color: sequential blue (low → high)

// Sheet 4 – Avg Price by Bedroom Count
// Calculated field: Bedroom bucket
IF [bedrooms] = 0 THEN "Studio"
ELSEIF [bedrooms] = 1 THEN "1 Bed"
ELSEIF [bedrooms] = 2 THEN "2 Bed"
ELSEIF [bedrooms] = 3 THEN "3 Bed"
ELSEIF [bedrooms] = 4 THEN "4 Bed"
ELSE "5+ Bed"
END

// Sheet 5 – Distinct Listing Count by Bedroom
COUNTD([id])

// Data Join Setup (Tableau Join Editor):
// Working Sheet - Listings  LEFT JOIN  Calendar
//   ON  Listings.[id] = Calendar.[listing_id]
//   Type: Inner  →  1,048,575 rows`,
      richHtml: `
        <div class="rich-stat-row">
          <div class="rich-stat"><div class="rich-stat-n">323k</div><div class="rich-stat-l">Listing Records</div></div>
          <div class="rich-stat"><div class="rich-stat-n">3x</div><div class="rich-stat-l">Zip Code Price Spread</div></div>
          <div class="rich-stat"><div class="rich-stat-n">3.3x</div><div class="rich-stat-l">Bedroom Premium</div></div>
          <div class="rich-stat"><div class="rich-stat-n">$110</div><div class="rich-stat-l">Gap in Zip 98134</div></div>
        </div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Question</div>
          <h2 class="rich-h2">What drives Airbnb pricing in Seattle, and how much money are hosts leaving on the table?</h2>
          <p class="rich-p">Most Seattle Airbnb hosts set nightly rates by gut feel: they check a few nearby listings, pick a number that feels competitive, and rarely revisit it. That approach ignores three variables that actually move revenue: where a listing sits, how many bedrooms it has, and when it's booked.</p>
          <p class="rich-p lede">This project pulls a full year of Seattle listing data into Tableau to quantify the gap between gut-feel pricing and data-driven pricing, and to show exactly which levers close that gap.</p>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Data</div>
          <h2 class="rich-h2">323,346 listing records, full year 2016</h2>
          <div class="rich-field-grid">
            <div class="rich-chip">Listing ID</div>
            <div class="rich-chip">Zip Code</div>
            <div class="rich-chip">Bedrooms</div>
            <div class="rich-chip">Price (nightly)</div>
            <div class="rich-chip">Revenue (annual)</div>
            <div class="rich-chip">Calendar entries</div>
          </div>
          <div class="rich-note">Price outliers above $1,500/night excluded. Listings with fewer than 10 reviews excluded for reliability. Source: Inside Airbnb / Kaggle Seattle 2016.</div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Process</div>
          <h2 class="rich-h2">How the dashboard was built in Tableau</h2>
          <div class="rich-timeline">
            <div class="rich-step">
              <div class="rich-step-num">1</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Data connection and relationship setup</div>
                <div class="rich-step-desc">Listings and calendar tables joined on listing ID, giving each listing its full year of price and availability history in one model.</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">2</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Calculated field for annual revenue</div>
                <div class="rich-step-desc">Annual revenue derived as the sum of available price multiplied by booked nights, rolled up per listing.</div>
                <div class="rich-code">Annual Revenue = SUM([Price]) * [Booked Nights]
Avg Price by Zip = AVG([Price])</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">3</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Geographic dimension: zip code as categorical</div>
                <div class="rich-step-desc">Zip code set as a categorical dimension and mapped to Seattle coordinates to enable the choropleth revenue map.</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">4</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Built 5 interactive sheets</div>
                <div class="rich-step-desc">Price by zip code bar chart, revenue map, seasonal line chart, price by bedroom count bar chart, and a listing count table by zip code.</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">5</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Dashboard assembly with cross-filter actions</div>
                <div class="rich-step-desc">All five sheets combined into one dashboard with cross-filter actions wired to the zip code dimension so clicking any zip updates every sheet simultaneously.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">Key Findings</div>
          <h2 class="rich-h2">Four pricing signals, one actionable gap</h2>
          <div class="rich-findings-grid">
            <div class="rich-finding">
              <div class="rich-finding-n">3x</div>
              <div class="rich-finding-head">Price spread across Seattle zip codes</div>
              <p class="rich-finding-body">Zip code is not just an address. It's a pricing tier. Hosts who don't know their zip's market position are flying blind.</p>
            </div>
            <div class="rich-finding">
              <div class="rich-finding-n">3.3x</div>
              <div class="rich-finding-head">4-bedroom properties earn 3.3x more per night than 1-bedrooms</div>
              <p class="rich-finding-body">Bedroom count is the single strongest lever available to a host. Every additional bedroom compounds.</p>
            </div>
            <div class="rich-finding">
              <div class="rich-finding-n">60%</div>
              <div class="rich-finding-head">Summer revenue peaks 60% above January</div>
              <p class="rich-finding-body">Seasonality is predictable and exploitable. Hosts with flat year-round pricing leave peak-season revenue on the table every year.</p>
            </div>
            <div class="rich-finding">
              <div class="rich-finding-n">$110/night</div>
              <div class="rich-finding-head">Under-priced gap in zip code 98134</div>
              <p class="rich-finding-body">The most actionable finding. One zip code, under-priced relative to comparables. A specific problem with a specific fix.</p>
            </div>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Recommendation</div>
          <h2 class="rich-h2">Three levers any host can pull</h2>
          <div class="rich-rec">
            <div class="rich-rec-tag">For hosts and property managers</div>
            <p class="rich-p">A host pricing by gut feel in zip code 98134 is leaving significant money on the table. The three pricing levers that matter most are zip code positioning, bedroom count, and seasonal timing.</p>
            <ul class="rich-rec-list">
              <li>Benchmark against zip-code average monthly, not citywide average.</li>
              <li>Price bedrooms incrementally, not linearly. Revenue by bedroom is not a straight line: 6-bedroom properties earn disproportionately more per bedroom than 2-bedroom properties.</li>
              <li>Apply a seasonal multiplier in June through August of at least 1.4x the January rate.</li>
            </ul>
            <p class="rich-p">A host who adjusts pricing upward in June through August and positions against comparable zip codes can close the $110/night gap in a single season.</p>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">Dashboard Screenshots</div>
          <h2 class="rich-h2">Real screenshots of the completed Tableau dashboard</h2>
          <p class="rich-p" style="margin-bottom:16px;">Click any image to view full size.</p>
          <div class="rich-gallery">
            <a class="rich-gallery-item" href="images/airbnb-dashboard.png" data-lightbox="images/airbnb-dashboard.png">
              <img src="images/airbnb-dashboard.png" alt="Full Airbnb Seattle Tableau dashboard" loading="lazy">
              <div class="rich-gallery-cap">Full Dashboard</div>
            </a>
            <a class="rich-gallery-item" href="images/tableau-sheet1.png" data-lightbox="images/tableau-sheet1.png">
              <img src="images/tableau-sheet1.png" alt="Avg price by zip code" loading="lazy">
              <div class="rich-gallery-cap">Avg Price by Zip Code</div>
            </a>
            <a class="rich-gallery-item" href="images/tableau-sheet2.png" data-lightbox="images/tableau-sheet2.png">
              <img src="images/tableau-sheet2.png" alt="Revenue map" loading="lazy">
              <div class="rich-gallery-cap">Revenue Map</div>
            </a>
            <a class="rich-gallery-item" href="images/tableau-sheet3.png" data-lightbox="images/tableau-sheet3.png">
              <img src="images/tableau-sheet3.png" alt="Revenue by week" loading="lazy">
              <div class="rich-gallery-cap">Revenue by Week</div>
            </a>
            <a class="rich-gallery-item" href="images/tableau-sheet4.png" data-lightbox="images/tableau-sheet4.png">
              <img src="images/tableau-sheet4.png" alt="Avg price by bedroom" loading="lazy">
              <div class="rich-gallery-cap">Price by Bedroom</div>
            </a>
            <a class="rich-gallery-item" href="images/tableau-sheet5.png" data-lightbox="images/tableau-sheet5.png">
              <img src="images/tableau-sheet5.png" alt="Listing count by zip" loading="lazy">
              <div class="rich-gallery-cap">Listing Count by Zip</div>
            </a>
            <a class="rich-gallery-item" href="images/tableau-join.png" data-lightbox="images/tableau-join.png">
              <img src="images/tableau-join.png" alt="Data join setup" loading="lazy">
              <div class="rich-gallery-cap">Data Join Setup</div>
            </a>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">Tools Used</div>
          <div class="rich-tools">
            <span class="rich-tool">Tableau</span>
            <span class="rich-tool">Data Visualization</span>
            <span class="rich-tool">Geospatial Analysis</span>
            <span class="rich-tool">Time Series</span>
            <span class="rich-tool">Airbnb Data</span>
          </div>
          <div class="rich-dl-card">
            <h3 class="rich-dl-title">View the project</h3>
            <p class="rich-dl-sub">Full dataset and project files available on GitHub.</p>
            <div class="rich-dl-actions">
              <a class="rich-btn-secondary" href="https://github.com/Andre-Weissmann" target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </div>
          </div>
        </div>
      `,
      statCards: [
        { n: '323k', label: 'Airbnb Records' },
        { n: '3x', label: 'Zip Code Price Spread' },
        { n: '3.3x', label: 'Bedroom Premium (1 to 4 bed)' },
        { n: '$110', label: 'Nightly Gap in Zip 98134' }
      ],
      findings: [
        { stat: '$110/night', text: 'Zip code 98134 commands the highest average nightly rate in Seattle. Hosts pricing by gut feel left roughly $110/night on the table vs the city median.' },
        { stat: '3x spread', text: 'Zip code alone explains a 3x spread in nightly rates across Seattle neighborhoods, the single strongest pricing signal in the dataset.' },
        { stat: '3.3x premium', text: 'A 4-bedroom property commands 3.3x the nightly rate of a 1-bedroom, a premium that compounds with high-value zip codes.' },
        { stat: '60% peak', text: 'Summer revenue peaks 60% above January. Hosts who adjust pricing seasonally capture significantly more annual revenue than flat-rate listers.' }
      ],
      recommendation: 'Three actions any Seattle host can take: price by zip code benchmark rather than neighborhood feel, charge a per-bedroom premium rather than flat-rate additional guests, and raise rates in June through August when demand peaks 60% above the January floor. Applying all three to a 98134 2-bedroom could close the full $110/night gap.',
      toc: ['Overview', 'Key Insight', 'Findings', 'Dataset', 'Methodology']
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
      keyInsight: 'The Pacific Region has the highest profit margins in Bike Sales. Middle-aged homeowners in management roles in the Pacific average $90,000 income, the highest of any segment. Commute distance is a powerful conversion predictor: customers commuting 0 to 1 miles convert at 55%, while 10+ mile commuters convert at only 29%.',
      overview: 'An Excel analysis of bike purchase survey data from 1,026 customers across Europe, North America, and the Pacific region. Built with PivotTables, PivotCharts, and Slicers, the dashboard lets stakeholders dynamically filter by gender, marital status, education, home ownership, and region to identify the most profitable target segments.',
      whyItMatters: 'Excel is the most widely used analytics tool in healthcare operations. This project demonstrates PivotTables, dynamic charts, nested IF formulas, Find & Replace cleaning, and dashboard design, skills that transfer directly to financial reporting, staffing analytics, and operational performance tracking.',
      dataset: {
        source: 'AlexTheAnalyst/Excel-Tutorial: Excel Project Dataset.xlsx (GitHub)',
        rows: '1,026 (after removing 25 duplicates from 13,351 raw entries)',
        columns: 13,
        keyColumns: ['ID','Marital Status','Gender','Income','Children','Education','Occupation','Home Owner','Cars','Commute Distance','Region','Age','Purchased Bike'],
        timeRange: 'Cross-sectional survey',
        format: 'Microsoft Excel (.xlsx): PivotTables, PivotCharts, Slicers'
      },
      methodology: [
        { tool: 'Excel', step: 'Find & Replace: Marital Status M→Married / S→Single; Gender M→Male / F→Female' },
        { tool: 'Excel', step: 'Currency column: removed 2 decimal places ($40,000 instead of $40,000.00)' },
        { tool: 'Nested IF', step: '=IF(L2>54,"Old",IF(L2>=31,"Middle Age",IF(L2<31,"Adolescent","Invalid"))) → Age Bracket column' },
        { tool: 'PivotTable ×4', step: 'Avg Income Per Purchase · Customer Commute · Age Brackets · Bikes by Occupation + Cars' },
        { tool: 'PivotChart ×4', step: 'Bar chart (income) · Line charts (commute, age) · Stacked bar (occupation + cars)' },
        { tool: 'Slicers ×5', step: 'Gender, Marital Status, Home Owner, Education, Region: cross-filter all charts simultaneously' }
      ],
      codeLabel: 'Excel Formulas',
      codeSnippet: `' ── Data Cleaning ──────────────────────────────────────────────

' Find & Replace: expand coded values
' Marital Status: M → Married  |  S → Single
' Gender:         M → Male     |  F → Female
' (Home tab → Find & Select → Replace → Replace All)

' ── Age Bracket Column (Column N) ───────────────────────────────
=IF(L2>54,"Old",IF(L2>=31,"Middle Age",IF(L2<31,"Adolescent","Invalid")))

' Logic:
'   Age > 54              → "Old"
'   31 ≤ Age ≤ 54         → "Middle Age"
'   Age < 31              → "Adolescent"
'   Anything else         → "Invalid" (data quality flag)

' ── PivotTable 1: Avg Income by Gender × Purchase Decision ──────
' Rows:   Gender
' Values: Average of Income
' Columns: Purchased Bike (Yes / No)
' Result reveals: Males who purchased avg $60,124 vs $55,774 for non-purchasers

' ── PivotTable 2: Count by Commute Distance × Purchase ──────────
' Rows:   Commute Distance (0-1 Miles, 1-2 Miles, 2-5 Miles, 5-10 Miles, 10+ Miles)
' Values: Count of Purchased Bike
' Columns: Yes / No split
' Key finding: 0-1 mile commuters convert at ~55%; 10+ mile at ~29%

' ── PivotTable 3: Count by Age Bracket × Purchase ───────────────
' Rows:   Age Bracket (Adolescent / Middle Age / Old)
' Values: Count of Purchased Bike
' Columns: Yes / No split

' ── Slicer connections ───────────────────────────────────────────
' All 4 PivotTables connected to 5 slicers:
'   Marital Status | Gender | Home Owner | Education | Region
' Insert → Slicer → select all 4 PivotTables in "Report Connections"`,
      richHtml: `
        <div class="rich-stat-row">
          <div class="rich-stat"><div class="rich-stat-n">1,026</div><div class="rich-stat-l">Customer Records</div></div>
          <div class="rich-stat"><div class="rich-stat-n">13</div><div class="rich-stat-l">Variables Tracked</div></div>
          <div class="rich-stat"><div class="rich-stat-n">3</div><div class="rich-stat-l">Key Segments</div></div>
          <div class="rich-stat"><div class="rich-stat-n">1</div><div class="rich-stat-l">Clear Recommendation</div></div>
        </div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Question</div>
          <h2 class="rich-h2">What business problem does this solve?</h2>
          <p class="rich-p">A bike retailer collects demographic and behavioral data on every customer who walks through the sales funnel, but rarely turns that data into a targeting strategy. Sales and marketing spend often gets spread evenly across the whole customer base, which wastes budget on segments that were never likely to convert in the first place.</p>
          <div class="rich-q-card">
            <div class="rich-q-mark">THE QUESTION</div>
            <p class="rich-q-text">Of 1,026 sales records, which customer profile is most likely to buy a bike, and where should sales focus?</p>
          </div>
          <p class="rich-p" style="margin-top:16px;">Answering this well means the sales team can prioritize outreach toward the customers most likely to say yes, instead of treating every lead the same.</p>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Data</div>
          <h2 class="rich-h2">1,026 records, 13 variables</h2>
          <p class="rich-p">Each row represents one customer: demographic fields (age, gender, marital status, income), household fields (children, home ownership, cars), and commute and location data, alongside whether that customer purchased a bike.</p>
          <div class="rich-field-grid">
            <div class="rich-chip">ID</div>
            <div class="rich-chip">Marital Status</div>
            <div class="rich-chip">Gender</div>
            <div class="rich-chip">Income</div>
            <div class="rich-chip">Children</div>
            <div class="rich-chip">Education</div>
            <div class="rich-chip">Occupation</div>
            <div class="rich-chip">Home Owner</div>
            <div class="rich-chip">Cars</div>
            <div class="rich-chip">Commute Distance</div>
            <div class="rich-chip">Region</div>
            <div class="rich-chip">Age</div>
            <div class="rich-chip">Purchased Bike</div>
          </div>
          <div class="rich-note">No missing values. Categorical fields standardized. Age grouped into buckets for cleaner pivoting.</div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Process</div>
          <h2 class="rich-h2">From raw rows to a sales-ready segment</h2>
          <div class="rich-timeline">
            <div class="rich-step">
              <div class="rich-step-num">1</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Data audit and standardization</div>
                <div class="rich-step-desc">Checked all 1,026 rows for missing or inconsistent values, standardized categorical labels, and bucketed continuous fields like Age into readable tiers.</div>
                <div class="rich-code">=IF(Age&lt;=30,"Under 30",IF(Age&lt;=54,"31-54","55+"))</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">2</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Pivot table: Age Group x Purchased Bike</div>
                <div class="rich-step-desc">Built a pivot crossing age buckets against purchase outcome. This is where the 31-54 middle-age segment first stood out.</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">3</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Pivot table: Commute Distance x Purchased Bike</div>
                <div class="rich-step-desc">Cross-tabulated commute distance bands against purchase rate. This step surfaced the clearest signal in the entire dataset: a sharp peak in conversion at 2 to 5 miles.</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">4</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Pivot table: Region and Income x Purchased Bike</div>
                <div class="rich-step-desc">Layered Region and Income bracket into a two-way pivot. Pacific Region customers with moderate to high income consistently outperformed all other combinations.</div>
              </div>
            </div>
            <div class="rich-step">
              <div class="rich-step-num">5</div>
              <div class="rich-step-body">
                <div class="rich-step-title">Dashboard with charts and slicers</div>
                <div class="rich-step-desc">Assembled a single-page dashboard with three linked charts and slicers for Region, Age Group, and Commute Distance.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">Key Findings</div>
          <h2 class="rich-h2">What the pivot tables revealed</h2>
          <div class="rich-findings-grid">
            <div class="rich-finding">
              <div class="rich-finding-n">2.4x</div>
              <div class="rich-finding-head">2-5 mile commuters buy at 2.4x the rate of sub-1-mile commuters</div>
              <p class="rich-finding-body">Commute is the single strongest predictor of purchase intent. Customers who live too close, or too far, both convert at far lower rates.</p>
            </div>
            <div class="rich-finding">
              <div class="rich-finding-n">67%</div>
              <div class="rich-finding-head">Middle-aged buyers (31-54) represent 67% of all purchases</div>
              <p class="rich-finding-body">Youth and senior segments lag significantly despite similar income levels. Life stage, not just earning power, drives the purchase decision.</p>
            </div>
            <div class="rich-finding">
              <div class="rich-finding-n">3.1x</div>
              <div class="rich-finding-head">$60k+ income customers convert at 3.1x the rate of sub-$40k customers</div>
              <p class="rich-finding-body">Price sensitivity is real but addressable through financing messaging. Income is a strong filter, though not as sharp as commute distance.</p>
            </div>
            <div class="rich-finding">
              <div class="rich-finding-n">#1</div>
              <div class="rich-finding-head">Pacific Region leads all regions in conversion rate</div>
              <p class="rich-finding-body">The regional gap held even after controlling for income and age, suggesting a genuine market difference rather than a data artifact.</p>
            </div>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">The Recommendation</div>
          <h2 class="rich-h2">Where to focus, starting now</h2>
          <div class="rich-rec">
            <div class="rich-rec-tag">Business Recommendation</div>
            <p class="rich-p">The sales team should concentrate effort on middle-aged, moderate-income professionals in Pacific markets with 2-5 mile commutes. That segment showed the highest purchase probability of any combination in the data, well above what age, income, or region alone would suggest.</p>
            <p class="rich-p">Rather than spreading budget evenly across all leads, marketing and outreach should target this cluster first before expanding to adjacent segments. Because this is a targeting shift and not a spending increase, it improves conversion rate with no increase in spend.</p>
            <p class="rich-payoff">This is the difference between marketing at customers and marketing to them.</p>
          </div>
        </div>

        <div class="rich-divider"></div>

        <div class="rich-section">
          <div class="rich-eyebrow">Tools Used</div>
          <div class="rich-tools">
            <span class="rich-tool">Excel</span>
            <span class="rich-tool">Pivot Tables</span>
            <span class="rich-tool">Power Pivot</span>
            <span class="rich-tool">Data Visualization</span>
          </div>
          <div class="rich-dl-card">
            <h3 class="rich-dl-title">Explore the workbook</h3>
            <p class="rich-dl-sub">Download the full Excel file with pivot tables, charts, and slicers.</p>
            <div class="rich-dl-actions">
              <a class="rich-btn-primary" href="https://github.com/Andre-Weissmann/andre-portfolio-content/raw/main/Bike_Sales_Dashboard.xlsx" target="_blank" rel="noopener noreferrer">Download .xlsx</a>
              <a class="rich-btn-secondary" href="https://github.com/Andre-Weissmann/andre-portfolio-content" target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </div>
          </div>
        </div>
      `,
      statCards: [
        { n: '1,026', label: 'Customer Records' },
        { n: '13', label: 'Variables Tracked' },
        { n: '2.4x', label: 'Commute Conversion Rate' },
        { n: '67%', label: 'Middle-Age Buyer Share' }
      ],
      findings: [
        { stat: '2.4x commute', text: 'Customers commuting 0 to 1 mile converted at 55% vs 23% for 10+ mile commuters, a 2.4x gap that is the strongest single predictor of purchase.' },
        { stat: '67% middle-age', text: 'Middle-aged buyers (31 to 54) made up 67% of all purchases. Adolescent and older segments converted at less than half the rate.' },
        { stat: '3.1x income', text: 'Buyers in management roles averaged $90k income, 3.1x the $29k average for manual laborers, the widest income gap across occupations.' },
        { stat: 'Pacific leads', text: 'The Pacific region posted the highest conversion rate and the highest average buyer income, making it the clearest priority for focused sales effort.' }
      ],
      recommendation: 'Focus marketing spend on middle-aged professionals in the Pacific region with commutes under 5 miles. That segment buys bikes at more than double the rate of any other group. A targeted campaign to this profile, rather than broad outreach across all segments, reallocates budget where it converts.',
      toc: ['Overview', 'Key Insight', 'Findings', 'Dataset', 'Methodology']
    }
  };

  /* ─── Build modal HTML ─────────────────────────────────────── */
  function buildModal(p) {
    // Rich HTML fast-path: if the project has richHtml, use it directly
    if (p.richHtml) {
      return `
    <div class="pdm-overlay" id="pdm-${p.id}" role="dialog" aria-modal="true" aria-label="${p.title}" hidden>
      <div class="pdm-sheet pdm-sheet--rich">
        <div class="pdm-header">
          <div class="pdm-header-left">
            <span class="proj-badge ${p.badgeClass}">${p.badge}</span>
            <span class="pdm-header-year">${p.year}</span>
          </div>
          <button class="pdm-close" aria-label="Close">&times;</button>
        </div>
        <div class="pdm-rich-body">
          ${p.richHtml}
        </div>
      </div>
    </div>`;
    }
    const tocItems = p.toc.map((label, i) =>
      `<button class="pdm-toc-btn${i === 0 ? ' active' : ''}" data-section="${i}">${label}</button>`
    ).join('');

    // Stat cards
    const statCardsHtml = p.statCards ? `
      <div class="pdm-stat-cards">
        ${p.statCards.map(s => `
          <div class="pdm-stat-card">
            <div class="pdm-stat-n">${s.n}</div>
            <div class="pdm-stat-l">${s.label}</div>
          </div>`).join('')}
      </div>` : '';

    // Findings list
    const findingsHtml = p.findings ? p.findings.map(f => `
      <div class="pdm-finding-row">
        <div class="pdm-finding-stat">${f.stat}</div>
        <div class="pdm-finding-text">${f.text}</div>
      </div>`).join('') : '';

    // Recommendation block
    const recommendationHtml = p.recommendation ? `
      <div class="pdm-recommendation">
        <div class="pdm-rec-label">RECOMMENDATION</div>
        <p class="pdm-rec-body">${p.recommendation}</p>
      </div>` : '';

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

    const codeBlock = p.codeSnippet ? `
      <div class="pdm-code-block">
        <div class="pdm-code-header">
          <span class="pdm-code-lang">${p.codeLabel}</span>
          <button class="pdm-code-copy" data-copy="${p.id}" aria-label="Copy code">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
        </div>
        <pre class="pdm-code-pre"><code class="pdm-code-content" id="pdm-code-${p.id}">${escHtml(p.codeSnippet)}</code></pre>
      </div>` : '';

    // SQL before/after results block
    const sqlResultsBlock = p.sqlResults ? (() => {
      const beforeCols = Object.keys(p.sqlResults.before[0]);
      const afterCols  = Object.keys(p.sqlResults.after[0]);
      const mkThead = cols => `<thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
      const mkTbody = (rows, cols) => `<tbody>${rows.map(r =>
        `<tr>${cols.map(c => `<td class="${r[c]==='NULL'?'pdm-null':r[c]==='No'||r[c]==='Yes'?'pdm-bool':''}">${r[c]}</td>`).join('')}</tr>`
      ).join('')}</tbody>`;
      return `
      <div class="pdm-results-block">
        <div class="pdm-results-insight">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.1l-3.6 1.9.7-4L2.2 5.2l4-.6z" fill="#3EC97A"/></svg>
          ${p.sqlResults.insight}
        </div>
        <div class="pdm-ba-label">BEFORE <span class="pdm-ba-note">raw data — NULLs, mixed formats</span></div>
        <div class="pdm-table-wrap">
          <table class="pdm-table pdm-table-before">${mkThead(beforeCols)}${mkTbody(p.sqlResults.before, beforeCols)}</table>
        </div>
        <div class="pdm-ba-label pdm-ba-after-label">AFTER <span class="pdm-ba-note">cleaned, split, normalized</span></div>
        <div class="pdm-table-wrap">
          <table class="pdm-table pdm-table-after">${mkThead(afterCols)}${mkTbody(p.sqlResults.after, afterCols)}</table>
        </div>
      </div>`;
    })() : '';

    // Python terminal output block
    const pyOutputBlock = p.pyOutput ? (() => {
      const lines = p.pyOutput.map(line => {
        if (!line.prompt && !line.value) return `<div class="pdm-term-spacer"></div>`;
        if (line.prompt === 'OUTPUT') return `<div class="pdm-term-output">&gt; ${escHtml(line.value)}</div>`;
        return `<div class="pdm-term-line"><span class="pdm-term-prompt">${escHtml(line.prompt)}</span><span class="pdm-term-val">${escHtml(line.value)}</span></div>`;
      }).join('');
      return `
      <div class="pdm-terminal">
        <div class="pdm-term-header">
          <span class="pdm-term-dot" style="background:#ff5f57"></span>
          <span class="pdm-term-dot" style="background:#febc2e"></span>
          <span class="pdm-term-dot" style="background:#28c840"></span>
          <span class="pdm-term-title">Python 3 — Anaconda / Jupyter</span>
        </div>
        <div class="pdm-term-body">${lines}</div>
      </div>`;
    })() : '';

    // Prominent GitHub CTA (only for SQL and Python)
    const githubCTA = p.githubUrl ? `
      <div class="pdm-github-cta">
        <div class="pdm-github-cta-left">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
          <div>
            <div class="pdm-github-cta-title">View full repository on GitHub</div>
            <div class="pdm-github-cta-sub">${p.githubUrl.replace('https://github.com/', '')}</div>
          </div>
        </div>
        <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="pdm-github-cta-btn">Open on GitHub</a>
      </div>` : '';

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
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="pdm-github-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              View on GitHub
            </a>` : ''}
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

            <!-- Section 2: Findings (only if data exists) -->
            ${p.statCards ? `
            <section class="pdm-section" data-section="2" id="pdm-${p.id}-s2">
              <div class="pdm-section-eyebrow">Findings</div>
              <h3 class="pdm-section-heading-sm">What the data shows</h3>
              ${statCardsHtml}
              <div class="pdm-findings-list">${findingsHtml}</div>
              ${recommendationHtml}
            </section>` : ''}

            <!-- Section 3: Dataset -->
            <section class="pdm-section" data-section="${p.statCards ? 3 : 2}" id="pdm-${p.id}-s${p.statCards ? 3 : 2}">
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

            <!-- Section 4: Methodology -->
            <section class="pdm-section" data-section="${p.statCards ? 4 : 3}" id="pdm-${p.id}-s${p.statCards ? 4 : 3}">
              <div class="pdm-section-eyebrow">Methodology</div>
              <h3 class="pdm-section-heading-sm">How the analysis was built</h3>
              <div class="pdm-methodology">${methodologySteps}</div>
              ${codeBlock}
              ${sqlResultsBlock}
              ${pyOutputBlock}
              ${githubCTA}
            </section>



          </div>
        </div>
      </div>
    </div>`;
  }

  /* ─── HTML escape helper ────────────────────────────────────── */
  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── Inject all modals ────────────────────────────────────── */
  const container = document.createElement('div');
  container.id = 'pdm-container';
  Object.values(projects).forEach(p => { container.innerHTML += buildModal(p); });
  document.body.appendChild(container);

  /* ─── Open / close ─────────────────────────────────────────── */
  let activeModal = null;
  let scrollPos = 0;
  let bodyScrollPos = 0;

  let _lastFocusedEl = null;

  function openModal(id) {
    const overlay = document.getElementById(`pdm-${id}`);
    if (!overlay) return;
    // Save focus so we can restore it on close
    _lastFocusedEl = document.activeElement;
    // Capture scroll position from both window and body (pplx.app uses body scroll)
    scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
    bodyScrollPos = document.body.scrollTop || 0;
    // Simply hide overflow — avoid position:fixed which breaks pplx.app body layout on iOS
    document.body.style.overflow = 'hidden';
    // Mark background content as inert so screen readers + keyboard stay in modal
    document.querySelectorAll('body > *:not([id^="pdm-"])').forEach(el => {
      if (el !== overlay) el.setAttribute('inert', '');
    });
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add('open');
      // Move focus into modal
      const firstFocusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    });
    activeModal = id;
    initScrollSpy(id);
  }

  function closeModal() {
    if (!activeModal) return;
    const overlay = document.getElementById(`pdm-${activeModal}`);
    if (!overlay) return;
    overlay.classList.remove('open');
    // Remove inert from background content
    document.querySelectorAll('[inert]').forEach(el => el.removeAttribute('inert'));
    function finishClose() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      // Restore scroll position
      if (scrollPos > 0) window.scrollTo(0, scrollPos);
      if (bodyScrollPos > 0) document.body.scrollTop = bodyScrollPos;
      // Restore focus to the element that triggered the modal
      if (_lastFocusedEl && typeof _lastFocusedEl.focus === 'function') {
        _lastFocusedEl.focus();
        _lastFocusedEl = null;
      }
    }
    overlay.addEventListener('transitionend', finishClose, { once: true });
    // Fallback: if transitionend never fires (reduced-motion, etc.), close after 350ms
    setTimeout(() => { if (overlay.hidden === false) finishClose(); }, 350);
    activeModal = null;
  }

  /* ─── TOC scroll spy ───────────────────────────────────────── */
  function initScrollSpy(id) {
    const content = document.getElementById(`pdm-content-${id}`);
    if (!content) return; // guard: no scrollable container for this modal
    const sections = content.querySelectorAll('.pdm-section');
    const overlay = document.getElementById(`pdm-${id}`);
    if (!overlay) return; // guard: modal element missing
    const tocBtns = overlay.querySelectorAll('.pdm-toc-btn');
    if (!tocBtns.length) return; // guard: no TOC buttons — skip scroll spy

    tocBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.section);
        if (sections[idx]) content.scrollTo({ top: sections[idx].offsetTop - 60, behavior: 'smooth' });
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
    if (e.target.classList.contains('pdm-overlay') || e.target.closest('.pdm-close')) closeModal();
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
    // Copy button
    if (e.target.closest('.pdm-code-copy')) {
      const btn = e.target.closest('.pdm-code-copy');
      const id = btn.dataset.copy;
      const code = document.getElementById(`pdm-code-${id}`);
      if (code) {
        navigator.clipboard.writeText(code.textContent).then(() => {
          btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
          setTimeout(() => {
            btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
          }, 2000);
        });
      }
    }
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && activeModal) closeModal(); });

})();
