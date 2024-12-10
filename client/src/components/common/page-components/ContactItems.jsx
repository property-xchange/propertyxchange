import React from 'react';
import { HiOutlineMapPin } from 'react-icons/hi2';
import { FiSmartphone } from 'react-icons/fi';
import { FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ContactItems = () => {
  return (
    <div>
      <ul className='className="text-sm"'>
        <li className="flex justify-start items-center mb-2">
          <FiMail className="mr-2" />
          <Link to="mailto:info@propertyxchange.com">
            info@propertyxchange.com
          </Link>
        </li>
        <li className="flex justify-start items-center mb-2">
          <FiSmartphone className="mr-2" />
          <Link to="tel:+2348150000">+234 815 0000</Link>
        </li>
        <li className="flex justify-start items-center mb-2">
          <HiOutlineMapPin className="mr-2" />
          <Link>10 Ikeja Alausa GRA Lagos</Link>
        </li>
      </ul>
    </div>
  );
};

export default ContactItems;
