import { BiCreditCard } from 'react-icons/bi';
import { TbBuildingCommunity } from 'react-icons/tb';
import { GrTechnology } from 'react-icons/gr';

const AboutUs = () => {
  return (
    <div className="pt-16 pb-20">
      <div className="flex flex-wrap gap-24">
        <div className="relative flex-1 basis-[18rem] border">
          <img
            src="/images/property (16).jpg"
            alt=""
            className="object-cover w-full h-full rounded-lg"
          />
          <img
            src="/images/property (26).jpg"
            alt=""
            className="absolute object-cover w-48 h-64 border-4 border-white rounded-lg sm:w-72 sm:h-80 dark:border-dark -bottom-20 -right-2 md:-right-20"
          />
        </div>
        <div className="relative flex-1 basis-[22rem]">
          <h1 className="sub-heading">about us</h1>
          <h1 className="heading">
            Welcome to PropertyXchange Where Your Dream Home Awaits!
          </h1>
          <p className="mt-3">
            we understand that finding the perfect home is more than just a
            transaction; it's about turning your dreams into reality. As a
            premier destination for real estate enthusiasts, we are dedicated to
            simplifying your property search and making the journey towards your
            ideal home an exciting and seamless experience.
          </p>
          <h1 className="heading mt-3">Why Choose Us</h1>
          <div className="mt-4">
            <div className="flex-align-center gap-x-2">
              <div className="icon-box text-primary !bg-primary/20">
                <TbBuildingCommunity />
              </div>
              <div>
                <h1 className="font-semibold capitalize">Community Focus</h1>
                <p>
                  Beyond bricks and mortar, we emphasize the importance of
                  community. Discover neighborhoods that align with your
                  lifestyle and values.
                </p>
              </div>
            </div>

            <div className="mt-3 flex-align-center gap-x-2">
              <div className="icon-box text-primary !bg-primary/20">
                <GrTechnology />
              </div>
              <div>
                <h1 className="font-semibold capitalize">
                  Innovative Technology
                </h1>
                <p>
                  We leverage cutting-edge technology to bring you the latest
                  listings, virtual tours, and interactive maps, keeping you
                  informed at every step.
                </p>
              </div>
            </div>

            <div className="mt-3 flex-align-center gap-x-2">
              <div className="icon-box text-primary !bg-primary/20">
                <BiCreditCard />
              </div>
              <div>
                <h1 className="font-semibold capitalize">Our Commitment</h1>
                <p>
                  We are committed to transparency, integrity, and personalized
                  service. Our team of dedicated professionals is here to assist
                  you, providing expert advice and support to make informed
                  decisions about your real estate investments.
                </p>
              </div>
            </div>

            <div className="mt-3 flex-align-center gap-x-2">
              <div className="icon-box text-primary !bg-primary/20">
                <BiCreditCard />
              </div>
              <div>
                <h1 className="font-semibold capitalize">Our Commitment</h1>
                <p>
                  We are committed to transparency, integrity, and personalized
                  service. Our team of dedicated professionals is here to assist
                  you, providing expert advice and support to make informed
                  decisions about your real estate investments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
