import { useState } from 'react';
import { BiBuildings, BiMap, BiMoney } from 'react-icons/bi';
import { Link } from 'react-router-dom';

const purposes = ['rent', 'sale', 'short-let', 'joint-venture'];

const Filters = () => {
  const [query, setQuery] = useState({
    purpose: 'rent',
    street: '',
    type: '',
    minPrice: 0,
    maxPrice: 0,
  });

  const switchPurpose = (value) => {
    setQuery((prev) => ({ ...prev, purpose: value }));
  };

  const handleChange = (e) => {
    setQuery((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="md:max-w-[80%] w-full mx-auto relative -mt-8 sm:-mt-20">
      <div className="p-1 flex-center-between rounded-t-lg bg-secondary w-[100%] md:w-[70%] md:text-xl text-sm card-shadow dark:shadow-none">
        {purposes.map((purpose) => (
          <button
            key={purpose}
            onClick={() => switchPurpose(purpose)}
            className={`p-2 m-1 border rounded-lg w-full shadow-sm card-bordered capitalize ${
              query.purpose === purpose
                ? 'bg-primary text-white'
                : 'dark:bg-hover-color-dark bg-slate-100'
            }`}
          >
            {purpose}
          </button>
        ))}
      </div>
      <form className="flex-col bg-white gap-x-4 flex-center-between gap-y-4 md:gap-y-0 md:flex-row  card-shadow dark:shadow-none p-4  border rounded-b-lg rounded-tr-lg dark:bg-card-dark dark:border-dark">
        <div className="flex-col flex-1 w-full flex-align-center gap-x-4 md:w-fit sm:flex-row gap-y-4 sm:gap-y-0">
          <div className="flex-1 w-full p-2 rounded-lg  md:w-fit bg-slate-100 dark:bg-hover-color-dark card-bordered">
            <h1 className="font-bold">Location</h1>
            <div className="flex-align-center gap-x-2">
              <BiMap />
              <input
                type="text"
                name="street"
                id="street"
                className="w-full bg-transparent border-0 outline-none"
                placeholder="Enter location of the property"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex-1 w-full p-2 rounded-lg md:w-fit bg-slate-100 dark:bg-hover-color-dark card-bordered">
            <h1 className="font-bold">Property Type</h1>
            <div className="flex-align-center gap-x-2">
              <BiBuildings />
              <select
                name="type"
                id="type"
                className="w-full bg-transparent border-0 outline-none dark:bg-hover-color-dark opacity-70"
                onChange={handleChange}
              >
                <option value="Land">Land</option>
                <option value="House">House</option>
                <option value="Co-working Space">Co-working Space</option>
                <option value="Commercial Property">Commercial Property</option>
                <option value="Flat/Apartments">Flat/Apartment</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex-col flex-1 w-full flex-align-center gap-x-4 md:w-fit sm:flex-row gap-y-4 sm:gap-y-0">
          <div className="flex-1 w-full p-2 rounded-lg md:w-fit bg-slate-100 dark:bg-hover-color-dark card-bordered">
            <h1 className="font-bold">Minimum Price </h1>
            <div className="flex-align-center gap-x-2">
              <BiMoney />
              <input
                type="number"
                name="minPrice"
                id="minPrice"
                className="w-full bg-transparent border-0 outline-none dark:bg-hover-color-dark opacity-70"
                max={50000000000}
                min={0}
                placeholder="Enter min price"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex-1 w-full p-2 rounded-lg md:w-fit bg-slate-100 dark:bg-hover-color-dark card-bordered">
            <h1 className="font-bold">Maximum Price </h1>
            <div className="flex-align-center gap-x-2">
              <BiMoney />
              <input
                type="number"
                name="maxPrice"
                id="maxPrice"
                className="w-full bg-transparent border-0 outline-none dark:bg-hover-color-dark opacity-70"
                max={50000000000}
                min={0}
                placeholder="Enter max price"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <Link
          to={`/property?purpose=${query.purpose}&type=${query.type}&street=${query.street}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`}
        >
          <button className="w-full btn btn-primary md:w-fit">search</button>
        </Link>
      </form>
    </div>
  );
};

export default Filters;
