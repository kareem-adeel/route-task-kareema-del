// modules imports
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// files imports
import User from '../../../DB/models/user.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import generateUniqueString from '../../utils/generate.unique-string.js';
import sendEmailService from '../../services/send-mail.service.js';

// =================== signUp api =========================

/*
    // 1 - destructing the required data
    // 2 - check if the user already exists
    // 3 - create user token for sending confirmation email to the user
    // 4 - sending the email
    // 5 - check if the email sent
    // 6 - create the userName
    // 7 - hashing the password
    // 8 - creating user's media folder
    // 9 - intiate userImg Object
    // 10 - check if the user upload an image or not
        // 10.1 - if not keep the intial values of the image object
        // 10.2 - uploading user img
    // 11 - creating the user object
    // 12 - check if the image isn't uploaded to put a value of media folder
    // 13 - saving the user to the database
    // 14 - check if the user document created 
    // 15 - return response
*/

export const signUp = async (req, res, next) => {
    // 1 - destructing the required data
    const {
        firstName,
        lastName,
        email,
        password,
    } = req.body;

    // 2 - check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new Error('User already exists , please signIn', { cause: 400 }));
    }

    // 3 - create user token for sending confirmation email to the user
    const userToken = jwt.sign({ email }, process.env.JWT_SECRET_VEREFICATION, { expiresIn: '1h' });
    // 4 - sending the email
    const isEmailSent = await sendEmailService({
        to: email,
        subject: 'account verification',
        message: `<section style="width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
        <div style="width: 50%; background-color: rgba(128, 128, 128,0.3); height: 20vh; border-radius: .625rem; text-align: center;">
            <h2 style=" color: black; text-shadow: 7px 7px 5px  white;display:block;font-size:25px;">Please click the link to verify your account</h2>
            <a style="text-decoration: none; font-size: 20px; " href='http://localhost:3000/user/verify-email?token=${userToken}'>Verify Account</a>
        </div>
    </section>`
    });
    // 5 - check if the email sent
    if (!isEmailSent) {
        return next(new Error(`unable to send email , please try again later`, { cause: 500 }));
    }
    // 6 - create the userName
    const userName = firstName + ' ' + lastName;
    // 7 - hashing the password
    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

    // 8 - creating user's media folder
    const mediaFolder = generateUniqueString(13);
    // 9 - intiate userImg Object
    let userImg = {
        secure_url: '',
        public_id: ''
    }
    // 10 - check if the user upload an image or not
    if (!req.file) {
        // 10.1 - if not keep the intial values of the image object
        userImg = {
            secure_url: '',
            public_id: ''
        }
    } else {
        // 10.2 - uploading user img
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `Task Manager/${mediaFolder}`
        })
        userImg = {
            secure_url,
            public_id
        }

    }
    // 11 - creating the user object
    const newUserObject = {
        firstName,
        lastName,
        userName,
        email,
        password: hashedPassword,
        userImg,
        mediaFolderId: ''
    }
    // 12 - check if the image isn't uploaded to put a value of media folder
    if (userImg.public_id === '' && userImg.secure_url === '') {
        newUserObject.mediaFolderId = '';
    } else {
        newUserObject.mediaFolderId = mediaFolder;
    }
    // 13 - saving the user to the database
    const newUser = await User.create(newUserObject);
    // 14 - check if the user document created 
    if (!newUser) {
        return next(new Error('Failed to create user', { cause: 500 }));
    }
    // 15 - return response
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
    });
}

// ============================= verify the email ========================== //

/*
    // 1 - destructing the required data 
    // 2 - verify user's token 
    // 3 - get user by email whith isEmailVerified = false
    // 4 - check if the user exist or not
    // 5 - return the response
*/
export const verifyEmail = async (req, res, next) => {
    // 1 - destructing the required data 
    const { token } = req.query;
    // 2 - verify user's token 
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VEREFICATION);
    // 3 - get user by email whith isEmailVerified = false
    const findUser = await User.findOneAndUpdate({ email: decodedData.email, isEmailVerified: false }, { isEmailVerified: true }, { new: true });
    // 4 - check if the user exist or not
    if (!findUser) {
        return next(new Error(`user not foud`, { cause: 404 }));
    }
    // 5 - return the response
    return res.status(200).json({
        success: true,
        message: 'email verified successfully',
        data: findUser
    });
}

