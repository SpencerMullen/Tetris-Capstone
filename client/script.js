$(function() {
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
            c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    const token = getCookie('auth-token')

    let userData

    console.log(token)

    if (token) {
        $.post(
            "http://localhost:8000/api/auth", { token }, 
            function(data) {
                const $el = $('.login-options')
                $el.empty()
                
                $el.append(`
                    <p>Welcome Back ${data.username}</p>
                    <a href="./api/logout">Logout</a>
                `)

            }, "json"
        )
    }
})