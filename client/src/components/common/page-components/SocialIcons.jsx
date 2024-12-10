import { Link } from 'react-router-dom';
import { socials } from '../../../data/dummyData';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const SocialIcons = () => {
  return (
    <div className="p-3 mt-8 border dark:border-dark">
      <h1 className="font-semibold">Social Media</h1>
      <div className="flex-wrap gap-2 mt-3 flex-align-center">
        {/* {socials.map((social, i) => (
          <>
            <Link
              to={social.socialLinks}
              key={i}
              data-tooltip-id={social.socialHandle}
              data-tooltip-content={social.socialHandle}
              className="icon-box bg-slate-100 dark:bg-dark-light hover:!bg-primary hover:text-white"
            >
              {social.socialIcon}
            </Link>
            <Tooltip id={social.socialHandle} />
          </>
        ))} */}
      </div>
    </div>
  );
};

export default SocialIcons;
