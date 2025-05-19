const areas = document.querySelectorAll('.area');
const dots = document.querySelectorAll('.dot');
let current = 0;

function showSlide(index) {
    areas.forEach((area, i) => {
        area.classList.toggle('active', i === index);
        dots[i].classList.toggle('active', i === index);
    });
}

document.getElementById('prevBtn').addEventListener('click', () => {
    current = (current - 1 + areas.length) % areas.length;
    showSlide(current);
});

document.getElementById('nextBtn').addEventListener('click', () => {
    current = (current + 1) % areas.length;
    showSlide(current);
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        current = index;
        showSlide(current);
    });
});

setInterval(() => {
    current = (current + 1) % areas.length;
    showSlide(current);
}, 2000);