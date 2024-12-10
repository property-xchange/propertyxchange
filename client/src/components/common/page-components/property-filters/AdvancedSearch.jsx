import { useState } from 'react';
import {
  listingCategories,
  listingType,
  locationData,
  listingFeatures,
} from '../../../../data/dummyData';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState({
    purpose: searchParams.get('purpose' || ''),
    type: searchParams.get('type' || ''),
    subType: searchParams.get('subType' || ''),
    state: searchParams.get('state' || ''),
    lga: searchParams.get('lga' || ''),
    number_of_beds: searchParams.get('number_of_beds' || ''),
    number_of_bathrooms: searchParams.get('number_of_bathrooms' || ''),
    toilets: searchParams.get('toilets' || ''),
    serviced: searchParams.get('serviced' || ''),
    furnished: searchParams.get('furnished' || ''),
    features: [],
    minPrice: searchParams.get('minPrice' || ''),
    maxPrice: searchParams.get('maxPrice' || ''),
    maxDiscountPrice: searchParams.get('maxDiscountPrice' || ''),
    minDiscountPrice: searchParams.get('minDiscountPrice' || ''),
  });

  //state and lga
  const [selectedState, setSelectedState] = useState('');
  const [selectedLGA, setSelectedLGA] = useState('');
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedLGA('');
  };
  const handleLGAChange = (e) => {
    const newLGA = e.target.value;
    setSelectedLGA(newLGA);
  };

  //type and subtype
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubType, setSelectedSubType] = useState('');
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);
    setSelectedSubType('');
  };
  const handleSubTypeChange = (e) => {
    const newSubType = e.target.value;
    setSelectedSubType(newSubType);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const updatedFeatures = checked
        ? [...query.features, value]
        : query.features.filter((feature) => feature !== value);
      setQuery({
        ...query,
        features: updatedFeatures,
      });
    } else {
      setQuery({
        ...query,
        [name]: value,
      });
    }
  };

  const handleFilter = () => {
    const cleanedQuery = Object.fromEntries(
      Object.entries(query).filter(
        ([key, value]) => value !== null && value !== ''
      )
    );
    const params = new URLSearchParams(cleanedQuery);
    navigate(`/property?${params.toString()}`);
  };

  return (
    <div className="p-3 border dark:border-dark mt-3 text-sm">
      <h1 className="font-semibold">Our Advanced Search</h1>
      <div className="mt-5 flex flex-col w-full">
        <h1 className="text-center font-medium">Regular Price</h1>
        <div className="flex gap-3 w-[100%] text-sm">
          <div className="flex gap-3">
            <label htmlFor="minRegularPrice">Min Price</label>
            <input
              type="number"
              min={0}
              id="minRegularPrice"
              name="minRegularPrice"
              placeholder="any"
              className="w-[50%] filter"
              onChange={handleChange}
              defaultValue={query.minPrice}
            />
          </div>
          <div className="flex gap-3">
            <label htmlFor="maxRegularPrice">Max Price</label>
            <input
              type="number"
              min={0}
              id="maxRegularPrice"
              name="maxRegularPrice"
              placeholder="any"
              className="w-[50%] filter"
              onChange={handleChange}
              defaultValue={query.maxPrice}
            />
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col w-full">
        <h1 className="text-center font-medium">Discount Price</h1>
        <div className="flex gap-3 w-[100%]">
          <div className="flex gap-3">
            <label htmlFor="minDiscountPrice">Min Price</label>
            <input
              type="number"
              min={0}
              id="minDiscountPrice"
              name="minDiscountPrice"
              placeholder="any"
              className="w-[50%] filter"
              onChange={handleChange}
              defaultValue={query.minDiscountPrice}
            />
          </div>
          <div className="flex gap-3">
            <label htmlFor="maxDiscountPrice">Max Price</label>
            <input
              type="number"
              id="maxDiscountPrice"
              name="maxDiscountPrice"
              placeholder="any"
              className="w-[50%] filter"
              min={0}
              onChange={handleChange}
              defaultValue={query.maxDiscountPrice}
            />
          </div>
        </div>
      </div>
      <div className="mt-5 flex gap-3 w-full text-sm">
        <div className="w-[50%]">
          <label htmlFor="category">Purpose</label>
          <select
            name="purpose"
            id="purpose"
            onChange={handleChange}
            defaultValue={query.minPrice}
            className="filter"
          >
            <option value="all">All</option>
            {listingCategories.map(({ id, name }) => (
              <option value={name} key={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-[50%]">
          <label htmlFor="timestamp">Posted Time</label>
          <select
            name="timestamp"
            id="timestamp"
            className="filter"
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value={3600000}>Last Hour</option>
            <option value={86400000}>Last 24 Hours</option>
            <option value={604800000}>Last Week</option>
            <option value={2592000000}>Last Month</option>
          </select>
        </div>
      </div>
      <div className="mt-5 flex gap-3 w-full text-sm">
        <div className="w-[50%]">
          <label htmlFor="type">Type</label>
          <select
            name="type"
            id="type"
            value={selectedType}
            onChange={(e) => {
              handleTypeChange(e);
              handleChange(e);
            }}
            className="filter"
            defaultValue={query.type}
          >
            <option value="all">All</option>
            {listingType.map((index) => (
              <option key={index.type} value={index.type}>
                {index.type}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[50%]">
          <label htmlFor="subType">SubType</label>
          <select
            name="subType"
            id="subType"
            value={selectedSubType}
            onChange={(e) => {
              handleSubTypeChange(e);
              handleChange(e);
            }}
            disabled={!selectedType}
            className="filter"
            defaultValue={query.subType}
          >
            <option value="all">All</option>
            {listingType
              .find((index) => index.type === selectedType)
              ?.subType.map((subType) => (
                <option key={subType} value={subType}>
                  {subType}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="mt-5 flex gap-3 w-full text-sm">
        <div className="w-[50%]">
          <label htmlFor="state">State</label>
          <select
            name="state"
            className="filter"
            id="state"
            value={selectedState}
            onChange={(e) => {
              handleStateChange(e);
              handleChange(e);
            }}
            defaultValue={query.state}
          >
            <option value="all">All</option>
            {locationData.map((location) => (
              <option key={location.state} value={location.state}>
                {location.state}
              </option>
            ))}
          </select>
        </div>
        <div className="w-[50%]">
          <label htmlFor="lga">LGA</label>
          <select
            name="lga"
            value={selectedLGA}
            onChange={(e) => {
              handleLGAChange(e);
              handleChange(e);
            }}
            disabled={!selectedState}
            className="filter"
            defaultValue={query.lga}
          >
            <option value="all">All</option>
            {locationData
              .find((location) => location.state === selectedState)
              ?.lga.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="mt-5 gap-4 flex-align-center">
        <div>
          <label htmlFor="number_of_beds">No of Beds</label>
          <input
            type="number"
            name="number_of_beds"
            id="number_of_beds"
            className="filter"
            placeholder="eg 2"
            defaultValue={query.number_of_beds}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="number_of_bathrooms">No of Bathroom</label>
          <input
            type="number"
            name="number_of_bathrooms"
            id="number_of_bathrooms"
            className="filter"
            placeholder="eg 2"
            defaultValue={query.number_of_bathrooms}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="toilets">No of Toilets</label>
          <input
            type="number"
            name="toilets"
            id="toilets"
            className="filter"
            placeholder="eg 2"
            defaultValue={query.toilets}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="mt-5 flex justify-between items-center gap-1">
        <div>
          <label htmlFor="serviced">Serviced</label>
          <select
            name="serviced"
            id="serviced"
            className="filter"
            defaultValue={query.serviced}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label htmlFor="furnished">Furnished</label>
          <select
            name="furnished"
            id="furnished"
            className="filter"
            defaultValue={query.furnished}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label htmlFor="parking">Parking</label>
          <select
            name="parking"
            id="parking"
            className="filter"
            defaultValue={query.parking}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label htmlFor="newlyBuilt">New Built</label>
          <select
            name="newlyBuilt"
            id="newlyBuilt"
            className="filter"
            defaultValue={query.newlyBuilt}
            onChange={handleChange}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="mt-5">
        <h1 className="text-center font-medium">Features</h1>
        <div className="flex flex-wrap gap-3">
          {listingFeatures.map((item, index) => (
            <div className="flex" key={index}>
              <input
                type="checkbox"
                className="w-3 mr-1"
                value={item}
                checked={query.features.includes(item)}
                onChange={handleChange}
              />
              <span className="text-xs">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        className="btn bg-secondary hover:bg-primary transition-all duration-300 w-full mt-5 text-slate-200 !rounded-none"
        onClick={handleFilter}
      >
        search property
      </button>
    </div>
  );
};

export default AdvancedSearch;
