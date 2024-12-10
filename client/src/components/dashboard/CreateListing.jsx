import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BsYoutube } from 'react-icons/bs';
import { BiLogoInstagramAlt } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import {
  locationData,
  listingType,
  listingFeatures,
} from '../../data/dummyData.js';
import Dashboard from './Dashboard.jsx';
import {
  validateYouTubeLink,
  validateInstagramLink,
} from '../../helper/validate.js';
import apiRequest from '../../helper/apiRequest.js';
import toast, { Toaster } from 'react-hot-toast';
import UploadWidget from '../common/page-components/UploadWidget.jsx';
import { setCurrentProperty } from '../../redux/features/dataSlice.js';
import TextEditor from '../common/page-components/TextEditor.jsx';

export default function CreateListing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [purpose, setPurpose] = useState();

  //Listing Type and SubType
  const [selectedType, setSelectedType] = useState();
  const [selectedSubType, setSelectedSubType] = useState();

  //Listing DESCRIPTION
  const [description, setDescription] = useState('');

  //show more features
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  //state and lga
  const [selectedState, setSelectedState] = useState();
  const [selectedLGA, setSelectedLGA] = useState();

  //show discount or Installments
  const [showDiscount, setShowDiscount] = useState(false);
  const [showInstallment, setShowInstallment] = useState(false);

  //state for regular price, discount price and percentage
  const [regularPrice, setRegularPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');

  //social links
  const [instagramLinkErr, setInstagramLinkErr] = useState();
  const [youTubeLinkErr, setYouTubeLinkErr] = useState();

  //Booleans
  const [isServiced, setIsServiced] = useState(false);
  const [isFurnished, setIsFurnished] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [isNewlyBuilt, setIsNewlyBuilt] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const toggleDiscount = () => setShowDiscount(!showDiscount);
  const toggleInstallment = () => setShowInstallment(!showInstallment);

  //handle purpose
  const handleCheckboxChange = (value) => {
    setPurpose(value);
  };

  //handle type change
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    setSelectedSubType('');
  };

  //handle subtype change
  const handleSubTypeChange = (e) => {
    const subType = e.target.value;
    setSelectedSubType(subType);
  };

  const handleBooleanChange = (booleans) => {
    switch (booleans) {
      case 'serviced':
        setIsServiced(!isServiced);
        break;
      case 'furnished':
        setIsFurnished(!isFurnished);
        break;
      case 'parking':
        setHasParking(!hasParking);
        break;
      case 'newlyBuilt':
        setIsNewlyBuilt(!isNewlyBuilt);
        break;
      default:
        break;
    }
  };

  //handle features
  const moreFeatures = () => {
    setShowMoreFeatures(!showMoreFeatures);
  };
  const handleFeatureChange = (feature) => {
    setSelectedFeatures((prevFeatures) => {
      if (prevFeatures.includes(feature)) {
        return prevFeatures.filter((f) => f !== feature);
      } else {
        return [...prevFeatures, feature];
      }
    });
  };

  //state
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedLGA('');
  };

  //lga
  const handleLGAChange = (e) => {
    const newLGA = e.target.value;
    setSelectedLGA(newLGA);
  };

  //handle discount price and percentage
  const handleDiscountPercentageChange = (e) => {
    const value = e.target.value;
    setDiscountPercentage(value);
    const discountAmount = (value / 100) * regularPrice;
    if (regularPrice) {
      setDiscountPrice((regularPrice - discountAmount).toFixed(2));
    }
  };

  const handleDiscountPriceChange = (e) => {
    const value = e.target.value;
    const discountPercentage = (value / regularPrice) * 100;

    setDiscountPrice(value);
    if (regularPrice) {
      setDiscountPercentage((100 - discountPercentage).toFixed(2));
    }
  };

  //handle current date
  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed.
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  //handle social link
  const handleInstagramChange = (e) => {
    const input = e.target.value;
    const isValidInstagramLink = validateInstagramLink(input);
    if (!isValidInstagramLink) {
      setInstagramLinkErr('Invalid Instagram URL');
    } else {
      setInstagramLinkErr('');
    }
  };

  const handleYouTubeChange = (e) => {
    const input = e.target.value;
    const isValidYouTubeLink = validateYouTubeLink(input);
    if (!isValidYouTubeLink) {
      setYouTubeLinkErr('Invalid YouTube URL');
    } else {
      setYouTubeLinkErr('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const errors = [];
    if (!purpose) errors.push('A purpose is required');
    if (!description) errors.push('A description is required');
    if (!selectedType) errors.push('A type is required');
    if (!selectedSubType) errors.push('A subtype is required');
    if (!selectedState) errors.push('A state is required');
    if (!selectedLGA) errors.push('A local government location is required');

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      setIsLoading(false);
      return;
    }

    if (instagramLinkErr || youTubeLinkErr) {
      toast.error('Please fix the errors in your social media links');

      const formData = new FormData(e.target);

      formData.set('instagramLink', '');
      formData.set('youtubeLink', '');

      const inputs = Object.fromEntries(formData);

      if (!inputs.name) {
        toast.error('A title of the property is required');
        setIsLoading(false);
        return;
      }

      if (!inputs.street) {
        toast.error('A street or address is required');
        setIsLoading(false);
        return;
      }

      if (!inputs.price) {
        toast.error('The price is required');
        setIsLoading(false);
        return;
      }

      if (
        (purpose === 'short-let' ||
          purpose === 'rent' ||
          purpose === 'joint-venture') &&
        !inputs.appendTo
      ) {
        toast.error(
          'Append the time period for rent, short-let or joint-venture'
        );
        setIsLoading(false);
        return;
      }

      if (parseFloat(inputs.initialPayment) > parseFloat(inputs.price)) {
        toast.error('Initial payment cannot be greater than price');
        setIsLoading(false);
        return;
      }

      if (
        parseFloat(inputs.initialPayment) > parseFloat(inputs.discountPrice)
      ) {
        toast.error('Initial payment cannot be greater than discount price');
        setIsLoading(false);
        return;
      }

      if (parseFloat(inputs.discountPrice) > parseFloat(inputs.price)) {
        toast.error('Discount price cannot be greater than price');
        setIsLoading(false);
        return;
      }

      if (
        parseFloat(inputs.monthlyPayment) > parseFloat(inputs.discountPrice)
      ) {
        toast.error('Monthly payment cannot be greater than discount price');
        setIsLoading(false);
        return;
      }

      if (parseFloat(inputs.monthlyPayment) > parseFloat(inputs.price)) {
        toast.error('Monthly payment cannot be greater than discount price');
        setIsLoading(false);
        return;
      }
      let discountEndDate = null;
      if (inputs.discountEndDate) {
        discountEndDate = new Date(
          inputs.discountEndDate + 'T00:00:00Z'
        ).toISOString();
      }
      try {
        const res = await apiRequest.post('/listing', {
          name: inputs.name,
          price: parseFloat(inputs.price),
          purpose,
          number_of_beds: parseInt(inputs.number_of_beds),
          number_of_bathrooms: parseInt(inputs.number_of_bathrooms),
          toilets: parseInt(inputs.toilets),
          latitude: inputs.latitude,
          longitude: inputs.longitude,
          discountPercent: parseFloat(inputs.discountPercentage),
          discountPrice: parseFloat(inputs.discountPrice),
          discountEndDate,
          installment: showInstallment,
          appendTo: inputs.appendTo,
          installmentAppendTo: inputs.installmentAppendTo,
          initialPayment: parseFloat(inputs.initialPayment),
          monthlyPayment: parseFloat(inputs.monthlyPayment),
          duration: parseInt(inputs.duration),
          furnished: isFurnished,
          serviced: isServiced,
          newlyBuilt: isNewlyBuilt,
          parking: hasParking,
          offer: showDiscount,
          youtubeLink: inputs.youtubeLink,
          instagramLink: inputs.instagramLink,
          type: selectedType,
          subType: selectedSubType,
          features: selectedFeatures,
          street: inputs.street,
          lga: selectedLGA,
          state: selectedState,
          description: description,
          images: images,
        });
        setIsLoading(false);
        toast.success(`Listing created Successfully`);
        navigate('/property/' + res.data.id);
      } catch (err) {
        setIsLoading(false);
        toast.error(err.response.data.message);
      }
      setIsLoading(false);
    }

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    // New validations for coordinates and images
    if (!inputs.latitude || inputs.latitude.trim() === '') {
      errors.push('Latitude is required');
    }
    if (!inputs.longitude || inputs.longitude.trim() === '') {
      errors.push('Longitude is required');
    }
    if (!images || images.length === 0) {
      errors.push('At least one property image is required');
    }
    if (images && images.length > 14) {
      errors.push('Maximum of 14 images allowed');
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      setIsLoading(false);
      return;
    }

    // Validate coordinate format (optional but recommended)
    const latitudeRegex = /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/;
    const longitudeRegex = /^-?((1[0-7]|[1-9])?[0-9](\.[0-9]+)?|180(\.0+)?)$/;

    if (inputs.latitude && !latitudeRegex.test(inputs.latitude)) {
      errors.push('Invalid latitude format (must be between -90 and 90)');
    }
    if (inputs.longitude && !longitudeRegex.test(inputs.longitude)) {
      errors.push('Invalid longitude format (must be between -180 and 180)');
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      setIsLoading(false);
      return;
    }

    if (!inputs.name) {
      toast.error('A title of the property is required');
      setIsLoading(false);
      return;
    }

    if (
      (purpose === 'short-let' ||
        purpose === 'rent' ||
        purpose === 'joint-venture') &&
      !inputs.appendTo
    ) {
      toast.error('Append the period for rent, short-let or joint-venture');
      setIsLoading(false);
      return;
    }

    if (!inputs.street) {
      toast.error('A street or address is required');
      setIsLoading(false);
      return;
    }

    if (!inputs.price) {
      toast.error('The regular price is required');
      setIsLoading(false);
      return;
    }

    if (parseFloat(inputs.initialPayment) > parseFloat(inputs.price)) {
      toast.error('Initial payment cannot be greater than regular price');
      setIsLoading(false);
      return;
    }

    if (parseFloat(inputs.initialPayment) > parseFloat(inputs.discountPrice)) {
      toast.error('Initial payment cannot be greater than discount price');
      setIsLoading(false);
      return;
    }

    if (parseFloat(inputs.monthlyPayment) > parseFloat(inputs.discountPrice)) {
      toast.error('Monthly payment cannot be greater than discount price');
      setIsLoading(false);
      return;
    }

    if (parseFloat(inputs.monthlyPayment) > parseFloat(inputs.price)) {
      toast.error('Monthly payment cannot be greater than regular price');
      setIsLoading(false);
      return;
    }

    if (parseFloat(inputs.discountPrice) > parseFloat(inputs.price)) {
      toast.error('Discount price cannot be greater than price');
      setIsLoading(false);
      return;
    }
    let discountEndDate = null;
    if (inputs.discountEndDate) {
      discountEndDate = new Date(
        inputs.discountEndDate + 'T00:00:00Z'
      ).toISOString();
    }
    try {
      const res = await apiRequest.post('/listing', {
        name: inputs.name,
        price: parseFloat(inputs.price),
        purpose,
        number_of_beds: parseInt(inputs.number_of_beds),
        number_of_bathrooms: parseInt(inputs.number_of_bathrooms),
        toilets: parseInt(inputs.toilets),
        latitude: inputs.latitude,
        longitude: inputs.longitude,
        discountPercent: parseFloat(inputs.discountPercentage),
        discountPrice: parseFloat(inputs.discountPrice),
        discountEndDate,
        installment: showInstallment,
        appendTo: inputs.appendTo,
        installmentAppendTo: inputs.installmentAppendTo,
        initialPayment: parseFloat(inputs.initialPayment),
        monthlyPayment: parseFloat(inputs.monthlyPayment),
        duration: parseInt(inputs.duration),
        furnished: isFurnished,
        serviced: isServiced,
        newlyBuilt: isNewlyBuilt,
        parking: hasParking,
        offer: showDiscount,
        youtubeLink: inputs.youtubeLink,
        instagramLink: inputs.instagramLink,
        type: selectedType,
        subType: selectedSubType,
        features: selectedFeatures,
        street: inputs.street,
        lga: selectedLGA,
        state: selectedState,
        description: description,
        images: images,
      });
      setIsLoading(false);
      toast.success(`Listing created Successfully`);
      navigate('/property/' + res.data.id);
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response.data.message);
    }
    setIsLoading(false);
  };

  return (
    <Dashboard>
      <main className="p-3 max-w-4xl mx-auto">
        <Toaster position="top-center" reverseOrder={false}></Toaster>
        <h1 className="text-2xl font-semibold text-center my-3 md:mb-7 mb-4 uppercase tracking-widest">
          Post a property
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-8"
        >
          <div className="flex flex-col flex-1 gap-9 text-sm">
            <div className="flex flex-col gap-3">
              <h2 className="uppercase font-bold text-gray-400">Name</h2>
              <input
                type="text"
                placeholder="Title eg: Furnished 2 Bedroom Duplex"
                className="border rounded-lg input"
                id="name"
                name="name"
                maxLength="62"
                minLength="10"
              />
              <div className="flex justify-between gap-3 sm:flex-row flex-col">
                <div className="flex flex-col w-full mt-3 sm:mt-0">
                  <label htmlFor="type" className=" mb-1">
                    Type:
                  </label>
                  <select
                    className="border rounded-lg  appearance-none input"
                    id="type"
                    name="type"
                    value={selectedType}
                    onChange={handleTypeChange}
                  >
                    <option
                      value=""
                      className="bg-secondary text-white rounded-md"
                    >
                      Select Type
                    </option>
                    {listingType.map((index) => (
                      <option
                        key={index.type}
                        value={index.type}
                        className="bg-secondary text-white rounded-md"
                      >
                        {index.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col w-full">
                  <label htmlFor="subType" className="mb-1">
                    SubType(Optional):
                  </label>
                  <select
                    className="border rounded-lg  appearance-none input"
                    id="subType"
                    name="subType"
                    value={selectedSubType}
                    onChange={handleSubTypeChange}
                    disabled={!selectedType}
                  >
                    <option
                      value=""
                      className="bg-secondary text-white rounded-md"
                    >
                      Select SubType
                    </option>
                    {listingType
                      .find((index) => index.type === selectedType)
                      ?.subType.map((subType) => (
                        <option
                          key={subType}
                          value={subType}
                          className="bg-secondary text-white rounded-md"
                        >
                          {subType}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="uppercase font-bold text-gray-400">Purpose</h2>
              <div className="flex justify-between flex-wrap">
                <div className="flex mt-2">
                  <input
                    type="checkbox"
                    id="sale"
                    name="sale"
                    className="w-4 mr-3 input border"
                    onChange={() => handleCheckboxChange('sale')}
                    checked={purpose === 'sale'}
                  />
                  <span className="mr-3 sm:mr-4">Sell</span>
                </div>
                <div className="flex mt-2">
                  <input
                    type="checkbox"
                    id="rent"
                    name="rent"
                    className="w-4 mr-3 input"
                    onChange={() => handleCheckboxChange('rent')}
                    checked={purpose === 'rent'}
                  />
                  <span className="mr-3 sm:mr-4">Rent</span>
                </div>
                <div className="flex mt-2">
                  <input
                    type="checkbox"
                    id="short-let"
                    name="short-let"
                    className="w-4 mr-3 input"
                    onChange={() => handleCheckboxChange('short-let')}
                    checked={purpose === 'short-let'}
                  />
                  <span className="mr-3 sm:mr-4">Short let</span>
                </div>
                <div className="flex mt-2">
                  <input
                    type="checkbox"
                    id="joint-venture"
                    name="joint-venture"
                    className="w-4 mr-3 input"
                    onChange={() => handleCheckboxChange('joint-venture')}
                    checked={purpose === 'joint-venture'}
                  />
                  <span className="mr-3 sm:mr-4">Joint Venture</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-7">
              <h2 className="uppercase font-bold text-gray-400">Description</h2>
              <TextEditor
                initialValue={description}
                onChange={(newValue) => setDescription(newValue)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="uppercase font-bold text-gray-400">Features</h2>
              <div className="flex gap-4 flex-wrap">
                <div className="flex">
                  <input
                    type="checkbox"
                    id="parking"
                    name="parking"
                    className="w-4 mr-3"
                    checked={hasParking}
                    onChange={() => handleBooleanChange('parking')}
                  />
                  <span>Parking Spot</span>
                </div>
                <div className="flex">
                  <input
                    type="checkbox"
                    id="serviced"
                    name="serviced"
                    className="w-4 mr-3"
                    checked={isServiced}
                    onChange={() => handleBooleanChange('serviced')}
                  />
                  <span>Serviced</span>
                </div>
                <div className="flex">
                  <input
                    type="checkbox"
                    id="newlyBuilt"
                    name="newlyBuilt"
                    className="w-4 mr-3"
                    checked={isNewlyBuilt}
                    onChange={() => handleBooleanChange('newlyBuilt')}
                  />
                  <span>Newly Built</span>
                </div>
                <div className="flex">
                  <input
                    type="checkbox"
                    id="furnished"
                    name="furnished"
                    className="w-4 mr-3"
                    checked={isFurnished}
                    onChange={() => handleBooleanChange('furnished')}
                  />
                  <span>Furnished</span>
                </div>
                <div className="w-full">
                  <p
                    onClick={moreFeatures}
                    className="font-bold underline text-blue-500 cursor-pointer mb-2"
                  >
                    Click to select more features
                  </p>
                  {showMoreFeatures && (
                    <div className="w-full bg-gray-600 text-white flex flex-wrap text-xs gap-3 rounded-md p-4">
                      {listingFeatures.map((item, index) => (
                        <div className="flex" key={index}>
                          <input
                            type="checkbox"
                            name={item}
                            id={item}
                            className="w-3 mr-1"
                            onChange={() => handleFeatureChange(item)}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-around gap-2 w-[100%]">
                <div className="flex items-center">
                  <input
                    type="number"
                    id="number_of_beds"
                    name="number_of_beds"
                    min="0"
                    step={1}
                    className="border rounded-lg mr-3 w-[50%] input"
                  />
                  <p>Beds</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="number_of_bathrooms"
                    name="number_of_bathrooms"
                    min="0"
                    step={1}
                    className="border rounded-lg mr-3 w-[50%] input"
                  />
                  <p>Bathrooms</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="toilets"
                    name="toilets"
                    min="0"
                    step={1}
                    className="border rounded-lg mr-3 w-[50%] input"
                  />
                  <p>Toilets</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <h2 className="uppercase font-bold text-gray-400">Location</h2>
              <div className="flex justify-between gap-3 w-full  sm:flex-row flex-col">
                <div className="flex justify-start items-center w-full">
                  <label htmlFor="state" className="mr-3">
                    State:
                  </label>
                  <select
                    className="border rounded-lg w-[70%] input appearance-none"
                    id="state"
                    name="state"
                    value={selectedState}
                    onChange={handleStateChange}
                  >
                    <option
                      value=""
                      className="bg-secondary text-white rounded-md"
                    >
                      Select State
                    </option>
                    {locationData.map((index) => (
                      <option
                        key={index.state}
                        value={index.state}
                        className="bg-secondary text-white rounded-md"
                      >
                        {index.state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-start sm:justify-end items-center">
                  <label htmlFor="lga" className="mr-3">
                    LGA:
                  </label>
                  <select
                    className="border input rounded-lg"
                    id="lga"
                    name="lga"
                    value={selectedLGA}
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
              <p className="font-semibold text-xs">
                Note:
                <span className="font-normal text-gray-400 ml-2">
                  Enter digits only for both longitude and latitude
                </span>
              </p>
              <div className="flex justify-between sm:flex-row flex-col">
                <input
                  type="text"
                  name="latitude"
                  placeholder="lat. eg 9.0623438"
                  id="latitude"
                  className="border input rounded-lg sm:mb-0 mb-2"
                />
                <input
                  type="text"
                  name="longitude"
                  placeholder="long. eg 7.5188337"
                  id="longitude"
                  className="border input rounded-lg sm:mb-0 mb-4"
                />
              </div>
              <input
                type="text"
                placeholder="Street"
                className="border input rounded-lg"
                id="street"
                name="street"
              />
            </div>
          </div>

          <div className="flex flex-col flex-1 gap-9 text-sm">
            <div className="flex flex-col gap-3">
              <h2 className="uppercase font-bold text-gray-400">
                PRICING & Discount
              </h2>
              <div className="flex gap-6 justify-between ">
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    id="offer"
                    name="offer"
                    className="w-4 input"
                    onChange={toggleDiscount}
                  />
                  <span>Discount</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    id="installment"
                    name="installment"
                    onChange={toggleInstallment}
                    className="w-4 input"
                  />
                  <span>Installment</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-[100%]">
                <div className="flex gap-3">
                  <div className="flex flex-col">
                    <p className="mb-1">
                      Regular price <span>(₦)</span>
                    </p>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      min="1"
                      placeholder="eg 1000000"
                      className=" border rounded-lg w-[100%] input"
                      onChange={(e) => setRegularPrice(e.target.value)}
                    />
                  </div>
                  {(purpose === 'rent' ||
                    purpose === 'short-let' ||
                    purpose === 'joint-venture') && (
                    <div className="flex flex-col justify-end">
                      <p className="mb-1">Append to</p>
                      <select
                        className="border input rounded-lg"
                        id="appendTo"
                        name="appendTo"
                      >
                        <option className="bg-secondary text-white" value="">
                          select...
                        </option>
                        <option
                          className="bg-secondary text-white"
                          value="/month"
                        >
                          /month
                        </option>
                        <option className="bg-secondary text-white" value="/yr">
                          /year
                        </option>
                        <option
                          className="bg-secondary text-white"
                          value="/sqm"
                        >
                          /sqm
                        </option>
                      </select>
                    </div>
                  )}
                </div>
                {/* offer logic */}
                {showDiscount && (
                  <div className="flex gap-3">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="mb-1 text-xs">
                          Discount price <span>(₦)</span>
                        </p>
                        <input
                          type="number"
                          id="discountPrice"
                          name="discountPrice"
                          placeholder="eg ₦500000"
                          min="0"
                          className="border input rounded-lg w-[100%]"
                          value={discountPrice}
                          onChange={handleDiscountPriceChange}
                        />
                      </div>
                      <div>
                        <p className="mb-1 text-xs">% Discount</p>
                        <input
                          type="number"
                          placeholder="eg 50%"
                          id="discountPercentage"
                          name="discountPercentage"
                          min="0"
                          step={0.02}
                          className="border input rounded-lg w-[100%]"
                          value={discountPercentage}
                          onChange={handleDiscountPercentageChange}
                          onInvalid={(e) => e.preventDefault()}
                        />
                      </div>
                      <div>
                        <p className="mb-1 text-xs">Expire Date</p>
                        <input
                          type="date"
                          id="discountEndDate"
                          name="discountEndDate"
                          className="border input rounded-lg w-[100%]"
                          min={getCurrentDate()}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* installment logic*/}
                {showInstallment && (
                  <div className="flex w-[100%] gap-3">
                    <div className="flex flex-col">
                      <p className="mb-1 text-xs">
                        Initial Pay <span>(₦)</span>
                      </p>
                      <input
                        type="number"
                        id="initialPayment"
                        name="initialPayment"
                        min="0"
                        step={0.02}
                        className="border input rounded-lg w-[100%]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="mb-1 text-xs">
                        Monthly Pay <span>(₦)</span>
                      </p>
                      <input
                        type="number"
                        id="monthlyPayment"
                        name="monthlyPayment"
                        min="0"
                        step={0.02}
                        className="border input rounded-lg w-[100%]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="mb-1 text-xs">Duration</p>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        min="1"
                        step={1}
                        className="border input rounded-lg w-[100%]"
                      />
                    </div>
                    <div className="flex flex-col justify-end text-xs">
                      <p className="mb-1">Append to</p>
                      <select
                        className="border input rounded-lg"
                        id="installmentAppendTo"
                        name="installmentAppendTo"
                      >
                        <option className="bg-secondary text-white" value="">
                          select
                        </option>
                        <option
                          className="bg-secondary text-white"
                          value="/month"
                        >
                          /month
                        </option>
                        <option className="bg-secondary text-white" value="/yr">
                          /year
                        </option>
                        <option
                          className="bg-secondary text-white"
                          value="/sqm"
                        >
                          /sqm
                        </option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="uppercase font-bold text-gray-400">Social Link</h2>
              <div className="">
                <p className="text-xs text-gray-600 mb-1">
                  Paste a instagram video link of the property
                </p>
                <div className="flex gap-3 justify-start items-center p-2 rounded-lg">
                  <BiLogoInstagramAlt className="text-4xl text-gray-400" />
                  <input
                    type="url"
                    placeholder="eg: https:instagram.com/propertyxhange"
                    className="w-full rounded-lg input border"
                    id="instagramLink"
                    name="instagramLink"
                    onChange={handleInstagramChange}
                    onInvalid={(e) => e.preventDefault()}
                  />
                </div>
                {instagramLinkErr && (
                  <p className="text-red-700 text-xs">Invalid Instagram URL</p>
                )}
              </div>
              <div className="w-[100%]">
                <p className="text-xs text-gray-600 mb-1">
                  Paste a youtube video link of the property
                </p>
                <div className="flex gap-3 justify-start items-center  p-2 rounded-lg">
                  <BsYoutube className="text-4xl text-gray-400" />
                  <input
                    type="url"
                    placeholder="eg: https:.youtube.com/propertyxhange"
                    className="w-full rounded-lg input border"
                    id="youtubeLink"
                    name="youtubeLink"
                    onChange={handleYouTubeChange}
                    onInvalid={(e) => e.preventDefault()}
                  />
                </div>
                {youTubeLinkErr && (
                  <p className="text-red-700 text-xs">Invalid YouTube URL</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="uppercase font-bold text-gray-400">
                Upload images
              </h2>
              <UploadWidget
                uwConfig={{
                  cloudName: 'calstech',
                  uploadPreset: 'estate',
                  multiple: true,
                  maxImageFileSize: 2000000,
                  maxFiles: 14,
                  folder: 'post',
                }}
                setState={setImages}
              />
              <span className="flex mt-1">
                <p className="font-semibold text-xs">
                  Images:
                  <span className="font-normal text-gray-400 ml-2">
                    The first image will be the thumbnail (max 14 uploads of 2MB
                    each)
                  </span>
                </p>
              </span>
              <div className="w-full flex flex-wrap gap-1">
                {images.map((image, index) => (
                  <div className="relative w-[45%]">
                    <img
                      src={image}
                      key={index}
                      alt={'property.' + image}
                      className="w-full"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 m-1 p-1 bg-white rounded-full shadow"
                    >
                      <RiDeleteBin5Fill className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80 hover:bg-primary transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create listing'}
            </button>
          </div>
        </form>
      </main>
    </Dashboard>
  );
}
