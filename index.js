const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = process.env.PORT || 8009;
const mongoose= require('mongoose');

const authRouter = require('./routers/authRouter');

// here is a promise
mongoose.connect(process.env.MONGO_URI).then(
    ()=> {console.log('Database connected.')}
).catch(err=>{
    console.log(err);
})

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the server' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Try accessing: http://localhost:${PORT}`);
});
