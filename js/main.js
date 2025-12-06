document.addEventListener('DOMContentLoaded', function () {
    // Initialize Video.js player
    var player = videojs('brototype-video', {
        techOrder: ['youtube'],
        sources: [{
            type: 'video/youtube',
            src: 'https://www.youtube.com/watch?v=oyQu4euAwe4',
            youtube: {
                ytControls: 0,
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

                // Handle Name splitting and Name1_Last
                let lastNameInput = form.querySelector('input[name="Name1_Last"]');
                if (!lastNameInput) {
                    lastNameInput = document.createElement('input');
                    lastNameInput.type = 'hidden';
                    lastNameInput.name = 'Name1_Last';
                    form.appendChild(lastNameInput);
                }

                let fullName = name.trim();
                let firstSpaceIndex = fullName.indexOf(' ');

                if (firstSpaceIndex !== -1) {
                    // Name has a space, split it
                    let firstNameVal = fullName.substring(0, firstSpaceIndex);
                    let lastNameVal = fullName.substring(firstSpaceIndex + 1);

                    // Update the visible Input to just be the First Name
                    document.getElementById('name').value = firstNameVal;
                    lastNameInput.value = lastNameVal;
                } else {
                    lastNameInput.value = 'NULL';
                }


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

    // Video Carousel Logic
    const carouselTrack = document.getElementById('videoCarouselTrack');
    let carouselInterval;
    let carouselIndex = 0;
    let isVideoPlaying = false;
    let startCarousel = () => { };
    let stopCarousel = () => { };

    if (carouselTrack) {
        const cards = carouselTrack.querySelectorAll('.video-card');
        const cardWidth = 300;
        const gap = 20;
        const totalWidth = cardWidth + gap;
        const totalCards = cards.length;

        // Clone cards
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            carouselTrack.appendChild(clone);
        });

        function moveCarousel() {
            if (isVideoPlaying) return;

            carouselIndex++;
            carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            carouselTrack.style.transform = `translateX(-${carouselIndex * totalWidth}px)`;

            if (carouselIndex >= totalCards) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    carouselIndex = 0;
                    carouselTrack.style.transform = `translateX(0)`;
                }, 500);
            }
        }

        startCarousel = function () {
            if (carouselInterval) clearInterval(carouselInterval);
            carouselInterval = setInterval(moveCarousel, 3000);
        };

        stopCarousel = function () {
            clearInterval(carouselInterval);
        };

        // Initial start
        startCarousel();

        // Pause on hover
        carouselTrack.addEventListener('mouseenter', stopCarousel);
        carouselTrack.addEventListener('mouseleave', () => {
            if (!isVideoPlaying) startCarousel();
        });

        // Drag/Swipe Logic
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;
        let startTime = 0;

        // Touch events
        carouselTrack.addEventListener('touchstart', touchStart);
        carouselTrack.addEventListener('touchend', touchEnd);
        carouselTrack.addEventListener('touchmove', touchMove);

        // Mouse events
        carouselTrack.addEventListener('mousedown', touchStart);
        carouselTrack.addEventListener('mouseup', touchEnd);
        carouselTrack.addEventListener('mouseleave', () => {
            if (isDragging) touchEnd();
            if (!isVideoPlaying) startCarousel();
        });
        carouselTrack.addEventListener('mousemove', touchMove);

        // Disable context menu
        carouselTrack.oncontextmenu = function (event) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };

        function touchStart(index) {
            return function (event) {
                stopCarousel(); // Stop auto-scroll on interaction
                isDragging = true;
                startTime = new Date().getTime();
                startPos = getPositionX(event);
                animationID = requestAnimationFrame(animation);
                carouselTrack.style.cursor = 'grabbing';
                carouselTrack.style.transition = 'none'; // Remove transition for direct 1:1 movement
            }
        }

        function touchEnd() {
            isDragging = false;
            cancelAnimationFrame(animationID);
            carouselTrack.style.cursor = 'grab';
            carouselTrack.style.transition = 'transform 0.5s ease-in-out';

            const movedBy = currentTranslate - prevTranslate;
            const endTime = new Date().getTime();
            const timeElapsed = endTime - startTime;

            // Determine if it's a swipe or just a drag
            // Threshold for swipe: significant movement or fast flick
            if (movedBy < -50 || (movedBy < -10 && timeElapsed < 300)) {
                carouselIndex += 1;
            } else if (movedBy > 50 || (movedBy > 10 && timeElapsed < 300)) {
                carouselIndex -= 1;
            }

            // Boundary checks
            if (carouselIndex < 0) carouselIndex = 0;
            if (carouselIndex > totalCards) carouselIndex = totalCards; // Allow going to clone end

            setPositionByIndex();

            if (!isVideoPlaying) startCarousel();
        }

        function touchMove(event) {
            if (isDragging) {
                const currentPosition = getPositionX(event);
                currentTranslate = prevTranslate + currentPosition - startPos;
            }
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        function animation() {
            setSliderPosition();
            if (isDragging) requestAnimationFrame(animation);
        }

        function setSliderPosition() {
            carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
        }

        function setPositionByIndex() {
            // Update the main moveCarousel logic's index
            // We need to sync the manual drag with the auto-scroll index

            // Calculate target position
            const targetTranslate = carouselIndex * -totalWidth;
            prevTranslate = targetTranslate;
            currentTranslate = targetTranslate;

            carouselTrack.style.transform = `translateX(${targetTranslate}px)`;

            // Handle infinite loop reset if needed (similar to moveCarousel)
            if (carouselIndex >= totalCards) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    carouselIndex = 0;
                    const resetTranslate = 0;
                    prevTranslate = resetTranslate;
                    currentTranslate = resetTranslate;
                    carouselTrack.style.transform = `translateX(${resetTranslate}px)`;
                }, 500);
            }
        }

        // Update the moveCarousel function to sync with manual drag state
        // We need to override the original moveCarousel to use the shared variables if possible,
        // or just update the shared variables inside it.
        // Since moveCarousel is defined above in the same scope, we can modify it or just ensure
        // it updates `prevTranslate` and `currentTranslate`.

        // Let's redefine moveCarousel to be safe and use the shared state
        // We need to re-assign the outer moveCarousel function
        // But `moveCarousel` was defined as a function declaration, so it's hoisted but we can overwrite it if we change it to a var/let or just hook into it.
        // Actually, the simplest way is to update `prevTranslate` inside the original `moveCarousel` loop?
        // No, better to replace the logic here since we are inside the `if (carouselTrack)` block.

        // Overwriting the previous moveCarousel logic with one that respects the drag state
        carouselInterval = setInterval(() => {
            if (isVideoPlaying) return;

            carouselIndex++;
            carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            const targetTranslate = carouselIndex * -totalWidth;
            carouselTrack.style.transform = `translateX(${targetTranslate}px)`;

            // Sync drag state
            prevTranslate = targetTranslate;
            currentTranslate = targetTranslate;

            if (carouselIndex >= totalCards) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    carouselIndex = 0;
                    const resetTranslate = 0;
                    prevTranslate = resetTranslate;
                    currentTranslate = resetTranslate;
                    carouselTrack.style.transform = `translateX(${resetTranslate}px)`;
                }, 500);
            }
        }, 3000);

        // Clear the old interval started at the top
        clearInterval(carouselInterval);
        // Re-assign the startCarousel to use this new interval logic
        startCarousel = function () {
            if (carouselInterval) clearInterval(carouselInterval);
            carouselInterval = setInterval(() => {
                if (isVideoPlaying) return;

                carouselIndex++;
                carouselTrack.style.transition = 'transform 0.5s ease-in-out';
                const targetTranslate = carouselIndex * -totalWidth;
                carouselTrack.style.transform = `translateX(${targetTranslate}px)`;

                prevTranslate = targetTranslate;
                currentTranslate = targetTranslate;

                if (carouselIndex >= totalCards) {
                    setTimeout(() => {
                        carouselTrack.style.transition = 'none';
                        carouselIndex = 0;
                        const resetTranslate = 0;
                        prevTranslate = resetTranslate;
                        currentTranslate = resetTranslate;
                        carouselTrack.style.transform = `translateX(${resetTranslate}px)`;
                    }, 500);
                }
            }, 3000);
        };

        // Restart with new logic
        startCarousel();

        // Fix touchStart call
        carouselTrack.removeEventListener('touchstart', touchStart);
        carouselTrack.removeEventListener('mousedown', touchStart);
        carouselTrack.addEventListener('touchstart', touchStart(carouselIndex));
        carouselTrack.addEventListener('mousedown', touchStart(carouselIndex));
    }

    // Video.js Single Playback Logic & Carousel Control
    const playerIds = ['brototype-video', 'vid1', 'vid2', 'vid3', 'vid4'];
    playerIds.forEach(id => {
        const player = videojs(id);
        player.ready(() => {
            player.on('play', () => {
                // Stop carousel
                if (stopCarousel) {
                    isVideoPlaying = true;
                    stopCarousel();
                }

                // Pause other videos
                playerIds.forEach(otherId => {
                    if (otherId !== id) {
                        const otherPlayer = videojs(otherId);
                        if (!otherPlayer.paused()) {
                            otherPlayer.pause();
                        }
                    }
                });
            });

            const resumeCarousel = () => {
                setTimeout(() => {
                    let anyPlaying = false;
                    playerIds.forEach(pid => {
                        const p = videojs(pid);
                        if (p && !p.paused() && !p.ended()) anyPlaying = true;
                    });

                    if (!anyPlaying && startCarousel) {
                        isVideoPlaying = false;
                        startCarousel();
                    }
                }, 3000);
            };

            player.on('pause', resumeCarousel);
            player.on('ended', resumeCarousel);
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








