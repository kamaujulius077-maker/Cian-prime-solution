document.addEventListener("DOMContentLoaded", () => {
    let allProducts = [];

    // Fetch catalog products from Flask backend
    fetchProducts();

    // Setup Contact form submit event
    const contactForm = document.getElementById("quote-form");
    if (contactForm) {
        contactForm.addEventListener("submit", handleFormSubmit);
    }

    // Setup Filter button events
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
             const category = e.target.getAttribute("data-category");
            renderProducts(category);
        });
    });
});

async function fetchProducts() {
    try {
        const response = await fetch("/api/products");
        const data = await response.json();
        
        if (data.status === "success") {
            allProducts = data.data;
            renderProducts("all");
        }
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

function renderProducts(filterCategory) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    const filtered = filterCategory === "all" 
        ? allProducts 
        : allProducts.filter(p => p.category === filterCategory);

    if (filtered.length === 0) {
        grid.innerHTML = "<p>No products found in this category.</p>";
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div>
                <span class="product-badge">${product.badge}</span>
                <h3>${product.name}</h3>
                <p>${product.desc}</p>
            </div>
            <div class="product-footer">
                <span class="product-price">$${product.price.toFixed(2)}</span>
                <a href="#contact" class="btn btn-secondary" style="color:var(--dark); border-color:var(--border);">Inquire</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const responseEl = document.getElementById("form-response");
    const payload = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        service: document.getElementById("service").value,
        message: document.getElementById("message").value
    };

    try {
        const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            responseEl.className = "form-response success";
            responseEl.textContent = data.message;
            document.getElementById("quote-form").reset();
        }
    } catch (err) {
        console.error("Failed to submit quote request:", err);
    }
}