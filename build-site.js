const fs = require('fs');
const path = require('path');

const repoDir = __dirname;
const indexPath = path.join(repoDir, 'index.html');

let indexHtml = fs.readFileSync(indexPath, 'utf8');

// 1. Upgrade elevator-wrapper sizing and styling
indexHtml = indexHtml.replace(
  /class="relative w-full h-full min-h-\[400px\] overflow-hidden elevator-wrapper rounded-2xl"/g,
  'class="relative w-full min-h-[520px] h-[540px] md:h-[620px] overflow-hidden elevator-wrapper rounded-2xl border border-slate-700/60 shadow-2xl"'
);

// 2. Interactive Bangalore Lift Estimator Section HTML
const estimatorHtml = `
<section id="estimator" class="py-20 bg-slate-900 text-white relative overflow-hidden">
  <div class="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl"></div>
  <div class="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl"></div>
  <div class="mx-auto max-w-7xl px-6 relative z-10">
    <div class="text-center max-w-3xl mx-auto mb-14">
      <span class="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
        ✨ Instant Estimate · Bengaluru Special
      </span>
      <h2 class="mt-4 font-display text-3xl font-extrabold sm:text-5xl text-white">
        Elevator Specification & Cost Estimator
      </h2>
      <p class="mt-4 text-slate-300 text-base sm:text-lg">
        Planning an elevator in Bengaluru? Customize your requirements below for an instant indicative estimate and customized project proposal.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Controls -->
      <div class="lg:col-span-7 bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <!-- Building Type -->
        <div class="mb-6">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Select Building Type</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="calc-type-group">
            <button type="button" class="calc-btn active px-3 py-3 rounded-xl border border-sky-400 bg-sky-600/30 text-white text-xs sm:text-sm font-semibold transition-all text-center flex flex-col items-center gap-1.5" data-type="villa" data-rate="5.5" data-label="Residential Villa">
              <span class="text-lg">🏡</span>
              <span>Villa / Home</span>
            </button>
            <button type="button" class="calc-btn px-3 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:border-slate-500 text-slate-300 text-xs sm:text-sm font-semibold transition-all text-center flex flex-col items-center gap-1.5" data-type="apt" data-rate="7.2" data-label="Apartment Complex">
              <span class="text-lg">🏢</span>
              <span>Apartment</span>
            </button>
            <button type="button" class="calc-btn px-3 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:border-slate-500 text-slate-300 text-xs sm:text-sm font-semibold transition-all text-center flex flex-col items-center gap-1.5" data-type="comm" data-rate="8.8" data-label="Commercial Complex">
              <span class="text-lg">🏬</span>
              <span>Commercial</span>
            </button>
            <button type="button" class="calc-btn px-3 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:border-slate-500 text-slate-300 text-xs sm:text-sm font-semibold transition-all text-center flex flex-col items-center gap-1.5" data-type="hosp" data-rate="10.5" data-label="Hospital / Stretcher">
              <span class="text-lg">🏥</span>
              <span>Hospital Lift</span>
            </button>
          </div>
        </div>

        <!-- Floors -->
        <div class="mb-6">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Number of Stops / Floors</label>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2" id="calc-floors-group">
            <button type="button" class="calc-btn px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-sm font-bold transition-all text-center" data-floors="2" data-label="G + 1 (2 Stops)">G + 1</button>
            <button type="button" class="calc-btn active px-3 py-2.5 rounded-xl border border-sky-400 bg-sky-600/30 text-white text-sm font-bold transition-all text-center" data-floors="3" data-label="G + 2 (3 Stops)">G + 2</button>
            <button type="button" class="calc-btn px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-sm font-bold transition-all text-center" data-floors="4" data-label="G + 3 (4 Stops)">G + 3</button>
            <button type="button" class="calc-btn px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-sm font-bold transition-all text-center" data-floors="5" data-label="G + 4 (5 Stops)">G + 4</button>
            <button type="button" class="calc-btn px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-sm font-bold transition-all text-center" data-floors="6" data-label="G + 5 (6 Stops)">G + 5</button>
            <button type="button" class="calc-btn px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-sm font-bold transition-all text-center" data-floors="8" data-label="G + 7 (8 Stops)">G + 7+</button>
          </div>
        </div>

        <!-- Cabin Finish -->
        <div class="mb-6">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">3. Cabin Style & Finish</label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5" id="calc-finish-group">
            <button type="button" class="calc-btn px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium transition-all text-left flex items-center gap-2.5" data-finish="ss" data-add="0" data-label="Hairline Stainless Steel 304">
              <span class="w-3 h-3 rounded-full bg-slate-300 shrink-0"></span>
              <span>Hairline SS 304</span>
            </button>
            <button type="button" class="calc-btn active px-3 py-2.5 rounded-xl border border-sky-400 bg-sky-600/30 text-white text-xs sm:text-sm font-medium transition-all text-left flex items-center gap-2.5" data-finish="glass" data-add="1.2" data-label="Panoramic Glass Capsule">
              <span class="w-3 h-3 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_#38bdf8]"></span>
              <span>Panoramic Glass</span>
            </button>
            <button type="button" class="calc-btn px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium transition-all text-left flex items-center gap-2.5" data-finish="gold" data-add="0.9" data-label="Titanium Gold Mirror">
              <span class="w-3 h-3 rounded-full bg-amber-400 shrink-0"></span>
              <span>Titanium Gold</span>
            </button>
          </div>
        </div>

        <!-- Drive Technology -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">4. Machine Room Configuration</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="calc-drive-group">
            <button type="button" class="calc-btn active px-3 py-2.5 rounded-xl border border-sky-400 bg-sky-600/30 text-white text-xs sm:text-sm font-medium transition-all text-left flex items-center gap-2.5" data-drive="mrl" data-add="0" data-label="MRL (Machine Room-Less)">
              <span class="text-sky-400 font-bold">⚡ MRL</span>
              <span>No Machine Room on Terrace</span>
            </button>
            <button type="button" class="calc-btn px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium transition-all text-left flex items-center gap-2.5" data-drive="hydraulic" data-add="0.5" data-label="Hydraulic Drive">
              <span class="text-sky-400 font-bold">💧 Hydraulic</span>
              <span>Pitless / Low Headroom</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quote Summary Card -->
      <div class="lg:col-span-5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div class="flex items-center justify-between pb-5 border-b border-slate-700">
          <div>
            <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">Estimated Project Budget</span>
            <div class="text-3xl sm:text-4xl font-extrabold text-white mt-1" id="calc-price-display">₹6.7L – ₹7.9L*</div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            IS 14665 Certified
          </span>
        </div>

        <div class="py-5 space-y-3 text-xs sm:text-sm border-b border-slate-700">
          <div class="flex justify-between text-slate-300">
            <span class="text-slate-400">Application:</span>
            <span class="font-semibold text-white" id="sum-type">Residential Villa</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span class="text-slate-400">Floors / Stops:</span>
            <span class="font-semibold text-white" id="sum-floors">G + 2 (3 Stops)</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span class="text-slate-400">Cabin Finish:</span>
            <span class="font-semibold text-white" id="sum-finish">Panoramic Glass</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span class="text-slate-400">Drive Type:</span>
            <span class="font-semibold text-white" id="sum-drive">MRL (Machine Room-Less)</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span class="text-slate-400">Location:</span>
            <span class="font-semibold text-white">Bengaluru (Free Site Survey)</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span class="text-slate-400">Includes:</span>
            <span class="font-semibold text-emerald-400">ARD Safety + 1 Yr Warranty + AMC</span>
          </div>
        </div>

        <div class="pt-6 space-y-3">
          <a id="calc-whatsapp-btn" href="#" target="_blank" rel="noopener" class="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-6 font-bold text-sm shadow-lg transition-transform hover:scale-[1.02]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path></svg>
            Send Spec to WhatsApp for Detailed BOQ
          </a>
          <button type="button" id="calc-callback-btn" class="w-full flex items-center justify-center gap-2 rounded-2xl border border-sky-400/50 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 py-3 px-6 font-semibold text-sm transition-all">
            Request Callback & Site Inspection
          </button>
          <p class="text-[11px] text-slate-400 text-center">
            *Indicative base turnkey estimate including drive, cabin, safety gears & installation. Exact quotation given post structural site survey in Bengaluru.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
`;

