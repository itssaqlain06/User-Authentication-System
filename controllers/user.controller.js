import validator from 'validator';
import User from '../models/user.model.js';
import OTP from '../models/otp.model.js';
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import transporter from '../email/configEmail.js'

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please fill all the fields" });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Please enter a valid email" });
    }
    if (!validator.isStrongPassword(password, { minLength: 6 })) {
        return res.status(400).json({ error: "Password must be at least 6 characters with uppercase, lowercase, number, and special characters" });

    }
    try {
        const checkEmail = await User.findOne({ email: email.toLowerCase() });
        if (checkEmail) return res.status(400).json({ error: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await User.create(
            {
                name,
                email: email.toLowerCase(),
                password: hashPassword
            });

        return res.status(201).json({ user });

    } catch (error) {
        console.log(`Error in user.controller register function => ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide both email and password" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Please enter a valid email" });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        return res.status(200).json({ user: user });

    } catch (error) {
        console.log(`Error in user.controller login function => ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Please provide an email address" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Please enter a valid email" });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: "No user found with this email address" });
        }

        await OTP.deleteMany({ userId: user._id });

        const otp = crypto.randomInt(100000, 999999).toString();

        const storeOtp = new OTP({
            userId: user._id,
            otp: otp
        })

        await storeOtp.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "OTP sent to your email address" });

    } catch (error) {
        console.log(`Error in forgotPassword function => ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;

    if (!otp) {
        return res.status(400).json({ error: "Please provide user ID and OTP" });
    }

    try {
        const otpRecord = await OTP.findOne({ userId, otp });

        if (!otpRecord) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        return res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        console.log(`Error in verifyOtp function => ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};

export const setNewPassword = async (req, res) => {
    const { userId, password, confirm_password } = req.body;

    if (!userId || !password || !confirm_password) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    if (!validator.isStrongPassword(password, { minLength: 6 })) {
        return res.status(400).json({ error: "Password must be at least 6 characters with uppercase, lowercase, number, and special characters" });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.log(`Error in setNewPassword function => ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};

export const contactUs = async (req, res) => {
    const { name, subject, email, description } = req.body;

    if (!name || !subject || !email || !description) {
        return res.status(400).json({ error: "Please fill all the fields" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
    }

    try {

        const mailOptions = {
            from: email,
            to: 'dummytesting001e@gmail.com',
            subject: `Contact Us Form Submission: ${subject}`,
            text: `
                Name: ${name}
                Email: ${email}
                Subject: ${subject}
                Description: ${description}
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Your message has been sent successfully" });

    } catch (error) {
        console.log(`Error in contactUs function => ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};