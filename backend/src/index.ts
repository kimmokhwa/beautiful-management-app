import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // 개발 환경에서는 localhost의 모든 포트 허용
    if (process.env.NODE_ENV === 'development' && (!origin || origin.startsWith('http://localhost:'))) {
      callback(null, true);
    } else {
      const allowed = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map(o => o.trim())
        .filter(o => o);
      
      if (allowed.includes(origin || '')) {
        callback(null, true);
      } else if (process.env.NODE_ENV === 'production') {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      } else {
        // 개발 환경에서는 허용 (fallback)
        callback(null, true);
      }
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test Supabase connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const { error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    res.json({
      status: 'connected',
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Supabase connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Supabase',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
import materialsRouter from './routes/materials';
import proceduresRouter from './routes/procedures';
import dashboardRouter from './routes/dashboard';
import uploadRouter from './routes/upload';

app.use('/api/materials', materialsRouter);
app.use('/api/procedures', proceduresRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/upload', uploadRouter);

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', error);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Cost Management API Server`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Supabase test: http://localhost:${PORT}/api/test-connection`);
});

export default app;