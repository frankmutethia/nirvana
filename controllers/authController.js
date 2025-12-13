const { signupScheme } = require("../middlewares/validator");
const User = require("../models/usersModel");
const { doHash, doCompare, hmacProcess } = require("../utils/hashing");
const jwt = require('jsonwebtoken');
const resend = require("../middlewares/sendMail");


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

    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      verified: user.verified,
    }, process.env.TOKEN_SECRET, { expiresIn: '8h' });

    res.cookie('Authorization', 'Bearer ' + token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
    });

    user.password = undefined;
    return res.status(200).json({ success: true, message: 'Signed in successfully', token, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

exports.signout = async(req, res) => {
  res.clearCookie('Authorization')
  .status(200)
  .json({ success: true, message: 'Signed out successfully' });
};

exports.sendVerificationEmail = async(req, res) => {
  const { email } = req.body;
  try {
      const existingUser = await User.findOne({email})
      if(!existingUser){
        return res
        .status(404)
        .json({success:false, message: 'User does not exist!'});
      }
      if(existingUser.verified){
        return res
        .status(400)
        .json({success:false, message: 'Your account is already verified!'});
      }
      const codeValue = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: existingUser.email,
        subject: "Email Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px;">${codeValue}</h1>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });

      if(error){
        console.error('Resend error:', error);
        return res.status(400)
        .json({success:false, message: 'Verification email could not be sent. Try again later!'}); 
      }

      if(data && data.id){
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
        existingUser.verificationCode = hashedCodeValue;
        existingUser.verificationCodeValidation = Date.now();
        await existingUser.save()
        return res.status(200)
        .json({success:true, message: 'Verification code sent to your email address'}); 
      }
      
      res.status(400)
        .json({success:false, message: 'Verification email could not be sent. Try again later!'}); 
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false, message: 'An error occurred while sending verification email'});
  }
}

exports.verifyEmailCode = async(req, res) => {
  const { email, code } = req.body;
  try {
    if(!email || !code){
      return res.status(400).json({success:false, message: 'Email and verification code are required'});
    }

    const user = await User.findOne({email}).select('+verificationCode +verificationCodeValidation');
    if(!user){
      return res.status(404).json({success:false, message: 'User does not exist!'});
    }

    if(user.verified){
      return res.status(400).json({success:false, message: 'Your account is already verified!'});
    }

    if(!user.verificationCode || !user.verificationCodeValidation){
      return res.status(400).json({success:false, message: 'No verification code found. Please request a new one.'});
    }

    // Check if code has expired (10 minutes = 600000 milliseconds)
    const codeAge = Date.now() - user.verificationCodeValidation;
    const tenMinutes = 10 * 60 * 1000;
    if(codeAge > tenMinutes){
      return res.status(400).json({success:false, message: 'Verification code has expired. Please request a new one.'});
    }

    // Verify the code using HMAC
    const hashedInputCode = hmacProcess(code, process.env.HMAC_VERIFICATION_CODE_SECRET);
    if(hashedInputCode !== user.verificationCode){
      return res.status(401).json({success:false, message: 'Invalid verification code!'});
    }

    // Code is valid, verify the user
    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeValidation = undefined;
    await user.save();

    return res.status(200).json({success:true, message: 'Email verified successfully!'});
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false, message: 'An error occurred while verifying email'});
  }
}