import express from 'express';
import cors from 'cors';
import hospitalRoutes from './api/hospital/hospital.routes.js';
import campaignRoutes from './api/campaign/campaign.routes.js';
import patientRoutes from './api/patient/patient.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/hospital', hospitalRoutes);
app.use('/campaign', campaignRoutes);
app.use('/patient', patientRoutes);

export default app;

