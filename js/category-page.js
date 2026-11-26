import { applicationPayload } from "./category-enrollment.js";
import { getInternshipCategory } from "./internship-catalog.js";

const categoryId = document.body.dataset.categoryId;
const category = getInternshipCategory(categoryId);
const app = document.querySelector("#categoryApp");
const heroHeadings = {
  "short-term": `<span>Build Real Skills.</span> <em>Make Every Week Count.</em>`,
  "long-term": `<span>Build Expertise.</span> <em>Create Your Career Advantage.</em>`,
  summer: `<span>Turn Your Summer Into</span> <em>a Career Advantage.</em>`
};
const themeColors = {
  green: "#4d8060",
  blue: "#5476a8",
  amber: "#c27b1f"
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderPlan(plan) {
  const duration = plan.weeks ? `${plan.weeks} weeks` : "Flexible duration";
  const price = plan.priceINR === 0 ? "FREE" : `₹${plan.priceINR.toLocaleString("en-IN")}`;
  const milestones = plan.milestones ? `<p class="plan-meta">${plan.milestones} project milestones</p>` : "";
  const scope = plan.projectScope ? `<p class="plan-scope">${escapeHtml(plan.projectScope)}</p>` : "";
  const recommended = plan.recommended
    ? `<span class="plan-recommendation">${escapeHtml(plan.recommendationLabel || "Recommended scope")}</span>`
    : "";
  return `<article class="plan-card${plan.instantPdfIncluded ? " plan-premium" : ""}${plan.recommended ? " plan-card-recommended" : ""}">
    ${recommended}${plan.instantPdfIncluded ? `<span class="premium-label">INSTANT ENROLLMENT PDF</span>` : ""}
    <p class="eyebrow">${escapeHtml(plan.level)}</p>
    <h3>${escapeHtml(plan.name)}</h3>
    <p class="plan-duration">${duration}</p>
    <p class="plan-price">${price}</p>
    <p class="plan-disclosure">Enrollment opens after backend verification.</p>
    ${scope}${milestones}${list(plan.benefits)}
    <button class="button button-outline" type="button" data-select-plan="${escapeHtml(plan.id)}" aria-pressed="false">Select plan</button>
  </article>`;
}

function renderDomain(item) {
  let detail;
  if (categoryId === "long-term") {
    detail = `<p>${escapeHtml(item.overview || item.description)}</p>
      <h4>Recommended knowledge</h4>${list(item.skills)}
      <h4>Learning objectives</h4>${list(item.objectives)}
      <h4>Example capstone</h4><p>${escapeHtml(item.project)}</p>
      <h4>Example milestones</h4>${list(item.milestones)}
      <h4>Expected deliverables</h4>${list(item.deliverables)}`;
  } else if (categoryId === "summer") {
    detail = `<p>${escapeHtml(item.description)}</p>
      <h4>Learning objective</h4><p>${escapeHtml(item.objective)}</p>
      <h4>Project example</h4><p>${escapeHtml(item.project)}</p>
      <h4>Skills</h4>${list(item.skills)}
      <h4>Deliverables</h4>${list(item.deliverables)}`;
  } else {
    detail = `<p>${escapeHtml(item.description)}</p>
      <h4>Skills</h4>${list(item.skills)}
      <h4>Sample project</h4><p>${escapeHtml(item.project)}</p>`;
  }
  const specialization = item.specializations.length
    ? `<p class="domain-specializations"><strong>Specializations:</strong> ${item.specializations.map(escapeHtml).join(" · ")}</p>`
    : "";
  return `<article class="domain-card">
    <details>
      <summary><span class="domain-icon" aria-hidden="true">${item.emoji}</span><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description)}</small></span></summary>
      <div class="domain-detail">${detail}${specialization}
        <button class="button button-outline domain-select" type="button" data-select-domain="${escapeHtml(item.id)}" aria-pressed="false">Choose domain</button>
      </div>
    </details>
  </article>`;
}

if (!category || !app || !heroHeadings[categoryId]) {
  throw new Error(`Unknown internship category: ${categoryId || "(missing)"}`);
}

document.documentElement.style.setProperty("--category-accent", themeColors[category.theme]);
document.body.classList.add("category-page", `category-${category.theme}`);
document.title = `${category.name} Programs | Stratos Global Education`;

const durationRange = category.plans.map((plan) => plan.weeks).filter(Boolean);
const durationText = durationRange.length
  ? `${Math.min(...durationRange)}–${Math.max(...durationRange)} weeks`
  : "Flexible duration";
const isLongTerm = categoryId === "long-term";
const heroIcon = categoryId === "short-term" ? "🌱" : isLongTerm ? "🧭" : "☀️";
const projectRequirement = category.projectRequirements[0] || "Complete the assigned project requirements.";
const categoryLinks = [
  { href: "/#pricing", label: "Instant Certificate" },
  { href: "/short-term-internships/", label: "Short-Term" },
  { href: "/long-term-internships/", label: "Long-Term" },
  { href: "/summer-internships/", label: "Summer" }
];
const categoryLinkMarkup = categoryLinks.map(({ href, label }) =>
  `<a href="${href}"${href === category.route ? ' aria-current="page"' : ""}>${label}</a>`
).join("");

app.innerHTML = `
  <div class="announcement-strip">
    <span>${escapeHtml(category.name)} · ${category.domains.length} domains · ${category.plans.length} plan options</span>
    <span>${category.enrollment.available ? "Enrollment information" : "Enrollment is not open yet"}</span>
  </div>
  <header class="site-header">
    <a class="brand" href="/" aria-label="Stratos Global Education home">
      <img src="/stratos-logo.svg" alt="" width="44" height="44">
      <span>STRATOS<small>GLOBAL EDUCATION</small></span>
    </a>
    <nav class="desktop-nav" aria-label="Main navigation">
      <a href="/">Home</a>
      <details class="program-menu">
        <summary>Programs</summary>
        <div class="program-menu-list">${categoryLinkMarkup}</div>
      </details>
      <a href="#domains">Domains</a><a href="#plans">Plans</a><a href="#how">How It Works</a>
      <a href="/my-internships">My Internships</a>
      <a class="button button-primary" href="#application">Apply Now</a>
    </nav>
    <nav class="mobile-nav" aria-label="Quick navigation">
      <a href="/">Home</a>${categoryLinkMarkup}<a href="#plans">Plans</a><a href="#domains">Domains</a><a href="/my-internships">My Internships</a><a href="#application">Apply</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">${escapeHtml(category.name)} · VIRTUAL PROGRAM</p>
        <h1>${heroHeadings[categoryId]}</h1>
        <p class="hero-description">${escapeHtml(category.description)}</p>
        <div class="hero-facts">
          <span>${durationText}</span><span>${category.domains.length} domains</span><span>Virtual · project-based</span>
        </div>
        <div class="hero-actions">
          <a class="button button-primary" href="#domains">Explore Domains <span aria-hidden="true">→</span></a>
          <a class="button button-secondary" href="#plans">View Plans</a>
        </div>
      </div>
      <aside class="overview-card" aria-label="${escapeHtml(category.name)} overview">
        <div class="overview-card-heading">
          <div><p class="eyebrow">${escapeHtml(category.name)} OVERVIEW</p><h2>Learn by building.</h2></div>
          <span class="overview-icon" aria-hidden="true">${heroIcon}</span>
        </div>
        <div class="overview-duration"><span>Program duration</span><strong>${durationText}</strong></div>
        <ul class="overview-features">
          <li><span aria-hidden="true">▦</span><span><strong>${category.domains.length} domains</strong><small>Choose a practical focus</small></span></li>
          <li><span aria-hidden="true">◈</span><span><strong>${category.plans.length} plan options</strong><small>Proposed scopes and durations</small></span></li>
          <li><span aria-hidden="true">⌘</span><span><strong>Virtual internship</strong><small>Project-based learning</small></span></li>
          <li><span aria-hidden="true">✓</span><span><strong>Practical project</strong><small>${escapeHtml(projectRequirement)}</small></span></li>
          <li><span aria-hidden="true">♧</span><span><strong>QR-verifiable certificate</strong><small>After successful completion and approval</small></span></li>
        </ul>
        <a class="button overview-cta" href="#domains">Explore Internship Domains <span aria-hidden="true">→</span></a>
      </aside>
    </section>

    <section class="stats-strip" aria-label="Program summary">
      <div><strong>${category.domains.length}</strong><span>Domains</span></div>
      <div><strong>${category.plans.length}</strong><span>Plan options</span></div>
      <div><strong>${durationText}</strong><span>Duration range</span></div>
      <div><strong>Virtual</strong><span>Project format</span></div>
    </section>

    <section class="section benefits-section" aria-labelledby="benefits-title">
      <div class="section-heading">
        <p class="eyebrow">A PRACTICAL LEARNING PATH</p>
        <h2 id="benefits-title">What you will work toward</h2>
        <p>Clear project requirements, tangible deliverables, and evaluation based on submitted work.</p>
      </div>
      <div class="benefit-grid">
        <article class="benefit-card"><span aria-hidden="true">01</span><h3>Focused learning</h3><p>Choose one domain and build relevant skills through a defined project.</p></article>
        <article class="benefit-card"><span aria-hidden="true">02</span><h3>Project deliverables</h3><p>Submit practical work and supporting documentation according to the program requirements.</p></article>
        <article class="benefit-card"><span aria-hidden="true">03</span><h3>Evaluation</h3><p>Completion is reviewed against the assigned requirements; payment alone does not establish completion.</p></article>
        <article class="benefit-card"><span aria-hidden="true">04</span><h3>Certificate eligibility</h3><p>A completion certificate is issued only after required work is evaluated and approved.</p></article>
      </div>
    </section>

    <section class="section plans-section" id="plans" aria-labelledby="plans-title">
      <div class="section-heading">
        <p class="eyebrow">PLAN OPTIONS</p>
        <h2 id="plans-title">Choose a project scope</h2>
        <p>Every plan includes a QR-verifiable completion certificate after approval. Premium includes planned instant enrollment PDF delivery after verified payment.</p>
      </div>
      <p class="selection-summary">Selected domain: <strong data-plan-domain>None yet</strong></p><div class="plans-grid">${category.plans.map(renderPlan).join("")}</div>
      <p class="plan-footnote">Enrollment is temporarily unavailable pending backend activation. No payment will be collected.</p>
    </section>

    <section class="section domains-section" id="domains" aria-labelledby="domains-title">
      <div class="section-heading">
        <p class="eyebrow">${category.domains.length} AVAILABLE DOMAINS</p>
        <h2 id="domains-title">Find a project that fits</h2>
        <p>Select a domain to include it in your application preferences. Project examples are illustrative and can be adapted to the selected plan.</p>
      </div>
      <label class="domain-search-label">Search domains <input id="domainSearch" type="search" placeholder="Search by name or skill"></label><p class="selection-summary" aria-live="polite">Selected domain: <strong data-selected-domain>None yet</strong></p>
      <div class="domains-grid">${category.domains.map(renderDomain).join("")}</div>
    </section>

    <section class="section requirements-section" aria-labelledby="requirements-title">
      <div class="section-heading">
        <p class="eyebrow">PROJECT REQUIREMENTS</p>
        <h2 id="requirements-title">Build, document, and submit</h2>
      </div>
      <div class="requirements-panel">
        <div><h3>Every project should include</h3><ul><li>Work that matches the assigned project brief and selected plan scope.</li><li>Source files, design artifacts, or analysis required by the chosen domain.</li><li>A concise explanation of approach, decisions, and limitations.</li><li>Required deliverables submitted through the manually managed Google Form workflow.</li></ul></div>
        <div><h3>Submission and evaluation</h3><p>Project submissions are intended to use the manually managed Google Form process. A form URL is not configured for this category yet, so submissions are not currently available. Once the process is active, work will be reviewed against the assigned requirements; a certificate is issued only after successful evaluation and approval.</p><p>Cybersecurity activities must stay within an authorized local or simulated lab. Do not include personal or confidential data in submissions.</p></div>
      </div>
    </section>

    <section class="section workflow-section" id="how" aria-labelledby="workflow-title">
      <div class="section-heading">
        <p class="eyebrow">HOW IT WORKS</p>
        <h2 id="workflow-title">A clear project journey</h2>
      </div>
      <ol class="workflow-grid">
        <li><span>01</span><h3>Enroll when available</h3><p>Choose a domain and approved plan through the registration process.</p></li>
        <li><span>02</span><h3>Receive a project brief</h3><p>Project scope and deliverables are provided after enrollment is confirmed.</p></li>
        <li><span>03</span><h3>Submit with Google Forms</h3><p>Use the manually managed form link when it is configured and shared.</p></li>
        <li><span>04</span><h3>Complete evaluation</h3><p>Submitted work is reviewed against the assigned project requirements.</p></li>
        <li><span>05</span><h3>Earn a certificate</h3><p>QR-verifiable completion credentials follow successful evaluation and approval.</p></li>
      </ol>
    </section>

    <section class="section certificate-section" aria-labelledby="certificate-title">
      <div class="certificate-panel">
        <p class="eyebrow">COMPLETION CERTIFICATE</p>
        <h2 id="certificate-title">Earned through completed work</h2>
        <p>Certificate eligibility depends on meeting the project requirements and passing the applicable evaluation. A verified QR credential is provided only after issuance; all plans include a completion certificate after approval. Premium enrollment PDFs are separate documents and do not certify completion.</p>
      </div>
    </section>

    <section class="section faq-section" aria-labelledby="faq-title">
      <div class="section-heading"><p class="eyebrow">FAQ</p><h2 id="faq-title">Common questions</h2></div>
      <div class="faq-list">
        <details><summary>Can I enroll in this category now?</summary><p>Enrollment and checkout are not enabled for this category. The listed plans are not yet available to purchase.</p></details>
        <details><summary>Are the listed project examples guaranteed assignments?</summary><p>No. Examples illustrate the type of work; an assigned project brief and requirements must be confirmed when enrollment is available.</p></details>
        <details><summary>How are project complexity and duration determined?</summary><p>Each plan indicates a proposed duration and scope. Final project requirements must be confirmed before enrollment opens.</p></details>
        <details><summary>Does registration guarantee a certificate or placement?</summary><p>No. Certificates require successful evaluation of required work. This program does not promise employment or placement.</p></details>
        <details><summary>Where will I submit project work?</summary><p>Submissions use the manually managed Google Form process. A form URL has not been configured for this category yet.</p></details>
        ${categoryId === "summer" ? `<details><summary>When does the summer batch start?</summary><p>Summer enrollment dates have not been configured, so no batch date is being advertised.</p></details>` : ""}
      </div>
    </section>

    <section class="section application-section" id="application" aria-labelledby="application-title">
      <div class="application-panel">
        <p class="eyebrow">APPLICATION STATUS</p>
        <h2 id="application-title">Enrollment is not open yet</h2>
        <p>Registration and category checkout are not active. No payment can be collected for this program. Your selections are previews only and are not submitted.</p>
        <p class="application-selection">Selected plan: <strong data-selected-plan>None yet</strong> · Selected domain: <strong data-application-domain>None yet</strong></p>
        <form id="applicationPreview" class="application-preview"><label>Full name <input name="fullName" required maxlength="100" autocomplete="name"></label><label>Phone (+91) <input name="phone" type="tel" required autocomplete="tel" placeholder="+919876543210"></label><button class="button button-primary" type="submit">Review selection</button><p id="applicationFeedback" role="status"></p></form><a class="button button-primary" href="/my-internships">Go to My Internships</a>
        <a class="button button-secondary" href="/">Explore all programs</a>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <a class="brand" href="/"><img src="/stratos-logo.svg" alt="" width="40" height="40"><span>STRATOS<small>GLOBAL EDUCATION</small></span></a>
    <nav aria-label="Internship categories"><a href="/">Home</a><a href="/short-term-internships/">Short-Term</a><a href="/long-term-internships/">Long-Term</a><a href="/summer-internships/">Summer</a><a href="/my-internships">My Internships</a></nav>
    <p>© ${new Date().getFullYear()} Stratos Global Education</p>
  </footer>`;

const main = app.querySelector("main");
main.insertBefore(app.querySelector("#domains"), app.querySelector("#plans"));
main.insertBefore(app.querySelector("#plans"), app.querySelector(".benefits-section"));
main.insertBefore(app.querySelector("#domains"), app.querySelector("#plans"));
app.querySelector("#domainSearch").addEventListener("input", event => {
 const q = event.target.value.trim().toLowerCase();
 app.querySelectorAll(".domain-card").forEach(card => { card.hidden = !card.textContent.toLowerCase().includes(q); });
});
let selectedDomain = null;
let selectedPlan = null;
app.addEventListener("click", (event) => {
  const domainButton = event.target.closest("[data-select-domain]");
  const planButton = event.target.closest("[data-select-plan]");

  if (domainButton) {
    selectedDomain = category.domains.find((item) => item.id === domainButton.dataset.selectDomain);
    app.querySelectorAll("[data-select-domain]").forEach((button) => {
      const selected = button.dataset.selectDomain === selectedDomain.id;
      button.setAttribute("aria-pressed", String(selected));
      button.textContent = selected ? "Selected" : "Choose domain";
    });
    app.querySelector("[data-selected-domain]").textContent = selectedDomain.name;
    app.querySelector("[data-application-domain]").textContent = selectedDomain.name;
    app.querySelector("[data-plan-domain]").textContent = selectedDomain.name;
    app.querySelector("#plans").scrollIntoView({block:"start"});
  }

  if (planButton) {
    if (!selectedDomain) { app.querySelector("#domains").scrollIntoView({block:"start"}); app.querySelector("#domainSearch").focus({preventScroll:true}); return; }
    selectedPlan = category.plans.find((plan) => plan.id === planButton.dataset.selectPlan);
    app.querySelectorAll("[data-select-plan]").forEach((button) => {
      const selected = button.dataset.selectPlan === selectedPlan.id;
      button.setAttribute("aria-pressed", String(selected));
      button.textContent = selected ? "Selected plan" : "Select plan";
    });
    app.querySelector("[data-selected-plan]").textContent = `${selectedPlan.name} · ${selectedPlan.weeks} weeks`;
    app.querySelector("#application").scrollIntoView({block:"start"});
  }
});

app.querySelector('#applicationPreview').addEventListener('submit',event=>{event.preventDefault();const feedback=app.querySelector('#applicationFeedback');try{applicationPayload(category,selectedDomain,selectedPlan,Object.fromEntries(new FormData(event.target)));feedback.textContent=`${selectedDomain.name} · ${selectedPlan.name} · ${selectedPlan.priceINR===0?'FREE':'₹'+selectedPlan.priceINR}. Preview only: no registration or payment has been submitted.`;}catch(error){feedback.textContent=error.message;}});
