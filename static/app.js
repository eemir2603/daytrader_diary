// 1. İŞLEM DÜZENLEME (EDIT) FONKSİYONU
function editTrade(id, asset, direction, entry, exit, tp, sl, qty, date, notes) {
    document.getElementById('trade_id').value = id;
    document.getElementById('asset').value = asset || '';
    document.getElementById('direction').value = direction;
    document.getElementById('entryPrice').value = entry || '';
    document.getElementById('exitPrice').value = exit || '';
    document.getElementById('tp_price').value = tp || '';
    document.getElementById('sl_price').value = sl || '';
    document.getElementById('quantity').value = qty || '1';
    document.getElementById('trade_date').value = date || '';
    document.getElementById('notes').value = notes || '';

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
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Placeholder çevirileri
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
    document.getElementById('themeBtn').textContent = isDark ? '☀️ Light' : '🌙 Dark';
}

// 4. TABLO FİLTRELEME
function filterTrades(filterType, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const rows = document.querySelectorAll('#historyTable tbody tr.trade-row');
    rows.forEach(row => {
        const result = row.getAttribute('data-result'); // WIN, LOSS, BREAKEVEN, OPEN
        const direction = row.getAttribute('data-direction'); // LONG, SHORT

        if (filterType === 'ALL') {
            row.style.display = '';
        } else if (filterType === 'LONG' || filterType === 'SHORT') {
            row.style.display = (direction === filterType) ? '' : 'none';
        } else {
            row.style.display = (result === filterType) ? '' : 'none';
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
});