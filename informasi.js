// Navigasi scroll dan highlight tab aktif
document.querySelectorAll('.info-tabs a').forEach(tab => {
  tab.addEventListener('click', function (e) {
    e.preventDefault();

    // Hapus kelas 'active' dari semua tab
    document.querySelectorAll('.info-tabs a').forEach(t => t.classList.remove('active'));

    // Tambahkan ke tab yang diklik
    this.classList.add('active');

    // Scroll ke target id dengan smooth
    const targetId = this.getAttribute('href');
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
