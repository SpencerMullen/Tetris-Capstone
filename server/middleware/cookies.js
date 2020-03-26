module.exports = setCookie = (res, token) => {
    const cookieConfig = {
        maxAge: 100000000,
        signed: false
    }

    res.cookie('auth-token', token, cookieConfig)
}