
// Define pages array first - needed by all button handlers
const pages = Array.from(document.querySelectorAll('.book-page.page-right'));

// 🔧 FIX: normaliza z-index de todas las páginas
function resetPageZIndex() {
    pages.forEach((page, i) => {
        page.style.zIndex = 4 - i;
    });
}


const pageTurnBtn = document.querySelectorAll('.nextprev-btn');

pageTurnBtn.forEach((el) => {
    el.onclick = () => {
        const pageTurnId = el.getAttribute('data-page');
        const pageTurn = document.getElementById(pageTurnId);

        // Find correct page index in pages array
        const pageIndex = pages.findIndex(page => page.id === pageTurnId);

        if (pageTurn.classList.contains('turn')) {
            pageTurn.classList.remove('turn');

            setTimeout(() => {
                pageTurn.style.zIndex = 4 - pageIndex;
            }, 500);
        } else {
            pageTurn.classList.add('turn');

            setTimeout(() => {
                pageTurn.style.zIndex = 4 + pageIndex;
            }, 500);
        }
    };
});


// contact me button when click
const contactMeBtn = document.querySelector('.btn.contact-me');

contactMeBtn.onclick = () => {
    pages.forEach((page, index) => {
        setTimeout(() => {
            page.classList.add('turn');
            // set zIndex immediately (no need extra timeout)
            page.style.zIndex = 20 + index;
        }, (index + 1) * 200 + 100);
    });
};


// back profile button when click - close pages in reverse order
const backProfileBtn = document.querySelector('.back-profile');

backProfileBtn.onclick = () => {

    // 🔽 STEP 1: reset z-index immediately (prevents flash)
    resetPageZIndex();

    // 🔁 STEP 2: close pages from last to first with animation
    for (let i = pages.length - 1; i >= 0; i--) {
        const page = pages[i];
        const delay = (pages.length - i) * 200 + 100;

        setTimeout(() => {
            page.classList.remove('turn');
        }, delay);
    }
};



// opening animation
const coverRight = document.querySelector('.cover.cover-right');
const pageLeft = document.querySelector('.book-page.page-left');


// opening animation (cover right animation)
setTimeout(() => {
    coverRight.classList.add('turn');
}, 2100);

setTimeout(() => {
    coverRight.style.zIndex = -1;
}, 2800);

// after cover opens, unflip pages in reverse order to reveal profile
pages.slice().reverse().forEach((page, index) => {
    setTimeout(() => {
        page.classList.remove('turn');
        setTimeout(() => {
            page.style.zIndex = 10 + index;
        }, 500);
    }, (index + 1) * 200 + 2100);
});

// 🔥 FIX: reset z-index after first opening animation
setTimeout(() => {
    resetPageZIndex();
}, 2100 + pages.length * 200 + 800);
