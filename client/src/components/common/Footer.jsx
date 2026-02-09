import { BiBuildingHouse } from "react-icons/bi";
import { FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { HiOutlineMapPin } from "react-icons/hi2";
import { FiSmartphone } from "react-icons/fi";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import Subscribe from "./page-components/Subscribe";

const Footer = () => {
  return (
    <div className="text-slate-200">
      <footer>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 basis-[10rem]">
            <Link to="/" className="flex-shrink-0 flex-align-center gap-x-1">
              <img
                src={Logo}
                alt="property exchange logo"
                className="h-[45px]"
              />
            </Link>
            <div className="mt-3">
              <p className="text-sm">
                PropertyXchange is a real estate platform that connects buyers,
                sellers, and agents. Find your dream property with us!
              </p>
              <div className="gap-5 my-6 flex-center-center">
                <div className="icon-box bg-dark-light hover:bg-hover-color-dark">
                  <FiFacebook />
                </div>

                <div className="icon-box bg-dark-light hover:bg-hover-color-dark">
                  <FaTwitter />
                </div>

                <div className="icon-box bg-dark-light hover:bg-hover-color-dark">
                  <FaInstagram />
                </div>

                <div className="icon-box bg-dark-light hover:bg-hover-color-dark">
                  <FaLinkedin />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 basis-[15rem]">
            <h2 className="text-xl font-semibold">Contact Us</h2>
            <ul className='mt-2 className="text-sm"'>
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
                <Link>
                  15, Chris Onanuga Street, Lekki Phase 1, <br /> Eti-Osa LGA,
                  Lagos
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex-1 basis-[10rem]">
            <h2 className="text-xl font-semibold">Quick Links</h2>
            <ul>
              <li className="my-3 text-muted">
                <Link to="/about-us"> About Us</Link>
              </li>
              <li className="my-3 text-muted">
                <Link to="/services">Services</Link>
              </li>
              <li className="my-3 text-muted">
                <Link to="/contact-us">Contact Us</Link>
              </li>
              <li className="my-3 text-muted">
                <Link to="/blog">Blog</Link>
              </li>
              <li className="my-3 text-muted">
                <Link to="/create-property">List a Property</Link>
              </li>
              <li className="my-3 text-muted">
                <Link href="/advertise">Advertise With Us</Link>
              </li>
            </ul>
          </div>

          <div className="flex-1 basis-[10rem]">
            <h2 className="text-xl font-semibold">Business</h2>
            <ul>
              <li className="my-3 text-muted">
                <a href="#"> Success</a>
              </li>
              <li className="my-3 text-muted">
                <a href="#">Guide</a>
              </li>
              <li className="my-3 text-muted">
                <a href="#">Mission</a>
              </li>
              <li className="my-3 text-muted">
                <a href="#">Terms & Conditions</a>
              </li>
              <li className="my-3 text-muted">
                <a href="#">Pricacy Policy</a>
              </li>
            </ul>
          </div>
          <Subscribe />
        </div>
      </footer>
      <div className="py-2 mt-3 text-center border-t text-muted border-dark">
        <p>
          <span className="text-primary">PropertyXchange</span> | All Rights
          Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
