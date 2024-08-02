import express from 'express'

import { contactUs, forgotPassword, login, register, setNewPassword, verifyOtp } from '../controllers/user.controller.js'

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/set-new-password', setNewPassword);
router.post('/contact-us', contactUs)

export default router;