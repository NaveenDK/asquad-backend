Google Auth authentication react and node

Gathered from here https://codevoweb.com/google-oauth-authentication-react-and-node/

The url is `
const { data } = await axios.get<GoogleUserResult>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );`