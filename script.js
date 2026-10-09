// Configuration
const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/sanfai-leat/cashapp/main/products.json";

// State
let products = {};
let order = {};
let transactionCounter = 1;

// Load products on startup
async function loadProducts() {
  try {
    const response = await fetch(GITHUB_RAW_URL);
    if (!response.ok) throw new Error("Errore nel caricamento del file");
    products = await response.json();
    renderInterface();
  } catch (error) {
    console.error("Errore nel caricamento prodotti:", error);
    document.getElementById("content").innerHTML =
      '<div class="loading" style="color: red;">❌ Errore nel caricamento prodotti</div>';
  }
}

// Render the entire interface
function renderInterface() {
  const content = document.getElementById("content");
  content.innerHTML = `
        <div class="left-column">
            <div class="section">
                <h2>🍔 foods</h2>
                <div class="buttons-grid" id="foods-buttons"></div>
            </div>

            <div class="section">
                <h2>🍹 drinks</h2>
                <div class="buttons-grid" id="drinks-buttons"></div>
            </div>
        </div>

        <div class="right-column">
            <div class="section">
                <h2>📋 Order</h2>
                <div class="display-box" id="order-display">
                    <p style="color: #999; text-align: center;">Nessun articolo</p>
                </div>
            </div>

            <div class="section">
                <div class="input-group">
                    <label for="amount-paid">Paid (€)</label>
                    <input type="number" id="amount-paid" placeholder="0.00" step="0.01" min="0">
                </div>
            </div>

            <div class="section">
                <div class="input-group">
                    <label for="change-display">Change (€)</label>
                    <div class="output-display" id="change-display">0.00</div>
                </div>
            </div>

            <div class="section">
                <div class="action-buttons">
                    <button class="btn-cancel" onclick="cancelOrder()">CANCEL</button>
                    <button class="btn-print" onclick="printTransaction()">PRINT</button>
                </div>
            </div>
        </div>
    `;

  // Render product buttons
  renderProductButtons();

  // Add event listener for amount paid
  document
    .getElementById("amount-paid")
    .addEventListener("input", updateChange);
}

// Render product buttons
function renderProductButtons() {
  const foodsContainer = document.getElementById("foods-buttons");
  const drinksContainer = document.getElementById("drinks-buttons");

  if (products.foods) {
    products.foods.forEach((item) => {
      const btn = document.createElement("button");
      btn.textContent = `${item.name}\n€${item.price.toFixed(2)}`;
      btn.onclick = () => addProduct(item.name, item.price);
      foodsContainer.appendChild(btn);
    });
  }

  if (products.drinks) {
    products.drinks.forEach((item) => {
      const btn = document.createElement("button");
      btn.textContent = `${item.name}\n€${item.price.toFixed(2)}`;
      btn.onclick = () => addProduct(item.name, item.price);
      drinksContainer.appendChild(btn);
    });
  }
}

// Add product to order
function addProduct(name, price) {
  if (!order[name]) {
    order[name] = { price, quantity: 0 };
  }
  order[name].quantity++;
  updateDisplay();
}

// Update order display
function updateDisplay() {
  const display = document.getElementById("order-display");
  const items = Object.entries(order);

  if (items.length === 0) {
    display.innerHTML =
      '<p style="color: #999; text-align: center;">Nessun articolo</p>';
    return;
  }

  let html = "";
  let total = 0;

  items.forEach(([name, data]) => {
    const itemTotal = data.price * data.quantity;
    total += itemTotal;
    html += `
            <div class="order-item">
                <span class="item-name">${name}</span>
                <span class="item-qty">x${data.quantity}</span>
                <span class="item-total">€${itemTotal.toFixed(2)}</span>
            </div>
        `;
  });

  html += `<div class="total-section">Totale: €${total.toFixed(2)}</div>`;
  display.innerHTML = html;

  updateChange();
}

// Update change display
function updateChange() {
  const amountPaid =
    parseFloat(document.getElementById("amount-paid").value) || 0;
  const total = calculateTotal();
  const change = Math.max(0, amountPaid - total);
  document.getElementById("change-display").textContent =
    `€${change.toFixed(2)}`;
}

// Calculate total
function calculateTotal() {
  return Object.values(order).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
}

// Cancel order
function cancelOrder() {
  const total = calculateTotal();
  if (total > 0) {
    logTransaction();
  }
  order = {};
  document.getElementById("amount-paid").value = "";
  updateDisplay();
}

// Log transaction to console
function logTransaction() {
  const transactionId = transactionCounter++;
  const timestamp = new Date().toLocaleString("it-IT");
  const total = calculateTotal();
  const amountPaid =
    parseFloat(document.getElementById("amount-paid").value) || 0;
  const change = Math.max(0, amountPaid - total);

  const logData = {
    "Transaction ID": transactionId,
    Timestamp: timestamp,
    Items: Object.entries(order).map(
      ([name, data]) =>
        `${name} x${data.quantity} = €${(data.price * data.quantity).toFixed(2)}`,
    ),
    Total: `€${total.toFixed(2)}`,
    "Amount Paid": `€${amountPaid.toFixed(2)}`,
    Change: `€${change.toFixed(2)}`,
  };

  console.log("═════════════════════════════════════════");
  console.log(`Transaction #${transactionId} - ${timestamp}`);
  console.log("─────────────────────────────────────────");
  Object.entries(logData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      console.log(`${key}:`);
      value.forEach((item) => console.log(`  ${item}`));
    } else {
      console.log(`${key}: ${value}`);
    }
  });
  console.log("═════════════════════════════════════════");
}

// Print transaction
function printTransaction() {
  const total = calculateTotal();
  if (total === 0) {
    alert("Empty order!");
    return;
  }
  logTransaction();
  alert("Order done! Check transaction logs");
}

// Initialize
loadProducts();
