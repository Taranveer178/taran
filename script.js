// Theme (Default is light mode)
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const iconSun = document.getElementById('iconSun');
const iconMoon = document.getElementById('iconMoon');

function setTheme(mode){
  if(mode === 'dark'){
    root.classList.add('dark');
    iconSun.style.display = 'none';
    iconMoon.style.display = 'block';
  } else {
    root.classList.remove('dark');
    iconSun.style.display = 'block';
    iconMoon.style.display = 'none';
  }
  try{ localStorage.setItem('theme', mode); }catch(e){}
}

(function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem('theme'); }catch(e){}
  if(saved){
    setTheme(saved);
  } else {
    setTheme('light'); 
  }
})();

themeToggle.addEventListener('click', () => {
  setTheme(root.classList.contains('dark') ? 'light' : 'dark');
});

// Dynamic Island Mobile menu
const menuBtn = document.getElementById('menuBtn');
const mainNav = document.getElementById('mainNav');

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  mainNav.classList.toggle('expanded');
});

// Close nav on link click or outside click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => mainNav.classList.remove('expanded'));
});
document.addEventListener('click', (e) => {
  if (!mainNav.contains(e.target)) {
    mainNav.classList.remove('expanded');
  }
});

// Scroll reveal
function observeReveal(els){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}
observeReveal(document.querySelectorAll('.reveal'));

// Counter Animation (Trust Bar)
const counters = document.querySelectorAll('.counter');
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      const target = +entry.target.getAttribute('data-target');
      const hasPlus = entry.target.getAttribute('data-plus') === 'true';
      let count = 0;
      const speed = target / 60;
      
      const updateCount = () => {
        count += speed;
        if(count < target) {
          entry.target.innerText = Math.ceil(count) + (hasPlus ? '+' : '');
          requestAnimationFrame(updateCount);
        } else {
          entry.target.innerText = target + (hasPlus ? '+' : '');
        }
      };
      updateCount();
      counterIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterIO.observe(c));

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const navIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute('id');
    const link = document.querySelector('.nav-links a[href="#' + id + '"]');
    if(!link) return;
    if(entry.isIntersecting){
      navAnchors.forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
sections.forEach(s => navIO.observe(s));


// Function for mobile sliders buttons
function scrollSlider(id, direction) {
  const slider = document.getElementById(id);
  if(!slider) return;
  // Scroll by width of one card + gap
  const scrollAmount = (slider.offsetWidth * 0.90) + 16;
  slider.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
}

// Mouse drag-to-scroll logic for sliders
const sliders = document.querySelectorAll('.mobile-slider');
let isDown = false;
let startX;
let scrollLeft;

sliders.forEach(slider => {
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.style.cursor = 'grabbing';
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });
  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });
  slider.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    slider.scrollLeft = scrollLeft - walk;
  });
});

// ---------- Featured Project Infinite Slider ----------
const lmsSlider = document.getElementById('lmsSlider');
const lmsSlides = document.querySelectorAll('.fp-slide');
const lmsPrevBtn = document.getElementById('lmsPrev');
const lmsNextBtn = document.getElementById('lmsNext');
const lmsDotsContainer = document.getElementById('lmsDots');

if (lmsSlider) {
  let currentSlide = 0;
  let slideInterval;

  // Create navigation dots dynamically
  lmsSlides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('fp-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    lmsDotsContainer.appendChild(dot);
  });
  
  const dots = document.querySelectorAll('.fp-dot');

  function updateSlider() {
    lmsSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % lmsSlides.length; // Loops back to start
    updateSlider();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + lmsSlides.length) % lmsSlides.length; // Loops to end
    updateSlider();
  }

  function goToSlide(index) {
    currentSlide = index;
    updateSlider();
    resetInterval();
  }

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 4000); // Auto-advance every 4 seconds
  }

  lmsNextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
  lmsPrevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

  // Initialize Autoplay
  resetInterval();
}

