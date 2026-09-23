
// Theme Configuration
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

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => mainNav.classList.remove('expanded'));
});
document.addEventListener('click', (e) => {
  if (!mainNav.contains(e.target)) {
    mainNav.classList.remove('expanded');
  }
});

// Scroll Reveal
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

// Trust Bar Counters
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

// Generic Slider Function for Featured Projects
function initializeProjectSlider(sliderId, prevBtnId, nextBtnId, dotsContainerId) {
  const sliderTrack = document.getElementById(sliderId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);
  const dotsContainer = document.getElementById(dotsContainerId);

  if (!sliderTrack || !prevBtn || !nextBtn || !dotsContainer) return;

  const slides = sliderTrack.querySelectorAll('.fp-slide');
  let currentSlide = 0;
  let slideInterval;

  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('fp-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  const dots = dotsContainer.querySelectorAll('.fp-dot');

  function updateSlider() {
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
  }

  function goToSlide(index) {
    currentSlide = index;
    updateSlider();
    resetInterval();
  }

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 4000); 
  }

  nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
  prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

  resetInterval();
}

// Init sliders for the 3 distinct projects
initializeProjectSlider('lmsSlider', 'lmsPrev', 'lmsNext', 'lmsDots');
// For Project 1 (RAG Bot)
initializeProjectSlider(
  document.querySelector('.slider-1-track').id = 'ragSliderTrack',
  document.querySelector('.btn-slider-1.prev').id = 'ragSliderPrev',
  document.querySelector('.btn-slider-1.next').id = 'ragSliderNext',
  document.querySelector('.dots-1').id = 'ragSliderDots'
);
// For Project 3 (RoomSplit)
initializeProjectSlider(
  document.querySelector('.slider-3-track').id = 'roomSliderTrack',
  document.querySelector('.btn-slider-3.prev').id = 'roomSliderPrev',
  document.querySelector('.btn-slider-3.next').id = 'roomSliderNext',
  document.querySelector('.dots-3').id = 'roomSliderDots'
);

// Mobile Infinite Slider Engine (Skills & Competencies)
function initInfiniteSliderDots(sliderId, dotsContainerId) {
  const slider = document.getElementById(sliderId);
  const dotsContainer = document.getElementById(dotsContainerId);
  if (!slider || !dotsContainer) return;

  const originalSlides = Array.from(slider.children).filter(el => !el.hasAttribute('data-clone'));
  const totalOriginal = originalSlides.length;
  if (totalOriginal <= 1) return;

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

  originalSlides.forEach(slide => {
    const clonePre = slide.cloneNode(true);
    clonePre.setAttribute('aria-hidden', 'true');
    clonePre.setAttribute('data-clone', 'true'); 
    slider.insertBefore(clonePre, slider.firstChild);

    const clonePost = slide.cloneNode(true);
    clonePost.setAttribute('aria-hidden', 'true');
    clonePost.setAttribute('data-clone', 'true');
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

initInfiniteSliderDots('servicesSlider', 'servicesDots');
initInfiniteSliderDots('skillsSlider', 'skillsDots');

// =============================
// Contact Form AJAX Handler (Google Pay Animation)
// =============================
const contactForm = document.getElementById('contactForm');
const formSuccessCard = document.getElementById('formSuccessCard');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
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
        contactForm.style.display = 'none';
        formSuccessCard.style.display = 'flex';
      } else {
        const data = await response.json();
        alert(data.errors ? data.errors.map(err => err.message).join(", ") : "Oops! There was a problem submitting your form.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Transmit Message</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
        }
      }
    } catch (error) {
      alert("Network error. Please try again later.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Transmit Message</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
      }
    }
  });
}

