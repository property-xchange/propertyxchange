import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { locationData } from '../../data/dummyData.js';
import Dashboard from './Dashboard.jsx';
import { FaLinkedin } from 'react-icons/fa';
import { FaWhatsappSquare } from 'react-icons/fa';
import { GrStatusGood } from 'react-icons/gr';
import { FaSquareFacebook } from 'react-icons/fa6';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { AiFillInstagram } from 'react-icons/ai';
import { TbDeviceLandlinePhone } from 'react-icons/tb';
import { FaRegUser } from 'react-icons/fa6';
import { FaRegBuilding } from 'react-icons/fa';
import { FaRegEnvelope } from 'react-icons/fa6';
import { CiWarning } from 'react-icons/ci';
import companyLogo from '../../assets/company_logo.png';
import defaultUserImg from '../../assets/avatar.webp';
import toast, { Toaster } from 'react-hot-toast';
import apiRequest from '../../helper/apiRequest.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import UploadWidget from '../common/page-components/UploadWidget.jsx';

export default function Profile() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [profilePhoto, setProfilePhoto] = useState([]);
  const [companyPhoto, setCompanyPhoto] = useState([]);
  const [accountType, setAccountType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.accountType) {
      setAccountType(currentUser.accountType);
    }
  }, [currentUser]);

  //state and lga
  const [selectedState, setSelectedState] = useState(currentUser.state);
  const [selectedLGA, setSelectedLGA] = useState(currentUser.lga);

  //social links error
  const [facebookLinkErr, setFacebookLinkErr] = useState();
  const [instagramLinkErr, setInstagramLinkErr] = useState();
  const [linkedInLinkErr, setLinkedInLinkErr] = useState();
  const [twitterLinkErr, setTwitterLinkErr] = useState();

  const validateWhatsAppNumber = (number) => {
    if (!number) {
      toast.error('WhatsApp Number is required');
      setIsLoading(false);
      return false;
    }
    return true;
  };

  const validateFirstName = (text) => {
    if (!text) {
      toast.error('First name is required');
      setIsLoading(false);
      return false;
    }
    return true;
  };

  const validateLastName = (text) => {
    if (!text) {
      toast.error('Last name is required');
      setIsLoading(false);
      return false;
    }
    return true;
  };

  const validateAddress = (text) => {
    if (!text) {
      toast.error('Address is required');
      setIsLoading(false);
      return false;
    }
    return true;
  };

  const handleCheckboxChange = (value) => {
    setAccountType(value);
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedLGA('');
  };

  const handleLGAChange = (e) => {
    const newLGA = e.target.value;
    setSelectedLGA(newLGA);
  };

  //social link error warning
  const handleFbkChange = (e) => {
    const input = e.target.value;
    const isValidFbkLink = validateFacebookLink(input);
    if (!isValidFbkLink) {
      setFacebookLinkErr('Invalid facebook URL');
    } else {
      setFacebookLinkErr('');
    }
  };

  const handleInstagramChange = (e) => {
    const input = e.target.value;
    const isValidInstagramLink = validateInstagramLink(input);
    if (!isValidInstagramLink) {
      setInstagramLinkErr('Invalid Instagram URL');
    } else {
      setInstagramLinkErr('');
    }
  };

  const handleLinkedInChange = (e) => {
    const input = e.target.value;
    const isValidLinkedInLink = isValidLinkedInLink(input);
    if (!isValidLinkedInLink) {
      setLinkedInLinkErr('Invalid facebook URL');
    } else {
      setLinkedInLinkErr('');
    }
  };

  const handleTwitterChange = (e) => {
    const input = e.target.value;
    const isValidTwitterLink = validateTwitterLink(input);
    if (!isValidTwitterLink) {
      setTwitterLinkErr('Invalid Twitter URL');
    } else {
      setTwitterLinkErr('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isValidFirstName = validateFirstName(e.target.firstName.value);
    if (!isValidFirstName) {
      setFacebookLinkErr();
    }

    const isValidLastName = validateLastName(e.target.lastName.value);
    if (!isValidLastName) {
      return;
    }

    const isValidWhatsAppNumber = validateWhatsAppNumber(
      e.target.whatsAppNum.value
    );

    if (!isValidWhatsAppNumber) {
      return;
    }

    if (!accountType) {
      toast.error('An account type is required');
      setIsLoading(false);
      return;
    }

    const isValidAddress = validateAddress(e.target.address.value);
    if (!isValidAddress) {
      setIsLoading(false);
      return;
    }

    if (!selectedState) {
      toast.error('A state is required');
      setIsLoading(false);
      return;
    }
    if (!selectedLGA) {
      toast.error('A local government location is required');
      setIsLoading(false);
      return;
    }

    if (
      facebookLinkErr ||
      instagramLinkErr ||
      twitterLinkErr ||
      linkedInLinkErr
    ) {
      toast.error('Please fix the errors in social media links');

      const formData = new FormData(e.target);

      formData.set('facebookLink', '');
      formData.set('instagramLink', '');
      formData.set('twitterLink', '');
      formData.set('linkedInLink', '');

      try {
        const res = await apiRequest.put(`/user/${currentUser.id}`, formData);
        updateUser(res.data);
        setIsLoading(false);
        toast.success(`Updated Successfully`);
      } catch (err) {
        setIsLoading(false);
        toast.error(err.response.data.message);
      }

      return;
    }

    const formData = new FormData(e.target);

    const {
      username,
      email,
      password,
      lastName,
      firstName,
      phoneNumber,
      whatsAppNum,
      companyName,
      companyEmail,
      companyNumber,
      address,
      aboutCompany,
      services,
      facebookLink,
      instagramLink,
      twitterLink,
      linkedInLink,
    } = Object.fromEntries(formData);

    try {
      const res = await apiRequest.put(`/user/${currentUser.id}`, {
        username,
        email,
        password,
        lastName,
        firstName,
        phoneNumber,
        whatsAppNum,
        accountType,
        companyName,
        companyEmail,
        companyNumber,
        state: selectedState,
        lga: selectedLGA,
        address,
        aboutCompany,
        services,
        facebookLink,
        instagramLink,
        twitterLink,
        linkedInLink,
        profilePhoto: profilePhoto[0],
        companyPhoto: companyPhoto[0],
      });
      updateUser(res.data);
      setIsLoading(false);
      toast.success(`Updated Successfully`);
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response.data.message);
    }

    setIsLoading(false);
  };

  // logout functionality
  function userLogout() {
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <Dashboard>
      <main className="p-3 max-w-5xl mx-auto">
        <Toaster position="top-center" reverseOrder={false}></Toaster>
        <h1 className="text-2xl font-semibold text-center my-3 md:mb-7 mb-4 uppercase tracking-widest w-full">
          Profile
        </h1>
        <h4 className="text-center">You can update your profile</h4>
        <div
          className={`${
            !currentUser.verified ? 'bg-red-400' : 'bg-green-400'
          } text-white p-4 h-100 text-center rounded-md mt-3 mb-3 flex-col justify-center items-center  gap-3`}
        >
          <div className="flex justify-center items-center gap-2">
            {!currentUser.verified ? (
              <CiWarning className="text-3xl" />
            ) : (
              <GrStatusGood className="text-3xl" />
            )}
            <h1 className="sm:text-lg text-sm font-semibold">
              {!currentUser.verified
                ? 'Account not verified!'
                : 'Congratulations your account is verified!'}
            </h1>
          </div>
          {!currentUser.verified && (
            <div className="flex justify-center items-center gap-2">
              <h2 className="sm:text-sm text-xs">
                Verify your account to get our verification badge on your
                profile.
              </h2>
              <Link className="underline text-sm" to="/verify">
                Get Started
              </Link>
            </div>
          )}
        </div>
        <form
          className="flex flex-col md:flex-row gap-8"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col flex-1 gap-9 text-sm">
            <div className="flex sm:flex-row flex-col gap-3 justify-center items-center">
              <div className="flex flex-col mr-1">
                <div>
                  <img
                    src={
                      profilePhoto[0] ||
                      currentUser.profilePhoto ||
                      defaultUserImg
                    }
                    alt="profile image"
                    className="h-[100px] w-[100px] rounded-full"
                  />
                  <UploadWidget
                    uwConfig={{
                      cloudName: 'calstech',
                      uploadPreset: 'estate',
                      multiple: false,
                      maxImageFileSize: 2000000,
                      folder: 'avatars',
                    }}
                    setState={setProfilePhoto}
                  />
                  {defaultUserImg && (
                    <p className="text-[10px] text-center leading-[1.2em] mt-1">
                      Click to upload your <br /> profile picture
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-grow">
                <input
                  type="text"
                  placeholder="Username"
                  id="username"
                  className="border p-3 rounded-lg input"
                  name="username"
                  defaultValue={currentUser.username}
                />
                <input
                  type="email"
                  placeholder="email"
                  id="email"
                  className="border p-3 rounded-lg input"
                  name="email"
                  defaultValue={currentUser.email}
                />
                {/* <Link
                  className="bg-slate-700 rounded-lg p-3 uppercase text-center hover:opacity-95 disabled:opacity-80 hover:bg-primary transition-all duration-300"
                  to="/recovery"
                >
                  Reset Password
                </Link> */}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 justify-start items-center  p-2 rounded-lg">
                <FaRegUser className=" text-gray-400 text-xl" />
                <div className="flex gap-2 w-full sm:flex-row flex-col">
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full border rounded-lg input"
                    id="lastName"
                    name="lastName"
                    defaultValue={currentUser.lastName}
                  />
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full border rounded-lg input"
                    id="firstName"
                    name="firstName"
                    defaultValue={currentUser.firstName}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-start items-center p-2 rounded-lg">
                <TbDeviceLandlinePhone className=" text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Phone Number "
                  className="w-full border rounded-lg input"
                  id="phoneNumber"
                  name="phoneNumber"
                  defaultValue={currentUser.phoneNumber}
                />
              </div>
              <div className="flex gap-3 justify-start items-center rounded-lg p-2">
                <FaWhatsappSquare className=" text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="WhatsApp Number"
                  className="w-full border rounded-lg input"
                  id="whatsAppNum"
                  name="whatsAppNum"
                  defaultValue={currentUser.whatsAppNum}
                />
              </div>
            </div>
            <div className="flex justify-evenly flex-wrap">
              <div className="flex mt-3">
                <input
                  type="checkbox"
                  id="individual"
                  name="individual"
                  className="w-5 mr-1"
                  onChange={() => handleCheckboxChange('individual')}
                  checked={accountType === 'individual'}
                />
                <span>Individual Agent</span>
              </div>
              <div className="flex mt-3">
                <input
                  type="checkbox"
                  id="developer"
                  name="developer"
                  onChange={() => handleCheckboxChange('developer')}
                  checked={accountType === 'developer'}
                  className="w-5 mr-1"
                />
                <span>Developer</span>
              </div>
              <div className="flex mt-3">
                <input
                  type="checkbox"
                  id="law"
                  name="law"
                  className="w-5 mr-1"
                  onChange={() => handleCheckboxChange('law')}
                  checked={accountType === 'law'}
                />
                <span>Law Firm</span>
              </div>
              <div className="flex mt-3">
                <input
                  type="checkbox"
                  id="survey"
                  name="survey"
                  className="w-5 mr-1"
                  onChange={() => handleCheckboxChange('survey')}
                  checked={accountType === 'survey'}
                />
                <span>Estate Surveying Firm </span>
              </div>
              <div className="flex mt-3">
                <input
                  type="checkbox"
                  id="organization"
                  name="organization"
                  className="w-5 mr-1"
                  onChange={() => handleCheckboxChange('organization')}
                  checked={accountType === 'organization'}
                />
                <span>Real Estate Organization</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-center items-center sm:flex-row flex-col">
                <div className="flex flex-col mr-3">
                  <div>
                    <img
                      src={
                        companyPhoto[0] ||
                        currentUser.companyPhoto ||
                        companyLogo
                      }
                      alt="company image"
                      className="h-[100px] w-[100px] rounded-full"
                    />
                    <UploadWidget
                      uwConfig={{
                        cloudName: 'calstech',
                        uploadPreset: 'estate',
                        multiple: true,
                        maxImageFileSize: 2000000,
                        folder: 'logo',
                      }}
                      setState={setCompanyPhoto}
                    />
                    {companyLogo && (
                      <p className="text-[10px] text-center leading-[1.2em] mt-1">
                        Click to upload your <br /> company logo
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 flex-grow">
                  <div className="flex gap-3 justify-start items-center p-2 rounded-lg">
                    <FaRegBuilding className=" text-gray-400 text-xl" />
                    <input
                      type="text"
                      placeholder="Company Name"
                      className="w-full border rounded-lg input"
                      id="companyName"
                      name="companyName"
                      defaultValue={currentUser.companyName}
                    />
                  </div>
                  <div className="flex gap-3 justify-start items-center p-2 rounded-lg">
                    <FaRegEnvelope className=" text-gray-400 text-xl" />
                    <input
                      type="email"
                      placeholder="Company email"
                      className="w-full border rounded-lg input"
                      id="companyEmail"
                      name="companyEmail"
                      defaultValue={currentUser.companyEmail}
                    />
                  </div>
                  <div className="flex gap-3 justify-start items-center p-2 rounded-lg">
                    <TbDeviceLandlinePhone className=" text-gray-400 text-xl" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full border rounded-lg input"
                      id="companyNumber"
                      name="companyNumber"
                      defaultValue={currentUser.companyNumber}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3 sm:flex-row flex-col">
                <div className="sm:w-[50%] w-full">
                  <label htmlFor="state" className="mr-3">
                    State:
                  </label>
                  <select
                    className="border p-3 rounded-lg input w-[70%]"
                    id="state"
                    name="state"
                    value={selectedState || currentUser.state}
                    onChange={handleStateChange}
                  >
                    <option value="">Select State</option>
                    {locationData.map((location) => (
                      <option key={location.state} value={location.state}>
                        {location.state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:w-[50%] w-full">
                  <label htmlFor="lga" className="mr-3">
                    LGA:
                  </label>
                  <select
                    className="border p-3 rounded-lg input w-[70%]"
                    id="lga"
                    value={selectedLGA || currentUser.lga}
                    onChange={handleLGAChange}
                    disabled={!selectedState}
                  >
                    <option
                      value=""
                      className="bg-secondary text-white rounded-md"
                    >
                      Select LGA
                    </option>
                    {locationData
                      .find((location) => location.state === selectedState)
                      ?.lga.map((lga) => (
                        <option
                          key={lga}
                          value={lga}
                          className="bg-secondary text-white rounded-md"
                        >
                          {lga}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <input
                type="text"
                placeholder="Address"
                className="border p-3 rounded-lg input"
                id="address"
                name="address"
                defaultValue={currentUser.address}
              />
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-9 text-sm">
            <div className="flex flex-col gap-3">
              <textarea
                type="text"
                placeholder="About your company"
                className="border p-3 rounded-lg input"
                id="aboutCompany"
                rows={5}
                name="aboutCompany"
                defaultValue={currentUser.aboutCompany}
              />
              <textarea
                type="text"
                placeholder="Services you provide eg facility Management"
                className="border p-3 rounded-lg input"
                id="services"
                rows={5}
                name="services"
                defaultValue={currentUser.services}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Instagram link</p>
                <div className="flex gap-3 justify-start items-center  p-2 rounded-lg">
                  <AiFillInstagram className=" text-gray-400 text-xl" />
                  <input
                    type="url"
                    placeholder="eg: https://www.instagram.com/propertyxhange"
                    className="w-full rounded-lg input"
                    id="instagramLink"
                    name="instagramLink"
                    onChange={handleInstagramChange}
                    onInvalid={(e) => e.preventDefault()}
                    defaultValue={currentUser.instagramLink}
                  />
                </div>
                {instagramLinkErr && (
                  <p className="text-red-400 text-xs">Invalid instagram URL</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Twitter link</p>
                <div className="flex gap-3 justify-start items-center  p-2 rounded-lg">
                  <FaSquareXTwitter className=" text-gray-400 text-xl" />
                  <input
                    type="url"
                    placeholder="eg: https://www.twitter.com/propertyxhange"
                    className="w-full rounded-lg input"
                    id="twitterLink"
                    name="twitterLink"
                    onChange={handleTwitterChange}
                    onInvalid={(e) => e.preventDefault()}
                    defaultValue={currentUser.twitterLink}
                  />
                </div>
                {twitterLinkErr && (
                  <p className="text-red-400 text-xs">Invalid twitter URL</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">LinkedIn link</p>
                <div className="flex gap-3 justify-start items-center  p-2 rounded-lg">
                  <FaLinkedin className="text-gray-400 text-xl" />
                  <input
                    type="url"
                    placeholder="eg: https://www.linkedIn.com/propertyxhange"
                    className="w-full p-3 rounded-lg input"
                    id="linkedInLink"
                    name="linkedInLink"
                    onChange={handleLinkedInChange}
                    onInvalid={(e) => e.preventDefault()}
                    defaultValue={currentUser.linkedInLink}
                  />
                </div>
                {linkedInLinkErr && (
                  <p className="text-red-400 text-xs">Invalid linkedIn URL</p>
                )}
              </div>
              <div className="w-[100%]">
                <p className="text-xs text-gray-400 mb-1">Facebook link</p>
                <div className="flex gap-3 justify-start items-center p-2 rounded-lg">
                  <FaSquareFacebook className=" text-gray-400 text-xl" />
                  <input
                    type="url"
                    placeholder="eg: https://www.facebook.com/propertyxhange"
                    className="w-full p-3 rounded-lg input"
                    id="facebookLink"
                    name="facebookLink"
                    onChange={handleFbkChange}
                    onInvalid={(e) => e.preventDefault()}
                    defaultValue={currentUser.facebookLink}
                  />
                </div>
                {facebookLinkErr && (
                  <p className="text-red-400 text-xs">Invalid facebook URL</p>
                )}
              </div>
            </div>
            <button
              className={`bg-slate-700 rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80 hover:bg-primary transition-all duration-300 text-white ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Updating' : 'Update'}
            </button>
            <div className="flex justify-center">
              <span className="text-gray-500">
                come back later?{' '}
                <button onClick={userLogout} className="text-red-500" to="/">
                  Logout
                </button>
              </span>
            </div>
          </div>
        </form>
      </main>
    </Dashboard>
  );
}
