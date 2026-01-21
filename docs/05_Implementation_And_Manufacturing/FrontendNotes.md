# Frontend Notes

## CSRF Cookies

    Use the /auth/user/ endpoint to see the CSRF token in the cookies. Use that in the other requests by setting `X-CSRFToken` in the headers.
