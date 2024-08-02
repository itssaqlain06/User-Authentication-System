import mongoose from "mongoose";

const VerificationOtpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    otp: { type: String, required: true },
}, {
    timestamps: true
})
export default mongoose.model("VerificationOtp", VerificationOtpSchema);