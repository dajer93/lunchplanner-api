const { 
  DynamoDBClient, 
  CreateTableCommand,
  ResourceInUseException
} = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand,
  UpdateCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb');

// Configure AWS
const clientConfig = {
  region: process.env.AWS_REGION || 'eu-central-1'
};

// If we're in local development, use credentials from env vars
if (process.env.NODE_ENV !== 'production') {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
  }
}

const dynamoClient = new DynamoDBClient(clientConfig);

// Create DynamoDB document client
const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false,
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true,
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false,
};

const unmarshallOptions = {
  // Whether to return numbers as strings instead of converting them to native JavaScript numbers.
  wrapNumbers: false,
};

// Create the DynamoDB Document client.
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions,
  unmarshallOptions,
});

// Table names
const tables = {
  USERS: process.env.USERS_TABLE || 'Lunchplanner-Users',
  INGREDIENTS: process.env.INGREDIENTS_TABLE || 'Lunchplanner-Ingredients',
  MEALS: process.env.MEALS_TABLE || 'Lunchplanner-Meals',
  MEALPLANS: process.env.MEALPLANS_TABLE || 'Lunchplanner-MealPlans'
};

/**
 * Creates DynamoDB tables if they don't exist
 * Note: In production, table creation should be handled through Infrastructure as Code (CloudFormation/Terraform)
 */
const initializeTables = async () => {
  try {
    // Users table
    const usersTableParams = {
      TableName: tables.USERS,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmailIndex',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
    
    await dynamoClient.send(new CreateTableCommand(usersTableParams));
    console.log(`Table ${tables.USERS} created successfully`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(`Table ${tables.USERS} already exists`);
    } else {
      console.error(`Error creating table ${tables.USERS}:`, error);
    }
  }

  try {
    // Ingredients table
    const ingredientsTableParams = {
      TableName: tables.INGREDIENTS,
      KeySchema: [
        { AttributeName: 'ingredientId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'ingredientId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UserIdIndex',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
    
    await dynamoClient.send(new CreateTableCommand(ingredientsTableParams));
    console.log(`Table ${tables.INGREDIENTS} created successfully`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(`Table ${tables.INGREDIENTS} already exists`);
    } else {
      console.error(`Error creating table ${tables.INGREDIENTS}:`, error);
    }
  }

  try {
    // Meals table
    const mealsTableParams = {
      TableName: tables.MEALS,
      KeySchema: [
        { AttributeName: 'mealId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'mealId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UserIdIndex',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
    
    await dynamoClient.send(new CreateTableCommand(mealsTableParams));
    console.log(`Table ${tables.MEALS} created successfully`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(`Table ${tables.MEALS} already exists`);
    } else {
      console.error(`Error creating table ${tables.MEALS}:`, error);
    }
  }

  try {
    // MealPlans table
    const mealPlansTableParams = {
      TableName: tables.MEALPLANS,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'date', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'date', AttributeType: 'S' }
      ],
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
    
    await dynamoClient.send(new CreateTableCommand(mealPlansTableParams));
    console.log(`Table ${tables.MEALPLANS} created successfully`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(`Table ${tables.MEALPLANS} already exists`);
    } else {
      console.error(`Error creating table ${tables.MEALPLANS}:`, error);
    }
  }
};

// Helper functions for common DynamoDB operations
const dynamoDB = {
  put: async (params) => {
    const command = new PutCommand(params);
    return docClient.send(command);
  },
  get: async (params) => {
    const command = new GetCommand(params);
    return docClient.send(command);
  },
  query: async (params) => {
    const command = new QueryCommand(params);
    return docClient.send(command);
  },
  update: async (params) => {
    const command = new UpdateCommand(params);
    return docClient.send(command);
  },
  delete: async (params) => {
    const command = new DeleteCommand(params);
    return docClient.send(command);
  }
};

module.exports = {
  dynamoDB,
  tables,
  initializeTables
}; 