// Insert the estimator section before the testimonials section
if (indexHtml.includes('<section id="testimonials"')) {
  indexHtml = indexHtml.replace('<section id="testimonials"', estimatorHtml + '<section id="testimonials"');
} else if (indexHtml.includes('<section id="contact"')) {
  indexHtml = indexHtml.replace('<section id="contact"', estimatorHtml + '<section id="contact"');
}

// 3. Callback Modal HTML
const modalHtml = `
<div id="quote-modal" class="fixed inset-0 z-[9999] hidden items-center justify-center bg-black/70 backdrop-blur-sm p-4">
  <div class="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 text-white shadow-2xl">
    <button id="modal-close-btn" class="absolute top-5 right-5 text-slate-400 hover:text-white p-2">✕</button>
    <div class="mb-5">
      <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">Universal Elevators Bengaluru</span>
      <h3 class="text-2xl font-bold mt-1">Book Free Site Survey & Quote</h3>
      <p class="text-slate-300 text-xs sm:text-sm mt-1">Our certified elevator engineer will contact you within 30 minutes.</p>
    </div>
    <form id="quote-form" class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
        <input type="text" id="cust-name" required placeholder="e.g. Ramesh Kumar" class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
          <input type="tel" id="cust-phone" required placeholder="+91 98765 43210" class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Bangalore Locality</label>
          <input type="text" id="cust-loc" placeholder="e.g. Whitefield, HSR, Indiranagar" class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none">
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1">Requirement Details</label>
        <textarea id="cust-msg" rows="3" placeholder="Tell us about your building, floors, or elevator issue..." class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"></textarea>
      </div>
      <button type="submit" class="w-full rounded-xl bg-primary hover:bg-primary-glow text-white font-bold py-3 text-sm shadow-lg transition-transform hover:scale-[1.02]">
        Submit & Dispatch on WhatsApp
      </button>
    </form>
  </div>
</div>
`;