// =============================
// Chatbot Client Logic
// =============================
document.addEventListener("DOMContentLoaded", function() {
  const chatHistory = document.getElementById("taran-chat-history");
  const chatInput = document.getElementById("taran-chat-input");
  const sendBtn = document.getElementById("taran-chat-send");
  const toggleBtn = document.getElementById("taran-chatbot-toggle");
  const closeBtn = document.getElementById("taran-chatbot-close");
  const chatWindow = document.getElementById("taran-chatbot-window");
  const trashBtn = document.querySelector(".trash-icon");
  
  const API_URL = "https://taran-rag-backend.staranveer178.workers.dev"; 

  let chatSessionId = "sess_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
  let userName = null;
  chatInput.placeholder = "Enter your name...";

  toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.add("btn-hidden");
    chatWindow.classList.remove("taran-chatbot-hidden");
    chatInput.focus();
  });
  
  closeBtn.addEventListener("click", () => {
    chatWindow.classList.add("taran-chatbot-hidden");
    toggleBtn.classList.remove("btn-hidden");
  });

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

    if (!userName) {
      const cleanName = text.replace(/^(my name is|i am|i'm)\s+/i, "").trim();
      userName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      sessionStorage.setItem("taran_chat_user_name", userName);

      chatInput.placeholder = `Ask anything, ${userName}...`;

      const welcomeBackMsg = `Nice to meet you, ${userName}! What would you like to know about Taran's work, skills, or projects?`;

      const typingId = "typing-" + Date.now();
      const typingIndicatorHtml = '<div class="typing-dots"><span></span><span></span><span></span></div>';
      addMessageUI("bot", typingIndicatorHtml, typingId, true);

      setTimeout(() => {
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.textContent = welcomeBackMsg;
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }, 600);

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
      
      const typingElem = document.getElementById(typingId);
      if (typingElem) {
        typingElem.classList.remove("typing-bubble"); 
        typingElem.textContent = data.reply;          
      }
    } catch (error) {
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



// =============================
// Chatbot Client Logic (Snapchat Bitmoji Feature)
// =============================
document.addEventListener("DOMContentLoaded", function() {
  const chatHistory = document.getElementById("taran-chat-history");
  const chatInput = document.getElementById("taran-chat-input");
  const sendBtn = document.getElementById("taran-chat-send");
  const toggleBtn = document.getElementById("taran-chatbot-toggle");
  const closeBtn = document.getElementById("chat-close-btn");
  const resetBtn = document.getElementById("chat-reset-btn");
  const chatWindow = document.getElementById("taran-chatbot-window");
  const bitmojiIndicator = document.getElementById("bitmoji-indicator");
  
  const API_URL = "https://taran-rag-backend.staranveer178.workers.dev"; 

  let chatSessionId = "sess_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
  let userName = null;

  // Open/Close logic
  toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.add("chat-hidden");
    chatWindow.classList.remove("chat-hidden");
    chatInput.focus();
  });
  
  closeBtn.addEventListener("click", () => {
    chatWindow.classList.add("chat-hidden");
    toggleBtn.classList.remove("chat-hidden");
  });

  // Reset logic
  resetBtn.addEventListener("click", () => {
    userName = null;
    chatSessionId = "sess_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    chatInput.placeholder = "Type your name...";
    chatHistory.innerHTML = `
      <div class="msg-wrapper bot">
        <div class="msg-bubble">Hello! I'm Taran's AI assistant. To personalize our chat, could you tell me your name?</div>
      </div>`;
  });

  chatInput.addEventListener("input", function() {
    sendBtn.disabled = this.value.trim().length === 0;
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !sendBtn.disabled) sendMessage();
  });

  sendBtn.addEventListener("click", sendMessage);

  // Trigger Snapchat Animation
  function showBitmojiTyping() {
    bitmojiIndicator.classList.add("is-typing");
    // Scroll chat down slightly so the bitmoji doesn't cover the last message
    setTimeout(() => {
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 50);
  }

  function hideBitmojiTyping() {
    bitmojiIndicator.classList.remove("is-typing");
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Show User Message
    addMessageUI("user", text);
    chatInput.value = "";
    sendBtn.disabled = true;

    // STEP 1: Name Capture
    if (!userName) {
      const cleanName = text.replace(/^(my name is|i am|i'm)\s+/i, "").trim();
      userName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      
      chatInput.placeholder = `Ask anything, ${userName}...`;
      const welcomeBackMsg = `Nice to meet you, ${userName}! What would you like to know about Taran's work, skills, or projects?`;

      showBitmojiTyping();

      setTimeout(() => {
        hideBitmojiTyping();
        setTimeout(() => {
          addMessageUI("bot", welcomeBackMsg);
        }, 200); // Small delay to let the bitmoji drop before message appears
      }, 1000);

      // Background tracking call
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

    // STEP 2: Normal Query
    showBitmojiTyping();

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
      
      hideBitmojiTyping();
      setTimeout(() => {
        addMessageUI("bot", data.reply);
      }, 300);
      
    } catch (error) {
      hideBitmojiTyping();
      setTimeout(() => {
        addMessageUI("bot", "Under development, please wait until 6:00 PM to finish updating.");
      }, 300);
    }
  }

  function addMessageUI(sender, content) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = `msg-wrapper ${sender}`;
    
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = content;

    wrapperDiv.appendChild(bubble);
    chatHistory.appendChild(wrapperDiv);
    
    // Auto-scroll logic
    setTimeout(() => {
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 50);
  }
});