// ============================= signIn api ================================== // 
/*
    // 1 - destructing the required data
    // 2 - check if the user is already exist by using email or mobile phone
    // 3 - check the password
    // 4 - create user token
    // 5 - updating the user's status
    // 6 - return the response
*/

export const signIn = async (req, res, next) => {
    // 1 - destructing the required data
    const { email, password } = req.body;
    // 2 - check if the user is already exist by using email or mobile phone
    const userExist = await User.findOne({email})
    if (!userExist) {
        return next(new Error('Invalid login credentials , please signUp', { cause: 404 }));
    }
    // 3 - check the password
    const verifiedPassword = bcrypt.compareSync(password, userExist.password);
    if (!verifiedPassword) {
        return next(new Error('password is incorrect', { cause: 400 }));
    }
    // 4 - create user token
    const userToken = jwt.sign({ email, id: userExist._id }, process.env.JWT_SECRET_LOGIN, { expiresIn: '1h' });
    // 5 - updating the user's status
    userExist.userStatus = 'online';
    await userExist.save();
    // 6 - return the response
    return res.status(200).json({
        success: true,
        message: 'user logged in successfully',
        token: userToken
    });
}

// ============================ get all user's data api =========================== //
/*
    // 1 - get all users
    // 2 - check if there are no users's in DB 
    // 3 - return the response
*/
export const getAllUsers = async (req, res, next) => {
    // 1 - get all users
    const allUsers = await User.find();
    // 2 - check if there are no users's in DB 
    if(!allUsers.length){
        return next(new Error('No users found', { cause: 404 }));
    }
    // 3 - return the response
    return res.status(200).json({
        success: true,
        message: 'all users ',
        data: allUsers
    });
}

// ============================= update user api ========================== //
/*
    // 1 - destructing the required data
    // 2 - destructing the id of the signedIn user (account owner)
    // 3 - find the user by id
    // 4 - check if the user wants to change his email
        // 4.1 - check if the new email is the same of old one
        // 4.2 - if the two emails are diffrent then we update the value of the old email
    // 5 - check if the user wants to change his img
        // 5.1 - we delete the old img from cloudinary
        // 5.2 - we update the value of the old img
        // 5.3 - update the image object
    // 6 - update the remaining details
    // 7 - save the updated user
    // 8 - return the response
*/

export const updateAccount = async (req, res, next) => {
    // 1 - destructing the required data
    const {
        newEmail,
        newFName,
        newLName,
        oldPublicId
    } = req.body;
    // 2 - destructing the id of the signedIn user (account owner)
    const { _id } = req.authUser;
    // 3 - find the user by id
    const user = await User.findById(_id);
    // 4 - check if the user wants to change his email
    if (newEmail) {
        // 4.1 - check if the new email is the same of old one
        if (newEmail === user.email) {
            return next(new Error('new email should be different from old one', { cause: 400 }));
        }
        // 4.2 - if the two emails are diffrent then we update the value of the old email
        user.email = newEmail;
    }

    // 5 - check if the user wants to change his img
    if (oldPublicId) {
        // 5.1 - we delete the old img from cloudinary
        await cloudinaryConnection().uploader.destroy(oldPublicId);
        // 5.2 - we update the value of the old img
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `Task Manager/${user.mediaFolderId}`
        });
        // 5.3 - update the image object
        user.userImg = {
            secure_url,
            public_id
        }
    }
    // 6 - update the remaining details
    user.firstName = newFName;
    user.lastName = newLName;
    user.userName = newFName + ' ' + newLName;
    // 7 - save the updated user
    await user.save();
    // 8 - return the response
    return res.status(200).json({
        success: true,
        message: 'account updated successfully',
        data: user
    });
}

// =========================== delete account ================================= //

/*

*/

export const deleteAccount = async (req, res, next) => {
    // 1 - destructing the user id of the loggedIn user(account owner)
    const { _id } = req.authUser;
    // 2 - find the user & delete user's document from DB
    const deletedUser = await User.findByIdAndDelete(_id);
    // 3 - check if the user's document is deleted or not
    if (!deletedUser) {
        return next(new Error('user not found', { cause: 404 }));
    }
    // 4 - delete user's media folder from cloudinary
    const { mediaFolderId, userImg } = deletedUser;
    await cloudinaryConnection().api.delete_resources(userImg.public_id);
    await cloudinaryConnection().api.delete_folder(`Task Manager/${mediaFolderId}`);
    // 5 - return the response
    return res.status(200).json({
        success: true,
        message: 'account deleted successfully'
    });
}

