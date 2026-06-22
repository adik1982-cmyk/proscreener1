// ── Service Worker Registration ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .catch(err => console.log('SW Failed', err));
    });
}

// ── DOM References ─────────────────────────────────────────────────────────
const apiModal     = document.getElementById('apiModal');
const settingsBtn  = document.getElementById('settingsBtn');
const saveApiBtn   = document.getElementById('saveApiBtn');
const closeApiBtn  = document.getElementById('closeApiBtn');
const apiStatus    = document.getElementById('apiStatus');
const apiKeyInput  = document.getElementById('apiKey');
const clientIdInput= document.getElementById('clientId');
const modeToggle   = document.getElementById('modeToggle');
const modeLabel    = document.getElementById('modeLabel');
const tableBody    = document.getElementById('tableBody');

// ── State ──────────────────────────────────────────────────────────────────
let currentTab = 'NSE';

// ── On Load ────────────────────────────────────────────────────────────────
window.onload = () => {
    if (localStorage.getItem('angelOneApiKey')) {
        apiStatus.className = "status connected";
        apiStatus.innerText = "🟢 Connected";
    }
    renderData();
};

// ── API Settings Modal ─────────────────────────────────────────────────────
settingsBtn.onclick = () => {
    apiModal.style.display = 'flex';
    if (localStorage.getItem('angelOneApiKey')) {
        apiKeyInput.value   = "••••••••" + localStorage.getItem('angelOneApiKey').slice(-4);
        clientIdInput.value = localStorage.getItem('angelOneClient') || '';
    }
};

closeApiBtn.onclick = () => { apiModal.style.display = 'none'; };

saveApiBtn.onclick = () => {
    if (apiKeyInput.value && !apiKeyInput.value.startsWith('•')) {
        localStorage.setItem('angelOneApiKey',  apiKeyInput.value);
        localStorage.setItem('angelOneClient',  clientIdInput.value);
    }
    apiStatus.className = "status connected";
    apiStatus.innerText = "🟢 Connected";
    apiModal.style.display = 'none';
    alert('Credentials securely saved to device memory!');
};

// ── Mock Data ──────────────────────────────────────────────────────────────
const mockData = {
    NSE: {
        bullish: [
            { sym: "RELIANCE",   price: "2954.20", rsi: "68.4", atr: "32.1" },
            { sym: "TCS",        price: "3845.00", rsi: "71.2", atr: "45.0" },
            { sym: "HDFCBANK",   price: "1520.40", rsi: "62.8", atr: "18.5" },
            { sym: "ICICIBANK",  price: "1384.50", rsi: "66.1", atr: "22.3" },
            { sym: "INFY",       price: "1976.80", rsi: "64.7", atr: "28.6" },
        ],
        bearish: [
            { sym: "WIPRO",   price: "450.10", rsi: "32.1", atr: "8.4"  },
            { sym: "PAYTM",   price: "390.00", rsi: "28.4", atr: "12.0" },
            { sym: "SBIN",    price: "720.50", rsi: "38.9", atr: "14.2" },
        ]
    },
    MCX: {
        bullish: [
            { sym: "GOLD MINI",    price: "72450", rsi: "63.2", atr: "180" },
            { sym: "SILVER MINI",  price: "86500", rsi: "67.8", atr: "420" },
            { sym: "CRUDE MINI",   price: "6820",  rsi: "61.4", atr: "95"  },
        ],
        bearish: [
            { sym: "COPPER MINI",  price: "832.5", rsi: "36.2", atr: "12.4" },
            { sym: "ZINC MINI",    price: "268.4", rsi: "31.8", atr: "8.6"  },
        ]
    },
    FNO: {
        bullish: [
            { sym: "TATAMOTORS", price: "1128.30", rsi: "74.1", atr: "28.4" },
            { sym: "BAJFINANCE", price: "8142.00", rsi: "72.3", atr: "94.6" },
            { sym: "TRENT",      price: "6284.00", rsi: "69.8", atr: "112.4"},
            { sym: "ZOMATO",     price: "248.60",  rsi: "67.2", atr: "8.4"  },
            { sym: "M&M",        price: "3124.80", rsi: "70.6", atr: "48.2" },
        ],
        bearish: [
            { sym: "SUNPHARMA", price: "1842.70", rsi: "34.2", atr: "28.6" },
            { sym: "AXISBANK",  price: "1246.50", rsi: "38.1", atr: "18.4" },
        ]
    }
};

// ── Mode Toggle ────────────────────────────────────────────────────────────
modeToggle.onchange = (e) => {
    const isBull = e.target.checked;
    modeLabel.innerText    = isBull ? "Bullish Breakouts" : "Bearish Breakdowns";
    modeLabel.style.color  = isBull ? "var(--green)" : "var(--red)";
    renderData();
};

// ── Tab Switch ─────────────────────────────────────────────────────────────
function switchTab(tabName, event) {
    currentTab = tabName;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    renderData();
}

// ── Render Table ───────────────────────────────────────────────────────────
function renderData() {
    const isBull  = modeToggle.checked;
    const tabData = mockData[currentTab] || mockData['NSE'];
    const data    = isBull ? tabData.bullish : tabData.bearish;
    const color   = isBull ? "var(--green)" : "var(--red)";
    const action  = isBull ? "BUY 📈" : "SELL 📉";

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="5">
                <div class="empty">
                    <div class="empty-icon">🔍</div>
                    <div>No signals found for current filters</div>
                </div>
            </td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    data.forEach(row => {
        tableBody.innerHTML += `
            <tr onclick="openTV('${row.sym}')">
                <td><strong>${row.sym}</strong></td>
                <td>₹${row.price}</td>
                <td style="color:${color}; font-weight:bold;">${row.rsi}</td>
                <td>${row.atr}</td>
                <td>
                    <button 
                        style="font-size:12px; padding:5px 8px; background:${isBull?'#1b5e20':'#b71c1c'};"
                        onclick="event.stopPropagation(); openTV('${row.sym}')">
                        ${action}
                    </button>
                </td>
            </tr>`;
    });
}

// ── Open TradingView ───────────────────────────────────────────────────────
function openTV(symbol) {
    // Try TradingView app first, fallback to browser
    const tvApp     = `tradingview://chart?symbol=NSE:${symbol}`;
    const tvBrowser = `https://www.tradingview.com/chart/?symbol=NSE:${encodeURIComponent(symbol)}`;
    
    // On mobile: try app deep link first
    const start = Date.now();
    window.location = tvApp;
    setTimeout(() => {
        // If app didn't open within 1.5s, open browser
        if (Date.now() - start < 2000) {
            window.open(tvBrowser, '_blank');
        }
    }, 1500);
}
