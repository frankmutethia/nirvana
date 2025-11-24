exports.signup = async (req, res) => {
    const {email,password} = req.body;
   try {
    const {error, value} = signupScheme.validate({email,password});
    if(error){
    return res.status(401).json({success:false, message: error.details[0].message});
   } 
   const existingUser = await User.findOne({email});
    }catch (error) {
     console.log(error);
   }
};