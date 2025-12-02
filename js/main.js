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
                counter.innerText = target;
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
});
