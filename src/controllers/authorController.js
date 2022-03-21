

const AuthorModel = require("../models/AuthorModel")
const jwt = require("jsonwebtoken")
const validate = require("validator")


const isValid = (value) => {

  if (typeof value === 'undefined' || value === null) return false

  if (typeof value === 'string' && value.trim().length === 0) {
    return false
  }
    return true

}

const isValidTitle = (title) => {
  return ['Mr', 'Mrs', 'Miss', 'Mast'].indexOf(title) !== -1
}

const isValidRequestBody = (requestBody) => {
  return Object.keys(requestBody).length > 0
}


const createAuthor = async function (req, res) {
  try {

    let requestBody = req.body;
    if (!isValidRequestBody(requestBody)) {
      return res.status(400).send({ status: false, msg: "invalid request parameters . Please Provide Author Details" })
    }

    //// Extracting Params ////

    const { fname, lname, title, email, password } = requestBody;

    ////      Validating....     ////

    if (!isValid(fname)) {
      res.status(400).send({ Status: false, message: "First Name is required" })
      return
    }

    if (!isValid(lname)) {
      res.status(400).send({ Status: false, message: "Last Name is required" })
      return
    }

    if (!isValid(title)) {
      res.status(400).send({ Status: false, message: "Title is required" })
      return
    }

    if (!isValidTitle(title)) {
      res.status(400).send({ Status: false, message: "Title Should Be Among Mr , Mrs , Miss And Mast" })
      return
    }

    if (!isValid(email)) {
      res.status(400).send({ Status: false, message: "Email is required" })
      return
    }

    if (!validate.isEmail(email)) {
      return res.status(400).send({ status: false, msg: "Invalid Email" })
    }

    if (!isValid(password)) {
      res.status(400).send({ Status: false, message: "Password Is Required" })
      return
    }

    

    const isEmailAlreadyUsed = await AuthorModel.findOne({ email });

    if (isEmailAlreadyUsed) {
      res.status(400).send({ Status: false, message: `${email} is Already Registerd` })
      return
    }

    // Validation Ends

    const authorData = { fname, lname, title, email, password }
    const newAuthor = await AuthorModel.create(authorData);
    res.status(201).send({ status: true, message: 'Author Created Successfully', data: newAuthor })


  } catch (err) {
    res.status(500).send( { Status: false, message: err.message } )
  }

}



////   login_Part   ////

const loginAuthor = async function (req, res) {

  try {

    const requestBody = req.body;

    if (!isValidRequestBody(requestBody)) {
      res.status(400).send({ status: false, message: "invalid request parameters . Please Provide login Details" })
    }

    const { email, password } = requestBody

    if (!isValid(email)) {
      res.status(400).send({ Status: false, message: "Email Is Required" })
      return
    }

    if (!validate.isEmail(email)) {
      return res.status(400).send({ status: false, msg: "Invalid Email" })
    }

    if (!isValid(password)) {
      res.status(400).send({ Status: false, message: "Password Is Required" })
      return
    }


    let Author = await AuthorModel.findOne({ email, password });

    if (!Author)
      return res.status(404).send({ status: false, msg: "Author Not Found , plz check Credintials", });


    let token = jwt.sign(
      {
        authorId: Author._id.toString(),
        groupno: "42",
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
      },
      "this-is-aSecretTokenForLogin"
    );
    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, message: "Author login SuccesFull", data: token });


  } catch (error) {
    return res.status(500).send({ Status: false, message: error.message })
  }

};


module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor
