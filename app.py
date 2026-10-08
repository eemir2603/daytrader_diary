from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

DATABASE = "trades.db"


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset TEXT NOT NULL,
            direction TEXT NOT NULL,
            entry_price REAL NOT NULL,
            exit_price REAL,
            quantity REAL NOT NULL DEFAULT 1,
            tp_price REAL,
            sl_price REAL,
            trade_date TEXT NOT NULL,
            notes TEXT,
            image_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


def calculate_pnl(trade):
    if trade["exit_price"] is None:
        return None

    if trade["direction"] == "LONG":
        return (trade["exit_price"] - trade["entry_price"]) * trade["quantity"]

    return (trade["entry_price"] - trade["exit_price"]) * trade["quantity"]


@app.route("/")
def index():
    conn = get_db_connection()

    rows = conn.execute("""
        SELECT *
        FROM trades
        ORDER BY trade_date DESC, id DESC
    """).fetchall()

    conn.close()

    trades = []

    total_pnl = 0
    wins = 0
    closed_trades = 0

    for row in rows:
        trade = dict(row)

        pnl = calculate_pnl(row)

        trade["pnl"] = pnl

        if pnl is not None:
            total_pnl += pnl
            closed_trades += 1

            if pnl > 0:
                wins += 1
                trade["result"] = "WIN"
            elif pnl < 0:
                trade["result"] = "LOSS"
            else:
                trade["result"] = "BREAKEVEN"
        else:
            trade["result"] = "OPEN"

        trades.append(trade)

    if closed_trades > 0:
        win_rate = (wins / closed_trades) * 100
    else:
        win_rate = 0

    total_trades = len(trades)

    return render_template(
        "index.html",
        trades=trades,
        total_pnl=total_pnl,
        win_rate=win_rate,
        total_trades=total_trades
    )


@app.route("/add_trade", methods=["POST"])
def add_trade():
    asset = request.form.get("asset", "").strip().upper()
    direction = request.form.get("direction", "LONG")
    entry_price = request.form.get("entry_price")
    exit_price = request.form.get("exit_price")
    quantity = request.form.get("quantity", "1")
    trade_date = request.form.get("trade_date")
    notes = request.form.get("notes", "").strip()

    if not asset or not entry_price or not trade_date:
        return "Eksik bilgi var.", 400

    try:
        entry_price = float(entry_price)
        quantity = float(quantity)

        if exit_price:
            exit_price = float(exit_price)
        else:
            exit_price = None

        if quantity <= 0:
            return "Quantity 0'dan büyük olmalı.", 400

    except ValueError:
        return "Fiyat veya miktar geçersiz.", 400

    conn = get_db_connection()

    conn.execute("""
        INSERT INTO trades (
            asset,
            direction,
            entry_price,
            exit_price,
            quantity,
            trade_date,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        asset,
        direction,
        entry_price,
        exit_price,
        quantity,
        trade_date,
        notes
    ))

    conn.commit()
    conn.close()

    return redirect(url_for("index"))


if __name__ == "__main__":
    init_db()
    app.run(debug=True)