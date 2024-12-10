import { Link } from 'react-router-dom';
import { FiCheck, FiLayers, FiUsers } from 'react-icons/fi';

const Speciality = () => {
  return (
    <div className="pt-10 pb-16">
      <div className="flex flex-wrap gap-10">
        <div className="flex-1 basis-[20rem]">
          <h1 className="sub-heading">about us</h1>
          <h1 className="heading">
            Welcome to PropertyXchange Where Your Dream Home Awaits!
          </h1>
          <p className="mt-3">
            We understand that finding the perfect home is more than just a
            transaction; it's about turning your dreams into reality. As a
            premier destination for real estate enthusiasts, we are dedicated to
            simplifying your property search and making the journey towards your
            ideal home an exciting and seamless experience.
          </p>
          <div className="mt-4">
            <div className="flex-align-center gap-x-2">
              <div className="icon-box text-primary !bg-primary/20">
                <FiCheck />
              </div>
              <p>Comprehensive Listings</p>
            </div>
            <div className="mt-2 flex-align-center gap-x-2">
              <div className="icon-box text-primary !bg-primary/20">
                <FiCheck />
              </div>
              <p>User-Friendly Interface</p>
            </div>
            <div className="mt-2 flex-align-center gap-x-2">
              <div className="icon-box text-primary !bg-primary/20">
                <FiCheck />
              </div>
              <p>Trusted Partnerships</p>
            </div>
            <div className="mt-2 flex-align-center gap-x-2">
              <div className="icon-box text-primary !bg-primary/20">
                <FiCheck />
              </div>
              <p>Community Focus</p>
            </div>
            <Link to="/about-us">
              <button className="mt-4 btn btn-primary">read more</button>
            </Link>
          </div>
        </div>
        <div className="flex-1 basis-[20rem]">
          <div className="relative">
            <img
              src="/images/property (5).jpg"
              alt=""
              className="rounded-lg w-full sm:h-[400px] object-cover"
            />
            <div className="absolute -bottom-10 sm:bottom-5 -left-2 md:-left-20">
              <div className="p-3 bg-white rounded-lg shadow-md w-72 flex-center-between gap-x-3 dark:bg-dark-light">
                <h1>
                  Committed to transparent, expert support for informed real
                  estate decisions.
                </h1>
                <div className="icon-box text-primary !bg-primary/20">
                  <FiUsers />
                </div>
              </div>
              <div className="p-3 mt-4 ml-8 bg-white rounded-lg shadow-md w-72 flex-center-between gap-x-3 dark:bg-dark-light">
                <h1>
                  Advanced tech for the latest listings, tours, and interactive
                  maps.
                </h1>
                <div className="icon-box text-primary !bg-primary/20">
                  <FiLayers />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Speciality;
