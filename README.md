# AI Product Review Analyzer
This project is a comprehensive platform that leverages Large Language Models (LLMs) to analyze product reviews from various e-commerce platforms. It provides users with deep insights, trust scores, and personalized recommendations to make informed purchasing decisions.

## Tech Stack
-   **Frontend**: React, TailwindCSS, Shadcn/UI
-   **Backend**: Python (Flask), SQLAlchemy
-   **LLM Provider**: Groq (OpenAI-compatible API)
-   **Database**: PostgreSQL

## 📂 Project Structure

```
backend/
├── app.py                    # Flask application entry point
├── extensions.py             # SQLAlchemy database initialization
├── utils/
│   ├── ai_client.py          # Core logic for LLM interactions (Analysis & Catalog)
│   └── scraper.py            # Placeholder for web scraping logic
├── models/
│   └── analysis.py           # SQLAlchemy database model for storing results
└── routes/
    ├── analyze.py            # API endpoints for review analysis
    ├── catalog.py            # API endpoints for product catalog and personalization
    ├── compare.py            # API endpoints for comparing products
    ├── export.py             # API endpoints for exporting results
    └── history.py            # API endpoints for retrieving analysis history
```

## ⚙️ Setup

### Prerequisites
-   Python 3.9+
-   Node.js 18+
-   PostgreSQL (or Docker)

### 1. Backend Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment**:
    ```bash
    python -m venv .venv
    # Windows
    .venv\Scripts\activate
    # Linux/Mac
    # source .venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables**:
    Create a `.env` file in the `backend/` directory:
    ```env
    GROQ_API_KEY=your_groq_api_key_here
    DATABASE_URL=postgresql://user:password@localhost:5432/dbname
    FLASK_SECRET_KEY=your_secret_key
    ```

5.  **Initialize the Database**:
    ```bash
    flask db init
    flask db migrate
    flask db upgrade
    ```
    *(Note: Ensure your PostgreSQL server is running)*

### 2. Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 🚀 Running the Application

1.  **Backend**: Run the Flask server
    ```bash
    cd backend
    flask run
    ```
    The server will start on `http://localhost:5002`.

2.  **Frontend**: The server will start automatically on `http://localhost:3000`.

## 🎯 Key Features

### Review Analysis
-   **Advanced Mode**: Deep analysis including Trust Score, Sentiment Analysis, and Verdicts.
-   **Basic Mode**: Quick, simple summaries.
-   **User Context**: Provides personalized insights based on user preferences (Budget, Use Case, etc.).

### Product Catalog
-   **Dynamic Fields**: Automatically generates relevant personalization fields based on product category.
-   **Structured Data**: Returns strict JSON with `single_select`, `multi_select`, `range`, and `text` field types.

### History & Export
-   **History**: Keeps a record of all past analysis.
-   **Export**: Allows exporting results to CSV or Excel formats.
