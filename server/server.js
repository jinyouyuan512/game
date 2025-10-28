// you/server/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Sequelize } from 'sequelize';
import { initModels } from './models.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Database Connection (SQLite)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_URL.replace('sqlite:', ''),
  logging: false,
});

// 初始化模型
const { User, Note, Game, Strategy, Tag, StrategyTag } = initModels(sequelize);

// Synchronize Database
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync();
    console.log('Database synchronized.');
    
    // 添加游戏和策略的示例数据
    await addSampleDataWrapper();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// 添加示例数据
async function addSampleDataWrapper() {
  try {
    // 调用games.js中的addSampleData函数
    await addSampleData();
  } catch (error) {
    console.error('添加示例数据失败:', error);
  }
}

// Basic Route
app.get('/', (req, res) => {
  res.send('You Backend Server is Running!');
});

// Import Routers
import { authRouter } from './auth.js';
import { dataRouter } from './data.js';
import { gamesRouter, addSampleData } from './games.js';

// Use Routers
app.use('/api/auth', authRouter);
app.use('/api/data', dataRouter);
app.use('/api', gamesRouter);

// Start Server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Server is also accessible at http://0.0.0.0:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
});

// Note: In a real app, you would define associations here, e.g.,
// User.hasMany(Note, { foreignKey: 'userId' });
// Note.belongsTo(User, { foreignKey: 'userId' });

export { sequelize, User, Note, Game, Strategy, Tag, StrategyTag };

