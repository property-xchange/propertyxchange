import { useSelector } from 'react-redux';
import { dataStore } from '../../redux/features/dataSlice';
import SingleAgentCard from '../common/page-components/SingleAgentCard';

const AgentList = ({ basis }) => {
  const { currentDataItems } = useSelector(dataStore);
  return (
    <div className="flex flex-wrap gap-4">
      {currentDataItems?.map((userData) => (
        <SingleAgentCard key={userData.id} {...userData} basis={basis} />
      ))}
    </div>
  );
};

export default AgentList;
