import axios from "axios";

const base = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

export const getAccessToken = async () => {
    const response = await axios({
        url: `${base}/v1/oauth2/token`,
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",    
        },
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET,
        },
        data: "grant_type=client_credentials",
    })

    return response.data.access_token;
}