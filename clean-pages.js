const fs = require('fs');
const path = require('path');

const repoDir = __dirname;
const htmlFiles = [
  path.join(repoDir, 'index.html'),
  path.join(repoDir, 'services', 'index.html'),
  path.join(repoDir, 'about', 'index.html'),
  path.join(repoDir, 'faq', 'index.html'),
  path.join(repoDir, 'contact', 'index.html')
];

const mobileMenuScript = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
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
  });
</script>
`;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix assets to use GitHub Pages repository prefix
  content = content.replace(/(href|src)=["']\/assets\//g, '$1="/universal-elevators/assets/');
  content = content.replace(/["']\/assets\//g, '"/universal-elevators/assets/');

  // Fix internal anchor navigation
  content = content.replace(/href=["']\/#([a-zA-Z0-9_\-]+)["']/g, 'href="#$1"');

  // Remove the TanStack Router hydration barrier & module import that blanks out the page
  content = content.replace(/<script class="\$tsr"[\s\S]*?<\/script>/g, '');
  content = content.replace(/<script type="module"[\s\S]*?<\/script>/g, '');

  // Insert smooth mobile toggle script before </body>
  content = content.replace('</body>', mobileMenuScript + '</body>');

  fs.writeFileSync(file, content, 'utf8');
  console.log('Cleaned and fixed:', file);
}
