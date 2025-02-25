# Stock.Service (beta)

A Node.js backend service that provides stock data analysis and OpenAI integration with machine-to-machine (M2M) verification capabilities.

## Features

- Stock data analysis with Moving Average and MACD calculations
- OpenAI integration for chat responses
- JWT-based machine-to-machine (M2M) verification
- Log management for stock queries
- Secure CORS configuration
- Input validation and sanitization
- Error handling and logging

## Prerequisites

- Node.js (v14 or higher)
- npm
- Access to OpenAI API
- Access to Yahoo Finance API

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory by copying and filling details in `.env.example`.

## Usage

### Start Development Server

```bash
npm run dev
```

The server will start on port 8002 (or the port specified in your .env file).

### API Endpoints

#### Stock Data
```
POST /stock
```
Request body:
```json
{
  "info": {
    "symbol": "AAPL",
    "period1": "1617235200",
    "period2": "1649357600"
  },
  "vcJwt": "your_verification_credential"
}
```
Returns calculated moving averages and MACD values for the specified stock.

#### Logs
```
GET /log
```
Returns the history of stock queries.

```
DELETE /log
```
Clears the log history.

#### Test
```
POST /test
```
Simple test endpoint to verify the service is running.

## Authentication

The service uses JWT-based verification credentials for machine-to-machine authentication. Include the `vcJwt` in the request headers for protected endpoints.

## Project Structure

- controller - Request handlers and business logic
- middleware - Authentication and request processing
- providers - External service integrations (OpenAI)
- routes - API route definitions

## Error Handling

The service includes comprehensive error handling for:
- Invalid requests
- Authentication failures
- External API errors
- Server errors
