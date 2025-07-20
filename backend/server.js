import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectCloudinary, connectDB } from "./configs/configs.js";
import userRouter from "./routes/userRoutes.js";
import membersRouter from "./routes/membersRoutes.js";
import teamRouter from  "./routes/teamRoutes.js";

//import eventRouter from "./routes/eventRoutes.js";
//import resourceRouter from "./routes/resourceRoutes.js";
//import teamRouter from  "./routes/teamRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import firebaseAuthRouter from "./routes/firebaseauthRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 4200;

const allowedOrigins = [
  'http://localhost:5173', 
  'https://cdcfrontendkrishna-git-main-krishna-gupta17s-projects.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

async function connectMongoDb() {
  try {
    await connectDB();
    console.log('connecte to mongoDB');
  } catch (error) {
    console.error('Failed to connect to mongoDB')
  }
}

connectMongoDb();
connectCloudinary();

app.get("/", (req, res) => {
  res.send("API working");
});



app.use('/user', userRouter);
app.use('/members', membersRouter);
app.use('/firebase-auth', firebaseAuthRouter);
//app.use('/event', eventRouter);
//app.use('/resource',resourceRouter);
//app.use('/team',teamRouter);
app.use('/admin',adminRoutes);
app.use('/api',teamRouter);

//listens to port for req 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//is any other route
//app.use('/{*any}', (req, res) => {
//  res.status(404).json({
//    success: false,
 //   message: "Route not found",
//  });
//});
