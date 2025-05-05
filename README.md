# EPL Analytics Tool

A web application for analyzing and visualizing English Premier League player statistics using spider diagrams.

## Features

- Interactive spider diagrams for player statistics
- Real-time player comparison
- Key performance metrics visualization

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Usage

1. The application will be available at `http://localhost:3000`
2. Select a player from the dropdown menu to view their statistics
3. The spider diagram will update to show the selected player's performance metrics

## Data Structure

The application currently uses sample data for demonstration. In a production environment, you would want to:

1. Connect to a real EPL statistics API
2. Store the data in a database
3. Implement caching for better performance

## Contributing

Feel free to submit issues and enhancement requests! 