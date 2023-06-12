import express from 'express';
import path from 'path';

const app = express();

app.use(express.json());
app.use(express.static(path.resolve('public')));

/* app.use('/v1', api); */

export default app;
