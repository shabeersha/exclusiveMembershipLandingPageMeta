document.addEventListener('DOMContentLoaded', function () {
    // Initialize Video.js player
    var player = videojs('brototype-video', {
        techOrder: ['youtube'],
        sources: [{
            type: 'video/youtube',
            src: 'https://www.youtube.com/watch?v=oyQu4euAwe4',
            youtube: {
                ytControls: 2,
                customVars: {
                    wmode: 'transparent',
                    rel: 0,
                    modestbranding: 1,
                    showinfo: 0,
                    iv_load_policy: 3,
                    controls: 0
                }
            }
        }],
        fluid: true,
        autoplay: true,
        controls: true
    });

    // Initialize intl-tel-input
    const phoneInput = document.querySelector("#international_PhoneNumber");
    let iti;
    if (phoneInput) {
        iti = window.intlTelInput(phoneInput, {
            initialCountry: "in",
            separateDialCode: true,
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        });
    }
    // Form Submission Handler
    const form = document.getElementById('leadForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            console.log("Form submitted", e);
            e.preventDefault();

            // Basic validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('international_PhoneNumber').value;
            const status = document.getElementById('current-status').value;



            // Phone Validation
            if (iti && !iti.isValidNumber()) {
                alert("Please enter a valid phone number.");
                return;
            }

            if (name && email && phone && status) {
                // Simulate successful submission
                const btn = form.querySelector('.btn-submit');

                btn.innerHTML = 'Submitting...';
                btn.disabled = true;

                // Add missing fields required by Zoho
                if (iti) {
                    const countryData = iti.getSelectedCountryData();
                    const dialCode = "+" + countryData.dialCode;

                    // Create or update hidden input for country code
                    let countryCodeInput = form.querySelector('input[name="PhoneNumber_countrycodeval"]');
                    if (!countryCodeInput) {
                        countryCodeInput = document.createElement('input');
                        countryCodeInput.type = 'hidden';
                        countryCodeInput.name = 'PhoneNumber_countrycodeval';
                        form.appendChild(countryCodeInput);
                    }
                    countryCodeInput.value = dialCode;
                }

                // Handle Name1_Last as requested (create hidden input)
                let lastNameInput = form.querySelector('input[name="Name1_Last"]');
                if (!lastNameInput) {
                    lastNameInput = document.createElement('input');
                    lastNameInput.type = 'hidden';
                    lastNameInput.name = 'Name1_Last';
                    form.appendChild(lastNameInput);
                }
                lastNameInput.value = 'NULL';


                // Submit the form programmatically
                form.submit();
            }
        });
    }

    // Number Counter Animation
    const counters = document.querySelectorAll('.counter-value');
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            // Calculate increment to ensure it finishes in a reasonable time
            // e.g., 2 seconds (2000ms) / 20ms per frame = 100 frames
            const increment = target / 50;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 30);
            } else {
                const suffix = counter.getAttribute('data-suffix') || '';
                counter.innerText = target + suffix;
            }
        };
        updateCount();
    });

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');

            // Close all other items
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Video.js Single Playback Logic
    const playerIds = ['brototype-video', 'vid1', 'vid2', 'vid3', 'vid4'];
    playerIds.forEach(id => {
        const player = videojs(id);
        player.ready(() => {
            player.on('play', () => {
                playerIds.forEach(otherId => {
                    if (otherId !== id) {
                        const otherPlayer = videojs(otherId);
                        if (!otherPlayer.paused()) {
                            otherPlayer.pause();
                        }
                    }
                });
            });
        });
    });
    // UTM Parameter Tracking
    function getQueryParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    }

    function populateHiddenFields() {
        const params = getQueryParams();
        const utmFields = [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
            'utm_content', 'utm_id', 'utm_adgroup', 'utm_matchtype',
            'utm_audience', 'utm_adgroupid', 'utm_network', 'utm_placement'
        ];

        utmFields.forEach(field => {
            if (params[field]) {
                const input = document.querySelector(`input[name="${field}"]`);
                if (input) {
                    input.value = params[field];
                }
            }
        });
    }

    populateHiddenFields();
});


//Highlights and perks 
const list = document.getElementById("exclusive-scrollList");
let items = list.querySelectorAll("li");
const originalItemCount = items.length;
const itemHeight = items[0].offsetHeight;

// Clone for seamless loop - add clones at both ends
const firstClone = items[0].cloneNode(true);
const lastClone = items[items.length - 1].cloneNode(true);
list.appendChild(firstClone);
list.insertBefore(lastClone, items[0]);

// Update items list after cloning
items = list.querySelectorAll("li");
const totalItems = items.length;

let currentIndex = 1; // Start at first real item (after the last clone)
let autoScroll;
let isUserInteracting = false;
let userInteractionTimer;
let isTransitioning = false;
const scroller = document.querySelector(".exclusive-scroller");

// Set initial position
list.style.transform = `translateY(-${(currentIndex - 1) * itemHeight}px)`;

function updateActiveItem() {
    items.forEach((item, index) => {
        item.classList.remove("active");
        // Show active state for the actual content, not clones
        let actualIndex = currentIndex;
        if (currentIndex === 0) actualIndex = originalItemCount;
        if (currentIndex === totalItems - 1) actualIndex = 1;

        if (index === actualIndex) item.classList.add("active");
    });
}

