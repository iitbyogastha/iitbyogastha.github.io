// assets/js/asanas.js
document.addEventListener("DOMContentLoaded", function() {
  const asanaItems = document.querySelectorAll(".asana-item");
  const centerDisplay = document.getElementById("asanaCenterDisplay");
  const titleEl = document.getElementById("asanaTitle");
  const descEl = document.getElementById("asanaDesc");

  if (!asanaItems.length || !centerDisplay) return;

  asanaItems.forEach(item => {
    item.addEventListener("click", function() {
      // Remove active class from all
      asanaItems.forEach(btn => btn.classList.remove("active"));
      
      // Add active class to clicked
      this.classList.add("active");

      // Get data
      const newTitle = this.getAttribute("data-title");
      const newDesc = this.getAttribute("data-desc");

      // Fade out
      centerDisplay.classList.add("fade-out");

      // Wait for fade out to complete (0.3s matches CSS transition)
      setTimeout(() => {
        titleEl.textContent = newTitle;
        descEl.textContent = newDesc;
        
        // Fade back in
        centerDisplay.classList.remove("fade-out");
      }, 300);
    });
  });
});