// ============================================
// Infinite Mobile Slider & Dot Synchronization
// ============================================
function initInfiniteSliderDots(sliderId, dotsContainerId) {
  const slider = document.getElementById(sliderId);
  const dotsContainer = document.getElementById(dotsContainerId);
  if (!slider || !dotsContainer) return;

  // Store original children
  const originalSlides = Array.from(slider.children).filter(el => !el.hasAttribute('data-clone'));
  const totalOriginal = originalSlides.length;
  if (totalOriginal <= 1) return;

  // Build pagination dots for original items
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalOriginal; i++) {
    const dot = document.createElement('button');
    dot.classList.add('slider-dot');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');

    dot.addEventListener('click', () => {
      const slideWidth = originalSlides[0].offsetWidth + 16;
      slider.scrollTo({
        left: (totalOriginal + i) * slideWidth,
        behavior: 'smooth'
      });
    });

    dotsContainer.appendChild(dot);
  }

  // FIX: Clone slides WITH the data-clone attribute so Desktop CSS hides them!
  originalSlides.forEach(slide => {
    const clonePre = slide.cloneNode(true);
    clonePre.setAttribute('aria-hidden', 'true');
    clonePre.setAttribute('data-clone', 'true'); // <-- THIS FIXES DESKTOP EMPTY SPACE
    slider.insertBefore(clonePre, slider.firstChild);

    const clonePost = slide.cloneNode(true);
    clonePost.setAttribute('aria-hidden', 'true');
    clonePost.setAttribute('data-clone', 'true'); // <-- THIS FIXES DESKTOP EMPTY SPACE
    slider.appendChild(clonePost);
  });

  const getSlideWidth = () => originalSlides[0].offsetWidth + 16;

  const initialOffset = () => {
    if (window.innerWidth <= 768) {
      slider.scrollLeft = totalOriginal * getSlideWidth();
    } else {
      slider.scrollLeft = 0;
    }
  };

  setTimeout(initialOffset, 50);

  let isResetting = false;

  slider.addEventListener('scroll', () => {
    if (window.innerWidth > 768 || isResetting) return;

    const slideWidth = getSlideWidth();
    const currentScroll = slider.scrollLeft;
    const totalSetWidth = totalOriginal * slideWidth;

    if (currentScroll < slideWidth * 0.5) {
      isResetting = true;
      slider.scrollLeft += totalSetWidth;
      setTimeout(() => { isResetting = false; }, 50);
    } else if (currentScroll >= totalSetWidth * 2 - slideWidth * 0.5) {
      isResetting = true;
      slider.scrollLeft -= totalSetWidth;
      setTimeout(() => { isResetting = false; }, 50);
    }

    const rawIndex = Math.round(slider.scrollLeft / slideWidth);
    const activeIndex = (rawIndex % totalOriginal + totalOriginal) % totalOriginal;

    const dots = dotsContainer.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === activeIndex);
    }
  }, { passive: true });

  window.addEventListener('resize', initialOffset);
}

// Initialize on page load
initInfiniteSliderDots('servicesSlider', 'servicesDots');
initInfiniteSliderDots('skillsSlider', 'skillsDots');

