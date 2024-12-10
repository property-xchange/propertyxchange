import toast from 'react-hot-toast';
import { authenticate } from './helper';

// validate login page username form
export async function usernameValidate(values) {
  const errors = usernameVerify({}, values);
  //check user values input
  if (values.username) {
    const { status } = await authenticate(values.username);
    if (status !== 200) {
      errors.exist = toast.error(
        'User does not exist! Please sign in or register'
      );
    }
  }
  return errors;
}

// validate password form
export async function passwordValidate(values) {
  const errors = passwordVerify({}, values);
  return errors;
}

// validate reset password form
export async function resetPasswordValidation(values) {
  const errors = passwordVerify({}, values);

  if (values.password !== values.confirm_password) {
    errors.exist = toast.error('Password not match!');
  }

  return errors;
}

//validate register form
export async function registerValidation(values) {
  const errors = usernameVerify({}, values);
  passwordVerify(errors, values);
  emailVerify(errors, values);

  return errors;
}

//validate profile form
export async function profileValidation(values) {
  const errors = emailVerify({}, values);
  firstNameVerify(errors, values);
  lastNameVerify(errors, values);
  phoneNumberVerify(errors, values);
  accountTypeVerify(errors, values);

  return errors;
}

//validate login form
export async function loginValidate(values) {
  let errors = passwordVerify({}, values);
  usernameVerify(errors, values);

  return errors;
}
////////////////////////////////////////////////

// validate username
function usernameVerify(error = {}, values) {
  if (!values.username) {
    error.username = toast.error('Username Required!');
  } else if (values.username.includes(' ')) {
    error.username = toast.error('Invalid Username!');
  }
  return error;
}

//validate email
function emailVerify(error = {}, values) {
  if (!values.email) {
    error.email = toast.error('Email Required!');
  } else if (values.email.includes(' ')) {
    error.email = toast.error('Wrong Email!');
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    error.email = toast.error('Invalid email address!');
  }

  return error;
}

// validate password
function passwordVerify(errors = {}, values) {
  /* eslint-disable no-useless-escape */
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

  if (!values.password) {
    errors.password = toast.error('Password Required!');
  } else if (values.password.includes(' ')) {
    errors.password = toast.error('Wrong Password!');
  } else if (values.password.length < 5) {
    errors.password = toast.error(
      'Password must be more than 5 characters long'
    );
  } else if (!specialChars.test(values.password)) {
    errors.password = toast.error('Password must have special character');
  }

  return errors;
}

// validate first name
function firstNameVerify(error = {}, values) {
  if (!values.firstName) {
    error.firstName = toast.error('First name is required!');
  }
  return error;
}
// validate last name
function lastNameVerify(error = {}, values) {
  if (!values.lastName) {
    error.lastName = toast.error('Last name is required!');
  }
  return error;
}
// validate phone number
function phoneNumberVerify(error = {}, values) {
  if (!values.phoneNumber) {
    error.phoneNumber = toast.error('Phone Number is required!');
  }
  return error;
}
// validate accountType
function accountTypeVerify(error = {}, values) {
  if (!values.accountType) {
    error.accountType = toast.error('An agent category is required!');
  }
  return error;
}

///////////////valid social link
// Validate Facebook link
export const validateFacebookLink = (inputValue) => {
  const isValidFacebookLink = /^(https?:\/\/)?(www\.)?facebook\.com/.test(
    inputValue
  );
  if (isValidFacebookLink) {
    return inputValue;
  } else {
    return null;
  }
};

// Validate Instagram link
export const validateInstagramLink = (inputValue) => {
  const isValidInstagramLink = /^(https?:\/\/)?(www\.)?instagram\.com/.test(
    inputValue
  );
  if (isValidInstagramLink) {
    return inputValue;
  } else {
    return null;
  }
};

// Validate Twitter link
export const validateTwitterLink = (inputValue) => {
  const isValidTwitterLink = /^(https?:\/\/)?(www\.)?twitter\.com/.test(
    inputValue
  );
  if (isValidTwitterLink) {
    return inputValue;
  } else {
    return null;
  }
};

// Validate LinkedIn link
export const validateLinkedInLink = (inputValue) => {
  const isValidLinkedInLink = /^(https?:\/\/)?(www\.)?linkedin\.com/.test(
    inputValue
  );
  if (isValidLinkedInLink) {
    return inputValue;
  } else {
    return null;
  }
};

// Validate youtube link
export const validateYouTubeLink = (inputValue) => {
  const isValidYouTubeLink =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(inputValue);
  if (isValidYouTubeLink) {
    return inputValue;
  } else {
    return null;
  }
};
