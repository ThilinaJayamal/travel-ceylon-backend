import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import cookieParser from 'cookie-parser'
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import serviceProviderRouter from './routes/serviceProviderRoute.js'
import taxiRouter from './routes/taxiRoute.js'
import staysRouter from './routes/staysRoute.js'

dotenv.config()

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/user",userRouter);
app.use("/api/service-provider",serviceProviderRouter);
app.use("/api/service/taxi",taxiRouter)
app.use("/api/service/stays", staysRouter)

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Server is running on PORT", port);
})