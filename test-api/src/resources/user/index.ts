import { Application } from 'express';
import userRoutes from './routes';

export default function registerUserRoutes(app: Application): void {
  app.use('/api/users', userRoutes);
}