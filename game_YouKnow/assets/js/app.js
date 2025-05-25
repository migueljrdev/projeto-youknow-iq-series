const areas = document.querySelectorAll('.area');
const dots = document.querySelectorAll('.dot');
let current = 0;
let slideInterval = null;

// Função para mostrar um slide específico
function showSlide(index) {
    areas.forEach((area, i) => {
        area.classList.toggle('active', i === index);
        dots[i].classList.toggle('active', i === index);
    });
}

// Função para iniciar o autoplay
function startAutoSlide() {
    // Garante que só existe um setInterval rodando
    if (slideInterval) clearInterval(slideInterval);

    slideInterval = setInterval(() => {
        current = (current + 1) % areas.length;
        showSlide(current);
    }, 2000);
}

// Função para pausar o autoplay temporariamente
function pauseAutoSlide(duration = 5000) {
    if (slideInterval) clearInterval(slideInterval);

    setTimeout(() => {
        startAutoSlide();
    }, duration);
}

// Botão anterior
document.getElementById('prevBtn').addEventListener('click', () => {
    current = (current - 1 + areas.length) % areas.length;
    showSlide(current);
    pauseAutoSlide();
});

// Botão próximo
document.getElementById('nextBtn').addEventListener('click', () => {
    current = (current + 1) % areas.length;
    showSlide(current);
    pauseAutoSlide();
});

// Clicando nos dots
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        current = index;
        showSlide(current);
        pauseAutoSlide();
    });
});

showSlide(current);
startAutoSlide();
