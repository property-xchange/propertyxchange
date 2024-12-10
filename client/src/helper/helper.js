import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_REACT_APP_SERVER_DOMAIN;

/** Make API Requests */

export async function getUsername() {
  // const token = localStorage.getItem('token');
  // if (!token) return Promise.reject('Cannot find Token');
  // let decode = jwtDecode(token);
  // return decode;
}

/** authenticate function */
export async function authenticate(username) {
  try {
    return await axios.post('/api/auth/authenticate', { username });
  } catch (error) {
    return { error: "Username doesn't exist...!" };
  }
}

/** get User details */
export async function getUser({ username }) {
  try {
    const { data } = await axios.get(`/api/user/${username}`);
    return { data };
  } catch (error) {
    return { error: "Password doesn't Match...!" };
  }
}

/** register user function */
export async function registerUser(credentials) {
  try {
    const {
      data: { msg },
      status,
    } = await axios.post(`/api/auth/register`, credentials);

    // let { username, email } = credentials;

    /** send email */
    // if (status === 201) {
    //   await axios.post('/api/auth/register-mail', {
    //     username,
    //     userEmail: email,
    //     text: msg,
    //   });
    // }
    return Promise.resolve(msg);
  } catch (error) {
    return Promise.reject({ error });
  }
}

/** login function */
export async function loginUser({ username, password }) {
  try {
    if (username) {
      const { data } = await axios.post(
        '/api/auth/login',
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );
      return Promise.resolve({ data });
    }
  } catch (error) {
    return Promise.reject({ error });
  }
}

/** logout function */
export async function logout() {
  try {
    // Send a request with credentials
    const res = await axios.post(
      '/api/auth/logout',
      {},
      {
        withCredentials: true,
      }
    );
    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject({ error });
  }
}

/** update user profile function */
export async function updateUserData(userId, response) {
  try {
    const data = await axios.put(`/api/user/${userId}`, response, {
      withCredentials: true,
    });

    return Promise.resolve({ data });
  } catch (error) {
    return Promise.reject({ error: "Couldn't Update Profile...!" });
  }
}

/** generate OTP */
export async function generateOTP(username) {
  try {
    const {
      data: { code },
      status,
    } = await axios.get('/api/generateOTP', { params: { username } });

    // send mail with the OTP
    if (status === 201) {
      let {
        data: { email },
      } = await getUser({ username });
      let text = `Your Password Recovery OTP is ${code}. Verify and recover your password.`;
      await axios.post('/api/register-mail', {
        username,
        userEmail: email,
        text,
        subject: 'Password Recovery OTP',
      });
    }
    return Promise.resolve(code);
  } catch (error) {
    return Promise.reject({ error });
  }
}

/** verify OTP */
export async function verifyOTP({ username, code }) {
  try {
    const { data, status } = await axios.get('/api/verifyOTP', {
      params: { username, code },
    });
    return { data, status };
  } catch (error) {
    return Promise.reject(error);
  }
}

/** reset password */
export async function resetPassword({ username, password }) {
  try {
    const { data, status } = await axios.put('/api/resetPassword', {
      username,
      password,
    });
    return Promise.resolve({ data, status });
  } catch (error) {
    return Promise.reject({ error });
  }
}

/** verify password */
export async function verifyPassword({ username, password }) {
  try {
    if (username) {
      const { data } = await axios.post('/api/auth/login', {
        username,
        password,
      });
      return Promise.resolve({ data });
    }
  } catch (error) {
    return Promise.reject({ error: "Password doesn't Match...!" });
  }
}
