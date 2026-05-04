// assets/js/asanas.js
document.addEventListener("DOMContentLoaded", function() {
  const asanaItems = document.querySelectorAll(".asana-item");
  const centerDisplay = document.getElementById("asanaCenterDisplay");
  const titleEl = document.getElementById("asanaTitle");
  const descEl = document.getElementById("asanaDesc");
  const stepEl = document.getElementById("asanaStep");
  const breathEl = document.getElementById("asanaBreath");
  const detailTitleEl = document.getElementById("asanaDetailTitle");
  const focusEl = document.getElementById("asanaFocus");
  const benefitsEl = document.getElementById("asanaBenefits");
  const progressTextEl = document.getElementById("asanaProgressText");
  const progressBarEl = document.getElementById("asanaProgressBar");

  if (!asanaItems.length || !centerDisplay) return;

  function updateAsana(item, index) {
    const newTitle = item.getAttribute("data-title");
    const newDesc = item.getAttribute("data-desc");
    const newStep = item.getAttribute("data-step") || `Step ${index + 1} of ${asanaItems.length}`;
    const newBreath = item.getAttribute("data-breath") || "Move with awareness";
    const newFocus = item.getAttribute("data-focus") || "Keep the body steady and relaxed";
    const newBenefits = item.getAttribute("data-benefits") || "Builds strength, flexibility, and attention";
    const progress = ((index + 1) / asanaItems.length) * 100;

    centerDisplay.classList.add("fade-out");

    setTimeout(() => {
      titleEl.textContent = newTitle;
      descEl.textContent = newDesc;
      if (stepEl) stepEl.textContent = newStep;
      if (breathEl) breathEl.textContent = `Breathe: ${newBreath}`;
      if (detailTitleEl) detailTitleEl.textContent = newTitle;
      if (focusEl) focusEl.textContent = newFocus;
      if (benefitsEl) benefitsEl.textContent = newBenefits;
      if (progressTextEl) progressTextEl.textContent = `${index + 1} / ${asanaItems.length}`;
      if (progressBarEl) progressBarEl.style.width = `${progress}%`;

      centerDisplay.classList.remove("fade-out");
      centerDisplay.classList.remove("pulse");
      requestAnimationFrame(() => centerDisplay.classList.add("pulse"));
    }, 240);
  }

  asanaItems.forEach((item, index) => {
    item.addEventListener("click", function() {
      asanaItems.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      updateAsana(this, index);
    });
  });

  updateAsana(asanaItems[0], 0);
});