// 4. Client Script (Three.js, Elevator 3D, Calculator, Left Track, Modal)
const scriptsHtml = `
${modalHtml}
<script src="/universal-elevators/assets/three.min.js"></script>
<script src="/universal-elevators/assets/elevator-3d.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const btn = document.querySelector('button[aria-label="Toggle menu"]');
    const nav = document.querySelector('header nav');
    if (btn && nav) {
      btn.addEventListener('click', () => {
        nav.classList.toggle('hidden');
        nav.classList.toggle('flex');
        nav.classList.toggle('flex-col');
        nav.classList.toggle('absolute');
        nav.classList.toggle('top-full');
        nav.classList.toggle('left-0');
        nav.classList.toggle('w-full');
        nav.classList.toggle('bg-background');
        nav.classList.toggle('p-6');
        nav.classList.toggle('shadow-xl');
        nav.classList.toggle('border-b');
        nav.classList.toggle('border-border');
      });
    }

    // 2. Left side page elevator track sync
    const sideTrackButtons = document.querySelectorAll('.elevator-track button');
    const sideCabin = document.querySelector('.elevator-track .cabin');
    const sectionTargets = ['#hero', '#services', '#about', '#faq', '#contact'];

    if (sideTrackButtons && sideTrackButtons.length > 0) {
      sideTrackButtons.forEach((b, idx) => {
        b.addEventListener('click', () => {
          const target = document.querySelector(sectionTargets[idx]);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = Math.min(100, Math.max(0, (scrollPos / docHeight) * 100));

      if (sideCabin) {
        sideCabin.style.top = scrollPct + '%';
      }

      // Highlight corresponding floor button
      const currentIdx = Math.min(4, Math.floor((scrollPct / 100) * 5));
      sideTrackButtons.forEach((b, idx) => {
        if (idx === currentIdx) {
          b.classList.remove('text-slate-400', 'font-medium');
          b.classList.add('text-primary', 'font-bold');
        } else {
          b.classList.remove('text-primary', 'font-bold');
          b.classList.add('text-slate-400', 'font-medium');
        }
      });
    });

    // 3. Calculator Logic
    let curTypeRate = 5.5;
    let curTypeLabel = 'Residential Villa';
    let curFloors = 3;
    let curFloorsLabel = 'G + 2 (3 Stops)';
    let curFinishAdd = 1.2;
    let curFinishLabel = 'Panoramic Glass';
    let curDriveAdd = 0;
    let curDriveLabel = 'MRL (Machine Room-Less)';

    function updateCalc() {
      const basePrice = (curTypeRate + (curFloors - 2) * 0.75 + curFinishAdd + curDriveAdd);
      const minPrice = basePrice.toFixed(1);
      const maxPrice = (basePrice * 1.18).toFixed(1);

      const priceDisplay = document.getElementById('calc-price-display');
      if (priceDisplay) {
        priceDisplay.textContent = '₹' + minPrice + 'L – ₹' + maxPrice + 'L*';
      }

      document.getElementById('sum-type').textContent = curTypeLabel;
      document.getElementById('sum-floors').textContent = curFloorsLabel;
      document.getElementById('sum-finish').textContent = curFinishLabel;
      document.getElementById('sum-drive').textContent = curDriveLabel;

      const waMsg = encodeURIComponent(
        'Hi Universal Elevators Bengaluru, I would like a quote for:\\n' +
        '• Building Type: ' + curTypeLabel + '\\n' +
        '• Floors: ' + curFloorsLabel + '\\n' +
        '• Cabin Finish: ' + curFinishLabel + '\\n' +
        '• Machine: ' + curDriveLabel + '\\n' +
        '• Indicative Budget: ₹' + minPrice + 'L - ₹' + maxPrice + 'L\\n' +
        'Please arrange a free site survey in Bengaluru.'
      );
      const waBtn = document.getElementById('calc-whatsapp-btn');
      if (waBtn) {
        waBtn.href = 'https://wa.me/919844141114?text=' + waMsg;
      }
    }

    // Calc button group binders
    function setupGroup(containerId, onSelect) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const btns = container.querySelectorAll('.calc-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => {
            b.classList.remove('active', 'border-sky-400', 'bg-sky-600/30', 'text-white');
            b.classList.add('border-slate-700', 'bg-slate-800', 'text-slate-300');
          });
          btn.classList.add('active', 'border-sky-400', 'bg-sky-600/30', 'text-white');
          btn.classList.remove('border-slate-700', 'bg-slate-800', 'text-slate-300');
          onSelect(btn);
          updateCalc();
        });
      });
    }

    setupGroup('calc-type-group', btn => {
      curTypeRate = parseFloat(btn.getAttribute('data-rate'));
      curTypeLabel = btn.getAttribute('data-label');
    });

    setupGroup('calc-floors-group', btn => {
      curFloors = parseInt(btn.getAttribute('data-floors'), 10);
      curFloorsLabel = btn.getAttribute('data-label');
    });

    setupGroup('calc-finish-group', btn => {
      curFinishAdd = parseFloat(btn.getAttribute('data-add'));
      curFinishLabel = btn.getAttribute('data-label');
    });

    setupGroup('calc-drive-group', btn => {
      curDriveAdd = parseFloat(btn.getAttribute('data-add'));
      curDriveLabel = btn.getAttribute('data-label');
    });

    updateCalc();

    // 4. Modal Interactions
    const modal = document.getElementById('quote-modal');
    const modalClose = document.getElementById('modal-close-btn');
    const callbackBtn = document.getElementById('calc-callback-btn');

    if (callbackBtn && modal) {
      callbackBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      });
    }

    if (modalClose && modal) {
      modalClose.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    }

    const form = document.getElementById('quote-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cust-name').value;
        const phone = document.getElementById('cust-phone').value;
        const loc = document.getElementById('cust-loc').value || 'Bangalore';
        const msg = document.getElementById('cust-msg').value;

        const text = encodeURIComponent(
          'Hi Universal Elevators, New Site Inspection Request:\\n' +
          '• Name: ' + name + '\\n' +
          '• Phone: ' + phone + '\\n' +
          '• Locality: ' + loc + '\\n' +
          '• Specification: ' + curTypeLabel + ', ' + curFloorsLabel + ', ' + curFinishLabel + '\\n' +
          '• Note: ' + (msg || 'N/A')
        );

        window.open('https://wa.me/919844141114?text=' + text, '_blank');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        alert('Thank you, ' + name + '! Your site inspection request has been sent to our engineers on WhatsApp.');
      });
    }
  });
</script>
`;

// Replace bottom scripts in index.html
if (indexHtml.includes('<script>')) {
  indexHtml = indexHtml.replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, scriptsHtml + '</body>');
} else {
  indexHtml = indexHtml.replace('</body>', scriptsHtml + '</body>');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('Successfully upgraded index.html with 3D elevator, interactive estimator, and modal!');
