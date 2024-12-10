import { useState, useEffect } from 'react';
import { BsYoutube } from 'react-icons/bs';
import { BiLogoInstagramAlt } from 'react-icons/bi';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { locationData, listingType, listingFeatures } from '../appData';
import Dashboard from './Dashboard';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();

  //states and LGA
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [lga, setLGA] = useState([]);
  const [selectedLGA, setSelectedLGA] = useState('');

  //Listing Type and SubType
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [subTypes, setSubType] = useState([]);
  const [selectedSubType, setSelectedSubType] = useState('');

  //validate social link input
  const [youtubeLinkErr, setYoutubeLinkErr] = useState(false);
  const [instagramLinkErr, setInstagramLinkErr] = useState(false);

  const [showMoreFeatures, setShowMoreFeatures] = useState(false);

  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    features: [],
    name: '',
    description: '',
    category: 'rent',
    type: '',
    lga: '',
    state: '',
    address: '',
    appendTo: '',
    installmentAppendTo: '',
    bedrooms: 0,
    bathrooms: 0,
    toilets: 0,
    regularPrice: 50,
    discountPrice: 0,
    initialPayment: 0,
    monthlyPayment: 0,
    duration: 1,
    offer: false,
    installment: false,
    parking: false,
    furnished: false,
    serviced: false,
    newlyBuilt: false,
    instagramLink: '',
    youtubeLink: '',
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  //get data
  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      console.log(data.state);
      console.log(data.lga);
      console.log(data.type);
      console.log(data.subType);
      setSelectedState(data.state);
      setSelectedType(data.type);
      setFormData(data);
    };
    fetchListing();
  }, []);

  // Use useEffect to populate the list of states when the component mounts
  useEffect(() => {
    // Assuming locationData is an array of objects with 'state' and 'lga' properties
    const statesList = locationData.map((location) => location.state);
    setStates(statesList);
  }, []);

  useEffect(() => {
    const typeItems = listingType.map((item) => item.type);
    setTypes(typeItems);
  }, []);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 8) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const moreFeatures = () => {
    setShowMoreFeatures(!showMoreFeatures);
  };

  const handleChangeFeatures = (item) => {
    setFormData((prevFormData) => {
      const updatedFeatures = [...prevFormData.features];

      // Check if the item is already in the features array
      const index = updatedFeatures.indexOf(item);

      if (index !== -1) {
        // If it's already selected, remove it
        updatedFeatures.splice(index, 1);
      } else {
        // If it's not selected, add it
        updatedFeatures.push(item);
      }

      return { ...prevFormData, features: updatedFeatures };
    });
  };
  const handleChange = (e) => {
    //state
    if (e.target.id === 'state') {
      setSelectedState(e.target.value);
      // Find the corresponding LGAs for the selected state
      const selectedStateData = locationData.find(
        (location) => location.state === e.target.value
      );
      const lgaList = selectedStateData ? selectedStateData.lga : [];
      setLGA(lgaList);
      setSelectedLGA('');
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }

    //LGA

    if (e.target.id === 'lga') {
      setSelectedLGA(e.target.value);
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }

    //Type
    if (e.target.id === 'type') {
      setSelectedType(e.target.value);
      const selectedTypeData = listingType.find(
        (items) => items.type === e.target.value
      );
      const subTypeItems = selectedTypeData ? selectedTypeData.subType : [];
      setSubType(subTypeItems);
      setSelectedSubType('');
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }

    //SubType
    if (e.target.id === 'subType') {
      setSelectedSubType(e.target.value);
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }

    //appendTo
    if (e.target.id === 'appendTo' || e.target.id === 'installmentAppendTo') {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }

    if (
      e.target.id === 'sale' ||
      e.target.id === 'rent' ||
      e.target.id === 'short-let'
    ) {
      setFormData({
        ...formData,
        category: e.target.id,
      });
    }

    if (listingFeatures.includes(e.target.id)) {
      setFormData({
        ...formData,
        features: e.target.id,
      });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'newlyBuilt' ||
      e.target.id === 'serviced' ||
      e.target.id === 'offer' ||
      e.target.id === 'installment'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea' ||
      e.target.type === 'url'
    ) {
      // Common logic for handling number, text, textarea and url inputs
      const inputId = e.target.id;
      const inputValue = e.target.value;

      // Check for YouTube link input
      if (inputId === 'instagramLink') {
        const isValidInstagramLink = /^https?:\/\/(www\.)?instagram\.com/.test(
          inputValue
        );
        setInstagramLinkErr(!isValidInstagramLink);
        if (!isValidInstagramLink) {
          setFormData({
            ...formData,
            [inputId]: '',
          });
          return; // Stop further processing for instagram link
        }
      }

      if (inputId === 'youtubeLink') {
        const isValidYoutubeLink = /^https?:\/\/(www\.)?youtube\.com/.test(
          inputValue
        );
        setYoutubeLinkErr(!isValidYoutubeLink);
        if (!isValidYoutubeLink) {
          setFormData({
            ...formData,
            [inputId]: '',
          });
          return; // Stop further processing for YouTube link
        }
      }

      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };
  console.log(formData);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
      if (+formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Dashboard>
      <main className="p-3 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-center my-3">
          Update a Listing
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-8"
        >
          <div className="flex flex-col flex-1 gap-9 text-sm">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Title eg: Furnished 2 Bedroom Duplex"
                className="border p-3 rounded-lg"
                id="name"
                maxLength="62"
                minLength="10"
                required
                onChange={handleChange}
                value={formData.name}
              />
              <div className="flex justify-evenly">
                <div className="flex">
                  <input
                    type="checkbox"
                    id="sale"
                    className="w-5 mr-3"
                    onChange={handleChange}
                    checked={formData.category === 'sale'}
                  />
                  <span>Sell</span>
                </div>
                <div className="flex">
                  <input
                    type="checkbox"
                    id="rent"
                    className="w-5 mr-3"
                    onChange={handleChange}
                    checked={formData.category === 'rent'}
                  />
                  <span>Rent</span>
                </div>
                <div className="flex">
                  <input
                    type="checkbox"
                    id="short-let"
                    className="w-5 mr-3"
                    onChange={handleChange}
                    checked={formData.category === 'short-let'}
                  />
                  <span>Short let</span>
                </div>
              </div>
              <div className="flex justify-around gap-3">
                <div className="flex flex-col">
                  <label htmlFor="type" className=" mb-1">
                    Type:
                  </label>
                  <select
                    className="border p-3 rounded-lg w-[100%]"
                    id="type"
                    value={selectedType}
                    onChange={handleChange}
                    required
                  >
                    <option></option>
                    {types.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="subType" className="mb-1">
                    SubType(Optional):
                  </label>
                  <select
                    className="border p-3 rounded-lg w-[100%]"
                    id="subType"
                    value={selectedSubType}
                    onChange={(e) => {
                      setSelectedSubType(e.target.value);
                      handleChange(e);
                    }}
                  >
                    <option value="">Select an option</option>
                    {subTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <textarea
              type="text"
              placeholder="Description"
              className="border p-3 rounded-lg"
              id="description"
              required
              onChange={handleChange}
              value={formData.description}
            />
            <div className="flex gap-4 flex-wrap">
              <div className="flex">
                <input
                  type="checkbox"
                  id="parking"
                  className="w-5 mr-3"
                  onChange={handleChange}
                  checked={formData.parking}
                />
                <span>Parking Spot</span>
              </div>
              <div className="flex">
                <input
                  type="checkbox"
                  id="serviced"
                  className="w-5 mr-3"
                  onChange={handleChange}
                  checked={formData.serviced}
                />
                <span>Serviced</span>
              </div>
              <div className="flex">
                <input
                  type="checkbox"
                  id="newlyBuilt"
                  className="w-5 mr-3"
                  onChange={handleChange}
                  checked={formData.newlyBuilt}
                />
                <span>Newly Built</span>
              </div>
              <div className="flex">
                <input
                  type="checkbox"
                  id="furnished"
                  className="w-5 mr-3"
                  onChange={handleChange}
                  checked={formData.furnished}
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
                          className="w-3 mr-1"
                          onChange={() => handleChangeFeatures(item)}
                          checked={formData.features.includes(item)}
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
                  id="bedrooms"
                  min="0"
                  step={1}
                  required
                  className="p-3 border border-gray-300 rounded-lg mr-3 w-[50%]"
                  onChange={handleChange}
                  value={formData.bedrooms}
                />
                <p>Beds</p>
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  id="bathrooms"
                  min="0"
                  step={1}
                  required
                  className="p-3 border border-gray-300 rounded-lg mr-3  w-[50%]"
                  onChange={handleChange}
                  value={formData.bathrooms}
                />
                <p>Bathrooms</p>
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  id="toilets"
                  min="0"
                  step={1}
                  required
                  className="p-3 border border-gray-300 rounded-lg mr-3 w-[50%]"
                  onChange={handleChange}
                  value={formData.toilets}
                />
                <p>Toilets</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="offer"
                  className="w-5 mr-3"
                  onChange={handleChange}
                  checked={formData.offer}
                />
                <span>Offer</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="installment"
                  className="w-5"
                  onChange={handleChange}
                  checked={formData.installment}
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
                    id="regularPrice"
                    min="50"
                    step={0.02}
                    required
                    className="p-3 border border-gray-300 rounded-lg w-[100%]"
                    onChange={handleChange}
                    value={formData.regularPrice}
                  />
                </div>
                {formData.category === 'sale' ||
                  ('short-let' && (
                    <div className="flex flex-col">
                      <p className="mb-1">Append to</p>
                      <select
                        className="p-3 border border-gray-300 rounded-lg"
                        onChange={handleChange}
                        value={formData.appendTo}
                        id="appendTo"
                      >
                        <option value="/ month">/month</option>
                        <option value="/year">/year</option>
                        <option value="/sqm">/sqm</option>
                      </select>
                    </div>
                  ))}
              </div>
              {/* offer logic */}
              {formData.offer && (
                <div className="flex gap-3">
                  <div className="flex flex-col">
                    <p className="mb-1">
                      Discount price <span>(₦)</span>
                    </p>
                    <input
                      type="number"
                      id="discountPrice"
                      min="0"
                      step={0.02}
                      required
                      className="p-3 border border-gray-300 rounded-lg w-[100%]"
                      onChange={handleChange}
                      value={formData.discountPrice}
                    />
                  </div>
                </div>
              )}
              {/* installment logic*/}
              {formData.installment && (
                <div className="flex w-[100%] gap-3">
                  <div className="flex flex-col">
                    <p className="mb-1">
                      Initial Pay <span>(₦)</span>
                    </p>
                    <input
                      type="number"
                      id="initialPayment"
                      min="0"
                      step={0.02}
                      className="p-3 border border-gray-300 rounded-lg w-[100%]"
                      onChange={handleChange}
                      value={formData.initialPayment}
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="mb-1">
                      Monthly Pay <span>(₦)</span>
                    </p>
                    <input
                      type="number"
                      id="monthlyPayment"
                      min="0"
                      step={0.02}
                      className="p-3 border border-gray-300 rounded-lg w-[100%]"
                      onChange={handleChange}
                      value={formData.monthlyPayment}
                    />
                  </div>

                  <div className="flex flex-col">
                    <p className="mb-1">Duration</p>
                    <input
                      type="number"
                      id="duration"
                      min="1"
                      step={1}
                      className="p-3 border border-gray-300 rounded-lg w-[100%]"
                      onChange={handleChange}
                      value={formData.duration}
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="mb-1">Append to</p>
                    <select
                      className="p-3 border border-gray-300 rounded-lg"
                      onChange={handleChange}
                      value={formData.installmentAppendTo}
                      id="installmentAppendTo"
                    >
                      <option value="/ month">/month</option>
                      <option value="/year">/year</option>
                      <option value="/sqm">/sqm</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-9  text-sm">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-[50%]">
                  <label htmlFor="state" className="mr-3">
                    State:
                  </label>
                  <select
                    className="border p-3 rounded-lg w-[70%]"
                    id="state"
                    value={selectedState}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-[50%]">
                  <label htmlFor="lga" className="mr-3">
                    LGA:
                  </label>
                  <select
                    className="border p-3 rounded-lg w-[70%]"
                    id="lga"
                    value={selectedLGA}
                    onChange={(e) => {
                      setSelectedLGA(e.target.value);
                      handleChange(e);
                    }}
                    required
                  >
                    <option value="">'Select an option</option>
                    {lga.map((lga, index) => (
                      <option key={index} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <input
                type="text"
                placeholder="Address"
                className="border p-3 rounded-lg"
                id="address"
                required
                onChange={handleChange}
                value={formData.address}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">
                  Paste a instagram video link of the property
                </p>
                <div className="flex gap-3 justify-start items-center  bg-white border p-2 rounded-lg">
                  <BiLogoInstagramAlt className="text-4xl text-gray-700" />
                  <input
                    type="url"
                    placeholder="eg: https://www.instagram.com/propertyxhange"
                    className="w-full focus:border-none focus:outline-none"
                    id="instagramLink"
                    onChange={handleChange}
                    value={formData.instagramLink}
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
                <div className="flex gap-3 justify-start items-center  bg-white border p-2 rounded-lg">
                  <BsYoutube className="text-4xl text-gray-700" />
                  <input
                    type="url"
                    placeholder="eg: https://www.youtube.com/propertyxhange"
                    className="w-full focus:border-none focus:outline-none"
                    id="youtubeLink"
                    onChange={handleChange}
                    value={formData.youtubeLink}
                  />
                </div>
                {youtubeLinkErr && (
                  <p className="text-red-700 text-xs">Invalid YouTube URL</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-xs">
                Images:
                <span className="font-normal text-gray-600 ml-2">
                  The first image will be the cover (max 7)
                </span>
              </p>
              <div className="flex gap-4">
                <input
                  onChange={(e) => setFiles(e.target.files)}
                  className="p-3 border border-gray-300 rounded w-full"
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleImageSubmit}
                  className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              <p className="text-red-700 text-xs">
                {imageUploadError && imageUploadError}
              </p>
              {formData.imageUrls.length > 0 &&
                formData.imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className="flex justify-between p-3 border items-center"
                  >
                    <img
                      src={url}
                      alt="listing image"
                      className="w-20 h-20 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>
            <button
              disabled={loading || uploading}
              className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
            >
              {loading ? 'Updating...' : 'Update listing'}
            </button>
            {error && <p className="text-red-700 text-xs">{error}</p>}
          </div>
        </form>
      </main>
    </Dashboard>
  );
}
