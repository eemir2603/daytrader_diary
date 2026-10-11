DayTrader Diary 📈

DayTrader Diary is a web-based portfolio and journal management tool that allows you to record, track, and analyze your trading activities in cryptocurrency, stock, or forex markets.

🚀 Features

Dynamic Dashboard: Automatically calculates and displays your Total PnL, Win Rate, and total number of trades.

Detailed Trade Logging: Record specific details for each trade, including asset (symbol), direction (Long/Short), entry/exit prices, position size, and date.

Risk Management (TP/SL): Keep track of your planned Take Profit and Stop Loss levels.

PnL Color Coding: Automatically highlights trade outcomes in the history table (green for profit, red for loss, standard for open trades).

CRUD Operations: Easily update existing trade details or completely delete them directly from the UI.

Psychology & Strategy Notes: A dedicated text area for each entry to record your mindset, emotions, and strategic reasoning behind the trade.

🛠️ Technologies Used

Backend: Python, Flask

Database: SQLite

Frontend: HTML5, CSS3, Vanilla JavaScript, Jinja2 Template Engine

⚙️ Installation and Setup

To run the project on your local machine, follow these steps:

Clone the Repository:

git clone https://github.com/eemir2603/daytrader_diary.git
cd daytrader_diary


Create and Activate a Virtual Environment:

# On macOS/Linux:
python3 -m venv .venv
source .venv/bin/activate

# On Windows:
python -m venv .venv
.venv\Scripts\activate


Install Dependencies:

pip install Flask


Run the Application:

python app.py


Open http://127.0.0.1:5000 in your web browser to start using the app. The SQLite database file (trades.db) will be created automatically upon the first run.