function scrollUp() {
    if (!items.length || !items[0].offsetHeight || isTransitioning) {
        return;
    }

    isTransitioning = true;
    currentIndex++;

    list.style.transition = "transform 0.7s ease-in-out";
    list.style.transform = `translateY(-${(currentIndex - 1) * itemHeight}px)`;

    // Handle infinite loop - when we reach the cloned first item
    if (currentIndex === totalItems - 1) {
        setTimeout(() => {
            list.style.transition = "none";
            currentIndex = 1; // Jump back to real first item
            list.style.transform = `translateY(-${(currentIndex - 1) * itemHeight}px)`;
            isTransitioning = false;
            updateActiveItem();
        }, 700); // Match transition duration
    } else {
        setTimeout(() => {
            isTransitioning = false;
            updateActiveItem();
        }, 700);
    }

    updateActiveItem();
}

function scrollDown() {
    if (!items.length || !items[0].offsetHeight || isTransitioning) {
        return;
    }

    isTransitioning = true;
    currentIndex--;

    list.style.transition = "transform 0.7s ease-in-out";
    list.style.transform = `translateY(-${(currentIndex - 1) * itemHeight}px)`;

    // Handle infinite loop - when we reach the cloned last item
    if (currentIndex === 0) {
        setTimeout(() => {
            list.style.transition = "none";
            currentIndex = originalItemCount; // Jump to real last item
            list.style.transform = `translateY(-${(currentIndex - 1) * itemHeight}px)`;
            isTransitioning = false;
            updateActiveItem();
        }, 700); // Match transition duration
    } else {
        setTimeout(() => {
            isTransitioning = false;
            updateActiveItem();
        }, 700);
    }

    updateActiveItem();
}

function pauseScroll() {
    clearInterval(autoScroll);
}

function resumeScroll() {
    if (!isUserInteracting && !isHovered) {
        clearInterval(autoScroll);
        scrollUp(); // Immediate scroll to avoid long wait
        autoScroll = setInterval(scrollUp, 2000);
    }
}

function resetScroller() {
    items = list.querySelectorAll("li");
    currentIndex = 1;
    list.style.transition = "none";
    list.style.transform = `translateY(-${(currentIndex - 1) * itemHeight}px)`;
    updateActiveItem();
    resumeScroll();
}

function handleUserInteraction() {
    isUserInteracting = true;
    pauseScroll();

    // Clear existing timer
    clearTimeout(userInteractionTimer);

    // Resume auto-scroll after 3 seconds of no interaction
    userInteractionTimer = setTimeout(() => {
        isUserInteracting = false;
        resumeScroll();
    }, 3000);
}

// Touch/Mouse events for manual scrolling
let startY = 0;
let isDragging = false;
let startTransform = 0;
let isHovered = false;

function handleStart(e) {
    if (isTransitioning) return;

    isDragging = true;
    startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    startTransform = currentIndex;
    handleUserInteraction();
    list.style.transition = "none";
}

function handleMove(e) {
    if (!isDragging || isTransitioning) return;

    e.preventDefault();
    const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - currentY;
    const moveRatio = deltaY / itemHeight;

    const newIndex = startTransform + moveRatio;
    list.style.transform = `translateY(-${(newIndex - 1) * itemHeight}px)`;
}

function handleEnd(e) {
    if (!isDragging || isTransitioning) return;

    isDragging = false;
    const currentY = e.type.includes('touch') ?
        (e.changedTouches ? e.changedTouches[0].clientY : startY) : e.clientY;
    const deltaY = startY - currentY;
    const threshold = itemHeight / 3;

    if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
            // Scroll up
            scrollUp();
        } else {
            // Scroll down
            scrollDown();
        }
    } else {
        // Snap back to current position
        list.style.transition = "transform 0.3s ease-out";
        list.style.transform = `translateY(-${(currentIndex - 1) * itemHeight}px)`;
    }

    handleUserInteraction();
}

// hover events - pause on enter, resume on leave
scroller.addEventListener("mouseenter", () => {
    isHovered = true;
    pauseScroll();
});

scroller.addEventListener("mouseleave", () => {
    isHovered = false;
    if (!isDragging && !isUserInteracting) {
        resumeScroll();
    }
});

// Manual scrolling event listeners
scroller.addEventListener("mousedown", handleStart);
scroller.addEventListener("mousemove", handleMove);
scroller.addEventListener("mouseup", handleEnd);

scroller.addEventListener("touchstart", handleStart, { passive: false });
scroller.addEventListener("touchmove", handleMove, { passive: false });
scroller.addEventListener("touchend", handleEnd);

// Wheel scrolling
scroller.addEventListener("wheel", (e) => {
    e.preventDefault();
    handleUserInteraction();

    if (e.deltaY > 0) {
        scrollUp();
    } else {
        scrollDown();
    }
}, { passive: false });

// Visibility change handler
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pauseScroll();
    } else {
        setTimeout(() => {
            if (!isUserInteracting) {
                resetScroller();
            }
        }, 500);
    }
});

// Start auto-scroll
autoScroll = setInterval(scrollUp, 2000);
updateActiveItem();

//Highlights and perks end
