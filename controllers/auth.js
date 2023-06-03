import User from '../models/auth'
import { hashPassword, comparePassword } from '../utils/auth'
import Jwt from 'jsonwebtoken'


//User Registration
export const register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body

    // Name validation
    if (!name) return res.status(400).send('Name is required')
    if (!email) return res.status(400).send('email is required')
    if (!mobile) return res.status(400).send('mobile is required')

    // Password validation
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send('Password is required and should be min 6 characters long')
    }

    // Email validation
    let userExist = await User.findOne({ email }).exec()
    if (userExist) return res.status(400).send('Email is taken')

    // hash password
    const hashedPassword = await hashPassword(password)

    // Save user in database
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword
    })
    await user.save().then(newUser => {
      console.log('New User----->', newUser)
    })

    return res.json({ ok: true })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}


//User Login
export const login = async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body

    // Email Validation
    const user = await User.findOne({ email }).exec()
    if (!user) return res.status(400).send('No user found')

    // Password Validation
    const match = await comparePassword(password, user.password)
    if (!match) return res.status(400).send("Password didn't match.")

    // Create Signed JWT
    const token = Jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    // Return User & Token to client, exclude hashed password.
    user.password = undefined

    // Send token in cookie.
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true // only works on https
    })

    res.status(200).json(user)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

//User Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('token')
    return res.json({ message: 'Signout success' })
  } catch (err) {
    console.log(err)
  }
}

export const allUser = async (req, res) => {
  const all = await User.find().exec()
  res.json(all)
}