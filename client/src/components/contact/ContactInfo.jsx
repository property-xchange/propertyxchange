import { BiMap } from "react-icons/bi";
import { FiMail, FiPhone } from "react-icons/fi";

const ContactInfo = () => {
  return (
    <div className="grid grid-cols-1 gap-6 py-16 sm:grid-cols-2 md:grid-cols-3">
      <div className="text-center">
        <div className="icon-box !h-14 !w-14 !bg-primary text-white mx-auto text-2xl">
          <FiPhone />
        </div>
        <h1 className="mt-2 text-lg font-semibold">Phone Number</h1>
        <a className="decoration-inherit" href="tel:+2347037248610">
          07037248610
        </a>
      </div>
      <div className="text-center">
        <div className="icon-box !h-14 !w-14 !bg-primary text-white mx-auto text-2xl">
          <FiMail />
        </div>
        <h1 className="mt-2 text-lg font-semibold">Email Address</h1>
        <div className="flex flex-col">
          <a
            className="decoration-inherit"
            href="mailto:contact@propertyXchange.com.ng"
          >
            contact@propertyXchange.com.ng
          </a>
          <a
            className="decoration-inherit"
            href="mailto:info@propertyXchange.com.ng"
          >
            info@propertyXchange.com.ng
          </a>
        </div>
      </div>
      <div className="text-center">
        <div className="icon-box !h-14 !w-14 !bg-primary text-white mx-auto text-2xl">
          <BiMap />
        </div>
        <h1 className="mt-2 text-lg font-semibold">Office Address</h1>
        <p>Lumumu Street Plot 3943, Ikeja, Lagos, Nigeria</p>
        <p>Horizon Street, Middle Avenue, Nigeria</p>
      </div>
    </div>
  );
};

export default ContactInfo;
