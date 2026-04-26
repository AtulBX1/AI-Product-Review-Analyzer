# AI Product Review Analyzer

## Overview
The AI Product Review Analyzer is a full-stack web application designed to synthesize and analyze customer product reviews using the Google Gemini LLM. It helps consumers and product managers quickly grasp the sentiment, pros, cons, and hidden patterns of any product across multiple review platforms.

## Core Features
- **Smart Analysis:** Generates comprehensive insights including overall sentiment scores, recommendation rates, target personas, and clear purchasing verdicts.
- **Side-by-Side Comparisons:** Allows users to compare two products simultaneously to make informed decisions.
- **Historical Tracking:** Saves all past analyses in a local SQLite database for easy retrieval and historical review.
- **Export Capabilities:** Users can export analysis results to both CSV (for spreadsheet analysis) and PDF (for shareable reports).

## Tech Stack
- **Backend:** Python, Flask, Flask-SQLAlchemy (SQLite), Google Generative AI SDK (`gemini-2.0-flash`).
- **Frontend:** React (Vite), Tailwind CSS, React Router.

## Use Cases
- Rapid consumer research before purchasing electronics, software, or household items.
- Product managers looking to extract feature requests or identify hidden seasonal/usability patterns from user feedback.
