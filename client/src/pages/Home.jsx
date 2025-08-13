import { useNavigate } from 'react-router-dom';
import {
  Brands,
  Counter,
  Featured,
  Projects,
  Services,
  Testimonial,
} from '../components/common/page-components';
import { Feeds, Hero, Invest, Speciality } from '../components/home';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigate = (searchUrl) => {
    navigate(searchUrl);
  };

  return (
    <div className="pt-16 px-[3%] md:px-[6%]">
      <Hero onNavigate={handleNavigate} /> {/* Pass the navigation handler */}
      {/* <Filters /> */}
      {/* <Invest /> */}
      {/* <Speciality /> */}
      {/* <Services /> */}
      <Featured />
      {/* <Counter /> */}
      <Projects />
      {/* <Testimonial /> */}
      {/* <Brands /> */}
      <Feeds />
    </div>
  );
};

export default Home;
