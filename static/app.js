// 1. İŞLEM DÜZENLEME (EDIT) FONKSİYONU
function editTrade(btn) {
    const id = btn.getAttribute('data-id');
    document.getElementById('trade_id').value = id;
    document.getElementById('asset').value = btn.getAttribute('data-asset') || '';
    document.getElementById('direction').value = btn.getAttribute('data-direction') || 'LONG';
    document.getElementById('entryPrice').value = btn.getAttribute('data-entry') || '';
    document.getElementById('exitPrice').value = btn.getAttribute('data-exit') || '';
    document.getElementById('tp_price').value = btn.getAttribute('data-tp') || '';
    document.getElementById('sl_price').value = btn.getAttribute('data-sl') || '';
    document.getElementById('quantity').value = btn.getAttribute('data-qty') || '1';
    document.getElementById('trade_date').value = btn.getAttribute('data-date') || '';
    document.getElementById('notes').value = btn.getAttribute('data-notes') || '';

    let form = document.getElementById('tradeForm');
    form.action = "/update_trade/" + id;

    let submitBtn = form.querySelector('button[type="submit"]');
    const currentLang = localStorage.getItem('lang') || 'tr';
    submitBtn.textContent = currentLang === 'en' ? "Update Trade" : "İşlemi Güncelle";
    submitBtn.setAttribute('data-i18n', 'btn_update');
    submitBtn.style.backgroundColor = "#ffc107";
    submitBtn.style.color = "black";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. DİL SÖZLÜĞÜ (TR / EN)
const translations = {
    tr: {
        title: "İşlem Günlüğü",
        stat_pnl: "Toplam PnL",
        stat_winrate: "Kazanma Oranı",
        stat_total: "Toplam İşlem",
        chart_title: "PnL Performans Grafiği (Equity Curve)",
        form_title: "Yeni İşlem Kaydı",
        lbl_asset: "Varlık (Sembol)",
        lbl_direction: "Yön",
        lbl_entry: "Giriş Fiyatı",
        lbl_exit: "Çıkış Fiyatı",
        lbl_tp: "Take Profit (TP)",
        lbl_sl: "Stop Loss (SL)",
        lbl_qty: "Miktar",
        lbl_date: "Tarih",
        lbl_notes: "Strateji & Psikoloji Notları",
        btn_save: "İşlemi Kaydet",
        btn_update: "İşlemi Güncelle",
        history_title: "Geçmiş İşlemler",
        filter_all: "Tümü",
        filter_win: "Kazananlar",
        filter_loss: "Kaybedenler",
        filter_open: "Açık İşlemler",
        th_date: "Tarih",
        th_asset: "Varlık",
        th_dir: "Yön",
        th_entry: "Giriş",
        th_exit: "Çıkış",
        th_pnl: "PnL",
        th_notes: "Notlar",
        th_action: "İşlem",
        btn_edit: "Düzenle",
        btn_delete: "Sil",
        status_open: "Açık",
        empty_table: "Henüz işlem kaydı bulunmuyor."
    },
    en: {
        title: "DayTrader Diary",
        stat_pnl: "Total PnL",
        stat_winrate: "Win Rate",
        stat_total: "Total Trades",
        chart_title: "PnL Performance Chart (Equity Curve)",
        form_title: "New Trade Entry",
        lbl_asset: "Asset (Symbol)",
        lbl_direction: "Direction",
        lbl_entry: "Entry Price",
        lbl_exit: "Exit Price",
        lbl_tp: "Take Profit (TP)",
        lbl_sl: "Stop Loss (SL)",
        lbl_qty: "Quantity",
        lbl_date: "Date",
        lbl_notes: "Strategy & Psychology Notes",
        btn_save: "Save Trade",
        btn_update: "Update Trade",
        history_title: "Trade History",
        filter_all: "All",
        filter_win: "Winners",
        filter_loss: "Losers",
        filter_open: "Open Trades",
        th_date: "Date",
        th_asset: "Asset",
        th_dir: "Direction",
        th_entry: "Entry",
        th_exit: "Exit",
        th_pnl: "PnL",
        th_notes: "Notes",
        th_action: "Action",
        btn_edit: "Edit",
        btn_delete: "Delete",
        status_open: "Open",
        empty_table: "No trade records found yet."
    }
};

function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    const assetInput = document.getElementById('asset');
    const notesInput = document.getElementById('notes');
    if (assetInput) assetInput.placeholder = lang === 'en' ? "e.g. AAPL, BTC" : "Örn: AAPL, BTC";
    if (notesInput) notesInput.placeholder = lang === 'en' ? "Reason for entry, pattern used, or emotional state..." : "İşleme girme sebebin, kullandığın formasyon veya duygu durumun...";
}

// 3. DARK / LIGHT MODE GEÇİŞİ
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
    renderPnLChart();
}

// 4. TABLO FİLTRELEME
function filterTrades(filterType, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const rows = document.querySelectorAll('#historyTable tbody tr.trade-row');
    rows.forEach(row => {
        const result = row.getAttribute('data-result');
        const direction = row.getAttribute('data-direction');

        if (filterType === 'ALL') {
            row.style.display = '';
        } else if (filterType === 'LONG' || filterType === 'SHORT') {
            row.style.display = (direction === filterType) ? '' : 'none';
        } else {
            row.style.display = (result === filterType) ? '' : 'none';
        }
    });
}

// 5. PNL PERFORMANS GRAFİĞİ (CHART.JS)
let pnlChartInstance = null;

function renderPnLChart() {
    const ctx = document.getElementById('pnlChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const rows = Array.from(document.querySelectorAll('#historyTable tbody tr.trade-row')).reverse();
    
    const labels = [];
    const dataPoints = [];
    let cumulativePnL = 0;

    rows.forEach(row => {
        const date = row.cells[0].textContent.trim();
        const asset = row.cells[1].textContent.trim();
        const pnlText = row.cells[5].textContent.trim();

        if (pnlText.includes('$')) {
            const pnlValue = parseFloat(pnlText.replace('$', ''));
            if (!isNaN(pnlValue)) {
                cumulativePnL += pnlValue;
                labels.push(`${date} (${asset})`);
                dataPoints.push(cumulativePnL);
            }
        }
    });

    if (labels.length === 0) {
        labels.push('Start');
        dataPoints.push(0);
    }

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#94a3b8' : '#4b5563';
    const gridColor = isDark ? '#334155' : '#e5e7eb';
    const lineColor = cumulativePnL >= 0 ? '#10b981' : '#ef4444';

    if (pnlChartInstance) {
        pnlChartInstance.destroy();
    }

    pnlChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'PnL ($)',
                data: dataPoints,
                borderColor: lineColor,
                backgroundColor: cumulativePnL >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderWidth: 3,
                pointBackgroundColor: lineColor,
                pointRadius: 4,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                y: {
                    ticks: {
                        color: textColor,
                        callback: function(value) { return '$' + value; }
                    },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

// SAYFA YÜKLENDİĞİNDE KAYITLI AYARLARI UYGULA
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) themeBtn.textContent = '☀️ Light';
    }

    const savedLang = localStorage.getItem('lang') || 'tr';
    const langSelect = document.getElementById('langSelect');
    if (langSelect) langSelect.value = savedLang;
    setLanguage(savedLang);
    renderPnLChart();
});