// =============================
// Contact Form AJAX Handler
// =============================
const contactForm = document.getElementById('contactForm');
const formSuccessCard = document.getElementById('formSuccessCard');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevents redirecting to Formspree
    
    const submitBtn = document.getElementById('cf-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';
    }

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Hide the form and show the Google Pay animation
        contactForm.style.display = 'none';
        formSuccessCard.style.display = 'flex';
      } else {
        const data = await response.json();
        alert(data.errors ? data.errors.map(err => err.message).join(", ") : "Oops! There was a problem submitting your form.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send message';
        }
      }
    } catch (error) {
      alert("Network error. Please try again later.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send message';
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
    const chatHistory = document.getElementById("taran-chat-history");
    const chatInput = document.getElementById("taran-chat-input");
    const sendBtn = document.getElementById("taran-chat-send");
    const toggleBtn = document.getElementById("taran-chatbot-toggle");
    const closeBtn = document.getElementById("taran-chatbot-close");
    const chatWindow = document.getElementById("taran-chatbot-window");
    const trashBtn = document.querySelector(".trash-icon");
    
    // Cloudflare Worker Backend URL
    const API_URL = "https://taran-rag-backend.staranveer178.workers.dev"; 

    // ALWAYS start a fresh session on page load (No sessionStorage)
    let chatSessionId = "sess_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    let userName = null;
    chatInput.placeholder = "Enter your name...";

    // Toggle Chatbot Window
    toggleBtn.addEventListener("click", () => {
        toggleBtn.classList.add("btn-hidden");
        chatWindow.classList.remove("taran-chatbot-hidden");
        chatInput.focus();
    });
    
    closeBtn.addEventListener("click", () => {
        chatWindow.classList.add("taran-chatbot-hidden");
        toggleBtn.classList.remove("btn-hidden");
    });

    // Reset Chat (Trash Button) - Clears history AND resets the user session
    trashBtn.addEventListener("click", () => {
        userName = null;
        chatSessionId = "sess_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
        chatInput.placeholder = "Enter your name...";
        
        chatHistory.innerHTML = `
            <div class="chat-message bot">
                <img src="https://taranveer.in/img/chatbot.webp" class="chat-avatar bot-avatar" alt="Taran Avatar">
                <div class="chat-bubble bot-bubble">Hi there! Welcome to Taran's portfolio. Before we begin, may I know your name?</div>
            </div>`;
    });
    // Input Controls
    chatInput.addEventListener("input", function() {
        sendBtn.disabled = this.value.trim().length === 0;
    });

    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !sendBtn.disabled) sendMessage();
    });

    sendBtn.addEventListener("click", sendMessage);

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessageUI("user", text);
        chatInput.value = "";
        sendBtn.disabled = true;

        // ============================================================
        // STEP 1: If we don't have the user's name yet, capture it!
        // ============================================================
        if (!userName) {
            // Clean up name (capitalize first letter)
            const cleanName = text.replace(/^(my name is|i am|i'm)\s+/i, "").trim();
            userName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            sessionStorage.setItem("taran_chat_user_name", userName);

            chatInput.placeholder = `Ask anything, ${userName}...`;

            // Professional acknowledgement asking what they want to know
            const welcomeBackMsg = `Nice to meet you, ${userName}! What would you like to know about Taran's work, skills, or projects?`;

            const typingId = "typing-" + Date.now();
            const typingIndicatorHtml = '<div class="typing-dots"><span></span><span></span><span></span></div>';
            addMessageUI("bot", typingIndicatorHtml, typingId, true);

            setTimeout(() => {
                const typingElem = document.getElementById(typingId);
                if (typingElem) typingElem.textContent = welcomeBackMsg;
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }, 600);

            // Log name capture to backend/D1 in the background
            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: `[Visitor Name Provided: ${userName}]`,
                    userName: userName,
                    sessionId: chatSessionId,
                    isIntro: true
                })
            }).catch(() => {});

            return;
        }

        // ============================================================
        // STEP 2: Normal AI Query with user's name attached
        // ============================================================
        const typingId = "typing-" + Date.now();
        const typingIndicatorHtml = `
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        `;
        addMessageUI("bot", typingIndicatorHtml, typingId, true);

       try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: text,
                userName: userName,
                sessionId: chatSessionId 
            })
        });

        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        
        // --- THIS PART IS STEP 3 ---
        const typingElem = document.getElementById(typingId);
        if (typingElem) {
            typingElem.classList.remove("typing-bubble"); // 1. Removes the tiny typing bubble size
            typingElem.textContent = data.reply;          // 2. Inserts the bot's response text
        }
    } catch (error) {
        // Also do it here in case the server has an error
        const typingElem = document.getElementById(typingId);
        if (typingElem) {
            typingElem.classList.remove("typing-bubble");
            typingElem.textContent = "Under development, please wait until 6:00 PM to finish updation.";
        }
    } finally {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    }

    function addMessageUI(sender, content, textId = null, isHtml = false) {
    const isUser = sender === "user";
    const avatarUrl = isUser ? "https://taranveer.in/img/user.webp" : "https://taranveer.in/img/chatbot.webp";
    
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}-bubble${isHtml ? ' typing-bubble' : ''}`;
    if (textId) bubble.id = textId;
    
    if (isHtml) {
        bubble.innerHTML = content;
    } else {
        bubble.textContent = content;
    }

    const avatar = document.createElement("img");
    avatar.src = avatarUrl;
    avatar.className = `chat-avatar ${sender}-avatar`;
    avatar.alt = sender;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
});

