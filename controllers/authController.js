const { signupScheme } = require("../middlewares/validator");
const User = require("../models/usersModel");
const { doHash, doCompare } = require("../utils/hashing");

exports.signup = async (req, res) => {
    const {email,password} = req.body;
   try {
    const {error, value} = signupScheme.validate({email,password});
    if(error){
    return res.status(401).json({success:false, message: error.details[0].message});
   } 
   const existingUser = await User.findOne({email});

   if(existingUser){
    return res.status(401).json({success:false, message: 'User already exists'});
    }
    const hashedPassword =  await doHash(password, 12);

    const newUser = new User({email, password: hashedPassword});
    const result = await newUser.save();
    result.password =undefined;
    res.status(201).json({success:true, message: 'Your account has been created successfully', user: result});

  }
  catch (error) {
     console.log(error);
     res.status(500).json({success:false, message: 'An error occurred during signup'});
   }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await doCompare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.password = undefined;
    res.status(200).json({ success: true, message: 'Signed in successfully', user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};