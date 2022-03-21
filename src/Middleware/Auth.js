

const jwt = require("jsonwebtoken")

////  Authenication_Part  ////

const verifyUser =async (req ,res , next) =>{

try {

    let token = req.headers["x-api-key"]
    if(!token){
        return res.status(400).send( { status : false , msg : "token Must Be Present , You Have To Login First" } )
    }

    let decodeToken = jwt.verify(token,"this-is-aSecretTokenForLogin")
    if(!decodeToken){
        return res.status(401).send( { status : false , msg : "Invalid Token" } )
    }

    req['authorId']= decodeToken.authorId
    
  
  next()

} catch (error) { 
    return res.status(500).send( { Error : error.message } )
}
};


module.exports.verifyUser = verifyUser
