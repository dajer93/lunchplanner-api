# Lunch Planner API

Backend API for the Lunch Planner application, built with Node.js, Express, and DynamoDB.

## Features

- JWT Authentication
- User Management
- Ingredients Management
- Meals Management
- Meal Planning
- Shopping List Generation

## Prerequisites

- Node.js 18+
- AWS Account
- DynamoDB

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example`:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration
5. Start the server:
   ```
   npm run dev
   ```

## AWS Configuration

For local development, you can use AWS credentials in your `.env` file:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

For deployment on EC2, it's recommended to use IAM Roles instead of hardcoded credentials.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change password

### User

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account

### Ingredients

- `GET /api/ingredients` - Get all ingredients
- `POST /api/ingredients` - Create ingredient
- `GET /api/ingredients/:ingredientId` - Get ingredient by ID
- `PUT /api/ingredients/:ingredientId` - Update ingredient
- `DELETE /api/ingredients/:ingredientId` - Delete ingredient

### Meals

- `GET /api/meals` - Get all meals
- `POST /api/meals` - Create meal
- `GET /api/meals/:mealId` - Get meal by ID
- `PUT /api/meals/:mealId` - Update meal
- `DELETE /api/meals/:mealId` - Delete meal

### Meal Plans

- `GET /api/plans` - Get meal plan
- `DELETE /api/plans` - Clear meal plan
- `GET /api/plans/shopping-list` - Generate shopping list
- `GET /api/plans/:date` - Get plan for a specific day
- `PUT /api/plans/:date` - Update plan for a specific day
- `DELETE /api/plans/:date` - Delete plan for a specific day

## Deployment

For deployment on AWS EC2:

1. Launch an EC2 instance
2. Install Node.js and dependencies
3. Clone the repository
4. Set up environment variables
5. Install PM2: `npm install -g pm2`
6. Start the server: `pm2 start server.js`
7. (Optional) Set up Nginx as a reverse proxy

## License

MIT 